/* =============================================================================
   Cursor personalizado: ponto creme de 6px com inércia (lerp 0.15).
   Sobre elementos [data-cursor="olhe"] vira um círculo de 60px com "OLHE".
   Desligado em telas de toque e em prefers-reduced-motion.
   ============================================================================= */
(function (H) {
  const C = (H.cursor = { x: -100, y: -100, has: false });

  C.init = () => {
    if (H.touch || H.reduced) return;
    const el = document.getElementById('cursor');
    document.documentElement.classList.add('has-cursor');
    let cx = -100, cy = -100, hovering = false;

    window.addEventListener('pointermove', (e) => {
      C.x = e.clientX;
      C.y = e.clientY;
      C.has = true;
      C.t = performance.now();
      el.classList.add('is-on');
    }, { passive: true });
    document.addEventListener('pointerleave', () => el.classList.remove('is-on'));

    // detecção por ponto (funciona mesmo quando a cena muda sob o mouse parado)
    const check = () => {
      const t = document.elementFromPoint(C.x, C.y);
      const want = !!(t && t.closest('[data-cursor="olhe"]'));
      if (want !== hovering) {
        hovering = want;
        el.classList.toggle('is-big', want);
      }
    };

    let frame = 0;
    window.gsap.ticker.add(() => {
      cx += (C.x - cx) * 0.15;
      cy += (C.y - cy) * 0.15;
      el.style.transform = `translate3d(${cx}px, ${cy}px, 0)`;
      if (++frame % 6 === 0 && C.has) check();
    });
  };
})(window.HALVORN);
