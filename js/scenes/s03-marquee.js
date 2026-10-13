/* =============================================================================
   CENA 3 — Letreiro horizontal com card central
   - A foto do hero encolhe até virar um card central (~40vw × 25vw) e troca,
     em crossfade, para a adega de barris.
   - Atrás do card, duas linhas gigantes correm em direções opostas: ligadas
     ao scroll (scrub) + um leve movimento automático contínuo.
   - Segunda metade: o card "vira" para o copo no fundo branco com um flash
     branco rápido e um leve scale 0.96 → 1.
   - Uma linha diagonal âmbar risca a tela de canto a canto (stroke-dashoffset).
   - Saída: o bloco inteiro sobe (yPercent -100) e revela a cena 4 por baixo.
   ============================================================================= */
(function (H) {
  const cardRect = () => {
    const W = H.vp.w;
    return H.isMobile()
      ? H.u.centerRect(W * 0.72, W * 0.5)
      : H.u.centerRect(W * 0.4, W * 0.25);
  };

  /** a linha diagonal é desenhada em px reais (traço uniforme em qualquer tela) */
  function sizeLine() {
    const svg = document.querySelector('.cut-line');
    const line = svg.querySelector('line');
    const W = H.vp.w, V = H.vp.h;
    svg.setAttribute('viewBox', `0 0 ${W} ${V}`);
    line.setAttribute('x1', -20); line.setAttribute('y1', V + 20);
    line.setAttribute('x2', W + 20); line.setAttribute('y2', -20);
  }

  H.scene({
    n: 3,
    el: '#s-open',
    len: 3.0,
    overlap: 0.55,
    rest: 1.4,

    init(ctx) {
      // repete o texto de cada linha o bastante para cobrir 2 telas + o loop
      ctx.qa('.marquee-track').forEach((tr) => {
        const html = tr.innerHTML;
        tr.innerHTML = new Array(8).fill(`<span>${html}</span>`).join('');
      });
    },

    resize: sizeLine,

    build(tl, at, ctx) {
      const { gsap } = window;
      sizeLine();
      const media = ctx.q('.open-media');
      const inner = ctx.q('.om-inner');
      const cellar = ctx.q('.om-cellar');
      const glass = ctx.q('.om-glass');
      const flash = ctx.q('.om-flash');
      const marquees = ctx.qa('.marquee');
      const top = ctx.q('.marquee--top .marquee-move');
      const bottom = ctx.q('.marquee--bottom .marquee-move');
      const line = ctx.q('.cut-line line');
      const block = ctx.q('.open-block');

      // movimento automático (independente do scroll), bem lento
      ctx.qa('.marquee-track').forEach((tr, i) => {
        gsap.fromTo(tr, { xPercent: i ? -50 : 0 }, { xPercent: i ? 0 : -50, duration: 90, ease: 'none', repeat: -1 });
      });

      // 1) a foto encolhe até o card e troca para a adega
      tl.fromTo(media, { clipPath: H.heroRect }, { clipPath: cardRect, duration: 1.0, ease: 'power3.inOut' }, at)
        .to(inner, { scale: 0.92, duration: 1.0, ease: 'power3.inOut' }, at)
        .to(cellar, { opacity: 1, duration: 0.6 }, at + 0.35)
        .to(marquees, { opacity: 1, duration: 0.4 }, at + 0.25)
        // 2) letreiros em direções opostas, amarrados ao scroll
        .fromTo(top, { x: () => -H.vp.w * 0.1 }, { x: () => -H.vp.w * 0.9, duration: 3.0 }, at)
        .fromTo(bottom, { x: () => -H.vp.w * 1.0 }, { x: () => -H.vp.w * 0.2, duration: 3.0 }, at)
        // 3) o card "vira" para o copo claro com flash branco
        .to(flash, { opacity: 1, duration: 0.06 }, at + 1.45)
        .set(glass, { opacity: 1 }, at + 1.51)
        .fromTo(inner, { scale: 0.92 * 0.96 }, { scale: 0.92, duration: 0.4, ease: 'power3.out', immediateRender: false }, at + 1.51)
        .to(flash, { opacity: 0, duration: 0.18 }, at + 1.51)
        // 4) a linha diagonal âmbar corta a tela
        .to(line, { strokeDashoffset: 0, duration: 0.7, ease: 'power2.inOut' }, at + 1.8)
        // 5) saída: o bloco inteiro sobe e revela o manifesto
        .to(block, { yPercent: -100, duration: 0.6, ease: 'power3.in' }, at + 2.4);
    },
  });
})(window.HALVORN);
