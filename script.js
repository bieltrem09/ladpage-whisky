/* =========================================================
   Animações de rolagem quadro a quadro (canvas)

   Cada <section class="scrolly"> da página vira uma animação
   independente, configurada por atributos data-*:

     data-frame-path   caminho com {n} no lugar do número do quadro
                       (ex.: "frames/frame-{n}.jpg" → frame-0001.jpg)
     data-frame-count  total de quadros
     data-reduced-frame  quadro exibido com prefers-reduced-motion
   ========================================================= */
(() => {
  'use strict';

  // ---------- Configuração geral ----------
  const CONFIG = {
    // Pixels de rolagem por quadro. 300 quadros x 14px ≈ 4200px de trilho.
    pxPerFrame: 14,
    // Suavização (0–1). Menor = mais "macio", maior = mais responsivo.
    ease: 0.14,
    // Limite de densidade de pixels do canvas (economiza memória/GPU no celular).
    maxDpr: 2,
    // Quantas imagens baixar ao mesmo tempo, por animação.
    concurrency: 6,
    // Começa a baixar uma animação quando ela está a esta distância da tela.
    preloadMargin: '150% 0px',
  };

  const root = document.documentElement;
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  let reduced = motionQuery.matches;

  // Ordem de carregamento: primeiro, último e meio, depois preenche
  // as lacunas progressivamente. Assim qualquer posição da rolagem tem
  // um quadro próximo disponível cedo.
  function loadOrder(count) {
    const order = [];
    const seen = new Uint8Array(count);
    const push = (i) => {
      if (i >= 0 && i < count && !seen[i]) { seen[i] = 1; order.push(i); }
    };
    push(0);
    for (let step = 1 << Math.ceil(Math.log2(count)); step >= 1; step >>= 1) {
      for (let i = 0; i < count; i += step) push(i);
    }
    return order;
  }

  class ScrollSequence {
    constructor(section) {
      this.section = section;
      this.canvas = section.querySelector('.scrolly__canvas');
      this.ctx = this.canvas.getContext('2d', { alpha: false });
      this.loader = section.querySelector('.loader');
      this.loaderFill = section.querySelector('.loader__bar span');
      this.loaderLabel = section.querySelector('.loader__label');
      this.captions = Array.from(section.querySelectorAll('.caption'));

      this.pathTemplate = section.dataset.framePath;
      this.frameCount = parseInt(section.dataset.frameCount, 10);
      this.reducedFrame = Math.min(
        this.frameCount,
        Math.max(1, parseInt(section.dataset.reducedFrame, 10) || Math.ceil(this.frameCount / 2))
      ) - 1;

      this.images = new Array(this.frameCount);
      this.loaded = new Uint8Array(this.frameCount);
      this.loadedCount = 0;
      this.preloadStarted = false;

      this.targetFrame = 0;   // para onde a rolagem aponta
      this.currentFrame = 0;  // valor suavizado (float)
      this.drawnFrame = -1;   // último quadro desenhado
      this.rafId = 0;
      this.canvasW = 0;
      this.canvasH = 0;

      this.tick = this.tick.bind(this);
    }

    framePath(index) {
      return this.pathTemplate.replace('{n}', String(index + 1).padStart(4, '0'));
    }

    // ---------- Carregamento ----------
    loadFrame(index) {
      return new Promise((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.src = this.framePath(index);

        const done = () => {
          this.images[index] = img;
          this.loaded[index] = 1;
          this.loadedCount++;
          this.updateLoader();
          // Se este é o quadro que deveria estar na tela, redesenha.
          if (Math.round(this.currentFrame) === index || this.drawnFrame === -1) {
            this.drawnFrame = -2;
            this.requestTick();
          }
          resolve();
        };

        const fail = () => {
          console.warn(`[scrolly] Não foi possível carregar ${img.src}`);
          this.loadedCount++;
          this.updateLoader();
          resolve();
        };

        img.onload = () => {
          // decode() evita travadas no primeiro desenho do quadro
          if (img.decode) img.decode().then(done, done);
          else done();
        };
        img.onerror = fail;
      });
    }

    async preloadAll() {
      if (this.preloadStarted) return;
      this.preloadStarted = true;

      const queue = loadOrder(this.frameCount);
      // O primeiro quadro sozinho, para a tela aparecer o quanto antes.
      await this.loadFrame(queue.shift());

      const worker = async () => {
        while (queue.length) await this.loadFrame(queue.shift());
      };
      await Promise.all(Array.from({ length: CONFIG.concurrency }, worker));
    }

    updateLoader() {
      if (!this.loader) return;
      const total = reduced ? 1 : this.frameCount;
      const pct = Math.min(100, Math.round((this.loadedCount / total) * 100));
      this.loaderFill.style.transform = `scaleX(${pct / 100})`;
      this.loaderLabel.textContent = `Carregando ${pct}%`;
      if (pct >= 100) this.loader.classList.add('is-done');
    }

    // Se o quadro pedido ainda não chegou, usa o mais próximo já carregado.
    nearestLoaded(index) {
      if (this.loaded[index]) return index;
      for (let d = 1; d < this.frameCount; d++) {
        if (this.loaded[index - d]) return index - d;
        if (this.loaded[index + d]) return index + d;
      }
      return -1;
    }

    // ---------- Canvas ----------
    resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
      const rect = this.canvas.getBoundingClientRect();
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (w === this.canvasW && h === this.canvasH) return;
      this.canvasW = this.canvas.width = w;
      this.canvasH = this.canvas.height = h;
      this.ctx.imageSmoothingEnabled = true;
      this.ctx.imageSmoothingQuality = 'high';
      this.render(true);
    }

    // Desenha a imagem cobrindo todo o canvas sem distorcer (equivalente a object-fit: cover).
    drawCover(img) {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(this.canvasW / iw, this.canvasH / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      this.ctx.drawImage(img, (this.canvasW - dw) / 2, (this.canvasH - dh) / 2, dw, dh);
    }

    render(force = false) {
      const index = this.nearestLoaded(Math.round(this.currentFrame));
      if (index === -1) return;
      if (!force && index === this.drawnFrame) return;
      this.drawCover(this.images[index]);
      this.drawnFrame = index;
    }

    // ---------- Rolagem ----------
    setTrackLength() {
      const length = this.frameCount * CONFIG.pxPerFrame + window.innerHeight;
      this.section.style.setProperty('--scroll-length', `${length}px`);
    }

    progress() {
      const rect = this.section.getBoundingClientRect();
      const scrollable = this.section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return 0;
      return Math.min(1, Math.max(0, -rect.top / scrollable));
    }

    updateCaptions(progress) {
      for (const el of this.captions) {
        const start = parseFloat(el.dataset.start);
        const end = parseFloat(el.dataset.end);
        el.classList.toggle('is-active', progress >= start && progress <= end);
      }
    }

    onScroll() {
      if (reduced) return;
      const progress = this.progress();
      this.targetFrame = progress * (this.frameCount - 1);
      this.updateCaptions(progress);
      this.section.classList.toggle('is-scrolled', progress > 0.01);
      this.requestTick();
    }

    tick() {
      this.rafId = 0;
      const diff = this.targetFrame - this.currentFrame;

      if (Math.abs(diff) < 0.05) this.currentFrame = this.targetFrame;
      else this.currentFrame += diff * CONFIG.ease;

      this.render();

      // Continua animando até alcançar o alvo; depois para (sem rAF ocioso).
      if (this.currentFrame !== this.targetFrame) this.requestTick();
    }

    requestTick() {
      if (!this.rafId) this.rafId = requestAnimationFrame(this.tick);
    }

    // ---------- Modos (normal / movimento reduzido) ----------
    applyMode() {
      if (reduced) {
        // Imagem estática, todas as legendas visíveis, sem trilho de rolagem.
        this.section.style.removeProperty('--scroll-length');
        this.targetFrame = this.currentFrame = this.reducedFrame;
        this.captions.forEach((el) => el.classList.add('is-active'));
        if (!this.loaded[this.reducedFrame]) this.loadFrame(this.reducedFrame);
        this.updateLoader();
      } else {
        this.setTrackLength();
        this.onScroll();
        this.currentFrame = this.targetFrame; // sem "rebobinar" ao trocar de modo
      }
    }
  }

  // ---------- Inicialização ----------
  const sequences = Array.from(document.querySelectorAll('.scrolly[data-frame-path]'))
    .filter((section) => section.querySelector('.scrolly__canvas'))
    .map((section) => new ScrollSequence(section));

  if (!sequences.length) return;

  // Só baixa os quadros de uma animação quando ela se aproxima da tela,
  // para a segunda sequência não competir com a primeira no carregamento.
  const preloadObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const seq = sequences.find((s) => s.section === entry.target);
          preloadObserver.unobserve(entry.target);
          if (seq && !reduced) seq.preloadAll();
        }
      }, { rootMargin: CONFIG.preloadMargin })
    : null;

  function applyMode() {
    reduced = motionQuery.matches;
    root.classList.toggle('reduced-motion', reduced);

    for (const seq of sequences) {
      seq.applyMode();
      if (reduced) continue;
      if (preloadObserver && !seq.preloadStarted) preloadObserver.observe(seq.section);
      else seq.preloadAll();
    }

    // A altura dos canvas muda entre os modos.
    requestAnimationFrame(() => sequences.forEach((seq) => { seq.resize(); seq.render(true); }));
  }

  applyMode();
  sequences.forEach((seq) => seq.resize());

  window.addEventListener('scroll', () => sequences.forEach((seq) => seq.onScroll()), { passive: true });

  // Recalcula trilhos e canvas quando a janela muda de tamanho.
  let resizeTimer = 0;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      for (const seq of sequences) {
        if (!reduced) {
          seq.setTrackLength();
          seq.onScroll();
        }
        seq.resize();
      }
    }, 100);
  });

  if ('ResizeObserver' in window) {
    const ro = new ResizeObserver(() => sequences.forEach((seq) => seq.resize()));
    sequences.forEach((seq) => ro.observe(seq.canvas));
  }

  // Usuário pode mudar a preferência com a página aberta.
  if (motionQuery.addEventListener) motionQuery.addEventListener('change', applyMode);
  else if (motionQuery.addListener) motionQuery.addListener(applyMode);

  // Voltar do cache (bfcache) no Safari/iOS: garante o quadro correto.
  window.addEventListener('pageshow', () => {
    for (const seq of sequences) {
      seq.onScroll();
      seq.currentFrame = seq.targetFrame;
      seq.render(true);
    }
  });
})();
