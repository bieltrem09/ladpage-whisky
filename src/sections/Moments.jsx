import { MOMENTS } from '../content/copy.js';
import { useReveal } from '../hooks/useReveal.js';

export default function Moments() {
  const ref = useReveal();
  return (
    <section className="section section--ice section--tight-top" aria-labelledby="momentos-title">
      <div ref={ref} className="container reveal">
        <div className="section-head">
          <p className="eyebrow">{MOMENTS.eyebrow}</p>
          <h2 id="momentos-title" className="h2">
            {MOMENTS.title}
          </h2>
          <p className="section-head__note">{MOMENTS.note}</p>
        </div>
        <ul className="moments" aria-label="Momentos sugeridos">
          {MOMENTS.items.map((m) => (
            <li key={m.moment} className="moment">
              <p className="moment__label">{m.moment}</p>
              <h3 className="moment__title">{m.text}</h3>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
