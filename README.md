# Formulário pré-reunião com domínio próprio

Questionário pré-reunião com a identidade visual da sua empresa,
publicado gratuitamente no **GitHub Pages** com **domínio próprio** e respostas
gravadas automaticamente numa **planilha Google Sheets**.

- Um único arquivo de configuração (`config.js`) para logo, cores, fonte, textos e campos
- Responsivo, acessível e com validação (e-mail, telefone com DDD, campos obrigatórios)
- Estilo Typeform: uma pergunta por tela, tela de boas-vindas, barra de progresso e setas ↑↓
- Atalhos de teclado (Enter avança, letras A, B, C… escolhem opções) e avanço automático na escolha única
- Múltipla escolha com limite, opção exclusiva e "Outro" com campo de texto
- Máscara de WhatsApp brasileira
- Captura automática de origem do lead (UTMs, gclid, fbclid, página e referência)
- Anti-spam (honeypot) e proteção contra injeção de fórmulas na planilha
- Aviso opcional por e-mail a cada novo lead

## Estrutura

```
index.html            Página do formulário
config.js             ← EDITE AQUI: marca, textos, campos e URL da planilha
assets/style.css      Estilos (usam as cores definidas em config.js)
assets/app.js         Renderização, validação e envio
assets/logo-mark.png  Símbolo da marca (branco, fundo transparente)
assets/favicon.png    Ícone da aba do navegador
apps-script/Code.gs   Script que grava os leads no Google Sheets
.github/workflows/    Publicação automática no GitHub Pages
```

## 1. Personalizar a identidade visual

Abra `config.js` e ajuste:

| Seção | O que muda |
|---|---|
| `brand.name`, `brand.logo`, `brand.favicon` | Nome e logo (clicar no logo recomeça o formulário) |
| `brand.instagram`, `brand.instagramLabel` | Estrela no canto da tela final que leva ao Instagram |
| `brand.colors` | Cores (hex): degradê do fundo (`background` → `backgroundEnd`), texto, botões e destaque |
| `brand.font`, `brand.headingFont` | Fontes do [Google Fonts](https://fonts.google.com) para textos e títulos |
| `brand.radius` | Arredondamento (`"4px"` = mais reto, `"20px"` = mais arredondado) |
| `texts` | Título, subtítulo, botão, mensagens de sucesso/erro, rodapé, link de privacidade |
| `fields` | Campos do formulário (adicione, remova ou reordene) |
| `redirectUrl` | Opcional: página de obrigado (útil para pixel de conversão) |

Para trocar o logo, coloque seu arquivo em `assets/` (ex.: `assets/minha-logo.png`)
e atualize `brand.logo`. Logos claros funcionam melhor, pois ficam sobre o fundo escuro.

### Perguntas

Cada pergunta tem `name` (vira o nome da coluna na planilha), `label`, `type` e,
opcionalmente, `required`, `placeholder`, `width: "half"` e `options`.

| Tipo | Uso |
|---|---|
| `text`, `email`, `tel`, `textarea`, `select` | Campos de texto e lista suspensa |
| `radio` | Escolha única |
| `checkboxes` | Múltipla escolha (`max: 2` limita a quantidade; `exclusive: ["Nenhum desses"]` desmarca as demais) |
| `group` | Várias perguntas curtas sob um título (ex.: "Seus dados") |
| `checkbox` | Aceite único (ex.: LGPD, com `{privacy}` virando link) |

Extras: `other: true` adiciona a opção "Outro" com campo de texto e `hint` mostra um
texto de ajuda abaixo da pergunta. `markRequired: true` exibe asteriscos nos obrigatórios.

```js
{ name: "cidade", label: "Cidade", type: "text", required: true },
{ name: "segmento", label: "Segmento", type: "radio", options: ["Varejo", "Indústria", "Serviços"], other: true }
```

Respostas de múltipla escolha ficam numa única célula, separadas por `;`
(ex.: `Indicação; Outro: Feiras`). Novas perguntas criam novas colunas na planilha
automaticamente, sem apagar dados antigos.

## 2. Conectar ao Google Sheets

1. Crie uma planilha em <https://sheets.new>.
2. Menu **Extensões → Apps Script**.
3. Apague o conteúdo do editor e cole o conteúdo de `apps-script/Code.gs`.
   - Opcional: preencha `NOTIFY_EMAIL` para receber um e-mail a cada lead.
4. Clique em **Implantar → Nova implantação**.
   - Tipo: **App da Web**
   - Executar como: **Eu**
   - Quem pode acessar: **Qualquer pessoa**
5. Autorize o acesso quando solicitado e copie a **URL do app da Web**
   (termina em `/exec`).
6. Cole a URL em `config.js`, no campo `endpoint`.

> Ao alterar o `Code.gs` depois, use **Implantar → Gerenciar implantações → Editar →
> Nova versão** para manter a mesma URL.

Os leads serão gravados na aba **Leads**, com data/hora, todos os campos e a origem do lead.

## 3. Publicar no GitHub Pages

1. Faça o merge deste código na branch `main`.
2. No GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. A cada push na `main`, o workflow publica o site. O endereço inicial será
   `https://<usuario>.github.io/<repositorio>/`.

## 4. Configurar o domínio próprio

Escolha o endereço, por exemplo `contato.suaempresa.com.br` (subdomínio – recomendado)
ou `suaempresa.com.br` (domínio raiz).

### No provedor do domínio (Registro.br, GoDaddy, Hostinger, Cloudflare…)

**Subdomínio** (ex.: `contato.suaempresa.com.br`) – crie um registro:

| Tipo | Nome | Valor |
|---|---|---|
| CNAME | `contato` | `<usuario>.github.io` |

**Domínio raiz** (ex.: `suaempresa.com.br`) – crie 4 registros `A`:

| Tipo | Nome | Valor |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |

(e, se quiser `www`, um `CNAME` de `www` para `<usuario>.github.io`).

> Se usar Cloudflare, deixe o proxy (nuvem laranja) **desativado** até o certificado
> HTTPS ser emitido pelo GitHub.

### No GitHub

1. **Settings → Pages → Custom domain**: digite o domínio e clique em **Save**.
2. Aguarde a verificação de DNS (de minutos a algumas horas).
3. Marque **Enforce HTTPS**.

Recomendado: verifique o domínio em **Settings (da sua conta/organização) → Pages →
Add a domain** para impedir que outra pessoa o use no GitHub.

## Testar localmente

```bash
python3 -m http.server 8080
# abra http://localhost:8080
```

## Privacidade (LGPD)

O formulário exige consentimento explícito e aponta para `texts.privacyUrl`.
Garanta que sua política de privacidade descreva a coleta desses dados e que a
planilha seja compartilhada apenas com quem precisa acessá-la.
