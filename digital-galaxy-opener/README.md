# Digital Galaxy — "The Center of Everything" (v2 · universo 3D)

Abertura cinematográfica de **30 s** para a Digital Galaxy, com um universo 3D real, a tipografia do site e um sound design original.

- **Ferramentas:** Remotion, React, TypeScript, Three.js e React Three Fiber.
- **Formato:** **3840 × 2160, 60 fps, 1.800 frames**.
- **Determinismo:** cada pixel e cada som é função do frame atual. Não há animação temporizada por CSS.

A versão anterior, toda em 2D, está preservada na tag git `v1-2d-opener`.

## Como rodar

```bash
npm install
npm run studio        # Remotion Studio (composições: DigitalGalaxyOpener e Universe3D)
npm run audio         # exporta a timeline → sintetiza a trilha → masteriza (-14 LUFS / -1 dBTP)
npm run validate      # 1 de cada 6 frames, com checagem automática da área segura
npm run stills        # frames de referência
npm run preview       # MP4 1920×1080 para revisar ritmo e sincronia
npm run render        # MP4 final 4K/60 → out/digital-galaxy-brand-opener.mp4
```

O WebGL roda em Chrome headless sem GPU via **ANGLE + SwiftShader** (`Config.setChromiumOpenGlRenderer('swangle')` em `remotion.config.ts`). Numa máquina com GPU, `--gl=angle` é mais rápido.

## Arquitetura

```
src/
  timeline/timeline.ts     ÚNICA fonte de verdade: cenas, key frames e AV_EVENTS (visual + som)
  world/                   o universo 3D contínuo
    worldState.ts          posição/estado de tudo por frame (planetas, órbitas, colapso, ondas)
    cameraRig.ts           GalaxyCameraRig: cada plano é uma função do frame
    GalaxyEnvironment.tsx  ThreeCanvas único atrás de todas as cenas
    Universe.tsx           órbitas, 5 planetas PBR, estrela + anel 3D, ondas, túnel, rastros
    GalaxyParticles.tsx    disco espiral (shader: rotação diferencial, colapso, onda)
    logoShapes.ts          estrela e anel extrudados a partir dos paths oficiais
  motion/cosmic.tsx        biblioteca de transições (metades 2D)
  scenes/Overlay*.tsx      camada editorial: tipografia, HUD e logo exata
  components/              BrandLogo, BrandStar, OrbitalRing, StarPulse, LogoReveal, KineticText, Eyebrow…
  brand/                   paleta, geometria oficial da logo, fontes do site
scripts/
  audio/score.py           síntese da trilha e do sound design a partir da timeline
  audio/master.py          loudness em duas passadas + medição + checagem mono
  stills.mjs               frames de referência + validação de área segura
```

### Um universo contínuo

O vídeo tem um único ambiente 3D. A cada frame, `worldState.ts` define onde estão os planetas, como as órbitas estão inclinadas, quanto a galáxia colapsou e o raio da onda de energia.

Por isso nenhum objeto some ou reaparece entre cenas. O caos, o congelamento, a contração, a expansão e o alinhamento final são estados do mesmo sistema.

### A logo como centro gravitacional

- **Plano do universo.** O plano orbital é o próprio anel da logo: um círculo inclinado até a proporção 0,659 (117,1 / 77,2) e girado 45°. As órbitas, o disco da galáxia e o túnel seguem essa arquitetura.
- **Estrela e anel em 3D.** Ambos são extrudados a partir dos paths oficiais. O contorno arredondado de 16 da estrela é reproduzido por offset da curva. De frente, as silhuetas coincidem com o símbolo.
- **Encaixe final.** No fim, as órbitas convergem no raio exato da elipse interna. A câmera encontra o alinhamento correto, e a logo SVG oficial entra sobre o anel 3D com silhueta idêntica. O vídeo termina com o arquivo original intacto.

## Tipografia: a mesma do site

Os estilos foram inspecionados em `digitalgalaxy.com.br/css/style.css` e reproduzidos aqui:

