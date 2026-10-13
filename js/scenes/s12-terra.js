/* =============================================================================
   CENA 12 — "TERRA alta."
   O único momento frio do site: rio nas Highlands em tons azulados.
   - Entra com fade a partir do preto + scale 1.1 → 1.
   - Título no canto inferior direito + microtexto.
   - Saída: a imagem escurece até o preto e o título sobe até o topo,
     encolhendo, antes de sumir.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 12,
    el: '#s-terra',
    len: 2.0,
    overlap: 0,
    rest: 1.0,

    build(tl, at, ctx) {
      const media = ctx.q('.tr-media');
      const img = ctx.q('.tr-media img');
      const dark = ctx.q('.tr-dark');
      const text = ctx.q('.tr-text');
      const title = ctx.q('.tr-text .scene-title');
      const micro = ctx.q('.tr-micro');

      tl.to(media, { opacity: 1, duration: 0.5 }, at)
        .fromTo(img, { scale: 1.1 }, { scale: 1, duration: 1.4, ease: 'power2.out' }, at);
      H.u.fx.textIn(tl, title, at + 0.45, { dur: 0.4 });
      tl.fromTo(micro, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, at + 0.75);

      // saída: escurece e o título sobe ao topo encolhendo
      tl.to(dark, { opacity: 1, duration: 0.55 }, at + 1.3)
        .to(micro, { opacity: 0, duration: 0.2 }, at + 1.3)
        .to(text, {
          y: () => -(H.vp.h - text.offsetHeight - H.vp.h * 0.11 - H.vp.h * 0.1),
          scale: 0.55,
          duration: 0.55,
          ease: 'power2.inOut',
        }, at + 1.3)
        .to(text, { opacity: 0, filter: 'blur(10px)', duration: 0.15 }, at + 1.85);
    },
  });
})(window.HALVORN);
