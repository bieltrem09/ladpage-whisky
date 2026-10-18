import { useEffect, useRef, useState } from 'react';
import FrameCanvas from '../components/FrameCanvas.jsx';
import { FRAMES, frameUrl } from '../config/frames.js';
import { HERO, SALES_LINK } from '../content/copy.js';
import { useFrameSequence } from '../hooks/useFrameSequence.js';
import { useMediaQuery, useReducedMotion } from '../hooks/useReducedMotion.js';

const seq = FRAMES.hero;
const buyHref = SALES_LINK ?? '#comprar';

export default function HeroReveal({ onIntroEnd }) {
  const reduced = useReducedMotion();
  const compact = useMediaQuery(seq.compactQuery);
  const focal = compact ? seq.focalCompact : seq.focal;
  const film = useFrameSequence(seq.dir, seq.count, { ext: seq.ext, digits: seq.digits });
  const canvas = useRef(null);

  const [uiIn, setUiIn] = useState(false); // texto + gradiente de leitura
  const [playing, setPlaying] = useState(false); // loader some
  const [ended, setEnded] = useState(false); // palavra BOOST + "Role"
  const [buffered, setBuffered] = useState(0); // quadros contíguos prontos

  const endRef = useRef(onIntroEnd);
  endRef.current = onIntroEnd;

  // ---------- Movimento reduzido: só o último quadro ----------
  useEffect(() => {
    if (!reduced) return;
    const last = film.total - 1;
    const off = film.onFrameLoaded((i) => {
      if (i === last) canvas.current?.paint(film.images[i]);
    });
    if (film.isLoaded(last)) canvas.current?.paint(film.images[last]);
    else film.load([last]);
    setUiIn(true);
    setPlaying(true);
    setEnded(true);
    endRef.current?.();
    return off;
  }, [reduced, film]);

  // ---------- Filme normal ----------
  useEffect(() => {
    if (reduced) return;

    let contiguous = 0;
    let started = false;
    let raf = 0;
    let timer = 0;
    let cancelled = false;

    const frameMs = 1000 / seq.fps;
    const last = film.total - 1;

    const play = () => {
      if (started || cancelled) return;
      started = true;
      film.warm(0, 14, 0);
      clearTimeout(timer);
      setPlaying(true);

      let cur = 0;
      let clock = performance.now(); // instante em que o quadro 0 "começou"
      let lastAdvance = clock;

      const tick = (now) => {
        if (cancelled) return;
        const want = Math.min(last, Math.floor((now - clock) / frameMs));
        const before = cur;

        while (cur < want) {
          if (film.isLoaded(cur + 1)) cur++;
          else {
            // Próximo quadro não chegou: segura o atual e desloca o relógio.
            clock = now - cur * frameMs;
            break;
          }
        }

        if (cur === before && now - lastAdvance > seq.stallJumpMs) {
          // Travado demais: pula para o quadro carregado mais perto do fim.
          const jump = film.nearestLoaded(last);
          if (jump > cur) {
            cur = jump;
            clock = now - cur * frameMs;
          }
          lastAdvance = now;
        }

        if (cur !== before) {
          lastAdvance = now;
          film.warm(cur, 14, 0);
          canvas.current?.paint(film.drawable(cur));
          if (cur >= seq.uiFrame - 1) setUiIn(true);
        }

        if (cur >= last) {
          setUiIn(true);
          setEnded(true);
          endRef.current?.();
          return;
        }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    };

    const checkBuffer = () => {
      while (contiguous < film.total && film.isLoaded(contiguous)) contiguous++;
      setBuffered(contiguous);
      if (contiguous >= Math.min(seq.bufferAhead, film.total)) play();
    };
    const off = film.onFrameLoaded((i) => {
      if (i === 0 && !started) canvas.current?.paint(film.images[0]);
      checkBuffer();
    });

    // Plano B: começa após o timeout mesmo sem o buffer completo.
    timer = setTimeout(() => {
      if (film.isLoaded(0)) play();
      else {
        const waitFirst = film.onFrameLoaded((i) => {
          if (i === 0) {
            waitFirst();
            play();
          }
        });
      }
    }, seq.startTimeoutMs);

    if (film.isLoaded(0)) canvas.current?.paint(film.images[0]);
    film.load('sequential');
    checkBuffer(); // quadros que já estavam prontos (ex.: remontagem)

    // Rolou durante a intro: a UI aparece na hora.
    const onScroll = () => {
      if (window.scrollY > 8) setUiIn(true);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      cancelled = true;
      off();
      clearTimeout(timer);
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [reduced, film]);

  const pct = Math.min(100, Math.round((buffered / Math.min(seq.bufferAhead, film.total)) * 100));

  return (
    <section
      id="topo"
      className={`hero ${uiIn ? 'is-ui' : ''} ${ended ? 'is-ended' : ''} ${reduced ? 'is-reduced' : ''}`}
      aria-labelledby="hero-title"
    >
      <div className="hero__stage">
        <FrameCanvas
          ref={canvas}
          focal={focal}
          label={HERO.canvasLabel}
          poster={frameUrl(seq, reduced ? seq.count : 1)}
        />
        <div className="hero__read" aria-hidden="true" />
        <div className="hero__fade" aria-hidden="true" />

        <p className="hero__word" aria-hidden="true">
          {HERO.bigWord}
        </p>

        <div className="scroll-hint" aria-hidden="true">
          <span>{HERO.scrollHint}</span>
          <span className="scroll-hint__line" />
        </div>

        <div className={`film-loader ${playing ? 'is-done' : ''}`} role="status" aria-live="polite">
          <span className="film-loader__bar">
            <span style={{ transform: `scaleX(${pct / 100})` }} />
          </span>
          <span className="film-loader__label">
            {HERO.loading} {pct}%
          </span>
        </div>
      </div>

      <div className="hero__content">
        <div className="hero__inner">
          <p className="eyebrow eyebrow--dash stagger" style={{ '--i': 0 }}>
            {HERO.eyebrow}
          </p>
          <h1 id="hero-title" className="hero__title stagger" style={{ '--i': 1 }}>
            <span>{HERO.titleLine1}</span>
            <span className="text-cobalt">{HERO.titleLine2}</span>
          </h1>
          <p className="hero__text stagger" style={{ '--i': 2 }}>
            {HERO.text}
          </p>
          <div className="hero__actions stagger" style={{ '--i': 3 }}>
            <a
              className="btn btn--navy"
              href={buyHref}
              {...(SALES_LINK ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {HERO.ctaPrimary} <span aria-hidden="true">→</span>
            </a>
            <a className="link-underline" href="#detalhe">
              {HERO.ctaSecondary} <span aria-hidden="true">↓</span>
            </a>
          </div>
          <dl className="spec-line stagger" style={{ '--i': 4 }}>
            {HERO.specs.map((s) => (
              <div key={s.label}>
                <dt>{s.label}</dt>
                <dd>{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
