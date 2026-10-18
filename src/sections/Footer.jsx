import Logo from '../components/Logo.jsx';
import { FOOTER, NAV } from '../content/copy.js';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__grid">
        <div className="footer__brand">
          <Logo tone="ice" />
        </div>
        <nav aria-label="Rodapé" className="footer__nav">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <ul className="footer__social">
          {FOOTER.social.map((s) => (
            <li key={s.label}>
              <span>{s.label}</span> {s.value}
            </li>
          ))}
        </ul>
      </div>
      <div className="container footer__bottom">
        <p>{FOOTER.legal}</p>
        <p>{FOOTER.copyright}</p>
      </div>
    </footer>
  );
}
