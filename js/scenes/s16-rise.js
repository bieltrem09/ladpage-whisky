/* =============================================================================
   CENA 16 — Líquido subindo: "ESTA NOITE merece."
   - Copo visto de cima, tom quente (WebGL: js/webgl/liquid-rise.js).
   - A superfície âmbar com ondulação sobe conforme o scroll até a metade
     da tela; abaixo dela a imagem fica tingida e distorcida. O mouse cria
     pequenas ondas na linha d'água.
   - Fallback: div âmbar (multiply) subindo com uma onda SVG no topo.
   - Saída: o líquido cobre tudo e a tela escurece.
   ============================================================================= */
(function (H) {
  let fx = null, fallback = false;

  H.scene({
    n: 16,
    el: '#s-rise',
    len: 2.6,
    overlap: 0.25,
    rest: 1.3,

    build(tl, at, ctx) {
      if (!fx && !fallback) {
        try {
          if (!H.GL.supported()) throw new Error('sem WebGL');
          fx = H.LiquidRise(ctx.q('#rs-canvas'), H.images['glass-top']);
        } catch (e) {
          console.info('[halvorn] cena 16 usando fallback:', e.message);
          fallback = true;
          ctx.q('#rs-fallback').hidden = false;
          ctx.q('#rs-canvas').style.display = 'none';
        }
      }
      const media = ctx.q('.rs-media');
      const dark = ctx.q('.rs-dark');
      const title = ctx.q('.rs-text .scene-title');

      tl.fromTo(ctx.el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at)
        .fromTo(media, { scale: 1.12 }, { scale: 1, duration: 2.6, ease: 'power1.out' }, at);

      if (fx) {
        tl.fromTo(fx.state, { level: -0.06 }, { level: 0.5, duration: 1.5, ease: 'power2.out' }, at + 0.1)
          .to(fx.state, { level: 1.15, duration: 0.8, ease: 'power2.in' }, at + 1.75);
      } else {
        const liquid = ctx.q('.rs-liquid');
        tl.fromTo(liquid, { height: '0%' }, { height: '50%', duration: 1.5, ease: 'power2.out' }, at + 0.1)
          .to(liquid, { height: '110%', duration: 0.8, ease: 'power2.in' }, at + 1.75);
      }

      H.u.fx.textIn(tl, title, at + 0.75, { dur: 0.4 });
      tl.to(title, { opacity: 0, y: -30, filter: 'blur(8px)', duration: 0.3 }, at + 2.05)
        .to(dark, { opacity: 1, duration: 0.45 }, at + 2.15);
    },

    active(on) {
      fx && fx.setActive(on);
    },
  });
})(window.HALVORN);
