/* =============================================================================
   CENA 13 — "O RITUAL" com 4 passos
   - Fundo fumaça com vinheta; título com glow suave + microtexto à direita.
   - 4 caixas lado a lado. Ao rolar, uma por vez "acende": uma mancha âmbar
     orgânica (círculo com filtro SVG feTurbulence + feDisplacementMap)
     se espalha como líquido derramado, e o rótulo aparece letra por letra.
   - Saída: o bloco sobe e encolhe enquanto a foto da cena 14 já aparece
     por baixo (a cena 13 fica acima da 14 no z-index).
   ============================================================================= */
(function (H) {
  H.scene({
    n: 13,
    el: '#s-ritual',
    len: 3.2,
    overlap: 0,
    rest: 2.6,

    init(ctx) {
      ctx.q('#rt-steps').innerHTML = H.config.text.ritualSteps
        .map((s, i) => `
          <li class="rt-step">
            <div class="rt-box">
              <span class="rt-num micro">${String(i + 1).padStart(2, '0')}</span>
              <svg class="rt-blob" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
                <circle cx="${38 + i * 8}" cy="${18 + (i % 2) * 5}" r="0" filter="url(#f-blob)" />
              </svg>
            </div>
            <p class="rt-label type-mix">${H.u.rich(s)}</p>
          </li>`)
        .join('');
      ctx.qa('.rt-label').forEach((l) => H.u.split(l, { chars: true }));
    },

    build(tl, at, ctx) {
      const bg = ctx.q('.scene-bg');
      const block = ctx.q('.rt-block');
      const title = ctx.q('.rt-title');
      const micro = ctx.q('.rt-micro');
      const boxes = ctx.qa('.rt-box');

      tl.fromTo(ctx.el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
      H.u.fx.textIn(tl, title, at + 0.15, { chars: true, dur: 0.35, stagger: 0.03 });
      tl.fromTo(title, { textShadow: '0 0 0px rgba(242,237,228,0)' }, { textShadow: '0 0 40px rgba(242,237,228,0.35)', duration: 0.5 }, at + 0.4)
        .fromTo(micro, { opacity: 0, x: -10 }, { opacity: 1, x: 0, duration: 0.3 }, at + 0.45)
        .fromTo(boxes, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.06, ease: 'power3.out' }, at + 0.5);

      ctx.qa('.rt-step').forEach((step, i) => {
        const s = at + 0.95 + i * 0.45;
        const circle = step.querySelector('circle');
        const label = step.querySelector('.rt-label');
        tl.fromTo(circle, { attr: { r: 0 } }, { attr: { r: 72 }, duration: 0.45, ease: 'power2.out' }, s);
        H.u.fx.textIn(tl, label, s + 0.08, { chars: true, dur: 0.25, stagger: 0.01, italicDelay: 0.1 });
      });

      // saída: sobe e encolhe; o fundo some revelando a cena 14 por baixo
      tl.to(block, { y: () => -H.vp.h * 0.45, scale: 0.7, opacity: 0, duration: 0.45, ease: 'power3.in' }, at + 2.75)
        .to(bg, { opacity: 0, duration: 0.4 }, at + 2.8);
    },
  });
})(window.HALVORN);
