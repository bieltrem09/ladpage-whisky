# HALVORN — Single Malt 18 Anos

Landing page em **scrollytelling cinematográfico**: um "filme" de 19 cenas controlado pelo scroll
(GSAP + ScrollTrigger + Lenis), com dois efeitos líquidos em WebGL e uma montagem em vídeo
que avança e volta com o scroll.

## Como rodar

O site é HTML/CSS/JS puro, sem build. As bibliotecas estão em `vendor/` (versões fixas).

```bash
# na raiz do repositório
python3 -m http.server 8000
# abra http://localhost:8000
```

> Também abre direto com duplo clique no `index.html`. O servidor local é recomendado porque alguns
> navegadores bloqueiam texturas WebGL vindas de `file://` (nesse caso entram os fallbacks em CSS).

## Publicar no GitHub Pages

1. Faça push para a branch `main`.
2. No GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch**.
3. Escolha `main` e a pasta `/ (root)` e salve.
4. Em ~1 minuto o site fica em `https://<usuario>.github.io/ladpage-whisky/`.

Todos os caminhos são relativos (`img/…`, `css/…`, `js/…`), então funciona em subpasta.

## Trocar textos, cores e imagens

Tudo fica no objeto **`CONFIG` no topo de `js/main.js`**:

- `colors` — paleta (vira CSS variables).
- `images` — arquivo de cada imagem dentro de `img/hd/` e `img/md/`.
- `film` — quadros da cena 17 (o filme controlado pelo scroll).
- `text` — todos os textos. Marcação: `*itálico âmbar*`, `**destaque**`, `\n` = quebra de linha.
- `gallery` — fotos da cena 5 (posição, largura, proporção, velocidade).
- `chapters` — microtexto do HUD de cada cena.
- `scroll.unit` / `scroll.mobileUnit` — quantas telas de scroll vale cada unidade da timeline
  (aumente para deixar o filme mais lento).
- `cta` — links do botão final.

## Estrutura

```
index.html            todas as cenas (vazias de texto; o conteúdo vem do CONFIG)
css/style.css         estilos globais + cada cena + responsivo
js/main.js            CONFIG + montagem da timeline mestra ("o filme")
js/core/              utilitários, preloader/idade, HUD, cursor, grão, som
js/webgl/             gl.js (helper), liquid-reveal.js (cena 7), liquid-rise.js (cena 16)
js/scenes/sNN-*.js    uma cena por arquivo, cada uma adiciona seus tweens à timeline
vendor/               gsap 3.13, ScrollTrigger, Lenis 1.3
img/                  imagens originais
img/hd/, img/md/      versões otimizadas (WebP 2560px / 1280px), incluindo os recortes "-cut"
img/film/l, img/film/p  quadros do filme (paisagem 1280×720 / retrato 540×960)
video/halvorn-filme.mp4 o mesmo filme em vídeo (1920×1080)
```

### Imagens

- **Qualidade:** cada imagem passou por upscale 4× com IA (Real-ESRGAN x4plus) e foi salva em
  WebP em duas resoluções. O site escolhe `hd` em telas grandes/retina e `md` no celular.
- **Fundo branco removido:** gota, grãos, rolha, rótulo e copo foram recortados (U²-Net + remoção
  do branco por "un-multiply", que preserva sombras e transparência). O copo de cristal virou uma
  versão "iluminada" para fundo escuro, e o rótulo ficou só com o dourado.
- **O filme (cena 17):** montagem quadro a quadro com movimento de câmera, fusões e flashes âmbar.
  No site ela é desenhada num canvas e a posição do scroll escolhe o quadro.

### Como o filme funciona

- Todas as cenas ficam empilhadas num palco fixo (`#stage`). Uma única timeline do GSAP é o filme;
  o ScrollTrigger amarra o scroll à agulha dela (`scrub: 1`). 1 unidade = 1 tela de scroll.
- Cada cena declara `len` (duração) e `overlap` (quanto começa antes da anterior terminar), o que dá
  as sobreposições de trailer sem buracos.
- Os efeitos líquidos usam WebGL puro (um helper mínimo em vez de uma engine 3D inteira) e têm
  fallback em CSS se o WebGL falhar.
- `prefers-reduced-motion`: sem scrub — cada cena vira um quadro com fade simples, WebGL desligado.
- A trilha sonora (botão "SOM") é gerada ao vivo com Web Audio; não há arquivo de áudio.
