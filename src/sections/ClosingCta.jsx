import { CLOSING, SALES_LINK, WHATSAPP } from '../content/copy.js';
import { useReveal } from '../hooks/useReveal.js';

const formatPhone = (digits) =>
  digits.replace(/^(\d{2})(\d{2})(\d{4,5})(\d{4})$/, '+$1 ($2) $3-$4');

export default function ClosingCta() {
  const ref = useReveal();
  return (
    <section id="comprar" className="section section--navy closing" aria-labelledby="comprar-title">
      <div ref={ref} className="container reveal">
        <h2 id="comprar-title" className="closing__title">
          <span>
            {CLOSING.titleA} <span className="text-cyan">{CLOSING.titleAccent}</span>
          </span>
          <span>{CLOSING.titleB}</span>
        </h2>
        <p className="closing__text">{CLOSING.text}</p>
        <div className="closing__actions">
          {SALES_LINK ? (
            <a className="btn btn--ice" href={SALES_LINK} target="_blank" rel="noopener">
              {CLOSING.cta} <span aria-hidden="true">→</span>
            </a>
          ) : (
            <>
              <span className="btn btn--ice is-disabled" aria-disabled="true">
                {CLOSING.cta} <span aria-hidden="true">→</span>
              </span>
              <p className="placeholder-note">{CLOSING.salesPlaceholder}</p>
            </>
          )}
          {WHATSAPP && (
            <div className="closing__whats">
              <a className="btn btn--ghost-ice" href={`https://wa.me/${WHATSAPP}`} target="_blank" rel="noopener">
                {CLOSING.whatsappLabel}
              </a>
              <span className="closing__phone">{formatPhone(WHATSAPP)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
