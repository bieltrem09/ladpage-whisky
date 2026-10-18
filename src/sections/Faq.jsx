import { FAQ } from '../content/copy.js';
import { useReveal } from '../hooks/useReveal.js';

export default function Faq() {
  const ref = useReveal();
  return (
    <section id="faq" className="section section--ice" aria-labelledby="faq-title">
      <div ref={ref} className="container faq reveal">
        <div className="section-head faq__head">
          <p className="eyebrow">{FAQ.eyebrow}</p>
          <h2 id="faq-title" className="h2">
            {FAQ.title}
          </h2>
        </div>
        <div className="faq__list">
          {FAQ.items.map((item) => (
            <details key={item.q} className="faq__item">
              <summary>
                <h3>{item.q}</h3>
                <span className="faq__icon" aria-hidden="true" />
              </summary>
              <p className={item.placeholder ? 'is-placeholder' : ''}>{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
