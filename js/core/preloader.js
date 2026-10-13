/* =============================================================================
   CENA 1 — Preloader + verificação de idade
   - Carrega TODAS as imagens do CONFIG (progresso real) e as fontes.
   - O contador 000 → 100 persegue o progresso real com suavidade.
   - Em 100, vira a pergunta de idade. "NÃO" bloqueia; "SIM" resolve gate().
   - O scroll fica travado (body.is-loading + lenis parado) até o SIM.
   ============================================================================= */
(function (H) {
  const P = (H.preloader = {});

  P.run = () =>
    new Promise((resolve) => {
      const { gsap } = window;
      const keys = Object.keys(H.config.images);
      const total = keys.length + 1; // +1 = fontes
      let done = 0;
      const shown = { v: 0 };
      const countEl = document.getElementById('pre-count');
      const barEl = document.getElementById('pre-bar');

      const render = () => {
        const v = Math.round(shown.v);
        countEl.textContent = String(v).padStart(3, '0');
        barEl.style.transform = `scaleX(${shown.v / 100})`;
      };

      let finished = false;
      const step = () => {
        done++;
        const target = (done / total) * 100;
        gsap.to(shown, {
          v: target,
          duration: 0.6,
          ease: 'power2.out',
          overwrite: true,
          onUpdate: render,
          onComplete: () => {
            if (done >= total && !finished) {
              finished = true;
              setTimeout(resolve, 250);
            }
          },
        });
      };

      keys.forEach((k) => {
        const img = new Image();
        img.decoding = 'async';
        const ok = () => {
          H.images[k] = img;
          (img.decode ? img.decode().catch(() => {}) : Promise.resolve()).then(step);
        };
        img.onload = ok;
        img.onerror = () => { console.warn('[halvorn] imagem não carregou:', k); step(); };
        img.src = H.img(k);
      });

      const fontsReady = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
      // não deixar uma fonte lenta segurar o site para sempre
      Promise.race([fontsReady, new Promise((r) => setTimeout(r, 4000))]).then(step);
    });

  /** Mostra a pergunta de idade e resolve no clique em SIM */
  P.gate = () =>
    new Promise((resolve) => {
      const { gsap } = window;
      const load = document.querySelector('.pre-load');
      const gate = document.getElementById('pre-gate');
      const deny = document.getElementById('pre-deny');
      const yes = document.getElementById('age-yes');
      const no = document.getElementById('age-no');
      const q = gate.querySelector('.pre-question');

      gsap.to(load, {
        opacity: 0, y: -10, duration: 0.4, ease: 'power2.in',
        onComplete: () => {
          load.hidden = true;
          gate.hidden = false;
          const s = H.u.split(q);
          gsap.fromTo(H.u.plainWords(q), { yPercent: 135 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: 'power4.out' });
          gsap.fromTo(H.u.italicWords(q), { yPercent: 135, filter: 'blur(8px)' }, { yPercent: 0, filter: 'blur(0px)', duration: 1, delay: 0.25, ease: 'expo.out' });
          gsap.fromTo('.pre-actions .btn-min', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.8, delay: 0.5, stagger: 0.08, ease: 'power3.out' });
          yes.focus({ preventScroll: true });
          return s;
        },
      });

      no.addEventListener('click', () => {
        deny.hidden = false;
        gsap.fromTo(deny, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' });
        yes.disabled = true;
        no.disabled = true;
        gsap.to('.pre-actions', { opacity: 0.25, duration: 0.6 });
      });

      yes.addEventListener('click', () => {
        yes.disabled = true;
        no.disabled = true;
        resolve();
      }, { once: true });
    });
})(window.HALVORN);
