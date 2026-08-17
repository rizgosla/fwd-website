# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them — don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

**Scope override:** When a task is explicitly a redesign or visual-quality task, §2 and §3 apply to *code structure*, not visual ambition. Adding sections, visuals, and motion to match an established design language is in-scope, not speculative. The code constraints still hold in full: no new dependencies, no new abstractions, no refactoring of things that work.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it — don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:

```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

## 5. Show, Don't Describe

**For any visual or copy change, I see it before you implement it.**

- Visual changes get a preview route I can open in a browser. Not a description, not a diff.
- Copy written in my voice gets shown to me as text before it goes in a page.
- Don't batch approval requests. One section, one question, one answer.
- Silence is not approval. If I haven't answered, ask again.

---

## Project stack — fwd-website

- Astro 5, deployed to Cloudflare via `@astrojs/cloudflare`.
- Tailwind v4 is installed but barely used — `global.css` is ~3,000 lines of hand-written CSS with custom properties. Write plain CSS using the existing tokens. Do not Tailwind-ify existing markup.
- **No React.** There are zero `.jsx`/`.tsx` files and no React dependency. If a task seems to need React, stop and ask — the answer is almost certainly no.
- No new dependencies without asking first.
- Animation is IntersectionObserver (`BaseLayout.astro`) plus CSS keyframes (`mv-rise` / `mv-stagger` / `mv-soften` in `global.css`). Work within it. Do not introduce an animation library.
- I'm on Windows using PowerShell. `bash` on my machine resolves to a broken WSL relay. Don't write shell scripts, don't invoke `bash`, don't try to screenshot. Give me a URL and I'll look.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.
