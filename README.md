# Raw Boost Light — landing page

React + Vite + Tailwind CSS. Frontend puro (sem backend). Os dois "filmes"
da lata são sequências de quadros WebP desenhadas em `<canvas>`, sem
bibliotecas de animação.

## Rodar

```bash
npm install
npm run dev      # desenvolvimento
npm run build    # gera dist/ (caminhos relativos: funciona na raiz ou em subpasta)
npm run preview  # serve o build
```

## Onde ficam os quadros

```
public/
  frames/
    hero/001.webp … 192.webp     filme de revelação (toca sozinho)
    detail/001.webp … 240.webp   filme comercial (controlado pela rolagem)
  hero-poster.webp               último quadro do hero (noscript)
  og-image.jpg                   1200×630 (Open Graph)
```

Tudo em `public/` é copiado para `dist/` no build. Os quadros são WebP
1600×900, qualidade 74, nomes com 3 dígitos.

**Trocar um filme** (ex.: o `detail` corrigido): substitua os arquivos na
pasta mantendo os nomes e ajuste `count` em `src/config/frames.js`. Nenhum
componente precisa mudar. Para gerar a partir de um vídeo:

```bash
ffmpeg -i video.mp4 -vf "scale=1600:900:flags=lanczos" -c:v libwebp \
  -quality 74 -compression_level 6 -start_number 1 public/frames/detail/%03d.webp
```

## Estrutura

```
src/
  config/frames.js          caminhos, quantidades, focais, faixas das legendas
  content/copy.js           todos os textos e placeholders
  hooks/useFrameSequence.js carregamento (6 em paralelo, grosso→fino ou sequencial),
                            janela de quadros pré-decodificados (ImageBitmap)
  hooks/useScrollProgress.js
  hooks/useReducedMotion.js (+ useMediaQuery)
  hooks/useReveal.js        reveal de seção, uma vez
  components/FrameCanvas.jsx  pintor "cover" com ponto focal
  components/Header.jsx       header em vidro + menu mobile
  components/Logo.jsx         logo PROVISÓRIO
  sections/HeroReveal.jsx  ScrollFilm.jsx  CanSpecs.jsx  Moments.jsx
           Flavors.jsx (só aparece com 2+ sabores)  Faq.jsx  ClosingCta.jsx  Footer.jsx
```

## Placeholders pendentes

Ficam visíveis na página (caixa tracejada) até serem trocados.

| Item | Onde trocar |
|---|---|
| Link do canal de venda | `SALES_LINK` em `src/content/copy.js` |
| WhatsApp (número) | `WHATSAPP` em `src/content/copy.js` |
| Ingredientes (do rótulo) | `SPECS.rows` em `copy.js` |
| Tabela nutricional oficial | `SPECS.rows` em `copy.js` |
| Definição oficial de "Light" | `FAQ.items` em `copy.js` |
| Texto oficial "100% natural" | `FAQ.items` em `copy.js` |
| Cafeína (valor do rótulo) | `FAQ.items` em `copy.js` |
| Regiões de entrega | `FAQ.items` em `copy.js` |
| Instagram, e-mail, cidade/região | `FOOTER.social` em `copy.js` |
| Aviso legal (confirmar com regulatório) | `FOOTER.legal` em `copy.js` |
| Outros sabores | `FLAVORS` em `copy.js` (seção aparece com 2+) |
| Logo oficial em SVG | `src/components/Logo.jsx` e `public/favicon.svg` |
| Domínio (canonical, og:image absoluto, sitemap, robots) | `index.html`, `public/sitemap.xml`, `public/robots.txt` |
| Filme `detail` corrigido (rótulo com erros) | `public/frames/detail/` |
| Público-alvo | não aparece no site; só orienta o texto |
