/* =============================================================================
   HALVORN — Single Malt 18 Anos
   Landing page em scrollytelling cinematográfico.

   Como funciona (resumo):
   - Todas as cenas vivem empilhadas dentro de um "palco" fixo (#stage).
   - Existe UMA timeline mestra do GSAP (o "filme"). Cada cena adiciona os seus
     tweens nessa timeline, numa posição calculada aqui.
   - O ScrollTrigger amarra o scroll à agulha dessa timeline (scrub: 1).
     1 unidade de tempo da timeline = 1 tela de scroll (CONFIG.scroll.unit).
   - Como as cenas são posicionadas por tempo, elas podem se sobrepor
     (a próxima começa antes de a anterior terminar) — é isso que dá o ritmo
     de "trailer", sem buracos entre seções.

   >>> Para trocar textos, cores e imagens, edite só o objeto CONFIG abaixo. <<<
   Convenções de texto no CONFIG:
     *palavra*   → itálico serifado âmbar
     **palavra** → destaque âmbar (sem itálico extra)
     \n          → quebra de linha
   ============================================================================= */

const CONFIG = {
  /* ---------------------------------------------------------------- cores */
  colors: {
    carvao: '#0B0A09',
    fumaca: '#1A1714',
    creme: '#F2EDE4',
    ambar: '#C8761E',
    ambarQuente: '#E39A3B',
    cobre: '#9A5A2A',
    cinzaTexto: '#8C857C',
  },

  /* ------------------------------------------------------------- imagens */
  imageBase: 'img/',
  images: {
    hero: 'watermarked_img_656600401022554758.jpg',          // decanter sobre barril
    cellar: '1ae79c50-6f75-42c1-811d-05ce9d26e1d5.jpeg',      // túnel de barris
    glass: '0f40071d-f5a1-4819-91c5-88a8e419817b.jpeg',       // copo vazio, fundo branco
    field: '9907422c-1227-419f-8cd7-1a02046034c8.jpeg',       // campo de cevada
    hand: 'watermarked_img_522449455733637753.jpg',           // mão com grãos
    grains: 'watermarked_img_7964294306485183090.jpg',        // grãos no branco
    cork: 'watermarked_img_6295541903596384342.jpg',          // rolha
    label: '5ef56255-3117-448c-83ab-a90cf5ee3268.jpeg',       // rótulo dourado
    copper: '41016df2-c10e-47b5-958d-878915ff845c.jpeg',      // alambique (detalhe)
    drop: 'acc67d1b-8ad3-4452-88f5-e19522d196a8.jpeg',        // gota
    'smoke-glass': '1afe814a-22a9-4796-a5ed-f1e2c191813f.jpeg', // copo com fumaça
    'barrel-fire': 'watermarked_img_18115323764787887869.jpg',  // barril em chamas
    master: 'watermarked_img_10388615411631255886.jpg',       // mestre destilador
    smoke: '55665b79-6874-43e5-b583-e352a94ef7e1.jpeg',       // fumaça âmbar
    stills: 'watermarked_img_16881551295261496567.jpg',       // destilaria
    highlands: 'watermarked_img_11618902999954946388.jpg',    // rio e montanhas
    oak: 'watermarked_img_12252475341680234219.jpg',          // madeira queimada
    sparks: '3b897243-3b90-47db-9c7b-bfae78a0cae2.jpeg',      // faíscas
    'glass-top': 'watermarked_img_9097782007578566460.jpg',   // copo visto de cima
  },

  /* --------------------------------------------------------------- scroll */
  scroll: {
    unit: 1.0,        // telas de scroll por unidade de timeline (desktop)
    mobileUnit: 0.62, // no mobile o filme é mais curto
    scrub: 1,         // atraso suave do scrub (segundos)
  },

  /* ------------------------------------------------------- textos (pt-BR) */
  text: {
    'pre.pill': 'Para a experiência completa, use fones e tela cheia',
    'pre.question': 'VOCÊ TEM MAIS DE *18 anos*?',
    'pre.yes': '[ SIM ]',
    'pre.no': '[ NÃO ]',
    'pre.deny': 'Volte quando o tempo for seu.',

    'hero.title': 'HALVORN',
    'hero.sub': 'Single Malt',
    'hero.h1': 'Halvorn Single Malt 18 Anos',

    'marquee.top': 'o tempo é o ingrediente — ',
    'marquee.bottom': 'DEZOITO ANOS NO ESCURO — FILHO DO FOGO — ',

    manifesto: [
      'DESTILO *em silêncio*',
      'PARA QUEM SABE ESPERAR.',
      'DESCANSO *em carvalho*',
      'POR DEZOITO INVERNOS.',
      'GUARDO CADA *estação*.',
      'NINGUÉM *apressa* O TEMPO.',
    ],

    'gallery.title': 'NASCE NO\n*campo*\nESCOCÊS.',
    'gallery.text': 'Cevada colhida à mão nas Highlands, maltada no chão de pedra e secada sobre turfa.',
    'gallery.quote': 'Eu bebo o que você só vê no copo.\nNinguém sabe a diferença.',

    'zoom.title': 'AGORA OLHE DE *perto*.',

    'reveal.t1': 'TODO MUNDO VÊ\n*o âmbar*.',
    'reveal.t2': 'NINGUÉM PERGUNTA\n*de onde vem o fogo*.',
    'reveal.endTitle': 'O ÂMBAR É O MESMO.',
    'reveal.endSub': 'Só o tempo mudou.',

    masterPhrases: [
      '*Tem alguém aqui dentro.*',
      '*Ele não tem pressa.*',
      '*Ele não esquece.*',
      '*Ele tem* **sede**.',
    ],

    'angels.top': "Angels'",
    'angels.bottom': 'SHARE',
    'angels.micro': '2% evapora a cada ano.\nÉ a parte dos anjos.',

    'copper.title': 'O COBRE NÃO PEDE LICENÇA.\n*Ele espera o tempo.*',

    'terra.title': 'TERRA *alta*.',
    'terra.micro': 'A água vem do degelo das montanhas.',

    'ritual.title': 'O RITUAL',
    'ritual.micro': 'São só quatro regras.\n*Sempre as mesmas.*',
    ritualSteps: [
      'MALTE *escolhido*.',
      'FOGO *lento*.',
      'COBRE *duas vezes*.',
      'TEMPO. *Sem atalho.*',
    ],

    'oak.title': 'CARVALHO QUEIMADO.\n*Lágrimas na madeira.*',

    'awake.title': 'ATÉ QUE ALGO *desperta*.',

    'rise.title': 'ESTA NOITE\n*merece*.',

    'deep.title': 'ELE AINDA ESTÁ AÍ. *No fundo do copo.*',

    'final.title': 'HALVORN',
    'final.sub': 'Single Malt · 18 Anos',
    'final.text': 'Destilado duas vezes em alambiques de cobre, envelhecido por dezoito anos em barris de carvalho tostado. Lotes limitados, numerados à mão.',
    'final.cta': 'RESERVAR UMA GARRAFA',
    'final.link': 'Encontrar um bar parceiro',
    'final.copy': '© 2026 Halvorn Distillery',
    'final.legal': 'Aprecie com moderação. Venda proibida para menores de 18 anos.',

    /* textos alternativos das imagens */
    'alt.hero': 'Decanter de cristal com whisky âmbar sobre um barril, atravessado por um feixe de luz',
    'alt.cellar': 'Túnel de adega com fileiras de barris de carvalho e raios de luz',
    'alt.glass': 'Copo de cristal lapidado vazio sobre fundo branco',
    'alt.drop': 'Uma gota de whisky âmbar caindo sobre fundo branco',
    'alt.smokeGlass': 'Copo de whisky com esfera de gelo envolto em fumaça',
    'alt.barrelFire': 'Interior de um barril de carvalho em chamas durante a tostagem',
    'alt.master': 'Retrato em preto e branco de um mestre destilador idoso segurando um copo',
    'alt.smoke': 'Fumaça escura com pontos de brilho âmbar',
    'alt.stills': 'Destilaria com alambiques de cobre e luz entrando pelas janelas',
    'alt.highlands': 'Rio de montanha nas Highlands escocesas ao entardecer',
    'alt.oak': 'Madeira de carvalho queimada com whisky escorrendo pelas rachaduras',
    'alt.glassTop': 'Copo de whisky visto de cima, com gelo',
  },

  /* Galeria da cena 5 — posição (left em %), largura (vw), proporção (w/h),
     velocidade de parallax (data-speed) e atraso de entrada (em telas). */
  gallery: [
    { img: 'field',  caption: '01 — Cevada',   alt: 'Campo de cevada sob céu de tempestade',            left: 50, top: 0,  w: 27, ratio: 1.55, speed: 1.0,  delay: 0.0 },
    { img: 'hand',   caption: '02 — Colheita', alt: 'Mão segurando grãos de cevada sobre madeira escura', left: 79, top: 0,  w: 16, ratio: 1.2,  speed: 1.45, delay: 0.25 },
    { img: 'grains', caption: '03 — Maltagem', alt: 'Grãos de cevada maltada sobre fundo branco',        left: 33, top: 0,  w: 14, ratio: 1.15, speed: 0.8,  delay: 0.55 },
    { img: 'cork',   caption: '04 — Rolha',    alt: 'Rolha de cortiça sobre fundo branco',               left: 66, top: 0,  w: 12, ratio: 1.0,  speed: 1.6,  delay: 0.95 },
    { img: 'label',  caption: '05 — Rótulo',   alt: 'Rótulo com hot stamping dourado em macro',          left: 7,  top: 0,  w: 18, ratio: 1.3,  speed: 1.1,  delay: 1.15 },
    { img: 'copper', caption: '06 — Cobre',    alt: 'Detalhe de alambique de cobre com rebites',         left: 45, top: 0,  w: 20, ratio: 1.5,  speed: 0.95, delay: 1.4 },
  ],

  /* Microtextos do HUD (canto inferior direito), por número de cena */
  chapters: {
    2:  ['CAPÍTULO 02 — A ORIGEM', 'Destilado em pequenos lotes desde 1906'],
    3:  ['CAPÍTULO 03 — O TEMPO', 'Dezoito invernos dentro do carvalho'],
    4:  ['CAPÍTULO 04 — O MANIFESTO', 'Paciência também é uma forma de fogo'],
    5:  ['CAPÍTULO 05 — O CAMPO', 'Cevada das Highlands, colhida à mão'],
    6:  ['CAPÍTULO 06 — A GOTA', 'Uma gota guarda dezoito anos'],
    7:  ['CAPÍTULO 07 — O FOGO', 'Barris tostados por dentro, à chama viva'],
    8:  ['CAPÍTULO 08 — O MESTRE', 'Silêncio na destilaria'],
    9:  ['CAPÍTULO 09 — O OLHAR', 'Quarenta anos ao lado dos alambiques'],
    10: ['CAPÍTULO 10 — OS ANJOS', 'O que evapora não volta'],
    11: ['CAPÍTULO 11 — O COBRE', 'Alambiques de pescoço longo'],
    12: ['CAPÍTULO 12 — A ÁGUA', 'Degelo das montanhas de Cairngorm'],
    13: ['CAPÍTULO 13 — O RITUAL', 'Quatro regras, nenhuma exceção'],
    14: ['CAPÍTULO 14 — A MADEIRA', 'Carvalho tostado ao fogo vivo'],
    15: ['CAPÍTULO 15 — O DESPERTAR', 'A primeira faísca'],
    16: ['CAPÍTULO 16 — A NOITE', 'Sirva puro, ou com uma gota de água'],
    17: ['CAPÍTULO 17 — O FUNDO', 'O que fica depois do último gole'],
    18: ['CAPÍTULO 18 — HALVORN', 'Single Malt · 18 Anos'],
  },

  totalChapters: 18,

  /* Links do CTA */
  cta: {
    href: 'mailto:reservas@halvorn.example?subject=Reserva%20Halvorn%2018',
    partnersHref: '#',
  },

  /* Trilha ambiente (gerada por Web Audio — não precisa de arquivo) */
  sound: { volume: 0.5 },
};

