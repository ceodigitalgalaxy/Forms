# Portfólio Digital Galaxy

Site estático do portfólio comercial da Digital Galaxy. Não tem build: é um `index.html` com as pastas `img/` e `video/`.

## Estrutura
- `index.html`: a página inteira (HTML, CSS e o script da galeria de fotos)
- `img/`: imagens em .webp e capas dos vídeos em .jpg
- `video/`: 4 vídeos .mp4 (axia-historia-clientes, santuario-hospital, tm-pets-inauguracao, reel-gastronomia)

Os arquivos vieram em dois zips. Antes de publicar, confirme que os 4 vídeos estão em `video/`.

## Publicação
Publicado no GitHub Pages pelo repositório `ceodigitalgalaxy/portfolio` (branch `main`), em https://portfolio.digitalgalaxy.com.br.
- O workflow `.github/workflows/pages.yml` publica a cada push na `main` (copia `index.html`, `img/`, `video/` e `.nojekyll`).
- DNS: CNAME `portfolio` → `ceodigitalgalaxy.github.io`. Domínio verificado na conta do GitHub (TXT `_github-pages-challenge-ceodigitalgalaxy.portfolio`).
- Para atualizar: substituir os arquivos e fazer push na `main`.

## Regras de conteúdo
- A página é para enviar a clientes: não colocar pendências internas nem nomes de quem da equipe faz cada tarefa.
- Visual da marca Digital Galaxy: fundo #0A090E com brilho roxo (#3B008E) e estrelas, acento lilás #A77BFF (claro #C4A6FF), texto #F3F0FA, apoio #C9C4D8, cinza #8A8599, linhas #221F2C. Fontes Saira (títulos e números), Saira Semi Expanded (chamada final) e Manrope (texto). Símbolo em `img/logo-mark.png` (branco, fundo transparente). Visual editorial com linhas finas, sem caixas arredondadas repetidas nem selos.
- Página resumida: deixar claro que é só uma seleção de trabalhos. Linguagem para leigos ("anúncios no Instagram e Facebook", "perfil do Google", "exibições"), sem termos como Meta Ads, tráfego pago ou impressões.
- Chamada final leva ao diagnóstico: https://diagnostico.digitalgalaxy.com.br
- A página tem `noindex` para não aparecer no Google.
