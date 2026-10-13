/* =============================================================================
   CENA 14 — "CARVALHO QUEIMADO."
   - Madeira queimada com whisky escorrendo, zoom lento contínuo.
   - Grão de filme mais forte durante a cena.
   - Título entra por máscara de baixo; o itálico com 0.2s de atraso.
   - Saída: o itálico sobe e sai pelo topo enquanto o fundo vai ao preto.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 14,
    el: '#s-oak',
    len: 2.0,
    overlap: 0.45,
    rest: 1.1,
    hudOffset: 0.4,

    build(tl, at, ctx) {
      const img = ctx.q('.ok-media img');
      const dark = ctx.q('.ok-dark');
      const title = ctx.q('.ok-text .scene-title');
      const grain = H.grain.el;

      tl.fromTo(img, { scale: 1.12 }, { scale: 1.28, duration: 2.0 }, at)
        .fromTo(grain, { opacity: 0.06 }, { opacity: 0.15, duration: 0.4 }, at + 0.3);
      H.u.fx.textIn(tl, title, at + 0.6, { dur: 0.4, italicDelay: 0.2 });

      const italic = title.querySelector('em');
      const plain = H.u.plainWords(title);
      tl.to(plain, { opacity: 0, duration: 0.25 }, at + 1.45)
        .to(italic, { y: () => -H.vp.h * 0.85, filter: 'blur(10px)', scaleY: 1.3, opacity: 0, duration: 0.45, ease: 'power2.in' }, at + 1.5)
        .to(dark, { opacity: 1, duration: 0.45 }, at + 1.5)
        .to(grain, { opacity: 0.06, duration: 0.3 }, at + 1.7);
    },
  });
})(window.HALVORN);
