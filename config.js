/**
 * CONFIGURAÇÃO DO FORMULÁRIO
 * --------------------------------------------------------------
 * Este é o único arquivo que você precisa editar para adaptar o
 * formulário à identidade visual e às necessidades da sua empresa.
 */
window.FORM_CONFIG = {
  // ---------------------------------------------------------------
  // 1. INTEGRAÇÃO COM GOOGLE SHEETS
  // Cole aqui a URL do Web App gerada ao implantar apps-script/Code.gs
  // (ex.: https://script.google.com/macros/s/AKfy.../exec)
  // ---------------------------------------------------------------
  endpoint: "",

  // ---------------------------------------------------------------
  // 2. IDENTIDADE VISUAL
  // ---------------------------------------------------------------
  brand: {
    name: "Digital Galaxy",
    logo: "assets/logo-mark.png",     // símbolo em branco, fundo transparente
    favicon: "assets/favicon.png",    // ícone da aba do navegador
    website: "https://www.instagram.com/digitalgalaxymkt",
    colors: {
      background: "#3B008E",          // roxo da marca (canto superior esquerdo)
      backgroundEnd: "#000000",       // degradê termina em preto
      text: "#FFFFFF",                // perguntas e respostas
      button: "#FFFFFF",              // botões "OK", "Começar", setas
      buttonText: "#3B008E",          // texto dos botões
      accent: "#B794FF",              // números das perguntas e barra de progresso
      error: "#FF5C6C"
    },
    font: { family: "Sora", weights: "400;500;600;700" },       // textos
    headingFont: { family: "Orbitron", weights: "600;700" },    // título e nome da marca
    radius: "8px"
  },

  // ---------------------------------------------------------------
  // 3. TEXTOS
  // ---------------------------------------------------------------
  texts: {
    pageTitle: "Formulário pré-reunião | Digital Galaxy",
    headline: "Formulário pré-reunião",
    subheadline:
      "Olá! Antes da nossa conversa, queremos conhecer um pouco do seu negócio. " +
      "São 10 perguntas rápidas, cerca de 5 minutos. Não existe resposta certa: " +
      "quanto mais sincero, melhor conseguimos ajudar.",
    start: "Começar",
    duration: "Leva cerca de 5 minutos",
    ok: "OK",
    submit: "Enviar respostas",
    submitting: "Enviando…",
    successTitle: "Obrigado!",
    successMessage:
      "Vamos analisar suas respostas e chegar à reunião com ideias para o seu negócio.",
    errorMessage:
      "Não foi possível enviar agora. Verifique sua conexão e tente novamente.",
    privacyUrl: "https://example.com/privacidade"
  },

  // Opcional: redirecionar para outra página após o envio (ex.: página
  // de obrigado com pixel de conversão). Deixe vazio para mostrar a
  // mensagem de sucesso na própria página.
  redirectUrl: "",

  markRequired: false,  // asterisco nos obrigatórios (desligado: todas são obrigatórias)

  // ---------------------------------------------------------------
  // 4. PERGUNTAS
  // Cada item é uma tela (uma pergunta por vez, no estilo Typeform).
  // "name" vira o nome da coluna na planilha.
  //
  // Tipos: text, email, tel, textarea, select, checkbox (aceite único),
  //   radio       → escolha única (avança sozinha ao escolher)
  //   checkboxes  → múltipla escolha ("max": limite de opções,
  //                 "exclusive": opções que desmarcam as demais)
  //   group       → várias perguntas curtas sob um mesmo título
  //
  // Opções extras:
  //   other: true      → adiciona "Outro" com campo de texto
  //   width: "half"    → dois campos lado a lado em telas largas
  //   required: true   → obrigatório
  // ---------------------------------------------------------------
  fields: [
    {
      type: "group", label: "Seus dados",
      fields: [
        { name: "nome", label: "Nome", type: "text", required: true, autocomplete: "name", width: "half" },
        { name: "empresa", label: "Nome da empresa", type: "text", required: true, autocomplete: "organization", width: "half" },
        { name: "whatsapp", label: "WhatsApp", type: "tel", required: true, autocomplete: "tel", placeholder: "(11) 91234-5678", width: "half" },
        { name: "instagram_site", label: "@ do Instagram ou site", type: "text", required: true, placeholder: "@suaempresa ou suaempresa.com.br", width: "half" }
      ]
    },
    {
      name: "o_que_vende", type: "text", required: true, maxlength: 200,
      label: "Em uma frase, o que sua empresa vende e para quem?",
      placeholder: "Ex.: Doces artesanais para festas infantis em Campinas"
    },
    {
      name: "tempo_de_negocio", type: "radio", required: true,
      label: "Há quanto tempo o negócio existe?",
      options: ["Menos de 1 ano", "De 1 a 3 anos", "De 3 a 10 anos", "Mais de 10 anos"]
    },
    {
      name: "objetivo_6_meses", type: "radio", required: true,
      label: "Qual é o seu principal objetivo para os próximos 6 meses?",
      options: [
        "Ser mais conhecido e passar mais credibilidade",
        "Atrair mais clientes novos",
        "Vender mais para quem já é cliente",
        "Lançar um produto, serviço ou unidade nova",
        "Mudar ou atualizar a imagem da marca"
      ]
    },
    {
      name: "como_clientes_chegam", type: "checkboxes", required: true, other: true,
      label: "Como os clientes chegam até você hoje?",
      options: [
        "Indicação",
        "Instagram, Facebook ou TikTok",
        "Google ou Google Maps",
        "Anúncios pagos",
        "Passagem pela loja ou ponto físico"
      ]
    },
    {
      name: "o_que_ja_tem", type: "checkboxes", required: true,
      label: "O que você já tem hoje?",
      options: [
        "Logo e identidade visual definidas",
        "Redes sociais com postagens frequentes",
        "Site ou landing page",
        "Perfil no Google Meu Negócio",
        "Anúncios rodando",
        "Nenhum desses"
      ],
      exclusive: ["Nenhum desses"]
    },
    {
      name: "quem_cuida_marketing", type: "radio", required: true,
      label: "Quem cuida do marketing hoje?",
      options: ["Eu mesmo, quando dá tempo", "Alguém da equipe", "Agência ou freelancer", "Ninguém"]
    },
    {
      name: "maiores_incomodos", type: "checkboxes", required: true, other: true, max: 2,
      label: "O que mais te incomoda no marketing da sua empresa hoje?",
      options: [
        "Não consigo postar com frequência",
        "Minhas redes não passam uma imagem profissional",
        "Tenho seguidores, mas eles não viram clientes",
        "Já anunciei e não tive retorno",
        "Não apareço no Google quando me procuram",
        "Não sei o que funciona nem como medir resultados"
      ]
    },
    {
      name: "investimento_mensal", type: "radio", required: true,
      label: "Quanto você pretende investir por mês em marketing, somando consultoria e anúncios?",
      options: ["Até R$ 1.000", "De R$ 1.000 a R$ 3.000", "De R$ 3.000 a R$ 6.000", "Acima de R$ 6.000", "Ainda não sei"]
    },
    {
      name: "quando_comecar", type: "radio", required: true,
      label: "Quando você gostaria de começar?",
      options: ["Imediatamente", "Nos próximos 30 dias", "Nos próximos 3 meses", "Só estou pesquisando"]
    }
  ],

  // Captura automática de origem do lead (salva em colunas próprias)
  trackUtm: true
};
