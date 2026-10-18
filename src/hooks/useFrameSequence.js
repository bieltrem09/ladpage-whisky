import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const CONCURRENCY = 6;
const CAN_BITMAP = typeof window !== 'undefined' && 'createImageBitmap' in window;

// Ordem "grosso → fino": primeiro, último, meio e depois as lacunas.
// Assim qualquer ponto da rolagem tem um quadro próximo disponível cedo.
function coarseOrder(n) {
  const order = [];
  const seen = new Uint8Array(n);
  const push = (i) => {
    if (i >= 0 && i < n && !seen[i]) {
      seen[i] = 1;
      order.push(i);
    }
  };
  push(0);
  push(n - 1);
  for (let step = 1 << Math.ceil(Math.log2(Math.max(n, 2))); step >= 1; step >>= 1) {
    for (let i = 0; i < n; i += step) push(i);
  }
  return order;
}

/**
 * Carrega uma sequência de quadros numerados (001.webp, 002.webp...).
 *
 * @param {string} dir    pasta com barra no fim
 * @param {number} count  total de quadros na pasta
 * @param {{ stride?: number, ext?: string, digits?: number }} options
 *   stride 2 = usa um quadro sim, outro não (o último sempre entra).
 *
 * Índices (i) referem-se à lista `frames`, não ao número do arquivo.
 */
