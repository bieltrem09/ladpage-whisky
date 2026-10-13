/* =============================================================================
   CENA 4 — Manifesto em tipografia cinética (fundo escuro)
   - Texto revelado palavra por palavra (opacidade 0.1 → 1, y 30 → 0).
   - Atrás de cada linha recém-revelada, uma barra âmbar (marca-texto) cresce
     da esquerda para a direita e depois encolhe para a direita quando a
     próxima linha entra. Enquanto a barra está sob a linha, o itálico vira
     creme para continuar legível.
   - Saída: cortina creme sobe de baixo (clip-path). A última linha fica por
     um instante em carvão sobre creme (é uma cópia dentro da cortina) e sai
     pelo topo com motion blur.
   ============================================================================= */
(function (H) {
  const LINE_GAP = 0.46;

  H.scene({
    n: 4,
    el: '#s-manifesto',
    len: 4.0,
    overlap: 0.6,
    rest: 3.1,

    init(ctx) {
      const lines = H.config.text.manifesto;
      const html = lines
        .map((l) => `<p class="mf-line"><span class="mf-bar" aria-hidden="true"></span><span class="mf-text">${H.u.rich(l)}</span></p>`)
        .join('');
      ctx.q('#mf-block').innerHTML = html;
      ctx.q('#mf-copy').innerHTML = html;
      ctx.qa('#mf-block .mf-text').forEach((t) => H.u.split(t));
    },

    build(tl, at, ctx) {
      const lines = ctx.qa('#mf-block .mf-line');
      const copyLines = ctx.qa('#mf-copy .mf-line');
      const curtain = ctx.q('.mf-curtain');
      const n = lines.length;
      const start = (i) => at + 0.35 + i * LINE_GAP;

      lines.forEach((line, i) => {
        const words = Array.from(line.querySelectorAll('.wi'));
        const bar = line.querySelector('.mf-bar');
        const ems = line.querySelectorAll('em');
        const s = start(i);

        tl.fromTo(words, { opacity: 0.1, y: 30 }, { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: 'power3.out' }, s);
        // barra entra pela esquerda
        tl.fromTo(bar, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.28, ease: 'power3.inOut' }, s + 0.1);
        if (ems.length) tl.to(ems, { color: H.config.colors.creme, duration: 0.15 }, s + 0.14);
        // ...e sai pela direita quando a próxima linha entra
        const out = i < n - 1 ? start(i + 1) + 0.1 : start(i) + 0.55;
        tl.set(bar, { transformOrigin: '100% 50%' }, out)
          .to(bar, { scaleX: 0, duration: 0.28, ease: 'power3.inOut' }, out);
        if (ems.length) tl.to(ems, { color: H.config.colors.ambar, duration: 0.15 }, out + 0.08);
      });

      // as primeiras linhas somem; fica só "NINGUÉM apressa O TEMPO."
      const end = start(n - 1) + 0.6; // ≈ at + 3.25
      tl.to(lines.slice(0, n - 1), { opacity: 0, y: -16, filter: "blur(6px)", duration: 0.25, stagger: 0.03 }, end - 0.3);

      // cortina creme sobe de baixo
      tl.fromTo(curtain, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.45, ease: 'power3.inOut', immediateRender: false }, end);

      // a última linha (original + cópia) sai pelo topo com motion blur
      const last = [lines[n - 1], copyLines[n - 1]];
      H.u.fx.blurOut(tl, last, at + 3.78, { dur: 0.22, y: () => -H.vp.h * 0.35 });
    },
  });
})(window.HALVORN);
