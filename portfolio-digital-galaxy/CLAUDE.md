# Portfólio Digital Galaxy

Site estático do portfólio comercial da Digital Galaxy. Não tem build: é um `index.html` com as pastas `img/` e `video/`.

## Estrutura
- `index.html`: a página inteira (HTML, CSS e o script da galeria de fotos)
- `img/`: imagens em .webp e capas dos vídeos em .jpg
- `video/`: 4 vídeos .mp4 (axia-historia-clientes, santuario-hospital, tm-pets-inauguracao, reel-gastronomia)

Os arquivos vieram em dois zips. Antes de publicar, confirme que os 4 vídeos estão em `video/`.

## Publicar no Netlify com domínio próprio
1. Instalar a CLI: `npm install -g netlify-cli`
2. Login: `netlify login`. O dono da conta faz o login no navegador.
3. Primeiro deploy: `netlify deploy --prod --dir .`, criando um site novo quando perguntar.
4. Domínio: adicionar o subdomínio (ex.: `portfolio.dominio.com.br`) em Domain management no painel do Netlify, ou com `netlify domains`.
5. DNS: criar um registro CNAME com nome `portfolio` apontando para o endereço `.netlify.app` do site, no painel onde o DNS do domínio é gerenciado.
6. Depois da propagação, ativar o HTTPS em Domain management.

Para atualizar: substituir os arquivos e rodar `netlify deploy --prod --dir .` de novo.

## Regras de conteúdo
- A página é para enviar a clientes: não colocar pendências internas nem nomes de quem da equipe faz cada tarefa.
- Visual: fontes Saira (títulos) e Manrope (texto), roxo como destaque, visual editorial, sem caixas arredondadas repetidas nem selos.
- A página tem `noindex` para não aparecer no Google.
