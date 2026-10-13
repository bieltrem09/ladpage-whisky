/* =============================================================================
   CENA 6 — "AGORA OLHE DE perto." (zoom para tela cheia)
   - A frase aparece centralizada, pequena, letra por letra.
   - Um card pequeno com a gota sobe de baixo, centraliza e cresce até cobrir
     a tela inteira (clip-path com cantos retos; raio 4px → 0).
   - Com a gota em tela cheia, a câmera "mergulha" nela: zoom forte + fade,
     enquanto a cena 7 (copo com fumaça) entra por cima com zoom inverso.
   ============================================================================= */
(function (H) {
  const smallCard = () => {
    const W = H.vp.w;
    return H.isMobile() ? H.u.centerRect(W * 0.5, W * 0.66, 4) : H.u.centerRect(W * 0.2, W * 0.135, 4);
  };

  H.scene({
    n: 6,
    el: '#s-zoom',
    len: 2.2,
    overlap: 0.3,
    rest: 0.7,

    build(tl, at, ctx) {
      const bg = ctx.q('.scene-bg');
      const title = ctx.q('.z-title');
      const card = ctx.q('.z-card');
      const img = ctx.q('.z-img');

      tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.01 }, at + 0.3);
      H.u.fx.textIn(tl, title, at + 0.1, { chars: true, dur: 0.3, stagger: 0.015 });

      // o card sobe de baixo até o centro
      window.gsap.set(card, { clipPath: smallCard() });
      tl.fromTo(card, { y: () => H.vp.h * 0.75 }, { y: 0, duration: 0.75, ease: 'power3.out' }, at + 0.3)
        .fromTo(img, { scale: 1.35 }, { scale: 1.15, duration: 0.75 }, at + 0.3)
        // cresce até cobrir a tela
        .fromTo(card, { clipPath: smallCard }, { clipPath: () => H.u.full(0), duration: 0.8, ease: 'expo.inOut', immediateRender: false }, at + 1.05)
        .to(img, { scale: 1, duration: 0.8, ease: 'expo.inOut' }, at + 1.05)
        // mergulho na gota
        .to(img, { scale: 2.6, opacity: 0, filter: 'blur(6px)', duration: 0.45, ease: 'power2.in' }, at + 1.8);
    },
  });
})(window.HALVORN);
