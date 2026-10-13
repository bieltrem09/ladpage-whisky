/* =============================================================================
   CENA 18 — Pré-final: "ELE AINDA ESTÁ AÍ. No fundo do copo."
   Fundo preto, frase única no centro, entra palavra por palavra e fica
   ~1 tela de scroll parada.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 18,
    el: '#s-deep',
    len: 1.8,
    overlap: 0,
    rest: 1.0,

    build(tl, at, ctx) {
      const title = ctx.q('.dp-title');
      const s = H.u.split(title);
      tl.fromTo(ctx.el, { opacity: 0 }, { opacity: 1, duration: 0.15 }, at);
      tl.fromTo(s.words, { yPercent: 135, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.3, stagger: 0.09, ease: 'power4.out' }, at + 0.1);
      tl.fromTo(H.u.italicWords(title), { filter: 'blur(8px)' }, { filter: 'blur(0px)', duration: 0.3, stagger: 0.09 }, at + 0.45);
      tl.to(title, { opacity: 0, y: -20, filter: 'blur(8px)', duration: 0.25 }, at + 1.6);
    },
  });
})(window.HALVORN);