/* =============================================================================
   Namespace global. Os outros arquivos (core, webgl, cenas) se registram aqui.
   ============================================================================= */
window.HALVORN = (function () {
  const H = {
    config: CONFIG,
    scenes: [],
    vp: { w: window.innerWidth, h: window.innerHeight },
    reduced: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    touch: window.matchMedia('(hover: none), (pointer: coarse)').matches,
    images: {},  // HTMLImageElement pré-carregados, por chave
  };
  H.isMobile = () => H.vp.w < 768;
  H.isTablet = () => H.vp.w >= 768 && H.vp.w < 1024;

  /** Registra uma cena. Ver js/scenes/*.js para o formato. */
  H.scene = (def) => H.scenes.push(def);

  /** Caminho completo de uma imagem pela chave do CONFIG. */
  H.img = (key) => CONFIG.imageBase + CONFIG.images[key];

  document.addEventListener('DOMContentLoaded', () => boot(H));
  return H;
})();

/* =============================================================================
   BOOT
   ============================================================================= */
function boot(H) {
  const { gsap, ScrollTrigger } = window;
  gsap.registerPlugin(ScrollTrigger);
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);

  applyColors(H);
  bindContent(H);

  H.grain.init();
  H.cursor.init();
  H.sound.init();
  H.hud.init();

  // cenas em ordem numérica
  H.scenes.sort((a, b) => a.n - b.n);
  H.scenes.forEach((s) => s.init && s.init(sceneCtx(H, s)));

  // carrega imagens; depois mostra a pergunta de idade; ao "SIM", começa o filme
  H.preloader.run().then(() => {
    buildFilm(H);
    return H.preloader.gate();
  }).then(() => startFilm(H));
}

