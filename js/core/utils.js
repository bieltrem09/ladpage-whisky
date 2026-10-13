/* =============================================================================
   Utilitários compartilhados
   - rich():   converte a marcação simples do CONFIG em HTML
   - split():  divide um título em palavras/letras, cada uma dentro de uma
               máscara (overflow: hidden) — o texto entra "por baixo da linha"
   - inset():  monta clip-paths em px (interpoláveis pelo GSAP)
   - fx.*:     o vocabulário de movimento do site (entradas por máscara,
               saídas com motion blur, etc.), sempre adicionando à timeline
   ============================================================================= */
(function (H) {
  const u = (H.u = {});

  /* --------------------------------------------------------------- rich() */
  u.rich = (str) => {
    const esc = String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    return esc
      .replace(/\*\*(.+?)\*\*([.,!?:;]*)/g, '<strong>$1$2</strong>')
      .replace(/\*(.+?)\*([.,!?:;]*)/g, '<em>$1$2</em>')
      .replace(/\n/g, '<br>')
      // ponto final da sans pesada vira um ponto âmbar
      .replace(/([^\s>])\.(?=\s|<br>|$)/g, '$1<span class="dot">.</span>');
  };

  /* -------------------------------------------------------------- split() */
  /**
   * Divide o conteúdo de `el` em palavras (e opcionalmente letras).
   * Mantém <em>, <strong> e <br>. O texto completo fica num span .sr-only
   * para leitores de tela; a versão dividida fica com aria-hidden.
   * Retorna { words, chars, lines } — `lines` agrupa as palavras por <br>.
   */
  u.split = (el, opts = {}) => {
    if (el._split) return el._split;
    const withChars = !!opts.chars;
    const label = el.textContent.replace(/\s+/g, ' ').trim();
    const source = Array.from(el.childNodes);

    const out = document.createElement('span');
    out.className = 'split';
    out.setAttribute('aria-hidden', 'true');

    const words = [];
    const chars = [];
    const lines = [[]];

    const makeWord = (text) => {
      const w = document.createElement('span');
      w.className = 'w';
      const wi = document.createElement('span');
      wi.className = 'wi';
      if (withChars) {
        Array.from(text).forEach((ch) => {
          const c = document.createElement('span');
          c.className = 'c';
          const ci = document.createElement('span');
          ci.className = 'ci';
          ci.textContent = ch;
          c.appendChild(ci);
          wi.appendChild(c);
          chars.push(ci);
        });
      } else {
        wi.textContent = text;
      }
      w.appendChild(wi);
      words.push(wi);
      lines[lines.length - 1].push(wi);
      return w;
    };

    const walk = (node, parent) => {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach((tok) => {
          if (!tok) return;
          if (/^\s+$/.test(tok)) parent.appendChild(document.createTextNode(' '));
          else parent.appendChild(makeWord(tok));
        });
      } else if (node.nodeType === 1) {
        if (node.tagName === 'BR') {
          parent.appendChild(document.createElement('br'));
          lines.push([]);
          return;
        }
        const clone = node.cloneNode(false);
        parent.appendChild(clone);
        Array.from(node.childNodes).forEach((n) => walk(n, clone));
      }
    };
    source.forEach((n) => walk(n, out));

    el.textContent = '';
    const sr = document.createElement('span');
    sr.className = 'sr-only';
    sr.textContent = label;
    el.appendChild(sr);
    el.appendChild(out);

    el._split = { words, chars, lines: lines.filter((l) => l.length) };
    return el._split;
  };

  /** palavras dentro de <em> (itálicos) e fora deles */
  u.italicWords = (el) => Array.from(el.querySelectorAll('em .wi, strong .wi'));
  u.plainWords = (el) => Array.from(el.querySelectorAll('.wi')).filter((w) => !w.closest('em') && !w.closest('strong'));

  /* ---------------------------------------------------------- clip-paths */
  /** inset(top right bottom left round r) em px inteiros.
      Cuidados para o GSAP conseguir interpolar:
      - o navegador encurta insets simétricos ("inset(a b)") e o GSAP lê o
        valor de volta → bottom/left recebem -1px/-2px (invisível) para
        manter sempre 4 valores;
      - "round 0px" também some → o raio mínimo é 1px;
      - só inteiros (decimais confundem a interpolação de strings). */
  u.inset = (t, r, b, l, rad = 0) =>
    `inset(${Math.round(t)}px ${Math.round(r)}px ${Math.round(b) - 1}px ${Math.round(l) - 2}px round ${Math.max(1, Math.round(rad))}px)`;

  /** retângulo w×h (px) centralizado na tela, deslocado opcionalmente */
  u.centerRect = (w, h, rad = 0, dx = 0, dy = 0) => {
    const W = H.vp.w, V = H.vp.h;
    const x = (W - w) / 2 + dx, y = (V - h) / 2 + dy;
    return u.inset(y, W - x - w, V - y - h, x, rad);
  };
  u.full = (rad = 0) => u.inset(0, 0, 0, 0, rad);

  u.clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  u.lerp = (a, b, t) => a + (b - a) * t;

  /* -------------------------------------------------- vocabulário de movimento */
  const fx = (u.fx = {});

  /**
   * Entrada por máscara: palavras sobem de dentro da linha (yPercent 110 → 0).
   * Os itálicos entram um pouco depois e com blur saindo (8px → 0).
   */
  fx.textIn = (tl, el, at, o = {}) => {
    const s = u.split(el, { chars: !!o.chars });
    const dur = o.dur || 0.35;
    const plain = o.chars
      ? s.chars.filter((c) => !c.closest('em') && !c.closest('strong'))
      : u.plainWords(el);
    const ital = o.chars
      ? s.chars.filter((c) => c.closest('em') || c.closest('strong'))
      : u.italicWords(el);
    const stag = o.stagger != null ? o.stagger : o.chars ? 0.012 : 0.04;
    if (plain.length) {
      tl.fromTo(plain, { yPercent: 135 }, { yPercent: 0, duration: dur, stagger: stag, ease: 'power4.out' }, at);
    }
    if (ital.length) {
      tl.fromTo(
        ital,
        { yPercent: 135, filter: 'blur(8px)', opacity: 0 },
        { yPercent: 0, filter: 'blur(0px)', opacity: 1, duration: dur * 1.15, stagger: stag, ease: 'expo.out' },
        at + (o.italicDelay != null ? o.italicDelay : dur * 0.35)
      );
    }
    return s;
  };

  /**
   * Saída com "motion blur" vertical: sobe, estica no eixo Y e borra.
   * (filter blur + scaleY imitam o rastro de uma câmera rápida)
   */
  fx.blurOut = (tl, el, at, o = {}) => {
    const dur = o.dur || 0.35;
    tl.to(el, {
      y: o.y != null ? o.y : () => -H.vp.h * 0.18,
      scaleY: 1.35,
      filter: `blur(${o.blur || 14}px)`,
      opacity: 0,
      duration: dur,
      ease: 'power2.in',
    }, at);
  };

  /** fade simples */
  fx.fade = (tl, el, at, to, dur = 0.3, ease = 'none') =>
    tl.to(el, { opacity: to, duration: dur, ease }, at);

  /** Ajusta a fonte de `el` para que `measureEl` (inline) tenha a largura `targetW` px */
  u.fitText = (el, targetW, min, max, measureEl) => {
    el.style.fontSize = '100px';
    const w = (measureEl || el).getBoundingClientRect().width;
    const size = u.clamp((100 * targetW) / Math.max(1, w), min, max);
    el.style.fontSize = size + 'px';
    return size;
  };
})(window.HALVORN);
