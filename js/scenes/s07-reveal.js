/* =============================================================================
   CENA 7 — Revelação líquida: "TODO MUNDO VÊ o âmbar."
   - Copo com fumaça em tela cheia (WebGL, ver js/webgl/liquid-reveal.js).
     Uma mancha líquida âmbar/preta segue o cursor e revela, por dentro,
     o barril em chamas.
   - Fallback sem WebGL: círculo com máscara radial borrada seguindo o cursor.
   - Metade da cena: o texto troca (sai com blur, o novo entra por baixo).
   - Saída: duotone âmbar + escurecer; no centro "O ÂMBAR É O MESMO." com
     brilho branco e o itálico logo abaixo. Tudo vai ao preto e o itálico
     sobe ao topo, saindo com motion blur.
   ============================================================================= */
(function (H) {
  let fx = null;      // efeito WebGL
  let fallback = null;

  function setupFallback(ctx) {
    const box = ctx.q('#rv-fallback');
    const hidden = ctx.q('.rv-hidden');
    box.hidden = false;
    ctx.q('#rv-canvas').style.display = 'none';
    const pos = { x: 0.6, y: 0.5 }, tgt = { x: 0.6, y: 0.5 };
    let last = -1e9, running = false;
    const start = performance.now();
    window.addEventListener('pointermove', (e) => {
      tgt.x = e.clientX / H.vp.w;
      tgt.y = e.clientY / H.vp.h;
      last = performance.now();
    }, { passive: true });
    const tick = () => {
      const now = performance.now();
      if (now - last > 3000 && !H.reduced) {
        const t = (now - start) / 1000;
        tgt.x = 0.5 + 0.27 * Math.sin(t * 0.55);
        tgt.y = 0.5 - 0.2 * Math.sin(t * 1.1);
      }
      pos.x += (tgt.x - pos.x) * 0.08;
      pos.y += (tgt.y - pos.y) * 0.08;
      hidden.style.setProperty('--x', (pos.x * 100).toFixed(2) + '%');
      hidden.style.setProperty('--y', (pos.y * 100).toFixed(2) + '%');
    };
    return {
      setActive(on) {
        if (on === running) return;
        running = on;
        if (on) window.gsap.ticker.add(tick);
        else window.gsap.ticker.remove(tick);
      },
    };
  }

  H.scene({
    n: 7,
    el: '#s-reveal',
    len: 4.0,
    overlap: 0.5,
    rest: 1.5,

    build(tl, at, ctx) {
      // WebGL (com fallback em caso de erro)
      if (!fx && !fallback) {
        try {
          if (!H.GL.supported()) throw new Error('sem WebGL');
          fx = H.LiquidReveal(ctx.q('#rv-canvas'), H.images['smoke-glass'], H.images['barrel-fire'], ctx.el);
        } catch (e) {
          console.info('[halvorn] cena 7 usando fallback:', e.message);
          fallback = setupFallback(ctx);
        }
      }

      const media = ctx.q('.rv-media');
      const t1 = ctx.q('.rv-t1 .scene-title');
      const t2wrap = ctx.q('.rv-t2');
      const t2 = ctx.q('.rv-t2 .scene-title');
      const duo = ctx.q('.rv-duo');
      const dark = ctx.q('.rv-dark');
      const endTitle = ctx.q('.rv-end-title');
      const endSub = ctx.q('.rv-end-sub');

      // entrada: "mergulho" vindo da gota
      tl.fromTo(ctx.el, { opacity: 0 }, { opacity: 1, duration: 0.4 }, at)
        .fromTo(media, { scale: 1.4 }, { scale: 1, duration: 0.8, ease: 'power3.out' }, at);

      H.u.fx.textIn(tl, t1, at + 0.6, { dur: 0.4 });

      // troca de frase no meio da cena
      H.u.fx.blurOut(tl, t1, at + 1.9, { dur: 0.3, y: -60 });
      tl.set(t2wrap, { visibility: 'visible' }, at + 2.0);
      H.u.fx.textIn(tl, t2, at + 2.05, { dur: 0.4 });

      // saída: duotone âmbar + texto central com brilho
      H.u.fx.blurOut(tl, t2, at + 2.95, { dur: 0.3, y: -60 });
      tl.to(duo, { opacity: 0.85, duration: 0.4 }, at + 2.95)
        .to(dark, { opacity: 0.45, duration: 0.4 }, at + 2.95);
      H.u.fx.textIn(tl, endTitle, at + 3.15, { dur: 0.35, stagger: 0.04 });
      tl.fromTo(endTitle, { textShadow: '0 0 0px rgba(255,255,255,0)' }, { textShadow: '0 0 28px rgba(255,255,255,0.55)', duration: 0.3 }, at + 3.3);
      H.u.fx.textIn(tl, endSub, at + 3.3, { dur: 0.35 });

      // tudo vai ao preto; só o itálico fica, sobe ao topo e sai com blur
      tl.to(endTitle, { opacity: 0, filter: 'blur(8px)', duration: 0.2 }, at + 3.62)
        .to(dark, { opacity: 1, duration: 0.25 }, at + 3.62)
        .to(endSub, { y: () => -H.vp.h * 0.36, duration: 0.25, ease: 'power2.inOut' }, at + 3.66);
      H.u.fx.blurOut(tl, endSub, at + 3.86, { dur: 0.14, y: () => -H.vp.h * 0.6, blur: 18 });
    },

    active(on) {
      (fx || fallback) && (fx || fallback).setActive(on);
    },

    resize() {
      fx && fx.resize();
    },
  });
})(window.HALVORN);
