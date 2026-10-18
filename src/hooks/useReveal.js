import { useEffect, useRef } from 'react';

/**
 * Marca o elemento com .is-in quando entra na tela (uma vez).
 * O CSS só esconde .reveal quando <html> tem .js-reveal (posto no main.jsx),
 * então o conteúdo fica visível se o JS falhar ou com movimento reduzido.
 */
export function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in');
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in');
          io.disconnect();
        }
      },
      { rootMargin: '0px 0px -12% 0px' }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return ref;
}
