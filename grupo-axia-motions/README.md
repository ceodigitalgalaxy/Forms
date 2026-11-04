# Grupo Axia · Motions "Fim da escala 6×1"

Seis motions verticais (1080 × 1920, 30 fps, sem áudio) para o vídeo de aproximadamente 1:44 sobre o fim da escala 6×1. Cada motion é um projeto [HyperFrames](https://github.com/heygen-com/hyperframes) independente: HTML, CSS, SVG e GSAP numa timeline pausada, renderizada quadro a quadro. Por isso, todo render sai idêntico.

## Onde inserir cada motion

| # | Motion | Inserir em | Duração | Uso recomendado | Arquivo para a edição |
|---|---|---|---|---|---|
| 01 | Abertura · "Fim da escala 6×1?" | 00:00–00:03 | 2,5 s | Insert de tela cheia | `motion-01-abertura.mp4` |
| 02 | Redução da jornada · 44h → 40h | 00:12–00:18 | 2,0 s | Overlay sobre o apresentador | `motion-02-jornada-alpha.mov` ou `.webm` |
| 03 | Dois dias de descanso | 00:19–00:25 | 2,5 s | Overlay sobre o apresentador | `motion-03-descanso-alpha.mov` ou `.webm` |
| 04 | Impacto nos custos · até 7% | 00:39–00:49 | 2,3 s | Overlay sobre o apresentador | `motion-04-custos-alpha.mov` ou `.webm` |
| 05 | Impacto por setor | 00:52–01:12 | 3,0 s | Overlay sobre o apresentador | `motion-05-setores-alpha.mov` ou `.webm` |
| 06 | Planejamento empresarial | 01:22–01:41 | 3,0 s | Tela cheia ou overlay | `motion-06-planejamento.mp4` ou `-alpha.mov` |

Dentro de cada janela sugerida, alinhe o início do motion à fala correspondente: por exemplo, o 04 no momento em que o apresentador cita o percentual.

## Arquivos exportados (`/exports`)

Cada motion tem cinco arquivos:

| Arquivo | Formato | Fundo | Para quê |
|---|---|---|---|
| `<motion>.mp4` | H.264 | **Sólido** (verde Axia #033223), **sem transparência** | Insert de tela cheia |
| `<motion>-alpha.mov` | ProRes 4444 | **Transparente (alpha real)** | Overlay no Premiere, Final Cut, DaVinci, After Effects |
| `<motion>-alpha.webm` | VP9 com alpha | **Transparente (alpha real)** | Overlay em editores web e CapCut desktop |
| `<motion>-fundo.png` | PNG | Sólido | Quadro estático (thumbnail, aprovação) |
| `<motion>-alpha.png` | PNG RGBA | Transparente | Quadro estático para sobrepor |

O MP4 nunca tem transparência: use o `.mov` ou o `.webm` para overlays.

No modo overlay, o conteúdo fica num painel verde-escuro com borda fina, o mesmo componente de card do site. Assim o texto continua legível sobre qualquer imagem do apresentador. O painel fica centralizado entre y = 1240 e 1320 px. Nessa faixa ele não cobre o rosto (que costuma ficar no terço superior do quadro) e não entra na área da interface do Reels/TikTok (últimos ~320 px). Se a legenda original do vídeo estiver nessa altura, mude a posição (veja "Ajustes" abaixo).

## Como rodar

Requisitos: Node.js 22 ou superior, FFmpeg e Google Chrome ou Chromium. Confira com:

```bash
npx --yes hyperframes@0.9.9 doctor
```

### Prévia interativa

```bash
npm run preview
```

Depois abra http://localhost:5173/preview/. A prévia permite:

- escolher um dos seis motions;
- reproduzir, pausar (barra de espaço), reiniciar e arrastar a linha do tempo (com tempo e número do quadro);
- alternar entre tela cheia e overlay transparente (no overlay, o quadriculado é só da interface e não entra no vídeo);
- ajustar a altura do overlay;
- ver os seis lado a lado;
- baixar os arquivos já exportados.

A interface de controle é separada: os arquivos exportados são só as composições dentro de cada `motion-*/index.html`.

### Exportar

```bash
npm run render
```

Esse comando gera todos os formatos dos seis motions em `exports/`. Para gerar menos:

```bash
./scripts/render.sh motion-04-custos
```

```bash
FORMATS="mp4 png" ./scripts/render.sh
```

```bash
npm run render:alpha
```

### Editar no HyperFrames Studio

Cada pasta `motion-*` abre sozinha no editor visual:

```bash
cd motion-02-jornada && npx --yes hyperframes@0.9.9 preview
```

## Identidade visual

A identidade foi verificada em https://grupoaxia.co/ em 04/11/2026, direto no CSS e no HTML publicados:

| Token | HEX | Uso no site | Uso nos motions |
|---|---|---|---|
| `--brand-900` | `#033223` | Verde principal, fundo inverso | Fundo e painéis |
| `--brand-700` | `#0B6347` | Botão primário | Dias trabalhados (motion 03) |
| `--brand-200` | `#A0E493` | Acento (títulos de seção) | Números, destaques, ícones, checks |
| `--ink-soft` | `#C7D1CB` | Texto suave | Notas e textos de apoio |
| branco | `#FFFFFF` | Títulos sobre verde | Títulos |

- **Fonte:** Alexandria, o mesmo arquivo `.woff2` servido pelo site, em peso 600 com tracking negativo nos títulos, como no site.
- **Logotipo:** o SVG oficial, copiado do próprio HTML do site (símbolo `#logo`). Não foi redesenhado.
- **Linguagem gráfica:** cards com borda fina e cantos arredondados, linhas finas divisórias e a curva de animação `cubic-bezier(0.22, 1, 0.36, 1)`, todos tirados do CSS do site.

Toda a identidade fica em `assets/brand.css`. Se mudar algo, rode `npm run sync`: o script copia `assets/` para dentro de cada motion, porque cada um precisa renderizar sozinho.

## Ajustes

Cada motion declara duas variáveis, que podem ser usadas no render, no Studio ou na prévia:

| Variável | Tipo | Efeito |
|---|---|---|
| `fundo` | booleano | `true` = tela cheia com fundo sólido; `false` = overlay transparente |
| `overlayY` | número (px) | Centro vertical do painel no modo overlay (500–1500) |

Exemplo: o overlay 03 mais alto, no centro da tela:

```bash
cd motion-03-descanso && npx --yes hyperframes@0.9.9 render --format mov --variables '{"fundo":false,"overlayY":960}' -o ../exports/motion-03-descanso-centro.mov
```

Os textos ficam no HTML de cada motion (`motion-*/index.html`), em elementos com `id` próprio.

## Cuidados de conteúdo

- **02:** o texto diz "Redução da jornada em debate", para não afirmar que a mudança já está em vigor.
- **03:** a nota "Exemplo ilustrativo. As folgas variam por setor." deixa claro que sábado e domingo são só um exemplo.
- **04:** a nota "Estimativa citada no vídeo" e o "até" deixam claro que o número não é garantido nem vale para todos. A barra só acompanha o número e não representa uma escala de dados.
- **05:** os setores não têm números, para não inventar dados.

## Estrutura

```
grupo-axia-motions/
  assets/                 identidade central (brand.css, fonte, logo, GSAP, axia-kit.js)
  motion-01-abertura/     index.html + assets/ (cópia) + meta.json
  motion-02-jornada/
  motion-03-descanso/
  motion-04-custos/
  motion-05-setores/
  motion-06-planejamento/
  preview/index.html      interface de prévia
  exports/                MP4, MOV, WebM e PNG renderizados
  scripts/                render.sh, sync-assets.sh, serve.mjs
```
