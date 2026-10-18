/* =========================================================
   Animação de rolagem quadro a quadro (canvas)
   ========================================================= */
(() => {
  'use strict';

  // ---------- Configuração ----------
  const CONFIG = {
    frameCount: 240,
    // Caminho relativo ao index.html. Gera frames/frame-0001.jpg ... frame-0240.jpg
    framePath: (i) => `frames/frame-${String(i).padStart(4, '0')}.jpg`,
    // Pixels de rolagem por quadro. 240 quadros x 14px ≈ 3360px de trilho.
    pxPerFrame: 14,
    // Suavização (0–1). Menor = mais "macio", maior = mais responsivo.
    ease: 0.14,
    // Limite de densidade de pixels do canvas (economiza memória/GPU no celular).
    maxDpr: 2,
    // Quantas imagens baixar ao mesmo tempo.
    concurrency: 6,
    // Quadro mostrado quando o usuário prefere movimento reduzido.
    reducedMotionFrame: 120,
  };

  const root = document.documentElement;
  const section = document.getElementById('scrolly');
  const canvas = document.getElementById('scrolly-canvas');
  if (!section || !canvas) return;

  const loader = document.getElementById('loader');
  const loaderFill = document.getElementById('loader-fill');
  const loaderLabel = document.getElementById('loader-label');
  const captions = Array.from(section.querySelectorAll('.caption'));

  const ctx = canvas.getContext('2d', { alpha: false });
  const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

  const images = new Array(CONFIG.frameCount);   // HTMLImageElement | undefined
  const loaded = new Uint8Array(CONFIG.frameCount); // 1 quando pronto para desenhar
  let loadedCount = 0;
  let preloadStarted = false;

  let reduced = motionQuery.matches;
  let targetFrame = 0;   // para onde a rolagem aponta
  let currentFrame = 0;  // valor suavizado (float)
  let drawnFrame = -1;   // último quadro desenhado
  let rafId = 0;
  let canvasW = 0;
  let canvasH = 0;

  // ---------- Carregamento ----------
  function loadFrame(index) {
    return new Promise((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.src = CONFIG.framePath(index + 1);

      const done = () => {
        images[index] = img;
        loaded[index] = 1;
        loadedCount++;
        updateLoader();
        // Se este é o quadro que deveria estar na tela, redesenha.
        if (Math.round(currentFrame) === index || drawnFrame === -1) {
          drawnFrame = -2;
          requestTick();
        }
        resolve();
      };

      const fail = () => {
        console.warn(`[scrolly] Não foi possível carregar ${img.src}`);
        loadedCount++;
        updateLoader();
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

  async function preloadAll() {
    if (preloadStarted) return;
    preloadStarted = true;

    const queue = loadOrder(CONFIG.frameCount);
    // O primeiro quadro sozinho, para a tela aparecer o quanto antes.
    await loadFrame(queue.shift());

    const worker = async () => {
      while (queue.length) await loadFrame(queue.shift());
    };
    await Promise.all(Array.from({ length: CONFIG.concurrency }, worker));
  }

  function updateLoader() {
    const total = reduced ? 1 : CONFIG.frameCount;
    const pct = Math.min(100, Math.round((loadedCount / total) * 100));
    loaderFill.style.transform = `scaleX(${pct / 100})`;
    loaderLabel.textContent = `Carregando ${pct}%`;
    if (pct >= 100) loader.classList.add('is-done');
  }

  // Se o quadro pedido ainda não chegou, usa o mais próximo já carregado.
  function nearestLoaded(index) {
    if (loaded[index]) return index;
    for (let d = 1; d < CONFIG.frameCount; d++) {
      if (loaded[index - d]) return index - d;
      if (loaded[index + d]) return index + d;
    }
    return -1;
  }

  // ---------- Canvas ----------
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, CONFIG.maxDpr);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    if (w === canvasW && h === canvasH) return;
    canvasW = canvas.width = w;
    canvasH = canvas.height = h;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    drawnFrame = -2; // força redesenho
    render(true);
  }

  // Desenha a imagem cobrindo todo o canvas sem distorcer (equivalente a object-fit: cover).
  function drawCover(img) {
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(canvasW / iw, canvasH / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (canvasW - dw) / 2;
    const dy = (canvasH - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  }

  function render(force = false) {
    const wanted = Math.round(currentFrame);
    const index = nearestLoaded(wanted);
    if (index === -1) return;
    if (!force && index === drawnFrame) return;
    drawCover(images[index]);
    drawnFrame = index;
  }

  // ---------- Rolagem ----------
  function scrollProgress() {
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return 0;
    return Math.min(1, Math.max(0, -rect.top / scrollable));
  }

  function updateCaptions(progress) {
    for (const el of captions) {
      const start = parseFloat(el.dataset.start);
      const end = parseFloat(el.dataset.end);
      el.classList.toggle('is-active', progress >= start && progress <= end);
    }
  }

  function onScroll() {
    if (reduced) return;
    const progress = scrollProgress();
    targetFrame = progress * (CONFIG.frameCount - 1);
    updateCaptions(progress);
    root.classList.toggle('is-scrolled', progress > 0.01);
    requestTick();
  }

  function tick() {
    rafId = 0;
    const diff = targetFrame - currentFrame;

    if (Math.abs(diff) < 0.05) {
      currentFrame = targetFrame;
    } else {
      currentFrame += diff * CONFIG.ease;
    }

    render();

    // Continua animando até alcançar o alvo; depois para (sem rAF ocioso).
    if (currentFrame !== targetFrame) requestTick();
  }

  function requestTick() {
    if (!rafId) rafId = requestAnimationFrame(tick);
  }

  // ---------- Modos (normal / movimento reduzido) ----------
  function applyMode() {
    reduced = motionQuery.matches;
    root.classList.toggle('reduced-motion', reduced);

    if (reduced) {
      // Imagem estática, todas as legendas visíveis, sem trilho de rolagem.
      section.style.removeProperty('--scroll-length');
      const still = Math.min(CONFIG.frameCount, Math.max(1, CONFIG.reducedMotionFrame)) - 1;
      targetFrame = currentFrame = still;
      captions.forEach((el) => el.classList.add('is-active'));
      if (!loaded[still]) loadFrame(still);
      updateLoader();
    } else {
      const length = CONFIG.frameCount * CONFIG.pxPerFrame + window.innerHeight;
      section.style.setProperty('--scroll-length', `${length}px`);
      preloadAll();
      onScroll();
      currentFrame = targetFrame; // sem "rebobinar" ao trocar de modo
    }

    // A altura do canvas muda entre os modos.
    requestAnimationFrame(() => {
      resizeCanvas();
      render(true);
    });
  }

  // ---------- Inicialização ----------
  function init() {
    applyMode();
    resizeCanvas();

    window.addEventListener('scroll', onScroll, { passive: true });

    // Recalcula o trilho e o canvas quando a janela muda de tamanho.
    let resizeTimer = 0;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (!reduced) {
          const length = CONFIG.frameCount * CONFIG.pxPerFrame + window.innerHeight;
          section.style.setProperty('--scroll-length', `${length}px`);
          onScroll();
        }
        resizeCanvas();
      }, 100);
    });

    if ('ResizeObserver' in window) {
      new ResizeObserver(() => resizeCanvas()).observe(canvas);
    }

    // Usuário pode mudar a preferência com a página aberta.
    if (motionQuery.addEventListener) motionQuery.addEventListener('change', applyMode);
    else if (motionQuery.addListener) motionQuery.addListener(applyMode);

    // Voltar do cache (bfcache) no Safari/iOS: garante o quadro correto.
    window.addEventListener('pageshow', () => {
      onScroll();
      currentFrame = targetFrame;
      render(true);
    });
  }

  init();
})();
