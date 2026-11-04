#!/usr/bin/env bash
# Exporta os motions do Grupo Axia.
#
#   ./scripts/render.sh                         # os 6 motions, todos os formatos
#   ./scripts/render.sh motion-04-custos        # só um motion
#   FORMATS="mp4 webm" ./scripts/render.sh      # só alguns formatos
#
# Formatos:
#   mp4   H.264, fundo sólido verde Axia (insert de tela cheia). NÃO tem transparência.
#   webm  VP9 com canal alpha real (overlay).
#   mov   ProRes 4444 com canal alpha real (overlay; ideal para Premiere, Final Cut, DaVinci).
#   png   dois quadros no momento de leitura: -fundo.png (sólido) e -alpha.png (transparente).
set -euo pipefail
cd "$(dirname "$0")/.."
ROOT="$PWD"
OUT="$ROOT/exports"
FORMATS="${FORMATS:-mp4 webm mov png}"
HF="npx --yes hyperframes@0.9.9"
mkdir -p "$OUT"

./scripts/sync-assets.sh >/dev/null

if [ "$#" -gt 0 ]; then TARGETS=("$@"); else TARGETS=(motion-*/); fi

for t in "${TARGETS[@]}"; do
  name="$(basename "$t")"
  dir="$ROOT/$name"
  [ -f "$dir/index.html" ] || { echo "não encontrado: $name"; exit 1; }
  still="$(node -e "console.log(require('$dir/meta.json').still)")"
  echo "▸ $name"
  cd "$dir"
  for f in $FORMATS; do
    case "$f" in
      mp4)
        $HF render --quiet --quality delivery --variables '{"fundo":true}' -o "$OUT/$name.mp4" ;;
      webm)
        $HF render --quiet --quality delivery --format webm --variables '{"fundo":false}' -o "$OUT/$name-alpha.webm" ;;
      mov)
        $HF render --quiet --format mov --prores-profile 4444 --variables '{"fundo":false}' -o "$OUT/$name-alpha.mov" ;;
      png)
        frame=$(node -e "console.log(Math.round($still*30))")
        for mode in fundo alpha; do
          tmp="$(mktemp -d)"
          if [ "$mode" = fundo ]; then vars='{"fundo":true}'; else vars='{"fundo":false}'; fi
          $HF render --quiet --format png-sequence --variables "$vars" -o "$tmp/seq"
          src="$(ls "$tmp/seq"/*.png | sort | sed -n "$((frame + 1))p")"
          cp "$src" "$OUT/$name-$mode.png"
          rm -r "$tmp"
        done ;;
      *) echo "formato desconhecido: $f"; exit 1 ;;
    esac
  done
  cd "$ROOT"
done
echo "✓ exportado em $OUT"
ls -lh "$OUT"