export function useFrameSequence(dir, count, { stride = 1, ext = 'webp', digits = 3 } = {}) {
  // Números reais dos arquivos usados (1-based).
  const frames = useMemo(() => {
    const list = [];
    for (let n = 1; n <= count; n += stride) list.push(n);
    if (list[list.length - 1] !== count) list.push(count);
    return list;
  }, [count, stride]);

  // Estado mutável da sequência; recriado quando a lista muda.
  const store = useMemo(
    () => ({
      images: new Array(frames.length),
      loaded: new Uint8Array(frames.length),
      requested: new Uint8Array(frames.length),
      loadedCount: 0,
      gen: 0, // muda ao desmontar: cargas antigas em andamento são ignoradas
      active: false,
      listeners: new Set(),
      // Quadros já decodificados (ImageBitmap) perto do quadro atual.
      // null = decodificação em andamento.
      bitmaps: new Map(),
      blobs: new Array(frames.length),
      objectUrls: [],
    }),
    [dir, frames]
  );

  const [, setLoadedCount] = useState(0);
  const flushRef = useRef(0);

  useEffect(() => {
    store.active = true;
    setLoadedCount(store.loadedCount);
    return () => {
      store.active = false;
      store.gen++;
      // Libera para novo pedido o que não terminou (ex.: remontagem do StrictMode).
      for (let i = 0; i < store.requested.length; i++) store.requested[i] = store.loaded[i];
      cancelAnimationFrame(flushRef.current);
      flushRef.current = 0;
      store.bitmaps.forEach((b) => b?.close());
      store.bitmaps.clear();
    };
  }, [store]);

  // Libera os object URLs ao descartar a sequência (imagens já carregadas
  // continuam válidas; os bitmaps vêm dos blobs).
  useEffect(() => {
    return () => store.objectUrls.forEach((u) => URL.revokeObjectURL(u));
  }, [store]);

  const url = useCallback(
    (i) => `${dir}${String(frames[i]).padStart(digits, '0')}.${ext}`,
    [dir, frames, digits, ext]
  );

  // Atualiza o contador no máximo uma vez por frame de tela.
  const scheduleCount = useCallback(() => {
    if (flushRef.current) return;
    flushRef.current = requestAnimationFrame(() => {
      flushRef.current = 0;
      if (store.active) setLoadedCount(store.loadedCount);
    });
  }, [store]);

  const loadOne = useCallback(
    (i) =>
      new Promise((resolve) => {
        const gen = store.gen;
        const img = new Image();
        img.decoding = 'async';
        const finish = (ok) => {
          if (gen !== store.gen) return resolve();
          if (ok) {
            store.images[i] = img;
            store.loaded[i] = 1;
          }
          store.loadedCount++;
          scheduleCount();
          if (ok) store.listeners.forEach((fn) => fn(i));
          resolve();
        };
        img.onload = () => {
          if (img.decode) img.decode().then(() => finish(true), () => finish(true));
          else finish(true);
        };
        img.onerror = () => {
          console.warn(`[frames] falha ao carregar ${url(i)}`);
          finish(false);
        };
        // Baixa como Blob: o mesmo arquivo serve ao <img> (via object URL) e
        // ao createImageBitmap(blob), que decodifica fora da thread principal.
        fetch(url(i))
          .then((res) => {
            if (!res.ok) throw new Error(res.status);
            return res.blob();
          })
          .then((blob) => {
            if (gen !== store.gen) return resolve();
            store.blobs[i] = blob;
            const objectUrl = URL.createObjectURL(blob);
            store.objectUrls.push(objectUrl);
            img.src = objectUrl;
          })
          .catch(() => {
            img.src = url(i); // sem fetch (ex.: file://): carrega direto
          });
      }),
    [store, url, scheduleCount]
  );

  /**
   * Inicia o carregamento. `order`: 'sequential' | 'coarse' | array de índices.
   * Pode ser chamado várias vezes: quadros já pedidos são ignorados.
   */
  const load = useCallback(
    (order = 'sequential') => {
      const n = frames.length;
      const list =
        order === 'coarse'
          ? coarseOrder(n)
          : order === 'sequential'
            ? Array.from({ length: n }, (_, i) => i)
            : order;
      const queue = list.filter((i) => i >= 0 && i < n && !store.requested[i]);
      queue.forEach((i) => (store.requested[i] = 1));

      const gen = store.gen;
      const worker = async () => {
        while (queue.length && gen === store.gen) await loadOne(queue.shift());
      };
      return Promise.all(Array.from({ length: Math.min(CONCURRENCY, queue.length) }, worker));
    },
    [frames, store, loadOne]
  );

  const isLoaded = useCallback((i) => store.loaded[i] === 1, [store]);

  // Quadro carregado mais próximo de i (ou -1 se nenhum).
  const nearestLoaded = useCallback(
    (i) => {
      const n = frames.length;
      i = Math.max(0, Math.min(n - 1, i));
      if (store.loaded[i]) return i;
      for (let d = 1; d < n; d++) {
        if (i - d >= 0 && store.loaded[i - d]) return i - d;
        if (i + d < n && store.loaded[i + d]) return i + d;
      }
      return -1;
    },
    [frames, store]
  );

  /**
   * Mantém decodificados (ImageBitmap) os quadros de center−behind até
   * center+ahead e libera os que saíram da janela. Sem isso o navegador pode
   * descartar a imagem decodificada e o drawImage decodifica de novo na
   * thread principal a cada quadro (travadas no celular). Memória: cada
   * quadro 1600×900 ocupa ~5,8 MB decodificado, então a janela é curta.
   */
  const warm = useCallback(
    (center, ahead = 12, behind = 4) => {
      if (!CAN_BITMAP) return;
      const n = frames.length;
      const lo = Math.max(0, Math.round(center) - behind);
      const hi = Math.min(n - 1, Math.round(center) + ahead);
      const { bitmaps } = store;

      for (const [i, bmp] of bitmaps) {
        if (i < lo - 2 || i > hi + 2) {
          bmp?.close();
          bitmaps.delete(i);
        }
      }
      const gen = store.gen;
      for (let i = lo; i <= hi; i++) {
        if (!store.loaded[i] || bitmaps.has(i)) continue;
        bitmaps.set(i, null);
        // A partir do Blob a decodificação roda em segundo plano.
        createImageBitmap(store.blobs[i] || store.images[i]).then(
          (bmp) => {
            if (gen === store.gen && bitmaps.has(i) && bitmaps.get(i) === null) bitmaps.set(i, bmp);
            else bmp.close();
          },
          () => bitmaps.delete(i)
        );
      }
    },
    [frames, store]
  );

  // O que desenhar para o quadro i: o bitmap pronto ou, sem ele, a imagem.
  const drawable = useCallback((i) => store.bitmaps.get(i) || store.images[i], [store]);

  // Notificação a cada quadro carregado: fn(index). Retorna o "unsubscribe".
  const onFrameLoaded = useCallback(
    (fn) => {
      store.listeners.add(fn);
      return () => store.listeners.delete(fn);
    },
    [store]
  );

  // Objeto estável (seguro em dependências de efeitos). `loadedCount` é um
  // getter ao vivo; o estado acima garante o re-render quando ele muda.
  return useMemo(
    () => ({
      frames,
      total: frames.length,
      images: store.images,
      get loadedCount() {
        return store.loadedCount;
      },
      isLoaded,
      nearestLoaded,
      load,
      warm,
      drawable,
      onFrameLoaded,
    }),
    [frames, store, isLoaded, nearestLoaded, load, warm, drawable, onFrameLoaded]
  );
}
