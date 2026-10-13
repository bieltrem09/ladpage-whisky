/* =============================================================================
   CENA 8 — Respiro preto
   Meio segundo de tela quase preta, só um ponto creme piscando como um "rec".
   Pausa dramática antes do mestre.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 8,
    el: '#s-breath',
    len: 0.6,
    overlap: 0,
    rest: 0.3,
    build(tl, at, ctx) {
      tl.fromTo(ctx.q('.rec-dot'), { scale: 0 }, { scale: 1, duration: 0.1, ease: 'power3.out' }, at + 0.05)
        .to(ctx.q('.rec-dot'), { scale: 0, duration: 0.08 }, at + 0.52);
    },
  });
})(window.HALVORN);
