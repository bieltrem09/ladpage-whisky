/* =============================================================================
   CENA 16 — Líquido subindo (WebGL)
   Uma superfície de whisky sobe de baixo para cima (uLevel, controlado pelo
   scroll). A linha d'água é uma soma de senoides + ruído; o mouse cria
   pequenas ondas concêntricas. Abaixo da linha a imagem fica tingida de
   âmbar escuro e refratada, com cáusticas; na linha, um reflexo especular.
   ============================================================================= */
(function (H) {
  const FRAG = `
    uniform sampler2D uImg;
    uniform vec2 uRes, uImgSize, uMouse;
    uniform float uTime, uLevel, uAmp;
    varying vec2 vUv;
    void main(){
      vec2 uv = vUv;
      float t = uTime;
      float asp = uRes.x / uRes.y;
      float x = uv.x * asp;

      float wave = .010 * sin(x * 9. + t * 1.4)
                 + .006 * sin(x * 17. - t * 2.2)
                 + .014 * snoise(vec3(x * 2.2, t * .25, 0.));
      float dm = abs(uv.x - uMouse.x) * asp;
      wave += uAmp * .03 * sin(dm * 36. - t * 9.) * exp(-dm * 4.5);
      float surf = uLevel + wave;
      float depth = surf - uv.y;          // > 0 = submerso

      vec2 cuv = coverUv(uv, uRes, uImgSize);
      vec3 dry = texture2D(uImg, cuv).rgb * vec3(1.06, .97, .86);

      float k = smoothstep(0., .06, depth);
      vec2 r = vec2(snoise(vec3(uv * 4.5, t * .22)), snoise(vec3(uv * 4.5 + 9.1, t * .22))) * .02 * k;
      r.y += .025 * k;
      vec3 wet = texture2D(uImg, coverUv(uv + r, uRes, uImgSize)).rgb;
      float lum = dot(wet, vec3(.299, .587, .114));
      vec3 amber = vec3(.80, .42, .11);
      vec3 tinted = mix(amber * lum * 1.35, vec3(.16, .055, .01), smoothstep(0., .75, depth) * .75);
      tinted = mix(tinted, wet * amber * 1.3, .3);

      float cs = pow(1. - abs(snoise(vec3(uv * vec2(asp, 1.) * 5.5, t * .45))), 9.) * .4 * k;
      tinted += cs * vec3(1., .72, .32) * (1. - smoothstep(0., .5, depth));

      float below = smoothstep(-.0025, .0025, depth);
      vec3 col = mix(dry, tinted, below);
      // banda escura logo abaixo da superfície (menisco)
      col *= 1. - .35 * below * exp(-max(depth, 0.) * 45.) * (1. - exp(-max(depth, 0.) * 400.));
      // reflexo especular na linha d'água
      float line = exp(-abs(depth) * 260.);
      col += line * vec3(1., .84, .55) * .7;

      gl_FragColor = vec4(col, 1.);
    }`;

  H.LiquidRise = function (canvas, img) {
    const v = new H.GL.View(canvas);
    const gl = v.gl;
    const prog = v.program(FRAG);
    const tex = v.texture(img);
    const size = [img.naturalWidth || 1024, img.naturalHeight || 572];
    const state = { level: -0.05 };
    const mouse = { x: 0.5, amp: 0, lx: null };
    let running = false;
    const start = performance.now();

    window.addEventListener('pointermove', (e) => {
      if (!running) return;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      if (mouse.lx != null) mouse.amp = Math.min(1, mouse.amp + Math.abs(x - mouse.lx) * 6);
      mouse.lx = x;
      mouse.x = x;
    }, { passive: true });

    const frame = () => {
      const t = (performance.now() - start) / 1000;
      mouse.amp *= 0.965;
      const [w, h] = v.resize();
      gl.useProgram(prog.p);
      v.bindTex(prog, 'uImg', tex, 0);
      gl.uniform2f(prog.loc('uRes'), w, h);
      gl.uniform2f(prog.loc('uImgSize'), size[0], size[1]);
      gl.uniform2f(prog.loc('uMouse'), mouse.x, 0);
      gl.uniform1f(prog.loc('uTime'), t);
      gl.uniform1f(prog.loc('uLevel'), state.level);
      gl.uniform1f(prog.loc('uAmp'), mouse.amp);
      v.draw(prog, null);
    };

    return {
      state,
      setActive(on) {
        if (on === running) return;
        running = on;
        if (on) window.gsap.ticker.add(frame);
        else window.gsap.ticker.remove(frame);
      },
      renderOnce: frame,
    };
  };
})(window.HALVORN);
