/* One animated diagram per idea in the guide. Each builder renders into `root` and returns a paused GSAP timeline.
   Diagrams.mount(name, host) wires play/replay; with reduced motion the end state is shown without travel. */
(function () {
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = (tag, cls, html, parent) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    if (parent) parent.appendChild(n);
    return n;
  };
  const E = 'power3.out';
  // mirrors the tokens in site.css (GSAP needs real colour values to tween)
  const C = { red: '#dd0031', onRed: '#ffffff', white: '#f1f3f5', onWhite: '#0c0d10', clear: 'transparent' };
  const rtl = () => document.documentElement.dir === 'rtl';

  // Literal code in a diagram is real <code>, so the monospace stays inside code elements.
  const setText = (node, text) => { (node.querySelector('code') || node).textContent = text; };
  const wrapCode = root => root.querySelectorAll('.blk.code').forEach(n => { if (!n.querySelector('code')) n.innerHTML = '<code>' + n.innerHTML + '</code>'; });
  // Arabic pages define PHIL_CAPS to translate the captions; English is the fallback.
  const caption = (root, tl, at, text) => tl.call(() => { root.querySelector('.cap').textContent = (window.PHIL_CAPS && PHIL_CAPS[text]) || text; }, null, at);
  const shell = root => { root.innerHTML = ''; root.classList.add('dg'); return el('p', 'cap', '', root); };

  /* ---- chapter 1: dependencies flow down, lint refuses up ---- */
  function layers(root) {
    const cap = shell(root);
    const names = ['shell', 'feature', 'ui', 'core', 'data-access', 'util'];
    const wrap = el('div', '', '', root);
    wrap.style.cssText = 'position:relative;display:grid;gap:10px;max-width:960px';
    const bars = names.map((n, i) => {
      const b = el('div', 'blk ' + (i % 2 ? 'surf' : 'soft'), `<span>type:${n}</span>`, wrap);
      b.style.width = `${100 - i * 3}%`; b.style.justifyContent = 'space-between';
      return b;
    });
    const msg = el('div', 'blk', 'A project tagged with "type:util" can only depend on libs tagged with "type:util"', root);
    msg.style.cssText = 'white-space:normal;max-width:960px;font-weight:600';
    const pkt = el('div', 'blk hi', '', wrap);
    pkt.style.cssText = 'position:absolute;inset-inline-end:14px;width:18px;height:18px;padding:0;top:0';
    const y = i => bars[i].offsetTop + bars[i].offsetHeight / 2 - 9;
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'Dependencies flow down: shell, feature, ui, core, data-access, util.');
    tl.from(bars, { x: () => (rtl() ? 60 : -60), opacity: 0, duration: 0.5, stagger: 0.07, ease: E });
    tl.set(pkt, { y: y(0), opacity: 1 }).from(pkt, { opacity: 0, duration: 0.2 });
    for (let i = 1; i < names.length; i++) {
      tl.to(pkt, { y: y(i), duration: 0.32, ease: 'power2.inOut' })
        .to(bars[i], { scale: 1.025, duration: 0.12, yoyo: true, repeat: 1, transformOrigin: 'left center' }, '<0.22');
    }
    caption(root, tl, '>', 'Now util tries to import from ui. That is the wrong direction.');
    tl.to(pkt, { y: y(2) + (y(3) - y(2)) * 0.45, duration: 0.45, ease: 'power2.out' })
      .to(pkt, { x: 7, duration: 0.06, repeat: 5, yoyo: true })
      .to(bars[5], { backgroundColor: C.red, color: C.onRed, duration: 0.15 })
      .from(msg, { opacity: 0, y: 14, duration: 0.4, ease: E }, '<')
      .to(pkt, { y: y(5), x: 0, duration: 0.5, ease: 'power2.inOut' });
    caption(root, tl, '>', 'The build fails with that message. Nobody had to remember the rule.');
    return tl;
  }

  /* ---- chapter 3: the store is the facade ---- */
  function store(root) {
    const cap = shell(root);
    const grid = el('div', 'dg-2', '', root);
    grid.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.2fr);gap:clamp(20px,5vw,72px);align-items:start;max-width:1120px';
    const left = el('div', 'dg-col', '', grid);
    const comp = el('div', 'blk', 'OrderListComponent', left);
    const reads = el('div', 'blk soft', 'reads signals', left);
    const calls = el('div', 'blk soft', 'calls methods', left);
    const http = el('div', 'blk ghost code', '<s>inject(HttpClient)</s>', left);
    const right = el('div', 'dg-col', '', grid);
    el('div', 'tag', 'OrderListStore', right);
    const parts = [['guardedDevtools', 'surf'], ['withState', 'hi'], ['withProps', 'soft'], ['withResource', 'hi'], ['withMutations', 'soft'], ['withComputed', 'hi'], ['withMethods', 'soft']];
    const blocks = parts.map(([n, k]) => el('div', 'blk code ' + k, n + '(…)', right));
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'The page talks to one object.');
    tl.from(comp, { y: 20, opacity: 0, duration: 0.45, ease: E })
      .from([reads, calls], { x: () => (rtl() ? 20 : -20), opacity: 0, duration: 0.35, stagger: 0.1, ease: E });
    caption(root, tl, '>', 'The store is built from small features, state first and methods last.');
    tl.from(blocks, { x: () => (rtl() ? -70 : 70), opacity: 0, duration: 0.4, stagger: 0.16, ease: E });
    caption(root, tl, '>', 'No HttpClient in the component, no subscribe, no load() to remember.');
    tl.from(http, { opacity: 0, duration: 0.3 }).to(http, { x: () => (rtl() ? 12 : -12), duration: 0.07, repeat: 3, yoyo: true })
      .to(http, { opacity: 0.45, duration: 0.3 });
    return tl;
  }

  /* ---- chapter 4: what a failed reload keeps ---- */
  function resource(root) {
    const cap = shell(root);
    const row = el('div', 'dg-row', '', root);
    const box = el('div', 'dg-col', '', row);
    box.style.cssText = 'min-width:min(100%,320px);flex:1;max-width:420px';
    const items = ['Ada: 10', 'Grace: 40', 'Linus: 25'].map(t => el('div', 'blk surf', t, box));
    const empty = el('div', 'blk ghost', 'items: [ ]   total: 0', box); empty.style.display = 'none';
    const side = el('div', 'dg-col', '', row);
    side.style.cssText = 'flex:1;min-width:220px';
    const act = el('div', 'blk code', 'store.refresh()', side);
    const err = el('div', 'blk', 'listError() is set', side);
    const stale = el('div', 'blk hi', 'stale: show "try again"', side);
    const tl = gsap.timeline({ paused: true });
    gsap.set([err, stale], { opacity: 0 });
    caption(root, tl, 0, 'A resource reads from state. The list is loaded.');
    tl.from(items, { y: 16, opacity: 0, duration: 0.4, stagger: 0.1, ease: E }).from(act, { opacity: 0, duration: 0.3 });
    caption(root, tl, '>0.5', 'The same request reloads and fails: the last good page stays.');
    tl.to(act, { borderInlineStartColor: C.red, duration: 0.2 })
      .to(err, { opacity: 1, duration: 0.25 }).to(stale, { opacity: 1, duration: 0.25 }, '<0.1')
      .to(items, { opacity: 1 }, '<');
    tl.to([err, stale], { opacity: 0, duration: 0.3 }, '+=1.6')
      .call(() => { setText(act, 'store.setPage(2)'); }, null, '<')
      .to(act, { borderInlineStartColor: C.clear, duration: 0.2 }, '<');
    caption(root, tl, '>', 'A changed page is a new request. It fails, and the value falls back to the default.');
    tl.to(act, { borderInlineStartColor: C.red, duration: 0.2 })
      .to(items, { opacity: 0, y: -10, duration: 0.3, stagger: 0.05 })
      .call(() => { items.forEach(i => (i.style.display = 'none')); empty.style.display = 'inline-flex'; })
      .from(empty, { opacity: 0, duration: 0.3 }).to(err, { opacity: 1, duration: 0.25 });
    caption(root, tl, '>', 'Design the page for both: a stale list with retry, and an empty state with an error.');
    return tl;
  }

  /* ---- chapter 9: worlds ---- */
  function worlds(root) {
    const cap = shell(root);
    const row = el('div', 'dg-row', '', root);
    row.style.alignItems = 'stretch';
    const defs = [
      ['loads the order', ['fakeHttp(order)', 'fakeRoute(77)', 'fakeService(Language)', 'fakeService(Files)'], null],
      ['while loading', ['fakeHttp(pending)', 'fakeRoute(77)', 'fakeService(Language)', 'fakeService(Files)'], 0],
      ['when the API fails', ['fakeHttp(httpError 500)', 'fakeRoute(77)', 'fakeService(Language)', 'fakeService(Files)'], 0],
    ];
    const cols = defs.map(([t, chips, swap]) => {
      const c = el('div', 'dg-col', '', row);
      c.style.cssText = 'background:var(--bg);padding:16px;min-width:210px;flex:1;max-width:260px';
      el('div', 'tag', 'describe', c).style.alignSelf = 'flex-start';
      el('strong', '', t, c).style.cssText = 'font-size:16px;margin:2px 0 6px';
      const cs = chips.map((x, i) => el('div', 'blk code ' + (i === swap ? 'hi' : 'surf'), x, c));
      return { c, cs };
    });
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'A world is one set of providers, fixed when the component is created.');
    tl.from(cols[0].c, { y: 20, opacity: 0, duration: 0.45, ease: E })
      .from(cols[0].cs, { x: () => (rtl() ? 20 : -20), opacity: 0, stagger: 0.08, duration: 0.3 }, '<0.1');
    caption(root, tl, '>0.4', 'A variant is a new world that swaps exactly one fake.');
    [1, 2].forEach(i => {
      tl.from(cols[i].c, { x: () => (rtl() ? -50 : 50), opacity: 0, duration: 0.5, ease: E })
        .from(cols[i].cs.slice(1), { opacity: 0, duration: 0.2, stagger: 0.04 }, '<0.2')
        .fromTo(cols[i].cs[0], { borderInlineStartColor: C.clear }, { borderInlineStartColor: C.red, duration: 0.4 }, '<0.15');
    });
    caption(root, tl, '>', 'Nothing is reset inside a test. Every test starts from a fresh world.');
    return tl;
  }

  /* ---- chapter 7: Arabic is a layout ---- */
  function flip(root) {
    const cap = shell(root);
    const card = el('div', '', '', root);
    card.style.cssText = 'position:relative;height:230px;width:100%;max-width:900px;background:var(--bg)';
    const parts = [
      ['blk', '<b>Shop</b>', 24, 20, 'mirror'],
      ['blk soft code', 'Orders', 250, 20, 'mirror'],
      ['blk soft code', 'Billing', 370, 20, 'mirror'],
      ['blk hi', '&larr; Back', 24, 92, 'arrow'],
      ['blk surf', 'Order 77 shipped', 24, 160, 'mirror'],
      ['blk', '120.00', 540, 160, 'digits'],
    ].map(([c, h, x, yy, role]) => {
      const n = el('div', c, h, card);
      n.style.cssText += `;position:absolute;left:${x}px;top:${yy}px`;
      n.dataset.role = role;
      return n;
    });
    wrapCode(card);
    const W = () => card.clientWidth;
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'Arabic is not a translation file. It is a layout.');
    tl.from(parts, { y: 16, opacity: 0, duration: 0.4, stagger: 0.07, ease: E });
    caption(root, tl, '>0.5', 'Logical properties flip the layout. Direction-carrying icons mirror. Numerals and logos do not.');
    parts.forEach((p, i) => {
      const l = p.offsetLeft, w = p.offsetWidth;
      // every box moves to its mirrored position; only the arrow glyph changes direction, the digits do not
      tl.to(p, { x: () => W() - l - w - l, duration: 0.8, ease: 'power3.inOut' }, i === 0 ? '>' : '<0.05');
      if (p.dataset.role === 'arrow') tl.set(p, { innerHTML: 'Back &rarr;' }, '<0.4');
      if (p.dataset.role === 'digits') tl.to(p, { backgroundColor: C.red, color: C.onRed, duration: 0.3 }, '<0.5');
    });
    caption(root, tl, '>0.2', 'The box moves, the digits keep their direction.');
    return tl;
  }

  /* ---- chapter 0: write the abstraction the third time ---- */
  function third(root) {
    const cap = shell(root);
    const stage = el('div', '', '', root);
    stage.style.cssText = 'position:relative;min-height:190px;max-width:900px';
    const copies = ['store A', 'store B', 'store C'].map((t, i) => {
      const c = el('div', 'blk code surf', `${t}: loading = false; error = null;`, stage);
      c.style.cssText += `;position:absolute;inset-inline-start:0;top:${i * 56}px`; return c;
    });
    const fn = el('div', 'blk hi code', 'withRequestStatus()', stage);
    fn.style.cssText += ';position:absolute;inset-inline-end:0;top:56px;font-size:18px';
    const count = el('div', 'tag', 'copies: 0', stage); count.style.cssText = 'position:absolute;inset-inline-end:0;top:0';
    const tl = gsap.timeline({ paused: true });
    gsap.set(fn, { opacity: 0, scale: 0.6 });
    caption(root, tl, 0, 'The first copy is fine. So is the second.');
    copies.forEach((c, i) => {
      tl.from(c, { x: () => (rtl() ? 40 : -40), opacity: 0, duration: 0.45, ease: E }, i * 0.9)
        .call(() => { count.textContent = `copies: ${i + 1}`; }, null, i * 0.9 + 0.2);
    });
    caption(root, tl, '>', 'The third copy is the signal. Now you know what varies.');
    tl.to(copies, { x: () => (rtl() ? -260 : 260), opacity: 0, duration: 0.55, stagger: 0.08, ease: 'power3.in' })
      .to(fn, { opacity: 1, scale: 1, duration: 0.55, ease: 'back.out(2)' }, '<0.3');
    caption(root, tl, '>', 'One feature, written once, with exactly the parts that differ as parameters.');
    return tl;
  }

  /* ---- chapter 2: components lost their ceremony ---- */
  function lighter(root) {
    const cap = shell(root);
    const code = el('pre', 'code', '', root);
    code.style.cssText = 'max-width:900px;padding:20px 24px;margin:0;width:100%';
    const lines = [
      ['@Component({', 0, ''],
      ['  standalone: true,', 1, 'the default'],
      ['  changeDetection: ChangeDetectionStrategy.OnPush,', 1, 'the default in 22'],
      ["  selector: 'app-order-list',", 0, ''],
      ["  templateUrl: './order-list.component.html',", 0, ''],
      ['})', 0, ''],
      ['export class OrderListComponent implements OnInit {', 2, 'no hook left to implement'],
      ['  constructor(private store: OrderListStore) {}', 1, 'inject() instead'],
      ["  @HostBinding('class') cls = 'block';", 1, 'host: { } instead'],
      ['  ngOnInit() { this.store.load(); }', 1, 'reads derive from state'],
      ['}', 0, ''],
    ].map(([t, drop, why]) => {
      const d = el('div', '', '', code);
      d.style.cssText = 'display:flex;justify-content:space-between;gap:16px;overflow:hidden;white-space:pre';
      el('span', '', t.replace(/^(\s*)(\S+)/, '$1<span class="k">$2</span>').replace(' implements OnInit', '<span class="gone"> implements OnInit</span>'), d);
      const w = el('span', '', why, d); w.style.cssText = 'color:#ff8f7e;font-family:var(--font);font-weight:500;font-size:14px;opacity:0;white-space:nowrap';
      return { d, drop, w };
    });
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'This is what a component looked like.');
    tl.from(lines.map(l => l.d), { opacity: 0, x: () => (rtl() ? 16 : -16), stagger: 0.05, duration: 0.3, ease: E });
    caption(root, tl, '>0.6', 'Angular 22 made most of it the default, so it goes.');
    lines.filter(l => l.drop === 1).forEach(l => {
      tl.to(l.w, { opacity: 1, duration: 0.2 }, '>0.25')
        .to(l.d, { backgroundColor: 'rgba(221,0,49,0.22)', duration: 0.2 }, '<')
        .to(l.d, { height: 0, opacity: 0, paddingBlock: 0, duration: 0.4, ease: 'power3.inOut' }, '>0.35');
    });
    // with ngOnInit gone there is nothing left to implement, so that clause goes too
    const cls = lines.find(l => l.drop === 2);
    tl.to(cls.w, { opacity: 1, duration: 0.2 }, '>0.25')
      .to(cls.d.querySelector('.gone'), { opacity: 0, duration: 0.4 }, '<')
      .call(() => cls.d.querySelector('.gone').remove());
    caption(root, tl, '>', 'What is left is the part that is yours.');
    return tl;
  }

  /* ---- chapter 5: the toolkit inventory ---- */
  function toolkit(root) {
    const cap = shell(root);
    const cols = el('div', '', '', root);
    cols.style.cssText = 'display:grid;grid-template-columns:repeat(auto-fit,minmax(210px,1fr));gap:16px;max-width:1160px';
    const defs = [
      ['Adopt', 'hi', ['withResource', 'withMutations', 'guardedDevtools', 'withMapper', 'withStorageSync']],
      ['When a real need shows up', 'surf', ['withImmutableState', 'withReset', 'withConditional', 'withUndoRedo', 'withCallState']],
      ['Leave alone', '', ['withDataService', 'withEntityResources', 'withPagination', 'withRedux', 'withFeatureFactory']],
    ];
    const chips = [];
    defs.forEach(([h, k, names]) => {
      const c = el('div', 'dg-col', '', cols);
      c.style.cssText = 'background:var(--bg);padding:14px;align-items:flex-start';
      el('div', 'tag' + (k === 'hi' ? ' hi' : ''), h, c);
      names.forEach(n => chips.push(el('div', 'blk code ' + (k || ''), n, c)));
    });
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'The toolkit ships more than a feature needs.');
    tl.from(chips, { x: () => gsap.utils.random(-300, 300), y: () => gsap.utils.random(-120, 120), rotation: () => gsap.utils.random(-14, 14), opacity: 0, duration: 0.8, stagger: { each: 0.04, from: 'random' }, ease: 'power3.out' });
    caption(root, tl, '>0.3', 'Three piles: standard, add when needed, and leave alone. Every extension is a thing a reader must learn.');
    return tl;
  }

  /* ---- chapter 6: features compose, the compiler checks the order ---- */
  function compose(root) {
    const cap = shell(root);
    const g = el('div', 'dg-2', '', root);
    g.style.cssText = 'display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:clamp(20px,5vw,72px);max-width:1040px;align-items:start;position:relative';
    const bench = el('div', 'dg-col', '', g);
    const store = el('div', 'dg-col', '', g);
    store.style.cssText += ';background:var(--bg);padding:14px;min-height:220px';
    el('div', 'tag', 'ProductSearchStore', store);
    const filters = el('div', 'blk code hi', 'withFilters({ q: "" })', bench);
    const pag = el('div', 'blk code surf', 'withServerPagination()', bench);
    const stat = el('div', 'blk code soft', 'withRequestStatus()', bench);
    const err = el('div', 'blk', "Property 'firstPage' is missing", g);
    err.style.cssText += ';position:absolute;inset-inline-end:0;bottom:0;white-space:normal;max-width:300px;font-weight:600';
    const slot = n => { const s = n.cloneNode(true); s.style.opacity = 1; return s; };
    const move = (n, to) => { const c = slot(n); store.appendChild(c); gsap.set(n, { opacity: 0.18 }); return c; };
    const tl = gsap.timeline({ paused: true });
    gsap.set(err, { opacity: 0 });
    caption(root, tl, 0, 'Features are small and compose. withFilters needs firstPage() from the pagination feature.');
    tl.from([filters, pag, stat], { y: 14, opacity: 0, duration: 0.4, stagger: 0.1, ease: E });
    caption(root, tl, '>0.3', 'Put it first and the compiler refuses.');
    tl.to(filters, { x: () => g.clientWidth * 0.5 * (rtl() ? -1 : 1), duration: 0.5, ease: 'power2.inOut' })
      .to(filters, { y: 6, duration: 0.06, repeat: 5, yoyo: true }).to(err, { opacity: 1, duration: 0.2 }, '<')
      .to(filters, { x: 0, y: 0, duration: 0.5, ease: 'power2.inOut' }, '+=0.7').to(err, { opacity: 0, duration: 0.2 }, '<');
    caption(root, tl, '>', 'In the right order it snaps in.');
    [[pag, 0], [filters, 1], [stat, 2]].forEach(([n, i]) => {
      tl.call(() => { const c = move(n); gsap.from(c, { x: () => (rtl() ? -60 : 60), opacity: 0, duration: 0.5, ease: E }); }, null, '>0.15');
    });
    tl.to({}, { duration: 0.6 });
    return tl;
  }

  /* ---- chapter 10: gates on the way to main ---- */
  function pipeline(root) {
    const cap = shell(root);
    const row = el('div', 'dg-row', '', root);
    row.style.cssText += ';position:relative;max-width:1160px;gap:8px;align-items:stretch';
    const names = ['commit', 'pre-commit<br>lint-staged', 'commit-msg<br>commitlint', 'pre-push<br>build + test', 'main'];
    const gates = names.map((n, i) => {
      const b = el('div', 'blk ' + (i === 0 || i === 4 ? 'hi' : 'surf'), n, row);
      b.style.cssText += ';flex:1;min-width:130px;white-space:normal;text-align:center;justify-content:center;min-height:64px';
      return b;
    });
    const msg = el('div', 'blk code', '', root); msg.style.cssText = 'white-space:normal;max-width:900px;opacity:0';
    const pkt = el('div', 'blk hi', '', row); pkt.style.cssText = 'position:absolute;width:20px;height:20px;padding:0;top:-12px;inset-inline-start:0';
    const px = i => gates[i].offsetLeft + gates[i].offsetWidth / 2 - 10;
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'Every commit passes the same gates, so review is about logic.');
    tl.from(gates, { y: 16, opacity: 0, duration: 0.4, stagger: 0.08, ease: E });
    tl.set(pkt, { x: () => px(0) }).from(pkt, { opacity: 0, duration: 0.2 })
      .to(pkt, { x: () => px(1), duration: 0.45, ease: 'power2.inOut' })
      .to(pkt, { x: () => px(2), duration: 0.45, ease: 'power2.inOut' })
      .call(() => { setText(msg, 'fixed the thing   ->   subject may not be empty, type may not be empty [type-empty]'); }, null, '<0.3')
      .to(msg, { opacity: 1, duration: 0.25 }, '<').to(pkt, { x: () => px(2) + 14, duration: 0.06, repeat: 5, yoyo: true }, '<0.1')
      .to(pkt, { x: () => px(0), duration: 0.6, ease: 'power2.inOut' }, '+=0.2');
    caption(root, tl, '>', 'Rejected at the commit-msg gate. The format is Conventional Commits with an emoji.');
    tl.call(() => { setText(msg, 'fix(orders-data-access): \u{1F41B} keep the page when a reload fails'); }, null, '+=0.3')
      .to(pkt, { x: () => px(1), duration: 0.35 }).to(pkt, { x: () => px(2), duration: 0.35 }).to(pkt, { x: () => px(3), duration: 0.35 }).to(pkt, { x: () => px(4), duration: 0.35 })
      .to(gates[4], { scale: 1.06, yoyo: true, repeat: 1, duration: 0.15 });
    caption(root, tl, '>', 'A well-formed commit passes every gate on its way to main.');
    return tl;
  }

  /* ---- chapter 11: one source, six formats ---- */
  function fan(root) {
    const cap = shell(root);
    const g = el('div', 'dg-2', '', root);
    g.style.cssText = 'position:relative;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.3fr);gap:clamp(48px,12vw,160px);align-items:center;max-width:1040px';
    const src = el('div', 'dg-col', '', g);
    const docs = el('div', 'blk', 'docs/  12 chapters', src);
    const rules = el('div', 'blk hi', 'rules blocks', src);
    const out = el('div', 'dg-col', '', g);
    const fm = ['AGENTS.md', 'Cursor rules', 'Claude skill', 'Claude plugin', 'llms.txt', 'MCP server'].map(n => el('div', 'blk code surf', n, out));
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('style', 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible');
    g.appendChild(svg);
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'The chapters are written by hand. Every rule ends up in the formats AI tools read.');
    tl.from(docs, { y: 14, opacity: 0, duration: 0.4, ease: E }).from(rules, { y: 14, opacity: 0, duration: 0.4, ease: E }, '>-0.1');
    fm.forEach((f, i) => {
      const gb = g.getBoundingClientRect(), a = rules.getBoundingClientRect(), b = f.getBoundingClientRect();
      const x1 = (rtl() ? a.left : a.right) - gb.left, y1 = a.top + a.height / 2 - gb.top, x2 = (rtl() ? b.right : b.left) - gb.left, y2 = b.top + b.height / 2 - gb.top;
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', `M${x1} ${y1} C ${x1 + (x2 - x1) / 2} ${y1}, ${x1 + (x2 - x1) / 2} ${y2}, ${x2} ${y2}`);
      p.setAttribute('fill', 'none'); p.setAttribute('stroke', C.white); p.setAttribute('stroke-width', '4');
      svg.appendChild(p);
      const len = p.getTotalLength();
      gsap.set(p, { strokeDasharray: len, strokeDashoffset: len });
      tl.to(p, { strokeDashoffset: 0, duration: 0.55, ease: 'power2.inOut' }, 0.9 + i * 0.1)
        .from(f, { x: () => (rtl() ? -30 : 30), opacity: 0, duration: 0.4, ease: E }, 1.25 + i * 0.1);
    });
    caption(root, tl, '>0.2', 'They come from the same text, so none of them can disagree with the chapters.');
    return tl;
  }

  /* ---- chapter 8: contrast you measure (interactive) ---- */
  function contrast(root) {
    const cap = shell(root);
    const lum = h => { const c = [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(x => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4)); return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]; };
    const ratio = (a, b) => { const [l, d] = [lum(a), lum(b)].sort((x, y) => y - x); return (l + 0.05) / (d + 0.05); };
    const g = el('div', 'dg-2', '', root);
    g.style.cssText = 'display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:clamp(20px,5vw,64px);max-width:1120px;align-items:start';
    const sample = el('div', '', '', g);
    sample.style.cssText = 'padding:28px;min-height:190px;display:grid;gap:10px;align-content:center';
    const big = el('div', '', 'Large heading', sample); big.style.cssText = 'font-weight:700;font-size:40px;letter-spacing:-0.03em;line-height:1';
    const small = el('div', '', 'A 12px label that someone reads on a phone, outdoors.', sample); small.style.cssText = 'font-family:var(--font-text);font-size:13px';
    const panel = el('div', 'dg-col', '', g);
    const num = el('div', '', '0.00:1', panel); num.style.cssText = 'font-weight:700;font-size:clamp(3rem,8vw,5.5rem);line-height:1;letter-spacing:-0.04em;font-variant-numeric:tabular-nums';
    const meter = el('div', '', '', panel); meter.style.cssText = 'position:relative;height:22px;background:var(--bg);max-width:360px';
    const fill = el('div', '', '', meter); fill.style.cssText = 'height:100%;width:0;background:#f1f3f5';
    [[3, '3'], [4.5, '4.5'], [7, '7']].forEach(([v, t]) => { const m = el('span', '', t, meter); m.style.cssText = `position:absolute;top:26px;inset-inline-start:${(v / 21) * 100}%;font-size:13px;font-weight:700;transform:translateX(-50%)`; const k = el('i', '', '', meter); k.style.cssText = `position:absolute;top:-6px;bottom:-6px;width:4px;background:#dd0031;inset-inline-start:${(v / 21) * 100}%`; });
    meter.style.marginBottom = '30px';
    const v = el('div', 'dg-row', '', panel);
    const vs = el('span', 'tag', '', v), vl = el('span', 'tag', '', v);
    const pick = el('div', 'dg-row', '', panel);
    const presets = [['Brand blue on dark', '#0059ff', '#101820'], ['Near-white on dark', '#e6edf3', '#101820'], ['Ink on night', '#f1f3f5', '#0c0d10']];
    const state = { fg: presets[0][1], bg: presets[0][2] };
    const apply = (fg, bg, animate) => {
      state.fg = fg; state.bg = bg;
      sample.style.background = bg; sample.style.color = fg;
      const r = ratio(fg, bg);
      gsap.to(fill, { width: Math.min(100, (r / 21) * 100) + '%', duration: animate ? 0.7 : 0, ease: E });
      const o = { v: parseFloat(num.dataset.v || 0) };
      gsap.to(o, { v: r, duration: animate ? 0.7 : 0, ease: E, onUpdate: () => { num.textContent = o.v.toFixed(2) + ':1'; num.dataset.v = o.v; } });
      vs.textContent = r >= 7 ? 'small text: pass' : 'small text: fail'; vs.className = 'tag' + (r >= 7 ? '' : ' hi');
      vl.textContent = r >= 3 ? 'large text: pass' : 'large text: fail'; vl.className = 'tag' + (r >= 3 ? '' : ' hi');
    };
    presets.forEach(([n, f, b]) => { const bt = el('button', 'blk surf', n, pick); bt.type = 'button'; bt.style.border = '0'; bt.style.cursor = 'pointer'; bt.addEventListener('click', () => { fgI.value = f; bgI.value = b; apply(f, b, true); }); });
    const mk = (label, val) => { const l = el('label', 'blk soft', label + ' ', pick); l.style.cursor = 'pointer'; const i = el('input', '', '', l); i.type = 'color'; i.value = val; i.style.cssText = 'width:34px;height:26px;border:0;padding:0;background:none;cursor:pointer'; i.setAttribute('aria-label', label + ' colour'); return i; };
    const fgI = mk('text', state.fg), bgI = mk('ground', state.bg);
    [fgI, bgI].forEach(i => i.addEventListener('input', () => apply(fgI.value, bgI.value, false)));
    const tl = gsap.timeline({ paused: true });
    caption(root, tl, 0, 'Measure it. Small text needs 7:1, large text and borders 3:1. Try your own colours.');
    tl.call(() => apply(presets[0][1], presets[0][2], true), null, 0.3)
      .call(() => { fgI.value = presets[1][1]; bgI.value = presets[1][2]; apply(presets[1][1], presets[1][2], true); }, null, 2.2)
      .call(() => { fgI.value = presets[2][1]; bgI.value = presets[2][2]; apply(presets[2][1], presets[2][2], true); }, null, 4);
    return tl;
  }

  const builders = { layers, store, resource, worlds, flip, third, lighter, toolkit, compose, pipeline, fan, contrast };

  function mount(name, host) {
    const build = builders[name];
    if (!build || !window.gsap) return null;
    const stage = el('div', '', '', host);
    let tl;
    const play = () => {
      if (tl) tl.kill();
      stage.innerHTML = '';
      tl = build(stage);
      wrapCode(stage);
      // progress(1, false) fires the callbacks on the way, so captions and swaps reach their final state.
      const seek = new URLSearchParams(location.search).get('seek'); // ?seek=2.5 shows the diagram at 2.5s, for review
      if (seek !== null) tl.time(Math.min(parseFloat(seek) || 0, tl.duration()), false).pause();
      else if (reduce()) tl.progress(1, false).pause();
      else tl.play(0);
    };
    return { play, stage };
  }

  window.Diagrams = { mount, names: Object.keys(builders) };
})();
