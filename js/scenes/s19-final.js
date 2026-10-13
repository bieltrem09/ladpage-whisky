/* =============================================================================
   CENA 19 — Final: assinatura da marca + CTA
   - "HALVORN" surge com o mesmo efeito de letras subindo do hero (amarrando o
     começo ao fim); depois "Single Malt · 18 Anos", o parágrafo, o CTA e o
     rodapé em fade sequencial.
   ============================================================================= */
(function (H) {
  H.scene({
    n: 19,
    el: '#s-final',
    len: 1.6,
    overlap: 0.2,
    rest: 1.55,

    init(ctx) {
      const t = ctx.q('[data-final-letters]');
      t.textContent = H.config.text['final.title'];
      H.u.split(t, { chars: true });
    },

    build(tl, at, ctx) {
      const title = ctx.q('.fn-title');
      const seq = ['.fn-sub', '.fn-text', '.btn-cta', '.fn-link', '.fn-footer'].map((s) => ctx.q(s));

      tl.fromTo(ctx.el, { opacity: 0 }, { opacity: 1, duration: 0.3 }, at);
      tl.fromTo(title.querySelectorAll('.ci'), { yPercent: 135 }, { yPercent: 0, duration: 0.45, stagger: 0.05, ease: 'power4.out' }, at + 0.2);
      tl.fromTo(seq[0], { opacity: 0, y: 16, filter: 'blur(8px)' }, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.35, ease: 'expo.out' }, at + 0.6);
      tl.fromTo(seq.slice(1), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.12, ease: 'power3.out' }, at + 0.8);
    },
  });
})(window.HALVORN);
