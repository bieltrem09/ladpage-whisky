/* =============================================================================
   Interface fixa: contador "02 / 18", microtexto do capítulo (canto inferior
   direito) e a barra vertical de progresso na borda direita.
   ============================================================================= */
(function (H) {
  const hud = (H.hud = {});
  let idxEl, capWrap, capA, capB, bar, current = null, swap = null;

  hud.init = () => {
    idxEl = document.getElementById('hud-index');
    capWrap = document.getElementById('hud-caption');
    capA = document.getElementById('hud-cap-a');
    capB = document.getElementById('hud-cap-b');
    bar = document.getElementById('hud-progress');
    const first = H.config.chapters[2];
    capA.textContent = first[0];
    capB.textContent = first[1];
  };

  /** troca o capítulo com fade + leve deslocamento vertical */
  hud.chapter = (n) => {
    if (n === current) return;
    const { gsap } = window;
    const ch = H.config.chapters[n];
    current = n;
    idxEl.textContent = String(n).padStart(2, '0');
    if (!ch) return;
    if (swap) swap.kill(); // mata também o callback de troca pendente
    swap = gsap.timeline()
      .to(capWrap, { opacity: 0, y: -6, duration: 0.25, ease: 'power2.in' })
      .add(() => { capA.textContent = ch[0]; capB.textContent = ch[1]; })
      .fromTo(capWrap, { y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power3.out' });
  };

  hud.progress = (p) => {
    bar.style.transform = `scaleY(${H.u.clamp(p, 0, 1)})`;
  };
})(window.HALVORN);
