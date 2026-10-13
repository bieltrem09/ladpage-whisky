/* =============================================================================
   CENA 17 — "O filme": montagem com as imagens, controlada pelo scroll
   - Uma sequência de quadros (gerada a partir das imagens em alta, com
     movimento de câmera, fusões e flashes âmbar) é desenhada num canvas.
     O scroll é a agulha do filme: rolar para baixo avança, para cima volta.
     Entre dois quadros é feita uma fusão pelo valor fracionário, então o
     movimento fica suave mesmo com poucos quadros.
   - Barras de cinema (letterbox) abrem no início e fecham no fim.
   - Contador "REC" com timecode e três legendas que trocam.
   - Os quadros carregam em segundo plano depois do SIM (não seguram o
     preloader); enquanto um quadro não chega, mostra-se o mais próximo.
   ============================================================================= */
(function (H) {
  const state = { f: 0 };
  const frames = [];
  let canvas, c2d, total, drawn = -1, running = false, portrait = null, tcEl;

  function src(n) {
    const cfg = H.config.film;
    return (portrait ? cfg.portrait : cfg.landscape).replace('{n}', String(n).padStart(3, '0'));
  }

  /** carrega intercalado (a cada 8, depois a cada 4, 2, 1): a sequência
      inteira fica "navegável" cedo, e vai ganhando resolução temporal */
  function load() {
    frames.length = 0;
    const order = [];
    const seen = new Set();
    [8, 4, 2, 1].forEach((step) => {
      for (let n = 0; n < total; n += step) if (!seen.has(n)) { seen.add(n); order.push(n); }
    });
    let i = 0;
    const next = () => {
      if (i >= order.length) return;
      const n = order[i++];
      const img = new Image();
      img.decoding = 'async';
      img.onload = img.onerror = () => {
        if (img.naturalWidth) frames[n] = img;
        drawn = -1;
        next();
      };
      img.src = src(n);
    };
    for (let k = 0; k < 4; k++) next(); // 4 downloads em paralelo
  }

  function nearest(n) {
    for (let d = 0; d < total; d++) {
      if (frames[n - d]) return frames[n - d];
      if (frames[n + d]) return frames[n + d];
    }
    return null;
  }

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(H.vp.w * dpr);
    canvas.height = Math.round(H.vp.h * dpr);
    const wantPortrait = H.vp.h > H.vp.w;
    if (wantPortrait !== portrait) { portrait = wantPortrait; load(); }
    drawn = -1;
  }

  function cover(img, alpha) {
    const cw = canvas.width, ch = canvas.height;
    const s = Math.max(cw / img.naturalWidth, ch / img.naturalHeight);
    const w = img.naturalWidth * s, h = img.naturalHeight * s;
    c2d.globalAlpha = alpha;
    c2d.drawImage(img, (cw - w) / 2, (ch - h) / 2, w, h);
  }

  function draw() {
    const f = H.u.clamp(state.f, 0, total - 1);
    const key = Math.round(f * 20);
    if (key === drawn) return;
    drawn = key;
    const i0 = Math.floor(f);
    const w = f - i0;
    const a = nearest(i0);
    if (!a) return;
    cover(a, 1);
    const b = frames[i0 + 1];
    if (b && w > 0.02) cover(b, w);
    c2d.globalAlpha = 1;
    // timecode a 24 qps
    const fps = H.config.film.fps;
    const s = Math.floor(i0 / fps), fr = i0 % fps;
    tcEl.textContent = `00:00:${String(s).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  }

  H.scene({
    n: 17,
    el: '#s-film',
    len: 5.2,
    overlap: 0,
    rest: 2.6,

    init(ctx) {
      canvas = ctx.q('#fl-canvas');
      c2d = canvas.getContext('2d');
      tcEl = ctx.q('#fl-tc');
      total = H.config.film.frames;
      ctx.q('#fl-caps').innerHTML = H.config.text.filmCaptions
        .map((c) => `<p class="fl-cap scene-title">${H.u.rich(c)}</p>`)
        .join('');
    },

    resize,

    build(tl, at, ctx) {
      if (portrait === null) resize(); // primeira vez: escolhe o formato e começa a carregar
      const bars = ctx.qa('.fl-bar');
      const rec = ctx.q('.fl-rec');
      const caps = ctx.qa('.fl-cap');

      tl.fromTo(ctx.el, { opacity: 0 }, { opacity: 1, duration: 0.2 }, at)
        // as barras abrem até o formato cinema
        .fromTo(bars, { scaleY: 1 }, { scaleY: 0.22, duration: 0.5, ease: 'expo.inOut' }, at + 0.1)
        .fromTo(rec, { opacity: 0 }, { opacity: 1, duration: 0.2 }, at + 0.5)
        // a agulha do filme
        .fromTo(state, { f: 0 }, { f: total - 1, duration: 4.6, ease: 'none' }, at + 0.15);

      // legendas
      const gap = 1.35;
      caps.forEach((cap, i) => {
        const s = at + 0.8 + i * gap;
        tl.set(cap, { visibility: 'visible' }, s);
        H.u.fx.textIn(tl, cap, s, { dur: 0.35 });
        H.u.fx.blurOut(tl, cap, i < caps.length - 1 ? s + gap - 0.3 : at + 4.45, { dur: 0.25, y: -40 });
      });

      // fim: as barras fecham (corte para o preto)
      tl.to(rec, { opacity: 0, duration: 0.2 }, at + 4.7)
        .to(bars, { scaleY: 1, duration: 0.45, ease: 'expo.inOut' }, at + 4.72);
    },

    active(on) {
      if (on === running) return;
      running = on;
      drawn = -1;
      if (on) window.gsap.ticker.add(draw);
      else window.gsap.ticker.remove(draw);
    },
  });
})(window.HALVORN);
