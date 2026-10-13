/* =============================================================================
   CENA 7 — Revelação líquida (WebGL)
   Uma mancha viscosa âmbar/preta segue o cursor com atraso e, dentro dela,
   aparece a imagem escondida (o barril em chamas).

   Pipeline:
   1) SIM (ping-pong FBO, baixa resolução): acumula a trilha do mouse.
      A cada frame a trilha decai e "escorre" um pouco para baixo (gotejar).
   2) RENDER: mistura imagem base e escondida usando a trilha como máscara.
      A máscara é distorcida por ruído simplex (bordas orgânicas, tentáculos),
      ganha uma faixa âmbar escura na borda, um aro preto interno, refração
      e um brilho especular — como whisky espesso.

   Sem mouse (toque/mobile): a mancha anda sozinha em figura de oito e o
   toque arrasta a mancha.
   ============================================================================= */
(function (H) {
  const SIM = `
    uniform sampler2D uPrev;
    uniform vec2 uMouse, uLast;
    uniform float uAspect, uRadius, uStrength, uTime;
    varying vec2 vUv;
    float segDist(vec2 p, vec2 a, vec2 b){
      vec2 pa = p - a, ba = b - a;
      float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0., 1.);
      return length(pa - ba * h);
    }
    void main(){
      float n = snoise(vec3(vUv * 5., uTime * .25));
      // amostra um pouco acima → o conteúdo escorre para baixo
      vec2 off = vec2(n * .0018, .0016 + n * .0008);
      float prev = texture2D(uPrev, vUv + off).r;
      vec2 asp = vec2(uAspect, 1.);
      float d = segDist(vUv * asp, uLast * asp, uMouse * asp);
      float r = uRadius * (1. + n * .18);
      float splat = smoothstep(r, r * .15, d) * uStrength;
      float v = max(prev * .978 - .0035, 0.);
      v = max(v, splat);
      gl_FragColor = vec4(v, 0., 0., 1.);
    }`;

  const RENDER = `
    uniform sampler2D uBase, uHidden, uTrail;
    uniform vec2 uRes, uImg;
    uniform float uTime;
    varying vec2 vUv;
    void main(){
      vec2 uv = vUv;
      float t = uTime;
      float n1 = snoise(vec3(uv * 3.2, t * .15));
      float n2 = snoise(vec3(uv * 9.0 + 3.1, t * .32));
      vec2 disp = vec2(n1, n2) * .028;
      vec2 tuv = uv + disp;
      float tr = texture2D(uTrail, tuv).r;
      float field = tr + n2 * .14 * smoothstep(0., .5, tr);

      float m = smoothstep(.44, .52, field);                 // dentro da mancha
      float rim = smoothstep(.2, .44, field) * (1. - m);     // borda externa (âmbar)
      float inner = smoothstep(.5, .55, field) * (1. - smoothstep(.55, .7, field)); // aro preto

      vec2 e = vec2(.006, 0.);
      vec2 g = vec2(
        texture2D(uTrail, tuv + e.xy).r - texture2D(uTrail, tuv - e.xy).r,
        texture2D(uTrail, tuv + e.yx).r - texture2D(uTrail, tuv - e.yx).r
      );

      vec2 cuv = coverUv(uv, uRes, uImg);
      vec3 base = texture2D(uBase, cuv + g * .04 * rim).rgb;
      vec3 hid = texture2D(uHidden, cuv - g * .08 + vec2(n1, n2) * .005).rgb * 1.12;

      vec3 col = mix(base, hid, m);
      vec3 amberDark = vec3(.45, .19, .04);
      col = mix(col, amberDark * (.55 + .45 * (n1 * .5 + .5)) + base * .12, rim * .9);
      col = mix(col, vec3(.02, .01, .0), inner * .8);

      vec3 nrm = normalize(vec3(-g * 34., 1.));
      float spec = pow(max(0., dot(nrm, normalize(vec3(-.45, .55, .7)))), 28.);
      col += spec * (rim + inner) * vec3(1., .78, .45) * .6;

      gl_FragColor = vec4(col, 1.);
    }`;

  H.LiquidReveal = function (canvas, baseImg, hiddenImg, scope) {
    const v = new H.GL.View(canvas);
    const gl = v.gl;
    const sim = v.program(SIM);
    const ren = v.program(RENDER);
    const texBase = v.texture(baseImg);
    const texHidden = v.texture(hiddenImg);
    const imgSize = [baseImg.naturalWidth || 1024, baseImg.naturalHeight || 572];

    let A, B, simW, simH;
    const makeTargets = () => {
      const [w, h] = v.resize();
      simW = 256;
      simH = Math.max(64, Math.round(256 * (h / w)));
      A = v.target(simW, simH);
      B = v.target(simW, simH);
    };
    makeTargets();

    // estado do "pincel"
    const target = { x: 0.62, y: 0.55 };
    const pos = { x: 0.62, y: 0.55 };
    const last = { x: 0.62, y: 0.55 };
    let lastInput = -1e9;
    let touching = false;
    let running = false;
    const start = performance.now();

    const toUv = (cx, cy) => {
      const r = canvas.getBoundingClientRect();
      return { x: (cx - r.left) / r.width, y: 1 - (cy - r.top) / r.height };
    };
    const onMove = (e) => {
      if (!running) return;
      if (e.pointerType === 'touch' && !touching) return;
      const p = toUv(e.clientX, e.clientY);
      target.x = p.x;
      target.y = p.y;
      lastInput = performance.now();
    };
    const onDown = (e) => { if (e.pointerType === 'touch') { touching = true; onMove(e); } };
    const onUp = () => { touching = false; };
    window.addEventListener('pointermove', onMove, { passive: true });
    scope.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });

    const frame = () => {
      const now = performance.now();
      const t = (now - start) / 1000;

      // sem input recente → figura de oito automática
      if (now - lastInput > (H.touch ? 1800 : 3500)) {
        target.x = 0.5 + 0.27 * Math.sin(t * 0.55);
        target.y = 0.52 + 0.2 * Math.sin(t * 1.1);
      }
      last.x = pos.x; last.y = pos.y;
      pos.x += (target.x - pos.x) * 0.075;
      pos.y += (target.y - pos.y) * 0.075;

      const [w, h] = v.resize();
      const aspect = w / h;
      const mobile = H.isMobile();

      // 1) simulação da trilha
      gl.useProgram(sim.p);
      v.bindTex(sim, 'uPrev', A.tex, 0);
      gl.uniform2f(sim.loc('uMouse'), pos.x, pos.y);
      gl.uniform2f(sim.loc('uLast'), last.x, last.y);
      gl.uniform1f(sim.loc('uAspect'), aspect);
      gl.uniform1f(sim.loc('uRadius'), mobile ? 0.2 : 0.15);
      gl.uniform1f(sim.loc('uStrength'), 1.0);
      gl.uniform1f(sim.loc('uTime'), t);
      v.draw(sim, B);
      const tmp = A; A = B; B = tmp;

      // 2) composição final
      gl.useProgram(ren.p);
      v.bindTex(ren, 'uBase', texBase, 0);
      v.bindTex(ren, 'uHidden', texHidden, 1);
      v.bindTex(ren, 'uTrail', A.tex, 2);
      gl.uniform2f(ren.loc('uRes'), w, h);
      gl.uniform2f(ren.loc('uImg'), imgSize[0], imgSize[1]);
      gl.uniform1f(ren.loc('uTime'), t);
      v.draw(ren, null);
    };

    return {
      setActive(on) {
        if (on === running) return;
        running = on;
        if (on) window.gsap.ticker.add(frame);
        else window.gsap.ticker.remove(frame);
      },
      resize() { makeTargets(); },
      renderOnce: frame,
    };
  };
})(window.HALVORN);
