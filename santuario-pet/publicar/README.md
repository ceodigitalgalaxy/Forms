# Gerador de Cards · Santuário Pet

Ferramenta para os gerentes criarem cards de oferta, plano e aviso no padrão visual da Santuário Pet.
Endereço: https://gerador.petsantuario.com.br

## Arquivos
- `index.html` — a ferramenta inteira (gerada a partir de `santuario-pet/gerador` no repositório Forms).
- `CNAME` — domínio do site.

## Publicar no GitHub Pages
1. Settings → Pages → Source: **Deploy from a branch**, branch `main`, pasta `/ (root)`.
2. Custom domain: `gerador.petsantuario.com.br` → Save. Depois marque **Enforce HTTPS**.

## DNS (no provedor do domínio petsantuario.com.br)
| Tipo  | Nome     | Valor                       |
|-------|----------|-----------------------------|
| CNAME | gerador  | ceodigitalgalaxy.github.io  |
