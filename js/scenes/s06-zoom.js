/* =============================================================================
   CENA 6 — "AGORA OLHE DE perto." (zoom até mergulhar na gota)
   - A frase aparece centralizada, pequena, letra por letra.
   - A gota (recortada, sem o fundo branco) sobe de baixo, centraliza e cresce.
   - A câmera "mergulha" no bulbo da gota: zoom forte até o âmbar cobrir a
     tela, enquanto a cena 7 (copo com fumaça) entra por cima.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 6,
    el: '#s-zoom',
    len: 2.2,
    overlap: 0.3,
    rest: 0.95,

    build(tl, at, ctx) {
      const bg = ctx.q('.scene-bg');
      const title = ctx.q('.z-title');
      const card = ctx.q('.z-card');
      const img = ctx.q('.z-img');

      tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.01 }, at + 0.3);
      H.u.fx.textIn(tl, title, at + 0.1, { chars: true, dur: 0.3, stagger: 0.015 });

      // a gota sobe de baixo até o centro e cresce
      tl.fromTo(card, { y: () => H.vp.h * 0.85, scale: 0.42 }, { y: 0, scale: 0.78, duration: 0.75, ease: 'power3.out' }, at + 0.3)
        .to(card, { scale: 1, duration: 0.5, ease: 'power1.inOut' }, at + 1.05)
        .to(title, { opacity: 0, filter: 'blur(6px)', duration: 0.3 }, at + 1.2)
        // mergulho no bulbo: o âmbar toma a tela
        .fromTo(img, { scale: 1 }, { scale: 22, duration: 0.65, ease: 'power3.in' }, at + 1.5)
        .to(bg, { backgroundColor: H.config.colors.ambar, duration: 0.3 }, at + 1.8);
    },
  });
})(window.HALVORN);