/* Aplica as cores do CONFIG como CSS variables */
function applyColors(H) {
  const c = H.config.colors;
  const map = {
    '--carvao': c.carvao, '--fumaca': c.fumaca, '--creme': c.creme, '--ambar': c.ambar,
    '--ambar-quente': c.ambarQuente, '--cobre': c.cobre, '--cinza-texto': c.cinzaTexto,
  };
  Object.entries(map).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
}

/* Preenche [data-t] com textos, [data-img] com caminhos e [data-alt] com alts */
function bindContent(H) {
  const T = H.config.text;
  document.querySelectorAll('[data-t]').forEach((el) => {
    const v = T[el.dataset.t];
    if (v != null) el.innerHTML = H.u.rich(v);
  });
  document.querySelectorAll('[data-img]').forEach((el) => {
    el.src = H.img(el.dataset.img);
    el.decoding = 'async';
  });
  document.querySelectorAll('[data-alt]').forEach((el) => {
    const v = T[el.dataset.alt];
    if (v) el.alt = v;
  });
  const cta = document.getElementById('cta');
  const cta2 = document.getElementById('cta-2');
  if (cta) cta.href = H.config.cta.href;
  if (cta2) cta2.href = H.config.cta.partnersHref;
  document.getElementById('hud-total').textContent = String(H.config.totalChapters).padStart(2, '0');
}

