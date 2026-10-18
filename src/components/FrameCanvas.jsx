import { useEffect, useImperativeHandle, useRef } from 'react';

const MAX_DPR = 2;
const RESIZE_DEBOUNCE = 120;

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

/**
 * Canvas que pinta um quadro em modo "cover" respeitando um ponto focal
 * (fx, fy entre 0 e 1): o ponto focal fica o mais perto possível do centro
 * sem deixar borda vazia. Assim a lata não sai do quadro no celular em pé.
 *
 * API imperativa via ref: paint(img) — img pode ser HTMLImageElement ou ImageBitmap.
 * `poster` (opcional) é um <img> por baixo do canvas, visível até o primeiro
 * quadro ser pintado. Ele conta como LCP, o que um canvas não faz.
 */
export default function FrameCanvas({ ref, focal = { x: 0.5, y: 0.5 }, label, poster, className = '' }) {
  const canvasRef = useRef(null);
  const state = useRef({ ctx: null, w: 0, h: 0, img: null });
  const focalRef = useRef(focal);
  focalRef.current = focal;

  const draw = () => {
    const s = state.current;
    const { img, ctx, w, h } = s;
    if (!img || !ctx || !w || !h) return;
    const iw = img.naturalWidth || img.width; // HTMLImageElement ou ImageBitmap
    const ih = img.naturalHeight || img.height;
    if (!iw || !ih) return; // ImageBitmap já liberado (close)
    const scale = Math.max(w / iw, h / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const { x: fx, y: fy } = focalRef.current;
    const dx = clamp(w / 2 - dw * fx, w - dw, 0);
    const dy = clamp(h / 2 - dh * fy, h - dh, 0);
    ctx.drawImage(img, dx, dy, dw, dh);
    canvasRef.current.dataset.ready = 'true';
  };

  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width * dpr));
    const h = Math.max(1, Math.round(rect.height * dpr));
    const s = state.current;
    if (w === s.w && h === s.h && s.ctx) return draw();
    canvas.width = s.w = w;
    canvas.height = s.h = h;
    s.ctx = canvas.getContext('2d', { alpha: false });
    s.ctx.imageSmoothingEnabled = true;
    s.ctx.imageSmoothingQuality = 'high';
    draw();
  };

  // Ponto focal mudou (ex.: troca de layout): repinta o quadro atual.
  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focal.x, focal.y]);

  useImperativeHandle(ref, () => ({
    paint(img) {
      if (!img) return;
      state.current.img = img;
      if (!state.current.ctx) resize();
      else draw();
    },
  }));

  useEffect(() => {
    resize();
    let t = 0;
    const debounced = () => {
      clearTimeout(t);
      t = setTimeout(resize, RESIZE_DEBOUNCE);
    };
    const ro = 'ResizeObserver' in window ? new ResizeObserver(debounced) : null;
    ro?.observe(canvasRef.current);
    window.addEventListener('resize', debounced);
    // Voltar do bfcache (Safari): o canvas pode voltar em branco.
    window.addEventListener('pageshow', resize);
    return () => {
      clearTimeout(t);
      ro?.disconnect();
      window.removeEventListener('resize', debounced);
      window.removeEventListener('pageshow', resize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className={`frame-canvas ${className}`}>
      {poster && (
        <img
          className="frame-canvas__poster"
          src={poster}
          alt=""
          aria-hidden="true"
          fetchPriority="high"
          decoding="async"
          style={{ objectPosition: `${focal.x * 100}% ${focal.y * 100}%` }}
        />
      )}
      <canvas ref={canvasRef} className="frame-canvas__canvas" role="img" aria-label={label} />
    </div>
  );
}
