/* =============================================================================
   CENA 15 — Flash âmbar: "ATÉ QUE ALGO desperta."
   - Corte seco para âmbar sólido com as faíscas por cima (blend overlay).
   - Ao rolar, o âmbar escurece (camada preta 0 → 0.8), partículas sobem
     devagar (canvas 2D) e o texto sobe até o topo.
   ============================================================================= */
(function (H) {
  let canvas, c2d, parts = [], running = false;

  function resize() {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = H.vp.w * dpr;
    canvas.height = H.vp.h * dpr;
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function spawn(initial) {
    return {
      x: Math.random() * H.vp.w,
      y: initial ? Math.random() * H.vp.h : H.vp.h + 10,
      r: 0.6 + Math.random() * 2.2,
      vy: 0.25 + Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 0.3,
      a: 0.3 + Math.random() * 0.7,
      f: Math.random() * Math.PI * 2,
    };
  }

  function tick() {
    c2d.clearRect(0, 0, H.vp.w, H.vp.h);
    c2d.globalCompositeOperation = 'lighter';
    for (const p of parts) {
      p.y -= p.vy;
      p.f += 0.03;
      p.x += p.vx + Math.sin(p.f) * 0.25;
      if (p.y < -10) Object.assign(p, spawn(false));
      const flick = 0.6 + 0.4 * Math.sin(p.f * 3);
      c2d.beginPath();
      c2d.fillStyle = `rgba(255, 196, 120, ${p.a * flick})`;
      c2d.shadowBlur = 8;
      c2d.shadowColor = 'rgba(255, 150, 50, 0.9)';
      c2d.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      c2d.fill();
    }
  }

  H.scene({
    n: 15,
    el: '#s-awake',
    len: 1.8,
    overlap: 0,
    rest: 0.3,

    init(ctx) {
      canvas = ctx.q('#aw-particles');
      c2d = canvas.getContext('2d');
      const count = H.isMobile() ? 50 : 110;
      for (let i = 0; i < count; i++) parts.push(spawn(true));
      resize();
    },

    resize,

    build(tl, at, ctx) {
      const dark = ctx.q('.aw-dark');
      const title = ctx.q('.aw-title');
      const sparks = ctx.q('.aw-sparks');

      // corte seco: a cena aparece inteira de uma vez (sem fade)
      H.u.fx.textIn(tl, title, at, { dur: 0.18, stagger: 0.02, italicDelay: 0.05 });
      tl.fromTo(sparks, { scale: 1.15 }, { scale: 1, duration: 1.8 }, at)
        .to(dark, { opacity: 0.8, duration: 1.3 }, at + 0.3)
        .to(title, { y: () => -(H.vp.h * 0.5 - title.offsetHeight / 2 - H.vp.h * 0.1), duration: 1.0, ease: 'power2.inOut' }, at + 0.6)
        .to(title, { opacity: 0, filter: 'blur(8px)', duration: 0.25 }, at + 1.55);
    },

    active(on) {
      if (on === running || H.reduced) return;
      running = on;
      if (on) window.gsap.ticker.add(tick);
      else window.gsap.ticker.remove(tick);
    },
  });
})(window.HALVORN);
