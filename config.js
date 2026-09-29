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
    logo: "assets/logo.svg",          // caminho ou URL do logo (SVG/PNG)
    favicon: "assets/logo.svg",
    website: "https://example.com",   // link do logo / rodapé
    colors: {
      primary: "#5B3DF5",             // botões, destaques
      primaryContrast: "#FFFFFF",     // texto sobre a cor primária
      accent: "#16C8B0",              // detalhes secundários
      background: "#0E0B2B",          // fundo da página
      surface: "#FFFFFF",             // fundo do cartão do formulário
      text: "#1B1838",                // texto principal no cartão
      muted: "#6B6890",               // textos auxiliares
      error: "#D93A4A"
    },
    font: {
      family: "Inter",                // qualquer fonte do Google Fonts
      weights: "400;500;600;700"
    },
    radius: "14px"                    // arredondamento de campos e cartão
  },

  // ---------------------------------------------------------------
  // 3. TEXTOS
  // ---------------------------------------------------------------
  texts: {
    pageTitle: "Fale com a Digital Galaxy",
    headline: "Vamos acelerar o crescimento da sua empresa",
    subheadline:
      "Preencha o formulário e um especialista entrará em contato em até 1 dia útil.",
    submit: "Quero ser contatado",
    submitting: "Enviando…",
    successTitle: "Recebemos seus dados!",
    successMessage:
      "Obrigado pelo interesse. Em breve nossa equipe entrará em contato.",
    errorMessage:
      "Não foi possível enviar agora. Verifique sua conexão e tente novamente.",
    privacyUrl: "https://example.com/privacidade",
    footer: "© Digital Galaxy. Todos os direitos reservados."
  },

  // Opcional: redirecionar para outra página após o envio (ex.: página
  // de obrigado com pixel de conversão). Deixe vazio para mostrar a
  // mensagem de sucesso na própria página.
  redirectUrl: "",

  // ---------------------------------------------------------------
  // 4. CAMPOS DO FORMULÁRIO
  // Tipos suportados: text, email, tel, select, radio, textarea, checkbox
  // "name" vira o nome da coluna na planilha.
  // "width": "half" coloca dois campos lado a lado em telas largas.
  // ---------------------------------------------------------------
  fields: [
    { name: "nome", label: "Nome completo", type: "text", required: true, autocomplete: "name" },
    { name: "email", label: "E-mail corporativo", type: "email", required: true, autocomplete: "email", width: "half" },
    { name: "whatsapp", label: "WhatsApp", type: "tel", required: true, autocomplete: "tel", placeholder: "(11) 91234-5678", width: "half" },
    { name: "empresa", label: "Empresa", type: "text", required: true, autocomplete: "organization", width: "half" },
    { name: "cargo", label: "Cargo", type: "text", autocomplete: "organization-title", width: "half" },
    {
      name: "funcionarios", label: "Nº de funcionários", type: "select", required: true, width: "half",
      options: ["1 a 10", "11 a 50", "51 a 200", "201 a 1000", "Mais de 1000"]
    },
    {
      name: "interesse", label: "Principal interesse", type: "select", required: true, width: "half",
      options: ["Marketing digital", "Desenvolvimento de sites", "Automação", "Consultoria", "Outro"]
    },
    {
      name: "prazo", label: "Quando pretende começar?", type: "radio", required: true,
      options: ["Imediatamente", "Em até 3 meses", "Apenas pesquisando"]
    },
    { name: "mensagem", label: "Conte um pouco sobre seu desafio", type: "textarea", rows: 4 },
    {
      name: "consentimento", type: "checkbox", required: true,
      label: "Concordo em receber contato e com a {privacy}."
    }
  ],

  // Captura automática de origem do lead (salva em colunas próprias)
  trackUtm: true
};
