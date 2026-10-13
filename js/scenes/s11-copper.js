/* =============================================================================
   CENA 11 — Retângulo que expande: "O COBRE NÃO PEDE LICENÇA."
   - Tela preta. Um retângulo pequeno no centro mostra a destilaria tingida
     de âmbar; ao rolar ele expande até a tela inteira (clip-path) e a
     imagem interna faz scale 1.5 → 1.
   - Texto inferior esquerdo entra por máscara.
   - Saída: o texto sai pelo topo com blur forte e corte seco para o preto.
   ============================================================================= */
(function (H) {
  const small = () => {
    const W = H.vp.w;
    return H.isMobile() ? H.u.centerRect(W * 0.46, W * 0.3) : H.u.centerRect(W * 0.18, W * 0.11);
  };

  H.scene({
    n: 11,
    el: '#s-copper',
    len: 2.2,
    overlap: 0.15,
    rest: 1.5,

    build(tl, at, ctx) {
      const media = ctx.q('.cp-media');
      const img = ctx.q('.cp-media img');
      const title = ctx.q('.cp-text .scene-title');
      const text = ctx.q('.cp-text');

      window.gsap.set(media, { clipPath: small() });
      tl.fromTo(media, { opacity: 0 }, { opacity: 1, duration: 0.25 }, at + 0.1)
        .fromTo(img, { scale: 1.5 }, { scale: 1, duration: 1.1, ease: 'expo.inOut' }, at + 0.45)
        .fromTo(media, { clipPath: small }, { clipPath: () => H.u.full(0), duration: 1.0, ease: 'expo.inOut', immediateRender: false }, at + 0.45);

      H.u.fx.textIn(tl, title, at + 1.15, { dur: 0.35 });

      H.u.fx.blurOut(tl, text, at + 1.8, { dur: 0.25, blur: 20, y: () => -H.vp.h * 0.5 });
      tl.set(media, { opacity: 0 }, at + 2.08);
    },
  });
})(window.HALVORN);
