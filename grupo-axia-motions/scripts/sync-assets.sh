#!/usr/bin/env bash
# Copia a identidade central (/assets) para dentro de cada motion.
# Cada motion precisa da própria pasta assets/ para renderizar sozinho.
set -euo pipefail
cd "$(dirname "$0")/.."
for d in motion-*/; do
  rm -rf "${d}assets"
  cp -R assets "${d}assets"
done
echo "assets sincronizados em: $(ls -d motion-*/ | tr '\n' ' ')"
