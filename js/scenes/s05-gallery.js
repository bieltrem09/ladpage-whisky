/* =============================================================================
   CENA 5 — Galeria clara flutuante: "NASCE NO campo ESCOCÊS."
   - Fundo creme, texto carvão.
   - O título entra enorme e, com o scroll, sobe e diminui até o canto
     superior esquerdo. Um parágrafo pequeno aparece à direita.
   - 6 fotos em layout editorial assimétrico sobem com velocidades diferentes
     (data-speed), entrando por baixo e saindo pelo topo, cruzando-se.
     Cada uma entra com clip-path (cortina de baixo) e scale interno 1.3 → 1.
   - Final: frase itálica âmbar com uma linha fina, enquanto as fotos saem.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 5,
    el: '#s-gallery',
    len: 4.0,
    overlap: 0.5,
    rest: 1.9,

    init(ctx) {
      const wrap = ctx.q('#g-photos');
      wrap.innerHTML = H.config.gallery
        .map((p, i) => `
          <figure class="g-ph${p.cut ? ' g-ph--cut' : ''}" data-i="${i}" data-speed="${p.speed}" data-cursor="olhe"
            style="left:${p.left}%;width:${p.w}vw">
            <div class="g-ph-in" style="aspect-ratio:${p.ratio}">
              <img src="${H.img(p.img)}" alt="${p.alt}" decoding="async">
            </div>
            <figcaption class="micro">${p.caption}</figcaption>
          </figure>`)
        .join('');
      H.u.split(ctx.q('.g-title'));
    },

    build(tl, at, ctx) {
      const bg = ctx.q('.scene-bg');
      const title = ctx.q('.g-title');
      const text = ctx.q('.g-text');
      const quote = ctx.q('.g-quote-text');
      const qline = ctx.q('.g-quote-line');
      const mobile = H.isMobile();

      // o fundo creme só "assume" quando a cortina do manifesto já cobriu tudo
      tl.fromTo(bg, { opacity: 0 }, { opacity: 1, duration: 0.01 }, at + 0.5);

      // título: entra grande (centralizado na vertical)…
      const titleY = () => (H.vp.h - title.offsetHeight) / 2 - title.offsetTop;
      tl.fromTo(title, { y: titleY, scale: 1 }, { y: titleY, scale: 1, duration: 0.01 }, at);
      H.u.fx.textIn(tl, title, at + 0.35, { dur: 0.4, stagger: 0.05 });
      // …e sobe/diminui até o canto superior esquerdo
      tl.to(title, { y: 0, scale: mobile ? 0.62 : 0.34, duration: 1.4, ease: 'power2.inOut' }, at + 0.95);
      tl.fromTo(text, { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out' }, at + 1.9);

      // fotos com parallax de velocidades diferentes
      const photos = ctx.qa('.g-ph');
      photos.forEach((ph, i) => {
        const p = H.config.gallery[i];
        const inner = ph.querySelector('.g-ph-in');
        const img = ph.querySelector('img');
        const s = at + 0.5 + p.delay;
        const dur = Math.min(2.5 / p.speed, at + 3.95 - s);
        tl.fromTo(ph, { y: () => H.vp.h + 40 }, { y: () => -ph.offsetHeight - 60, duration: dur }, s)
          .fromTo(inner, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: dur * 0.3, ease: 'power3.out' }, s)
          .fromTo(img, { scale: 1.3 }, { scale: 1, duration: dur * 0.6, ease: 'power2.out' }, s);
      });

      // frase final
      tl.to(qline, { scaleX: 1, duration: 0.35, ease: 'power3.inOut' }, at + 2.9);
      H.u.fx.textIn(tl, quote, at + 3.0, { dur: 0.4, italicDelay: 0, stagger: 0.03 });
      tl.to([title, text], { opacity: 0, duration: 0.3 }, at + 3.3);
      tl.to([quote, qline], { opacity: 0, y: -20, filter: 'blur(6px)', duration: 0.3 }, at + 3.75);
    },
  });
})(window.HALVORN);