/* Contexto entregue para cada cena */
function sceneCtx(H, s) {
  const el = s.el ? document.querySelector(s.el) : null;
  return {
    el,
    q: (sel) => (el || document).querySelector(sel),
    qa: (sel) => Array.from((el || document).querySelectorAll(sel)),
    vw: () => H.vp.w,
    vh: () => H.vp.h,
  };
}

/* =============================================================================
   A TIMELINE MESTRA ("o filme")
   Cada cena declara:
     n        número da cena (ordem)
     el       seletor da <section> (controle de visibilidade)
     len      duração na timeline (em telas de scroll)
     overlap  quanto ela começa ANTES do fim da cena anterior
     rest     (opcional) ponto de "repouso" usado no modo reduced-motion
     build(tl, at, ctx)   adiciona os tweens a partir da posição `at`
     active(on)           (opcional) chamada quando a cena entra/sai da agulha
   ============================================================================= */
function buildFilm(H) {
  const { gsap, ScrollTrigger } = window;
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  // Num fromTo com stagger, o immediateRender só aplica o estado "from" no
  // PRIMEIRO alvo (os outros começam depois). Aqui aplicamos o "from" em
  // todos os alvos já na construção, para nada aparecer antes da hora.
  const fromTo = tl.fromTo.bind(tl);
  tl.fromTo = (targets, from, to, pos) => {
    if (to && to.stagger != null && to.immediateRender !== false) gsap.set(targets, { ...from });
    return fromTo(targets, from, to, pos);
  };

  // 1) posição de cada cena
  let prev = null;
  H.scenes.forEach((s) => {
    s.at = prev ? prev.at + prev.len - (s.overlap || 0) : 0;
    prev = s;
  });

  // 2) visibilidade: cada <section> só existe no intervalo das cenas que a usam
  const groups = new Map();
  H.scenes.forEach((s) => {
    if (!s.el) return;
    const g = groups.get(s.el) || { from: Infinity, to: -Infinity };
    g.from = Math.min(g.from, s.at);
    g.to = Math.max(g.to, s.at + s.len);
    groups.set(s.el, g);
  });
  const end = Math.max(...H.scenes.map((s) => s.at + s.len));
  groups.forEach((g, sel) => {
    const el = document.querySelector(sel);
    if (g.from > 0) tl.set(el, { visibility: 'visible' }, g.from);
    if (g.to < end) tl.set(el, { visibility: 'hidden' }, g.to);
  });

  // 3) cada cena adiciona a sua coreografia
  H.scenes.forEach((s) => {
    tl.addLabel('s' + s.n, s.at);
    s.build(tl, s.at, sceneCtx(H, s));
  });
  // garante o fim exato do filme
  tl.set({}, {}, end);

  H.film = tl;
  H.filmEnd = end;

  // 4) scroll → timeline
  const scroller = document.getElementById('scroller');
  const unitPx = () => H.vp.h * (H.isMobile() ? H.config.scroll.mobileUnit : H.config.scroll.unit);
  const sizeScroller = () => { scroller.style.height = Math.round(end * unitPx() + H.vp.h) + 'px'; };
  sizeScroller();

  ScrollTrigger.config({ ignoreMobileResize: true });

  if (H.reduced) {
    setupReduced(H, tl, unitPx);
  } else {
    H.st = ScrollTrigger.create({
      trigger: scroller,
      start: 'top top',
      end: () => '+=' + end * unitPx(),
      scrub: H.config.scroll.scrub,
      animation: tl,
      invalidateOnRefresh: true,
    });
  }

  // 5) a cada frame da timeline: HUD + cenas ativas
  let current = null;
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    H.scenes.forEach((s) => {
      if (!s.active) return;
      const on = t >= s.at - 0.05 && t <= s.at + s.len + 0.05;
      if (on !== s._on) { s._on = on; s.active(on); }
    });
    let cur = H.scenes[0];
    for (const s of H.scenes) if (t >= s.at + (s.hudOffset || 0)) cur = s;
    if (cur !== current) { current = cur; H.hud.chapter(cur.n); }
    H.hud.progress(t / end);
  });

  // 6) resize
  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt);
    rt = setTimeout(() => {
      const w = window.innerWidth, h = window.innerHeight;
      // no mobile, ignorar a barra de endereço que aparece/some
      if (H.touch && w === H.vp.w && Math.abs(h - H.vp.h) < 160) return;
      H.vp.w = w; H.vp.h = h;
      sizeScroller();
      H.scenes.forEach((s) => s.resize && s.resize());
      ScrollTrigger.refresh();
    }, 180);
  });
}

