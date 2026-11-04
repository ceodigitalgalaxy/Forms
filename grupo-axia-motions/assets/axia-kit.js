/* Grupo Axia · utilitário comum dos motions.
   Lê as variáveis (HyperFrames ou ?fundo=1&overlayY=1320 na URL da prévia)
   e aplica o modo: "tela cheia" (fundo sólido) ou "overlay" (fundo transparente). */
(function () {
  window.__timelines = window.__timelines || {};
  function readVars(defaults) {
    var v = {};
    try {
      if (window.__hyperframes && typeof window.__hyperframes.getVariables === "function") {
        v = window.__hyperframes.getVariables() || {};
      }
    } catch (e) {}
    var q = new URLSearchParams(location.search);
    Object.keys(defaults).forEach(function (k) {
      if (!q.has(k)) return;
      var s = q.get(k);
      if (typeof defaults[k] === "boolean") v[k] = s === "1" || s === "true";
      else if (typeof defaults[k] === "number") v[k] = Number(s);
      else v[k] = s;
    });
    var out = {};
    Object.keys(defaults).forEach(function (k) { out[k] = v[k] === undefined || v[k] === null ? defaults[k] : v[k]; });
    return out;
  }
  window.AxiaKit = {
    setup: function (defaults) {
      var vars = readVars(defaults);
      var root = document.getElementById("root");
      root.classList.toggle("mode-full", !!vars.fundo);
      root.classList.toggle("mode-overlay", !vars.fundo);
      if (vars.overlayY) root.style.setProperty("--overlay-y", vars.overlayY + "px");
      return vars;
    },
    /* animação padrão das linhas finas do fundo (tela cheia) */
    bgIn: function (tl, at) {
      var rules = document.querySelectorAll("#bg .bg-rule");
      var logo = document.querySelectorAll("#bg .bg-logo");
      if (rules.length) tl.fromTo(rules, { scaleX: 0 }, { scaleX: 1, duration: 0.5, ease: "expo.out", stagger: 0.06 }, at || 0);
      if (logo.length) tl.fromTo(logo, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: "power2.out" }, at || 0);
    }
  };
})();
