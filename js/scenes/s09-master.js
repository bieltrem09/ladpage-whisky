/* =============================================================================
   CENA 9 — Close do mestre destilador com frases que trocam
   - Retrato P&B em tela cheia com zoom lento contínuo (1.05 → 1.2) e parallax.
   - À direita do rosto, uma frase itálica por vez (fade + blur + y).
   - Na última ("Ele tem sede."), um ponto de luz âmbar acende sobre o copo
     e a imagem desfoca e escurece, enquanto "Angels'" (cena 10) já sobe.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 9,
    el: '#s-master',
    len: 3.2,
    overlap: 0.1,
    rest: 1.0,

    init(ctx) {
      ctx.q('#ms-phrases').innerHTML = H.config.text.masterPhrases
        .map((p) => `<p class="ms-ph">${H.u.rich(p)}</p>`)
        .join('');
    },

    build(tl, at, ctx) {
      const media = ctx.q('.ms-media');
      const img = ctx.q('.ms-media img');
      const light = ctx.q('.ms-light');
      const phrases = ctx.qa('.ms-ph');

      tl.fromTo(ctx.el, { opacity: 0 }, { opacity: 1, duration: 0.35 }, at)
        .fromTo(img, { scale: 1.05 }, { scale: 1.2, duration: 3.2 }, at)
        .fromTo(media, { y: () => H.vp.h * 0.03 }, { y: () => -H.vp.h * 0.03, duration: 3.2 }, at);

      const gap = 0.55;
      phrases.forEach((p, i) => {
        const s = at + 0.35 + i * gap;
        tl.fromTo(p, { opacity: 0, y: 24, filter: 'blur(10px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.15, ease: 'power3.out' }, s);
        if (i < phrases.length - 1) {
          tl.to(p, { opacity: 0, y: -18, filter: 'blur(10px)', duration: 0.12, ease: 'power2.in' }, s + gap - 0.12);
        }
      });

      const lastAt = at + 0.35 + (phrases.length - 1) * gap;
      tl.to(light, { opacity: 1, duration: 0.35 }, lastAt + 0.1)
        .to(media, { filter: 'blur(10px) brightness(0.35)', duration: 0.8 }, lastAt + 0.45)
        .to(phrases[phrases.length - 1], { opacity: 0, filter: 'blur(8px)', duration: 0.3 }, at + 2.85);
    },
  });
})(window.HALVORN);