/* reduced-motion: sem scrub. Cada cena é um "quadro" com fade simples. */
function setupReduced(H, tl, unitPx) {
  const { gsap, ScrollTrigger } = window;
  const veil = document.getElementById('flash');
  let idx = -1;
  const show = (i) => {
    if (i === idx) return;
    idx = i;
    const s = H.scenes[i];
    gsap.timeline()
      .to(veil, { background: H.config.colors.carvao, opacity: 1, duration: 0.25 })
      .add(() => tl.seek(s.at + (s.rest != null ? s.rest : s.len * 0.6), false))
      .to(veil, { opacity: 0, duration: 0.35 });
  };
  H.st = ScrollTrigger.create({
    trigger: document.getElementById('scroller'),
    start: 'top top',
    end: () => '+=' + H.filmEnd * unitPx(),
    onUpdate: (self) => {
      const t = self.progress * H.filmEnd;
      let i = 0;
      H.scenes.forEach((s, k) => { if (t >= s.at) i = k; });
      show(i);
    },
  });
  show(0);
}

/* =============================================================================
   Início do filme: flash âmbar, sai o preloader, entra o hero, libera o scroll
   ============================================================================= */
function startFilm(H) {
  const { gsap, ScrollTrigger } = window;
  const flash = document.getElementById('flash');
  const pre = document.getElementById('preloader');
  const hero = H.scenes.find((s) => s.n === 2);

  // Smooth scroll (Lenis) amarrado ao ticker do GSAP
  if (!H.reduced && window.Lenis) {
    H.lenis = new window.Lenis({ lerp: 0.085, wheelMultiplier: 0.9, smoothWheel: true });
    H.lenis.stop();
    H.lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => H.lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  }

  gsap.timeline()
    .set(flash, { background: H.config.colors.ambar })
    .to(flash, { opacity: 1, duration: 0.07, ease: 'none' })
    .add(() => {
      pre.remove();
      document.body.classList.remove('is-loading');
      document.body.classList.add('is-ready');
      H.hud.chapter(2);
      ScrollTrigger.refresh();
      if (hero && hero.intro) hero.intro();
    })
    .to(flash, { opacity: 0, duration: 0.12, ease: 'none' })
    .add(() => {
      if (H.lenis) H.lenis.start();
    }, H.reduced ? 0.2 : 1.6);
}
