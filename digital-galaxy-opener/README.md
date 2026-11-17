# Digital Galaxy — Brand Opener "The Center of Everything"

Abertura de marca de **30 s** para a Digital Galaxy, feita em **Remotion + React + TypeScript + SVG**.
Formato **3840 × 2160 (4K UHD), 60 fps, 1.800 frames**, com trilha e sound design sincronizados.

Cada elemento é uma função pura do frame atual (`useCurrentFrame()`), sem animações CSS por tempo.
Por isso qualquer frame renderiza igual em qualquer máquina.

## Como rodar

```bash
npm install
npm run studio        # Remotion Studio: prévia interativa, linha do tempo por cena
npm run validate      # renderiza 1 de cada 6 frames com checagem automática de área segura
npm run stills        # frames de referência (out/stills)
npm run preview       # MP4 1920×1080 para revisar o ritmo
npm run render        # MP4 final 4K/60 → out/digital-galaxy-brand-opener.mp4
npm run audio         # regenera trilha/SFX a partir da timeline (requer python3 + numpy)
```

No Studio, ative `showSafeArea` nas props para ver a área segura tracejada.

## Roteiro → cenas

| Tempo | Frames | Cena | Arquivo |
|---|---|---|---|
| 00–03 s | 0–179 | THE SIGNAL: a estrela pulsa, as órbitas se desenham, "SUA MARCA / NO CENTRO / DO UNIVERSO." | `src/scenes/S01Signal.tsx` |
| 03–07 s | 180–419 | CHAOS: painéis em cortes secos a cada batida (vários no eixo de 45° da logo), órbitas fragmentadas, "POSTAR / ANUNCIAR NÃO É ESTRATÉGIA." | `S02Chaos.tsx` |
| 07–10 s | 420–599 | THE CENTER: tudo congela (HOLD), "FALTA UM CENTRO.", a estrela pulsa e atrai os fragmentos | `S03Center.tsx` |
| 10–13 s | 600–779 | LOGO REVEAL: o anel inclinado se forma ao redor da estrela, os planetas entram em órbita, "DIGITAL GALAXY" + subtítulo | `S04LogoReveal.tsx` |
| 13–16 s | 780–959 | THE PROCESS: câmera 3D percorre a órbita 04; 4 checkpoints acendem | `S05Process.tsx` |
| 16–23 s | 960–1379 | THE FIVE PILLARS: 5 cartões, cada um com composição própria, abertos por wipe na forma da estrela | `S06Pillars.tsx` |
| 23–27 s | 1380–1619 | THE PROMISE: "SER VISTO. / SER LEMBRADO. / SER ESCOLHIDO." no beat | `S07Promise.tsx` |
| 27–30 s | 1620–1799 | FINAL ORBIT: pullback do sistema completo; as órbitas convergem no anel e formam a logo original; end card | `S08FinalOrbit.tsx` |

Todos os tempos ficam em **`src/timeline/timeline.ts`**, a única fonte de verdade. Os mesmos números geram a cue sheet do áudio.

## Logo: fidelidade

- A fonte da marca é o SVG oficial publicado em digitalgalaxy.com.br, em `public/brand/logo-digital-galaxy-mark.svg`.
- Ele foi comparado pixel a pixel com o arquivo enviado (`public/brand/logo-reference-upload.jpg`). As silhuetas coincidem e as coordenadas do viewBox batem com o bounding box do JPEG.
- `src/brand/logoGeometry.ts` contém os **paths originais, sem edição**:
  - anel = círculo r 131,5 menos uma elipse 117,1 × 77,2 a 45°;
  - estrela = 4 curvas cúbicas com contorno arredondado de 16.
- `BrandLogo` desenha sempre esses paths. Ao fim das animações, `LogoReveal` troca para a logo exata.
- O sistema orbital usa a geometria da própria logo. A câmera "brand view" (`lib/projection.ts`) inclina as órbitas até a proporção exata do anel (0,659) e as gira 45°. Por isso, no final, as órbitas colapsam exatamente na elipse interna da logo.

Componentes de marca em `src/components/brand/`: `BrandLogo`, `BrandStar`, `OrbitalRing`, `GalaxyCore`, `OrbitalSystem`, `StarPulse`, `LogoReveal`.

## Tipografia e área segura (checagem automática)

- Os títulos usam Inter (Black/ExtraBold) e os HUDs usam JetBrains Mono. As duas fontes são OFL e ficam em `public/fonts`.
- `KineticText` mede cada linha com as métricas reais do glifo (acentos incluídos), ajusta o tamanho à largura disponível (`fit`) e posiciona letra a letra.
- **Área segura:** 300 px nas laterais e 220 px em cima e embaixo.
  - Todo texto essencial passa por `assertSafe()`.
  - Com `validate: true`, qualquer bloco fora da área faz o render falhar com o nome do texto e as coordenadas.
  - Uma letra em bloco sólido sobre um caractere acentuado também é bloqueada, porque esconderia o acento.
- `npm run validate` cobre a timeline inteira: 301 frames, todos aprovados na entrega.

## Som

`public/audio/score.wav` é uma **trilha original sintetizada** por `scripts/audio/score.py`: osciladores e ruído em numpy, sem samples nem música de terceiros. Ela segue `public/audio/cues.json`, exportado da timeline. Está em 120 BPM (1 batida = 30 frames) e tem pontos dedicados para:

- impactos de texto e pulsos da estrela;
- transições e o freeze de "FALTA UM CENTRO.";
- o drop do logo reveal, os cartões de serviço e o encerramento.

Para usar uma trilha licenciada, substitua o arquivo `score.wav`, ou troque o `<Audio>` em `src/DigitalGalaxyOpener.tsx`, e use `cues.json` como mapa de sincronização.

## Paleta

Apenas `#13073B`, `#C9BCFF`, `#F5F3FA` e `#7C5CFF` (`src/brand/tokens.ts`). A função `alpha()` só aceita essas quatro cores e lança erro para qualquer outra.
Os únicos derivados são a transparência dessas cores e a vinheta, que é um tom mais escuro do próprio #13073B.

## Estrutura

```
src/
  timeline/timeline.ts      tempos de cena, key frames e cue sheet do som
  brand/                    tokens, geometria da logo, fontes
  lib/                      easing, câmera 3D, medição de texto, área segura
  components/brand/         logo, estrela, órbitas, núcleo, pulso, reveal
  components/type/          KineticText, Mono
  components/fx/            fundo, grão, partículas, HUD, painéis, wipe em estrela
  scenes/                   S01…S08
scripts/                    stills/validação, export de cues, síntese de áudio
public/                     logo, fontes, texturas de grão, áudio
```
