/* =============================================================================
   CENA 2 — Hero: "HALVORN  Single Malt"
   Entrada (por tempo, logo após o SIM):
   - a foto do decanter nasce como um retângulo pequeno no centro e expande
     até a metade direita (clip-path, 1.4s, expo.inOut) enquanto a imagem
     interna faz o movimento oposto (scale 1.4 → 1);
   - "HALVORN" sobe letra por letra de dentro da máscara;
   - "Single Malt" entra com fade + y + blur.
   O título existe em duas cópias: uma atrás da foto e outra na frente com uma
   máscara na faixa do decanter — assim a foto "cobre" parte das letras.
   Scroll (scrub): o título faz parallax mais rápido que a foto e se parte,
   metade para a esquerda e metade para a direita.
   ============================================================================= */
(function (H) {
  let titles, sub, media, inner, glow;

  /** retângulo da foto no estado final do hero (metade direita) */
  H.heroRect = () => {
    const W = H.vp.w, V = H.vp.h;
    if (H.isMobile()) return H.u.inset(V * 0.12, W * 0.06, V * 0.3, W * 0.06);
    return H.u.inset(0, 0, 0, W * 0.35);
  };
  const smallRect = () => H.u.centerRect(H.vp.w * 0.22, H.vp.w * 0.14);

  function fit() {
    // o título ocupa ~96% da largura (no mobile, quase toda)
    titles.forEach((t) => {
      const inner = t.querySelector('.ht-letters');
      H.u.fitText(t, H.vp.w * (H.isMobile() ? 0.94 : 0.96), 56, 420, inner);
    });
  }

  H.scene({
    n: 2,
    el: '#s-open',
    len: 1.2,
    rest: 0.05,

    init(ctx) {
      const word = H.config.text['hero.title'];
      const cut = Math.ceil(word.length / 2);
      const half = (s, side) =>
        `<span class="ht-half ht-half--${side}">` +
        Array.from(s).map((ch) => `<span class="c"><span class="ci">${ch}</span></span>`).join('') +
        '</span>';
      titles = ctx.qa('[data-hero-letters]');
      titles.forEach((t) => {
        const letters = `<span class="ht-letters" aria-hidden="true">${half(word.slice(0, cut), 'l')}${half(word.slice(cut), 'r')}</span>`;
        t.innerHTML = (t.tagName === 'H1' ? `<span class="sr-only">${H.config.text['hero.h1']}</span>` : '') + letters;
      });
      sub = ctx.q('.hero-type--front .hero-sub');
      media = ctx.q('.open-media');
      inner = ctx.q('.om-inner');
      glow = ctx.q('.hero-glow');

      fit();
      window.gsap.set(media, { clipPath: smallRect() });
      window.gsap.set(inner, { scale: 1.4 });
      window.gsap.set(ctx.qa('.hero-title .ci'), { yPercent: 135 });
      window.gsap.set(sub, { opacity: 0, y: 20, filter: 'blur(8px)' });
    },

    resize() {
      fit();
    },

    /** entrada baseada em tempo — chamada por startFilm() no SIM */
    intro() {
      const { gsap } = window;
      const letters = titles.map((t) => Array.from(t.querySelectorAll('.ci')));
      gsap.timeline({ defaults: { overwrite: 'auto' } })
        .to(glow, { opacity: 0.9, duration: 2.4, ease: 'power2.out' }, 0)
        .fromTo(media, { clipPath: smallRect() }, { clipPath: H.heroRect, duration: 1.4, ease: 'expo.inOut' }, 0.1)
        .fromTo(inner, { scale: 1.4 }, { scale: 1, duration: 1.6, ease: 'expo.inOut' }, 0.1)
        .to(letters, { yPercent: 0, duration: 1.1, stagger: 0.05, ease: 'power4.out' }, 0.55)
        .to(sub, { opacity: 1, y: 0, filter: 'blur(0px)', duration: 1.1, ease: 'expo.out' }, 1.15);
    },

    build(tl, at, ctx) {
      fit(); // de novo, agora com as fontes carregadas
      const L = ctx.qa('.ht-half--l');
      const R = ctx.qa('.ht-half--r');
      const types = ctx.qa('.hero-type');
      // parallax: o título sobe mais rápido que a foto
      tl.to(types, { y: () => -H.vp.h * 0.22, duration: 1.2 }, at)
        .to(inner, { y: () => -H.vp.h * 0.05, duration: 1.2 }, at)
        // o título se parte em dois e abre caminho
        .to(L, { x: () => -H.vp.w * 0.75, duration: 1.0, ease: 'power2.in' }, at + 0.2)
        .to(R, { x: () => H.vp.w * 0.75, duration: 1.0, ease: 'power2.in' }, at + 0.2)
        .to(sub, { opacity: 0, y: -30, filter: 'blur(10px)', duration: 0.5, ease: 'power2.in' }, at + 0.15)
        .to(glow, { opacity: 0.35, duration: 1 }, at + 0.2);
    },
  });
})(window.HALVORN);
