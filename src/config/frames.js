// Configuração dos filmes quadro a quadro.
// Para trocar um filme: substitua os arquivos na pasta e ajuste `count`.
// Os componentes não precisam mudar.

const BASE = import.meta.env.BASE_URL; // './' no build (caminhos relativos)

export const MOBILE_QUERY = '(max-width: 760px)';

export const FRAMES = {
  // Filme de revelação: toca sozinho ao abrir a página.
  hero: {
    dir: `${BASE}frames/hero/`,
    count: 192,
    ext: 'webp',
    digits: 3,
    focal: { x: 0.6, y: 0.5 },
    // Telas em paisagem mais "quadradas" que 16:9 (tablet deitado, notebook
    // 16:10): com x .6 a lata cairia no meio, sob o título. Aqui ela vai
    // para a direita da coluna de texto.
    focalCompact: { x: 0.45, y: 0.5 },
    compactQuery: '(min-width: 761px) and (min-aspect-ratio: 1/1) and (max-aspect-ratio: 17/10)',
    fps: 30,
    // Começa a tocar com este número de quadros prontos (ou após startTimeoutMs).
    bufferAhead: 72,
    startTimeoutMs: 3500,
    // Travado por mais que isso: pula para o quadro carregado mais perto do fim.
    stallJumpMs: 4000,
    // Quadro em que a UI entra (fim do close do rótulo).
    uiFrame: 34,
  },

  // Filme comercial: controlado pela rolagem.
  // ⚠️ A versão atual tem erros no rótulo ("BOOSST", "150 ml"...).
  // Ao receber o filme corrigido, basta trocar os arquivos (mesma estrutura).
  detail: {
    dir: `${BASE}frames/detail/`,
    count: 240,
    ext: 'webp',
    digits: 3,
    focal: { x: 0.5, y: 0.45 },
    mobileStride: 2,
    ease: 0.2,
    // Distância da tela para começar a baixar (120% da viewport).
    preloadMargin: '120% 0px',
    // Quadro estático com prefers-reduced-motion.
    reducedFrame: 100,
    // Faixas de progresso (0–1) de cada legenda; textos em content/copy.js.
    captionRanges: [
      [0, 0.3],
      [0.36, 0.64],
      [0.7, 1],
    ],
  },
};

export function frameUrl(seq, n) {
  return `${seq.dir}${String(n).padStart(seq.digits, '0')}.${seq.ext}`;
}
