import { FRAMES, frameUrl } from '../config/frames.js';
import { SPECS } from '../content/copy.js';
import { useReveal } from '../hooks/useReveal.js';

export default function CanSpecs() {
  const ref = useReveal();
  return (
    <section id="ficha" className="section section--ice" aria-labelledby="ficha-title">
      <div ref={ref} className="container specs reveal">
        <figure className="specs__media">
          <img
            src={frameUrl(FRAMES.hero, 1)}
            alt={SPECS.imageAlt}
            width="1600"
            height="900"
            loading="lazy"
            decoding="async"
          />
        </figure>
        <div className="specs__body">
          <p className="eyebrow">{SPECS.eyebrow}</p>
          <h2 id="ficha-title" className="h2">
            {SPECS.title}
          </h2>
          <dl className="spec-table">
            {SPECS.rows.map((r) => (
              <div key={r.label} className="spec-table__row">
                <dt>{r.label}</dt>
                <dd className={r.placeholder ? 'is-placeholder' : ''}>
                  {r.value}
                  {r.note && <span className="spec-table__note"> ({r.note})</span>}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
