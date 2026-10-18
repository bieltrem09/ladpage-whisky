import { useEffect, useRef, useState } from 'react';
import FrameCanvas from '../components/FrameCanvas.jsx';
import { FRAMES, MOBILE_QUERY } from '../config/frames.js';
import { DETAIL } from '../content/copy.js';
import { useFrameSequence } from '../hooks/useFrameSequence.js';
import { useMediaQuery, useReducedMotion } from '../hooks/useReducedMotion.js';
import { useScrollProgress } from '../hooks/useScrollProgress.js';

const seq = FRAMES.detail;
const captions = DETAIL.captions.map((c, i) => ({ ...c, range: seq.captionRanges[i] }));

const pad3 = (n) => String(n).padStart(3, '0');

function captionAt(p) {
  return captions.findIndex(({ range: [a, b] }) => p >= a && p <= b);
}

export default function ScrollFilm({ preloadNow = false }) {
  const reduced = useReducedMotion();
  const mobile = useMediaQuery(MOBILE_QUERY);
  const film = useFrameSequence(seq.dir, seq.count, {
    stride: mobile ? seq.mobileStride : 1,
    ext: seq.ext,
    digits: seq.digits,
  });

  const sectionRef = useRef(null);
  const canvas = useRef(null);
  const counterRef = useRef(null);
  const railRef = useRef(null);
  const anim = useRef({ target: 0, cur: 0, drawn: -1, raf: 0 });
  const [active, setActive] = useState(0);

  const paintIndex = (i, force = false) => {
    const idx = film.nearestLoaded(i);
    if (idx < 0) return;
    const a = anim.current;
    if (!force && idx === a.drawn) return;
    film.warm(idx, 8, 8);
    canvas.current?.paint(film.drawable(idx));
    a.drawn = idx;
    if (counterRef.current) counterRef.current.textContent = pad3(film.frames[idx]);
  };

  const tick = () => {
    const a = anim.current;
    a.raf = 0;
    const diff = a.target - a.cur;
    a.cur = Math.abs(diff) < 0.01 ? a.target : a.cur + diff * seq.ease;
    paintIndex(Math.round(a.cur));
    if (a.cur !== a.target) a.raf = requestAnimationFrame(tick);
  };

  const requestTick = () => {
    if (!anim.current.raf) anim.current.raf = requestAnimationFrame(tick);
  };

  // A lista de quadros muda (stride no celular): recomeça o estado de pintura.
  useEffect(() => {
    const a = anim.current;
    a.drawn = -1;
    return () => {
      cancelAnimationFrame(a.raf);
      a.raf = 0;
    };
  }, [film]);

  // Começa a baixar a 120% da viewport, ou quando o hero termina.
  useEffect(() => {
    if (reduced) {
      const target = Math.round(((seq.reducedFrame - 1) / (seq.count - 1)) * (film.total - 1));
      anim.current.target = anim.current.cur = target;
      const off = film.onFrameLoaded(() => paintIndex(target, true));
      film.load([target]);
      paintIndex(target, true);
      return off;
    }

    const off = film.onFrameLoaded((i) => {
      const a = anim.current;
      if (a.drawn < 0 || i === Math.round(a.cur)) paintIndex(Math.round(a.cur), true);
    });

    if (preloadNow) {
      film.load('coarse');
      return off;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          film.load('coarse');
          io.disconnect();
        }
      },
      { rootMargin: seq.preloadMargin }
    );
    io.observe(sectionRef.current);
    return () => {
      off();
      io.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [film, reduced, preloadNow]);

  useScrollProgress(
    sectionRef,
    (p) => {
      const a = anim.current;
      a.target = p * (film.total - 1);
      if (railRef.current) railRef.current.style.transform = `scaleY(${p})`;
      const c = captionAt(p);
      setActive((prev) => (prev === c ? prev : c));
      requestTick();
    },
    !reduced
  );

  return (
    <section
      id="detalhe"
      ref={sectionRef}
      className={`film ${reduced ? 'is-reduced' : ''}`}
      aria-labelledby="detalhe-title"
    >
      <h2 id="detalhe-title" className="sr-only">
        {DETAIL.heading}
      </h2>
      <div className="film__stage">
        <FrameCanvas ref={canvas} focal={seq.focal} label={DETAIL.canvasLabel} />
        <div className="film__scrim" aria-hidden="true" />

        <div className="film__captions">
          {captions.map((c, i) => (
            <div key={c.title} className={`film__caption ${reduced || i === active ? 'is-active' : ''}`}>
              <p className="eyebrow eyebrow--cyan">{c.eyebrow}</p>
              <p className="film__title">{c.title}</p>
            </div>
          ))}
        </div>

        <div className="film__rail" aria-hidden="true">
          <span className="film__track">
            <span ref={railRef} className="film__fill" />
          </span>
          <span ref={counterRef} className="film__counter">
            001
          </span>
          <span className="film__label">{DETAIL.frameLabel}</span>
        </div>
      </div>
    </section>
  );
}
