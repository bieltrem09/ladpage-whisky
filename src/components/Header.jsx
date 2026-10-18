import { useEffect, useRef, useState } from 'react';
import Logo from './Logo.jsx';
import { BUY_LABEL, NAV, SALES_LINK } from '../content/copy.js';

const buyHref = SALES_LINK ?? '#comprar';
const buyExternal = Boolean(SALES_LINK);

function MobileMenu({ open, onClose, returnFocusRef }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusables = () =>
      Array.from(panel.querySelectorAll('a[href], button:not([disabled])'));
    focusables()[0]?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Foco preso no painel.
      const items = focusables();
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    const returnTo = returnFocusRef.current;
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', onKey);
      returnTo?.focus();
    };
  }, [open, onClose, returnFocusRef]);

  return (
    <div
      ref={panelRef}
      id="menu-mobile"
      className="mobile-menu"
      role="dialog"
      aria-modal="true"
      aria-label="Menu"
      hidden={!open}
    >
      <div className="mobile-menu__top">
        <Logo />
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Fechar menu">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>
      <nav aria-label="Menu principal" className="mobile-menu__nav">
        {NAV.map((item) => (
          <a key={item.href} href={item.href} onClick={onClose}>
            {item.label}
          </a>
        ))}
      </nav>
      <a
        className="btn btn--navy btn--block"
        href={buyHref}
        onClick={onClose}
        {...(buyExternal ? { target: '_blank', rel: 'noopener' } : {})}
      >
        {BUY_LABEL}
      </a>
    </div>
  );
}

export default function Header() {
  const [open, setOpen] = useState(false);
  const toggleRef = useRef(null);
  const close = useRef(() => setOpen(false)).current;

  return (
    <>
      <header className="site-header">
        <div className="site-header__pill">
          <a href="#topo" className="site-header__brand" aria-label="Raw Boost — início">
            <Logo />
          </a>
          <nav aria-label="Principal" className="site-header__nav">
            {NAV.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </nav>
          <div className="site-header__actions">
            <a
              className="btn btn--navy btn--sm"
              href={buyHref}
              {...(buyExternal ? { target: '_blank', rel: 'noopener' } : {})}
            >
              {BUY_LABEL}
            </a>
            <button
              ref={toggleRef}
              type="button"
              className="icon-btn site-header__menu"
              aria-expanded={open}
              aria-controls="menu-mobile"
              aria-label="Abrir menu"
              onClick={() => setOpen(true)}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M4 8h16M4 16h16" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <MobileMenu open={open} onClose={close} returnFocusRef={toggleRef} />
    </>
  );
}
