/* Burnt Crumbs Homepage — interactions */
(() => {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  /* ──────────────────────────────────────────────────────────
     Stop-motion: build frames then auto-loop at 500ms
     ────────────────────────────────────────────────────────── */
  const SLIDES = {
    burrito: [
      'GoodTimesMedia_BurntCrumbsAugust2024072.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024073.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024074.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024075.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024076.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024077.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024078.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024079.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024080.jpg',
    ],
    chicken: [
      'GoodTimesMedia_BurntCrumbsAugust2024039.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024040.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024041.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024042.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024043.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024044.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024045.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024046.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024047.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024048.jpg',
    ],
    pancake: [
      'GoodTimesMedia_BurntCrumbsAugust2024096.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024097.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024098.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024099.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024100.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024101.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024102.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024103.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024104.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024105.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024106.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024107.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024108.jpg',
    ],
    salad: [
      'GoodTimesMedia_BurntCrumbsAugust2024185.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024186.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024187.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024189.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024190.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024191.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024192.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024193.jpg',
      'GoodTimesMedia_BurntCrumbsAugust2024194.jpg',
    ],
  };

  /* Build frame containers */
  $$('.stopmo-stage').forEach(stage => {
    const key = stage.dataset.folder;
    const wrap = stage.querySelector('.frames');
    const arr = SLIDES[key] || [];
    arr.forEach((f, i) => {
      const img = document.createElement('img');
      img.src = `media/slideshow-${key}/${f}`;
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      if (i === 0) img.classList.add('on');
      wrap.appendChild(img);
    });
  });

  /* Auto-loop each stage at 500ms */
  $$('.stopmo-stage').forEach(stage => {
    const imgs = Array.from(stage.querySelectorAll('.frames img'));
    if (!imgs.length) return;
    let idx = 0;
    setInterval(() => {
      imgs[idx].classList.remove('on');
      idx = (idx + 1) % imgs.length;
      imgs[idx].classList.add('on');
    }, 500);
  });

  /* ──────────────────────────────────────────────────────────
     Curved Carousel
     ────────────────────────────────────────────────────────── */
  const carousel = $('#carousel');
  const cards = $$('.carousel-card', carousel);
  const dots = $('#carousel-dots');

  cards.forEach((_, i) => {
    const b = document.createElement('button');
    b.style.cssText = 'width:6px;height:6px;border-radius:99px;background:rgba(245,237,224,0.25);border:0;padding:0;transition:width 200ms,background 200ms;';
    b.dataset.idx = i;
    dots.appendChild(b);
  });

  function updateCarousel() {
    const cw = carousel.clientWidth;
    const center = carousel.scrollLeft + cw / 2;
    let closestIdx = 0;
    let closestDist = Infinity;

    cards.forEach((card, i) => {
      const cardCenter = card.offsetLeft + card.offsetWidth / 2;
      const dx = cardCenter - center;
      const norm = dx / (cw * 0.6);
      const clamped = Math.max(-1.4, Math.min(1.4, norm));
      const abs = Math.abs(clamped);

      const y = abs * abs * 50;
      const rot = clamped * 10;
      const scale = 1 - Math.min(0.18, abs * 0.16);
      const opacity = 1 - Math.min(0.45, abs * 0.4);
      card.style.transform = `translateY(${y}px) rotate(${rot}deg) scale(${scale})`;
      card.style.opacity = opacity;
      card.style.zIndex = String(100 - Math.round(abs * 100));

      if (Math.abs(dx) < closestDist) { closestDist = Math.abs(dx); closestIdx = i; }
    });

    const c = cards[closestIdx];
    $('#ci-num').textContent = String(closestIdx + 1).padStart(2, '0');
    $('#ci-name').textContent = c.dataset.name || '';
    $('#ci-price').textContent = c.dataset.price || '';

    $$('button', dots).forEach((b, i) => {
      b.style.background = i === closestIdx ? 'var(--ember)' : 'rgba(245,237,224,0.25)';
      b.style.width = i === closestIdx ? '18px' : '6px';
    });
  }

  carousel.addEventListener('scroll', () => requestAnimationFrame(updateCarousel), { passive: true });

  $$('button', dots).forEach(btn => {
    btn.addEventListener('click', () => {
      const card = cards[+btn.dataset.idx];
      const target = card.offsetLeft + card.offsetWidth / 2 - carousel.clientWidth / 2;
      carousel.scrollTo({ left: target, behavior: 'smooth' });
    });
  });

  /* ──────────────────────────────────────────────────────────
     Nav scrolled state + sticky CTA
     ────────────────────────────────────────────────────────── */
  const nav = $('#nav');
  const sticky = $('#sticky-cta');
  const hero = $('.hero');

  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    nav.classList.toggle('scrolled', y > 80);
    const heroBottom = hero.offsetTop + hero.offsetHeight;
    sticky.classList.toggle('on', y > heroBottom - 200);
  }

  document.addEventListener('scroll', () => requestAnimationFrame(onScroll), { passive: true });

  /* Initial paint */
  requestAnimationFrame(() => {
    const first = cards[0];
    const target = first.offsetLeft + first.offsetWidth / 2 - carousel.clientWidth / 2;
    carousel.scrollLeft = target;
    updateCarousel();
    onScroll();
  });

})();
