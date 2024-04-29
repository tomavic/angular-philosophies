/* Landing page. Everything here is an enhancement: without it the page is static and complete. */
(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const io = (els, cb, opts) => {
    if (!('IntersectionObserver' in window)) return els.forEach(el => cb(el));
    const o = new IntersectionObserver(es => es.forEach(e => e.isIntersecting && cb(e.target, o)), opts);
    els.forEach(el => o.observe(el));
  };

  /* ---- 09:12: the prompt arrives ---- */
  io($$('.ask'), (el, o) => { el.classList.add('seen'); o && o.unobserve(el); }, { threshold: 0.6 });

  /* ---- 09:14: the review. The step in the middle of the screen drives the pinned code. ---- */
  const pane = $('.pane'), code = $('#pane-code'), counter = $('#pane-count');
  const steps = $$('.step');
  const flaws = steps.filter(s => s.classList.contains('comment')).map(s => s.dataset.f);
  const lines = code ? $$('.ln', code) : []; // chapter pages have no pane: a throw here would stop the chapter code below
  const linesOf = id => lines.filter(l => l.dataset.f.split(' ').includes(id));

  function show(step) {
    steps.forEach(s => s.classList.toggle('active', s === step));
    const f = step.dataset.f, at = flaws.indexOf(f);
    lines.forEach(l => { l.classList.remove('on', 'fixed'); delete l.dataset.pin; });
    const upto = f === '*' ? flaws.length : at + 1;
    flaws.slice(0, Math.max(upto, 0)).forEach((id, i) => linesOf(id).forEach(l => { l.dataset.pin = i + 1; }));
    if (f === '*') flaws.forEach(id => linesOf(id).forEach(l => l.classList.add('fixed')));
    pane.classList.toggle('focus', at >= 0);
    counter.textContent = at >= 0 ? `${at + 1} / ${flaws.length}` : f === '*' ? `${flaws.length} / ${flaws.length}` : '';
    if (at < 0) return;
    const hit = linesOf(f);
    hit.forEach(l => l.classList.add('on'));
    const top = hit[0].offsetTop - code.clientHeight / 3;
    code.scrollTo({ top: Math.max(0, top), behavior: reduce ? 'auto' : 'smooth' });
  }
  if (pane && steps.length) io(steps, show, { rootMargin: '-45% 0px -45% 0px' });

  /* ---- 09:20: the component rewrites itself ---- */
  const morph = $('#morph');
  let timers = [];
  function run() {
    timers.forEach(clearTimeout);
    morph.dataset.phase = 'before';
    timers = [setTimeout(() => (morph.dataset.phase = 'diff'), 700), setTimeout(() => (morph.dataset.phase = 'after'), 2900)];
  }
  if (morph) {
    morph.dataset.phase = 'before';
    io([morph], (el, o) => { run(); o && o.unobserve(el); }, { threshold: 0.35 });
    $('#replay').addEventListener('click', run);
  }

  /* ---- install tabs ---- */
  $$('[data-tabs]').forEach(box => {
    const tabs = $$('[role=tab]', box);
    const pick = (t, focus) => {
      tabs.forEach(x => {
        const on = x === t;
        x.setAttribute('aria-selected', on);
        x.tabIndex = on ? 0 : -1;
        document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
      });
      if (focus) t.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => pick(t));
      t.addEventListener('keydown', e => {
        const rtl = getComputedStyle(box).direction === 'rtl';
        const step = { ArrowRight: rtl ? -1 : 1, ArrowLeft: rtl ? 1 : -1, Home: -i, End: tabs.length - 1 - i }[e.key];
        if (step === undefined) return;
        e.preventDefault();
        pick(tabs[(i + step + tabs.length) % tabs.length], true);
      });
    });
  });

  /* ---- copy buttons ---- */
  $$('[data-copy]').forEach(b => {
    const label = b.textContent;
    b.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(document.getElementById(b.dataset.copy).textContent);
        b.textContent = b.dataset.done;
        setTimeout(() => (b.textContent = label), 1600);
      } catch { /* clipboard blocked: the text is still selectable */ }
    });
  });

})();

/* Chapter pages: the diagram, where you are on the page, and how far you have read. */
(() => {
  if (!document.body.classList.contains('chapter-page')) return;
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  $$('.figure[data-diagram]').forEach(fig => {
    const dg = window.Diagrams && Diagrams.mount(fig.dataset.diagram, fig);
    if (!dg) return fig.remove(); // no GSAP, no empty box
    const btn = document.createElement('button');
    btn.type = 'button'; btn.className = 'replay'; btn.textContent = 'Replay';
    btn.addEventListener('click', () => dg.play());
    fig.prepend(btn);
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) { io.disconnect(); dg.play(); } }, { threshold: 0.35 });
    io.observe(fig);
  });

  const links = $$('.side a');
  const heads = links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean);
  const progress = document.querySelector('.progress');
  let ticking = false;
  const update = () => {
    ticking = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    let current = heads[0];
    for (const h of heads) if (h.getBoundingClientRect().top < innerHeight * 0.3) current = h;
    links.forEach(a => a.setAttribute('aria-current', String(!!current && a.hash === '#' + current.id)));
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
  update();
})();
