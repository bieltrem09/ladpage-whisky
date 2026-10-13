/* =============================================================================
   CENA 10 — "Angels' SHARE" (tipografia gigante)
   - "Angels'" itálico âmbar gigante sobe por baixo (ainda sobre o mestre
     desfocado) e assenta em cima, à direita; depois desce levemente.
   - Card pequeno com a fumaça no meio, sobrepondo as duas palavras, com
     parallax interno.
   - "SHARE" entra deslizando da direita, letras surgindo a partir da borda.
   - Saída: o conjunto sobe com motion blur vertical (filtro SVG
     feGaussianBlur com stdDeviation só no eixo Y, animado).
   ============================================================================= */
(function (H) {
  let share;

  H.scene({
    n: 10,
    el: '#s-angels',
    len: 2.4,
    overlap: 0.65,
    rest: 1.5,
    hudOffset: 0.5,

    init(ctx) {
      share = ctx.q('.an-share');
      H.u.split(share, { chars: true });
      H.u.split(ctx.q('.an-angels'), { chars: true });
    },

    resize() {
      H.u.fitText(share, H.vp.w * 0.96, 60, 600, share.querySelector('.split'));
    },

    build(tl, at, ctx) {
      this.resize();
      const bg = ctx.q('.scene-bg');
      const group = ctx.q('.an-group');
      const angels = ctx.q('.an-angels');
      const card = ctx.q('.an-card');
      const cardImg = ctx.q('.an-card img');
      const shareChars = Array.from(share.querySelectorAll('.ci'));
      const micro = ctx.q('.an-micro');
      const blur = document.getElementById('f-mblur-blur');

      // "Angels'" sobe gigante enquanto o mestre ainda desfoca
      tl.fromTo(angels, { y: () => H.vp.h * 0.85 }, { y: 0, duration: 0.85, ease: 'power3.out' }, at)
        .fromTo(angels.querySelectorAll('.ci'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.03 }, at)
        .fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.45 }, at + 0.4)
        // card de fumaça abre no meio
        .fromTo(card, { clipPath: 'inset(50% 0% 50% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'expo.inOut' }, at + 0.65)
        .fromTo(cardImg, { yPercent: -8, scale: 1.25 }, { yPercent: 8, scale: 1.05, duration: 1.75 }, at + 0.65)
        .fromTo(card, { scale: 0.9 }, { scale: 1.08, duration: 1.75 }, at + 0.65)
        // SHARE desliza da direita, letras surgindo da borda
        .fromTo(share, { x: () => H.vp.w * 0.95 }, { x: 0, duration: 0.85, ease: 'power3.out' }, at + 0.7)
        .fromTo(shareChars, { xPercent: 60, opacity: 0 }, { xPercent: 0, opacity: 1, duration: 0.45, stagger: 0.07, ease: 'power3.out' }, at + 0.7)
        // "Angels'" desce levemente
        .to(angels, { y: () => H.vp.h * 0.045, duration: 1.1 }, at + 0.85)
        .fromTo(micro, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, at + 1.4);

      // saída com motion blur vertical (SVG)
      tl.set(group, { filter: 'url(#f-mblur)' }, at + 1.95)
        .fromTo(blur, { attr: { stdDeviation: '0 0' } }, { attr: { stdDeviation: '0 40' }, duration: 0.4, ease: 'power2.in', immediateRender: false }, at + 1.95)
        .to(group, { y: () => -H.vp.h * 0.35, opacity: 0, duration: 0.4, ease: 'power2.in' }, at + 1.95);
    },
  });
})(window.HALVORN);
