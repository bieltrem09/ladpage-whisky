/* =============================================================================
   Trilha ambiente — gerada em tempo real com Web Audio (sem arquivos):
   - drone grave: dois osciladores levemente desafinados + filtro passa-baixa
   - "lenha": ruído marrom suave + estalos aleatórios curtos
   Começa desligada. O botão "SOM ON/OFF" faz fade in/out.
   ============================================================================= */
(function (H) {
  const S = (H.sound = { on: false });
  let ctx, master, crackleTimer;

  function build() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return false;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // --- drone
    const droneFilter = ctx.createBiquadFilter();
    droneFilter.type = 'lowpass';
    droneFilter.frequency.value = 220;
    droneFilter.Q.value = 0.7;
    const droneGain = ctx.createGain();
    droneGain.gain.value = 0.32;
    droneFilter.connect(droneGain).connect(master);
    [[55, 'sawtooth', 0.35], [55.4, 'sawtooth', 0.3], [82.4, 'sine', 0.4], [27.5, 'sine', 0.6]].forEach(([f, type, g]) => {
      const o = ctx.createOscillator();
      o.type = type;
      o.frequency.value = f;
      const og = ctx.createGain();
      og.gain.value = g;
      o.connect(og).connect(droneFilter);
      o.start();
    });
    // respiração lenta do filtro
    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.05;
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(droneFilter.frequency);
    lfo.start();

    // --- ruído marrom (fogo ao fundo)
    const len = ctx.sampleRate * 4;
    const buf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {
      const w = Math.random() * 2 - 1;
      last = (last + 0.02 * w) / 1.02;
      d[i] = last * 3.2;
    }
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    noise.loop = true;
    const nf = ctx.createBiquadFilter();
    nf.type = 'lowpass';
    nf.frequency.value = 900;
    const ng = ctx.createGain();
    ng.gain.value = 0.18;
    noise.connect(nf).connect(ng).connect(master);
    noise.start();

    // --- estalos
    const popBuf = ctx.createBuffer(1, ctx.sampleRate * 0.03, ctx.sampleRate);
    const pd = popBuf.getChannelData(0);
    for (let i = 0; i < pd.length; i++) pd[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / pd.length, 4);
    const pop = () => {
      if (!S.on) return;
      const src = ctx.createBufferSource();
      src.buffer = popBuf;
      const f = ctx.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.value = 1200 + Math.random() * 2600;
      const g = ctx.createGain();
      g.gain.value = 0.05 + Math.random() * 0.22;
      src.connect(f).connect(g).connect(master);
      src.start();
      crackleTimer = setTimeout(pop, 80 + Math.random() * (Math.random() < 0.2 ? 90 : 700));
    };
    S.pop = pop;
    return true;
  }

  S.init = () => {
    const btn = document.getElementById('sound-btn');
    const label = document.getElementById('sound-label');
    btn.addEventListener('click', () => {
      if (!ctx && !build()) return;
      S.on = !S.on;
      if (ctx.state === 'suspended') ctx.resume();
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(S.on ? H.config.sound.volume : 0, now + (S.on ? 2.5 : 0.8));
      clearTimeout(crackleTimer);
      if (S.on) S.pop();
      label.textContent = S.on ? 'SOM ON' : 'SOM OFF';
      btn.setAttribute('aria-pressed', String(S.on));
      btn.classList.toggle('is-on', S.on);
    });
  };
})(window.HALVORN);
