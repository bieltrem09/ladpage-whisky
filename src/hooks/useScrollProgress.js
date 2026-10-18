import { useEffect, useRef } from 'react';

/**
 * Chama onProgress(p) com o progresso (0–1) da rolagem através de uma
 * seção "sticky": p = −rect.top / (alturaDaSeção − innerHeight).
 * Não causa re-render: quem chama decide o que atualizar.
 */
export function useScrollProgress(ref, onProgress, enabled = true) {
  const cb = useRef(onProgress);
  cb.current = onProgress;

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const scrollable = el.offsetHeight - window.innerHeight;
      const p = scrollable > 0 ? Math.min(1, Math.max(0, -rect.top / scrollable)) : 0;
      cb.current(p);
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    window.addEventListener('pageshow', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      window.removeEventListener('pageshow', update);
    };
  }, [ref, enabled]);
}
