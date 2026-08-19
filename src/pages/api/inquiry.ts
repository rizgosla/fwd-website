import type { APIRoute } from "astro";

/* ----------------------------------------------------------------------------
   Contact form endpoint.

   Before this existed, contact.astro called preventDefault(), waited 900ms and
   told the visitor their inquiry was in our inbox. It went nowhere.

   Delivery is Resend's REST API over plain fetch — no npm dependency, since
   fetch is native on the Workers runtime. The key is a Cloudflare secret:

       npx wrangler secret put RESEND_API_KEY

   Until that secret exists the endpoint returns a real 503 and the form shows
   a real error. It never claims success it can't back up.
   -------------------------------------------------------------------------- */

export const prerender = false;

const TO = "fwddesignconsulting@gmail.com";
/* Must be on a domain verified with Resend, which is why this isn't the Gmail
   address — you can't send *from* an address you don't control. */
const FROM = "Forward Design Consulting <inquiries@fwddesignconsulting.com>";
const RESEND = "https://api.resend.com/emails";

const SCOPE_LABEL: Record<string, string> = {
  full: "Full Site, $4,000",
  smaller: "Something smaller",
  "not-sure": "Not sure yet",
};

const field = (data: FormData, key: string, max: number) => {
  const v = data.get(key);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
};

const escape = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

async function sendEmail(key: string, payload: Record<string, unknown>) {
  const res = await fetch(RESEND, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error(`Resend responded ${res.status}: ${await res.text()}`);
  }
}

/** Reply-by promise that respects the weekend, matching the aside card's claim
 *  that inquiries sent over a weekend get answered Monday. */
function replyBy(now: Date) {
  const day = now.getUTCDay(); // 0 Sun … 6 Sat
  if (day === 5 || day === 6 || day === 0) return "Monday";
  return "tomorrow afternoon";
}

export const POST: APIRoute = async ({ request, locals }) => {
  const wantsJson = (request.headers.get("accept") || "").includes("application/json");

  const reply = (status: number, body: { ok: boolean; error?: string; replyBy?: string }) => {
    if (wantsJson) {
      return new Response(JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
    /* Native form POST — the browser is here without JS, so it needs a page,
       not JSON. Deliberately minimal; the styled success panel is the JS path. */
    return new Response(
      `<!doctype html><meta charset="utf-8"><title>${body.ok ? "Inquiry sent" : "Something went wrong"}</title>` +
        `<meta name="viewport" content="width=device-width,initial-scale=1">` +
        `<div style="font:16px/1.6 system-ui;max-width:34rem;margin:16vh auto;padding:0 1.5rem;color:#0d2f45">` +
        `<h1 style="font-size:1.8rem;margin:0 0 .75rem">${body.ok ? "Got it." : "That didn't send."}</h1>` +
        `<p style="margin:0 0 1.5rem;color:#243845">${
          body.ok
            ? `Your inquiry is with us. One of us will reply by ${body.replyBy}.`
            : `${escape(body.error || "Please try again.")} You can also email us directly at ${TO}.`
        }</p><a href="/contact" style="color:#144667">← Back to the site</a></div>`,
      { status, headers: { "Content-Type": "text/html; charset=utf-8" } },
    );
  };

  let data: FormData;
  try {
    const type = request.headers.get("content-type") || "";
    data = type.includes("application/json")
      ? (() => { throw new Error("json-unsupported"); })()
      : await request.formData();
  } catch {
    return reply(400, { ok: false, error: "We couldn't read that submission." });
  }

  /* Honeypot. Real people never see this field, so anything in it is a bot.
     Return 200 so the bot learns nothing and doesn't retry. */
  if (field(data, "hp_verify", 100)) {
    return reply(200, { ok: true, replyBy: replyBy(new Date()) });
  }

  const name = field(data, "name", 200);
  const email = field(data, "email", 320);
  const company = field(data, "company", 200);
  const brief = field(data, "brief", 5000);
  const scope = field(data, "scope", 40);
  const when = field(data, "when", 200);

  if (!name || !email || !brief) {
    return reply(400, { ok: false, error: "Name, email and a short brief are required." });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return reply(400, { ok: false, error: "That email address doesn't look right." });
  }

  const env = (locals as any)?.runtime?.env ?? {};
  const key = env.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
  if (!key) {
    console.error("[inquiry] RESEND_API_KEY is not set — cannot send.");
    return reply(503, {
      ok: false,
      error: "Our form isn't accepting messages right now.",
    });
  }

  const when_ = when || "Not specified";
  const lines = [
    `Name:     ${name}`,
    `Email:    ${email}`,
    `Company:  ${company || "—"}`,
    `Scope:    ${SCOPE_LABEL[scope] || scope || "—"}`,
    `Start:    ${when_}`,
    "",
    "Brief:",
    brief,
  ].join("\n");

  try {
    await sendEmail(key, {
      from: FROM,
      to: [TO],
      reply_to: email, // so hitting Reply in Gmail goes straight to them
      subject: `New inquiry — ${name}${company ? ` (${company})` : ""}`,
      text: lines,
      html:
        `<div style="font:15px/1.6 system-ui;color:#0d2f45">` +
        `<h2 style="margin:0 0 1rem">New inquiry</h2><table cellpadding="6" style="border-collapse:collapse">` +
        [
          ["Name", name],
          ["Email", email],
          ["Company", company || "—"],
          ["Scope", SCOPE_LABEL[scope] || scope || "—"],
          ["Start", when_],
        ]
          .map(
            ([k, v]) =>
              `<tr><td style="color:#5e6b78">${k}</td><td><strong>${escape(v)}</strong></td></tr>`,
          )
          .join("") +
        `</table><p style="margin:1.25rem 0 .35rem;color:#5e6b78">Brief</p>` +
        `<div style="white-space:pre-wrap;border-left:3px solid #8e94b8;padding-left:1rem">${escape(brief)}</div></div>`,
    });
  } catch (err) {
    console.error("[inquiry] send failed:", err);
    return reply(502, {
      ok: false,
      error: "We couldn't send that just now.",
    });
  }

  const by = replyBy(new Date());

  /* Confirmation to the sender. Best-effort: the lead is already safely in the
     inbox, so a failure here must not tell the visitor their inquiry failed. */
  try {
    await sendEmail(key, {
      from: FROM,
      to: [email],
      reply_to: TO,
      subject: "We got your inquiry - Forward Design Consulting",
      text:
        `Hi ${name},\n\nThanks for getting in touch. Your inquiry is with us and ` +
        `one of us will reply by ${by} with a flat-fee proposal.\n\n` +
        `For reference, here's what you sent:\n\n${brief}\n\nForward Design Consulting\n${TO}`,
    });
  } catch (err) {
    console.error("[inquiry] confirmation failed (inquiry itself was delivered):", err);
  }

  return reply(200, { ok: true, replyBy: by });
};