| Uso no site | Regra | No vídeo |
|---|---|---|
| Títulos (`--font-display`) | `"Galaxy"` = **Orbitron 600**, `letter-spacing: -0.01em`, `line-height: 1.1–1.15`, frases em caixa normal (sentence case) | todos os títulos |
| Til (ã, õ) | excluídos do "Galaxy" por `unicode-range` e renderizados em **Sora** ("na Orbitron o til parece um acento grave") | idêntico: `não`, `Execução` |
| Destaque | segunda parte do título em lilás (`.cta__title em`) | "do universo.", "centro.", "em órbita."… |
| Eyebrow | **Sora 600**, maiúsculas, `letter-spacing: 0.12em`, lilás, precedido da estrela | "Estratégia, marca e performance", "Nosso método", "Serviços" |
| Nome da marca (`--font-brand`) | **Orbitron 700**, `letter-spacing: 0.02em` | "Digital Galaxy" |
| Corpo (`--font-body`) | **Sora** | subtítulo e handles |

- **Arquivos de fonte:** são os mesmos do site, os subsets latin da Fontsource para Orbitron e Sora, ambos sob SIL Open Font License. JetBrains Mono (também OFL) aparece só nos códigos de HUD.
- **Paleta:** o site usa tons adicionais (#3B008E, #B794FF). O vídeo segue a paleta exclusiva definida no briefing.

### Movimento tipográfico cósmico

Todos os modos terminam com as letras paradas, nítidas e inteiras no momento de leitura:

- **gravity:** as letras nascem na estrela e são puxadas em espiral até o lugar.
- **orbital:** as letras fazem arcos curtos antes de alinhar.
- **stellar:** uma máscara de pulso estelar revela a linha.
- **depth:** a linha chega da profundidade, só com escala, sem distorção.
- **exit:** COSMIC COMPRESSION, em que a palavra colapsa num ponto.
- **lens:** curvatura gravitacional transitória.

A área segura (300 px laterais, 220 px em cima e embaixo) é verificada automaticamente sobre o layout final de cada linha. Uma violação faz o render de validação falhar.

## Transições (sistema Cosmic Gravity)

| Transição | Onde | Visual | Som |
|---|---|---|---|
| F · Cosmic Compression | 2,5 s | o quadro inteiro se comprime numa linha de energia e reabre no caos | contração sintética e corte seco |
| A · Gravity Pull | 7,9–9,8 s | tudo cai na estrela com atraso por distância; a câmera acelera junto | riser grave, aceleração e 50 ms de vácuo |
| C · Star Impulse | 9,8 s | onda volumétrica no shader da galáxia e choque de estrelas e anéis | impacto monumental e expansão estéreo |
| G · Stellar Alignment | 10,2 s e 28,3 s | as órbitas saem de planos diferentes e se alinham ao plano da logo | pulsos sequenciais e encaixe |
| B · Orbital Wipe | 12,7 s | a câmera mergulha no anel 3D e atravessa o furo | deslocamento estéreo e ressonância metálica |
| E · Orbital Slingshot | entre os pilares | a câmera curva em volta do planeta e acelera para o próximo | whoosh com pitch e pan |
| D · Gravitational Lens | 22,5 s | os títulos se curvam em volta da estrela e surgem anéis de lente | modulação de frequência e tensão |

## Som

`public/audio/score.wav` é **inteiramente original e sintetizado** por `scripts/audio/score.py`, sem samples nem música de terceiros. Cada som é gerado a partir de `AV_EVENTS`, os mesmos eventos que acionam o visual. O pan segue a posição do objeto na tela.

- **Trilha:** 128,57 BPM (exatamente 28 frames por batida), em ré menor, eletrônica cinematográfica com começo, desenvolvimento, clímax e resolução em ré maior.
- **Módulos:** DeepSpaceAmbience, StellarPulseSound (motivo da estrela em variações pequena, média e monumental), GravityImpactSound (sub, transiente, textura e cauda), OrbitalPassSound (doppler estilizado), CosmicTransitionSound e BrandSonicLogo.
- **Master:** −14 LUFS integrados e −1 dBTP de true peak, medidos com ebur128. A checagem mono mostra perda de cerca de 0,1 dB além dos 3 dB esperados da soma mono.
