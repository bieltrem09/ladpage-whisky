// Todos os textos da página num lugar só.
// Itens entre [colchetes] são PLACEHOLDERS: ficam visíveis na página
// até serem trocados pelo conteúdo oficial. Não invente dados do produto.

// Link do canal de venda (loja, WhatsApp ou marketplace).
// Enquanto for null, os botões levam à seção #comprar e o placeholder aparece lá.
export const SALES_LINK = null; // ex.: 'https://loja.rawboost.com.br'

// WhatsApp: número só com dígitos (ex.: '5511999999999'). null esconde o botão.
export const WHATSAPP = null;

// Outros sabores. Com um item só, a seção "Linha" não aparece.
export const FLAVORS = ['Light'];

export const NAV = [
  { href: '#detalhe', label: 'A lata' },
  { href: '#ficha', label: 'Ficha' },
  { href: '#faq', label: 'Perguntas' },
  { href: '#comprar', label: 'Onde comprar' },
];

export const HERO = {
  eyebrow: 'Energy drink · Linha Light',
  titleLine1: 'Energia leve.',
  titleLine2: '100% natural.',
  text: 'Raw Boost Light é o energético de 330 ml com fórmula 100% natural. Abra gelado e siga no seu ritmo.',
  ctaPrimary: 'Quero experimentar',
  ctaSecondary: 'Ver a lata em detalhe',
  specs: [
    { label: 'Volume', value: '330 ml' },
    { label: 'Fórmula', value: '100% natural' },
    { label: 'Linha', value: 'Light' },
  ],
  bigWord: 'BOOST',
  loading: 'Gelando',
  scrollHint: 'Role',
  canvasLabel: 'Filme da lata Raw Boost Light: close do rótulo, a lata recua, gira e para em pé acima das nuvens.',
};

export const DETAIL = {
  heading: 'A lata em detalhe',
  canvasLabel: 'Filme da lata Raw Boost Light girando, close das gotas de condensação no rótulo e a lata parando em pé.',
  captions: [
    { eyebrow: '330 ml · gelada', title: 'Cada gota no lugar.' },
    { eyebrow: '100% natural', title: 'Está escrito na lata.' },
    { eyebrow: 'Linha Light', title: 'Leve para o seu ritmo.' },
  ],
  frameLabel: 'Frame',
};

export const SPECS = {
  eyebrow: 'Ficha da lata',
  title: 'O que vem na lata.',
  imageAlt: 'Close do rótulo da lata Raw Boost Light com gotas de condensação',
  rows: [
    { label: 'Volume', value: '330 ml' },
    { label: 'Linha', value: 'Light' },
    { label: 'Fórmula', value: '100% natural', note: 'conforme rótulo' },
    { label: 'Embalagem', value: 'Lata de alumínio' },
    { label: 'Ingredientes', value: '[PLACEHOLDER: copiar do rótulo oficial]', placeholder: true },
    { label: 'Tabela nutricional', value: '[PLACEHOLDER: inserir tabela oficial]', placeholder: true },
  ],
};

export const MOMENTS = {
  eyebrow: 'Quando abrir',
  title: 'Gelada, na hora certa.',
  note: 'Sugestões de momento. Sem promessa de efeito.',
  items: [
    { moment: 'Antes do treino', text: 'Gelada, leve e pronta para ir com você.' },
    { moment: 'No meio do expediente', text: 'Uma pausa fria no meio do dia.' },
    { moment: 'Na rua com a galera', text: '330 ml que cabem em qualquer plano.' },
  ],
};

export const FAQ = {
  eyebrow: 'Perguntas frequentes',
  title: 'Antes de abrir a sua.',
  items: [
    { q: 'Onde posso comprar?', a: '[PLACEHOLDER: canal de venda — loja, WhatsApp ou marketplace]', placeholder: true },
    { q: 'O que significa "Light"?', a: '[PLACEHOLDER: definição oficial da marca]', placeholder: true },
    { q: 'A fórmula é mesmo 100% natural?', a: 'Sim, é o que informa o rótulo. [PLACEHOLDER: confirmar texto oficial]', placeholder: true },
    { q: 'Tem cafeína? Quanto?', a: '[PLACEHOLDER: valor do rótulo]', placeholder: true },
    { q: 'Qual o tamanho da lata?', a: '330 ml.' },
    { q: 'Fazem entrega para minha cidade?', a: '[PLACEHOLDER: regiões atendidas]', placeholder: true },
  ],
};

export const CLOSING = {
  titleA: 'Raw Boost',
  titleAccent: 'Light.',
  titleB: 'Peça a sua gelada.',
  text: 'Lata de 330 ml, fórmula 100% natural. Abra gelado e siga no seu ritmo.',
  cta: 'Quero experimentar',
  salesPlaceholder: '[PLACEHOLDER: link do canal de venda]',
  whatsappLabel: 'Pedir pelo WhatsApp',
};

export const FOOTER = {
  social: [
    { label: 'Instagram', value: '[PLACEHOLDER: @perfil]' },
    { label: 'WhatsApp', value: '[PLACEHOLDER: número]' },
    { label: 'E-mail', value: '[PLACEHOLDER: e-mail]' },
    { label: 'Região', value: '[PLACEHOLDER: cidade/região]' },
  ],
  legal: 'Não recomendado para crianças, gestantes, nutrizes, idosos e portadores de enfermidades. [CONFIRMAR COM O RÓTULO/REGULATÓRIO]',
  copyright: '© 2026 Raw Boost',
};

export const BUY_LABEL = 'Comprar';
