(function () {
  "use strict";

  var cfg = window.FORM_CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];

  // ---------------------------------------------------------------
  // Tema / identidade visual
  // ---------------------------------------------------------------
  function applyBrand() {
    var b = cfg.brand, c = b.colors, root = document.documentElement.style;
    root.setProperty("--primary", c.primary);
    root.setProperty("--primary-contrast", c.primaryContrast);
    root.setProperty("--accent", c.accent);
    root.setProperty("--bg", c.background);
    root.setProperty("--surface", c.surface);
    root.setProperty("--text", c.text);
    root.setProperty("--muted", c.muted);
    root.setProperty("--error", c.error);
    root.setProperty("--radius", b.radius);

    if (b.font && b.font.family) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://fonts.googleapis.com/css2?family=" +
        encodeURIComponent(b.font.family).replace(/%20/g, "+") +
        ":wght@" + b.font.weights + "&display=swap";
      document.head.appendChild(link);
      root.setProperty("--font", '"' + b.font.family + '", system-ui, sans-serif');
    }

    var t = cfg.texts;
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]').content = t.subheadline;
    $("favicon").href = b.favicon;
    $("brand-link").href = b.website;
    $("brand-logo").src = b.logo;
    $("brand-logo").alt = b.name;
    $("brand-name").textContent = b.name;
    $("headline").textContent = t.headline;
    $("subheadline").textContent = t.subheadline;
    $("submit").textContent = t.submit;
    $("success-title").textContent = t.successTitle;
    $("success-message").textContent = t.successMessage;
    $("footer").textContent = t.footer;
  }

  // ---------------------------------------------------------------
  // Renderização dos campos
  // ---------------------------------------------------------------
  function el(tag, attrs, children) {
    var node = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      if (attrs[k] === undefined || attrs[k] === false) return;
      if (k === "className") node.className = attrs[k];
      else if (k === "text") node.textContent = attrs[k];
      else node.setAttribute(k, attrs[k] === true ? "" : attrs[k]);
    });
    (children || []).forEach(function (ch) { if (ch) node.appendChild(ch); });
    return node;
  }

  function labelFor(f) {
    return el("label", { className: "field__label", for: "f-" + f.name }, [
      document.createTextNode(f.label),
      f.required ? el("span", { className: "field__req", text: "*", "aria-hidden": "true" }) : null
    ]);
  }

  // Substitui {privacy} por um link para a política de privacidade
  function richLabel(text) {
    var frag = document.createDocumentFragment();
    text.split("{privacy}").forEach(function (part, i) {
      if (i > 0) {
        frag.appendChild(el("a", {
          href: cfg.texts.privacyUrl, target: "_blank", rel: "noopener", text: "política de privacidade"
        }));
      }
      frag.appendChild(document.createTextNode(part));
    });
    return frag;
  }

  function renderField(f) {
    var id = "f-" + f.name;
    var common = { id: id, name: f.name, required: !!f.required, "aria-describedby": id + "-err" };
    var wrap = el("div", { className: "field" + (f.width === "half" ? " field--half" : ""), "data-field": f.name });
    var control;

    switch (f.type) {
      case "select":
        control = el("select", Object.assign({ className: "select" }, common),
          [el("option", { value: "", text: "Selecione…" })].concat(
            f.options.map(function (o) { return el("option", { value: o, text: o }); })));
        wrap.append(labelFor(f), control);
        break;

      case "radio":
        var group = el("div", { className: "choices", role: "radiogroup", "aria-labelledby": id + "-lbl" },
          f.options.map(function (o, i) {
            return el("label", { className: "choice" }, [
              el("input", { type: "radio", name: f.name, value: o, id: i === 0 ? id : undefined, required: !!f.required }),
              el("span", { text: o })
            ]);
          }));
        var lbl = labelFor(f); lbl.id = id + "-lbl"; lbl.removeAttribute("for");
        wrap.append(lbl, group);
        break;

      case "checkbox":
        wrap.classList.add("check");
        var cb = el("input", Object.assign({ type: "checkbox", value: "sim" }, common));
        var text = el("label", { for: id });
        text.appendChild(richLabel(f.label));
        wrap.append(cb, text);
        break;

      case "textarea":
        control = el("textarea", Object.assign({ className: "textarea", rows: f.rows || 4, placeholder: f.placeholder }, common));
        wrap.append(labelFor(f), control);
        break;

      default:
        control = el("input", Object.assign({
          className: "input",
          type: f.type || "text",
          placeholder: f.placeholder,
          autocomplete: f.autocomplete,
          inputmode: f.type === "tel" ? "tel" : undefined
        }, common));
        if (f.type === "tel") control.addEventListener("input", maskPhone);
        wrap.append(labelFor(f), control);
    }

    wrap.appendChild(el("span", { className: "field__error", id: id + "-err" }));
    return wrap;
  }

  // Máscara de telefone brasileiro: (11) 91234-5678
  function maskPhone(e) {
    var d = e.target.value.replace(/\D/g, "").slice(0, 11);
    var out = d;
    if (d.length > 0) out = "(" + d.slice(0, 2);
    if (d.length >= 3) out += ") " + d.slice(2, d.length === 11 ? 7 : 6);
    if (d.length >= 7) out += "-" + d.slice(d.length === 11 ? 7 : 6);
    e.target.value = out;
  }

  // ---------------------------------------------------------------
  // Validação
  // ---------------------------------------------------------------
  function validateField(f, form) {
    var wrap = form.querySelector('[data-field="' + f.name + '"]');
    var errEl = wrap.querySelector(".field__error");
    var msg = "";

    if (f.type === "radio") {
      if (f.required && !form.querySelector('input[name="' + f.name + '"]:checked')) msg = "Escolha uma opção.";
    } else if (f.type === "checkbox") {
      if (f.required && !form.elements[f.name].checked) msg = "É necessário aceitar para continuar.";
    } else {
      var v = form.elements[f.name].value.trim();
      if (f.required && !v) msg = "Campo obrigatório.";
      else if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Informe um e-mail válido.";
      else if (v && f.type === "tel" && !/^\d{10,11}$/.test(v.replace(/\D/g, ""))) msg = "Informe um telefone com DDD.";
    }

    errEl.textContent = msg;
    wrap.classList.toggle("field--invalid", !!msg);
    var input = form.elements[f.name];
    if (input && input.setAttribute) input.setAttribute("aria-invalid", msg ? "true" : "false");
    return !msg;
  }

  // ---------------------------------------------------------------
  // Envio
  // ---------------------------------------------------------------
  function captureUtm() {
    if (!cfg.trackUtm) return {};
    var key = "lead_utm", stored = {};
    try { stored = JSON.parse(sessionStorage.getItem(key) || "{}"); } catch (_) {}
    var params = new URLSearchParams(location.search);
    UTM_KEYS.forEach(function (k) { if (params.get(k)) stored[k] = params.get(k); });
    try { sessionStorage.setItem(key, JSON.stringify(stored)); } catch (_) {}
    return stored;
  }

  function buildPayload(form, utm) {
    var data = new URLSearchParams();
    cfg.fields.forEach(function (f) {
      var value;
      if (f.type === "radio") {
        var sel = form.querySelector('input[name="' + f.name + '"]:checked');
        value = sel ? sel.value : "";
      } else if (f.type === "checkbox") {
        value = form.elements[f.name].checked ? "sim" : "não";
      } else {
        value = form.elements[f.name].value.trim();
      }
      data.append(f.name, value);
    });
    Object.keys(utm).forEach(function (k) { data.append(k, utm[k]); });
    data.append("pagina", location.href.split("?")[0]);
    data.append("referencia", document.referrer || "");
    data.append("_hp", form.elements._hp.value);
    data.append("_fields", cfg.fields.map(function (f) { return f.name; }).join(","));
    return data;
  }

  function showSuccess() {
    if (cfg.redirectUrl) { location.href = cfg.redirectUrl; return; }
    $("form-view").hidden = true;
    $("success-view").hidden = false;
    $("success-view").scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function init() {
    applyBrand();
    var utm = captureUtm();
    var form = $("lead-form");
    var container = $("fields");
    cfg.fields.forEach(function (f) { container.appendChild(renderField(f)); });

    // Validação em tempo real: limpa o erro enquanto a pessoa corrige o campo.
    // Erros de formato só aparecem ao sair de um campo preenchido, para não
    // mover o layout (e "perder" cliques) ao sair de um campo vazio.
    cfg.fields.forEach(function (f) {
      var wrap = form.querySelector('[data-field="' + f.name + '"]');
      ["input", "change"].forEach(function (evt) {
        wrap.addEventListener(evt, function () {
          if (evt === "change" || wrap.classList.contains("field--invalid")) validateField(f, form);
        });
      });
      wrap.addEventListener("focusout", function (e) {
        if (e.target.value && e.target.type !== "radio" && e.target.type !== "checkbox") validateField(f, form);
      });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var errBox = $("form-error");
      errBox.hidden = true;

      var firstInvalid = null;
      cfg.fields.forEach(function (f) {
        if (!validateField(f, form) && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) {
        var node = form.querySelector('[data-field="' + firstInvalid.name + '"] input, [data-field="' + firstInvalid.name + '"] select, [data-field="' + firstInvalid.name + '"] textarea');
        if (node) node.focus();
        return;
      }

      if (!cfg.endpoint) {
        errBox.textContent = "Configuração pendente: defina a URL do Google Apps Script em config.js (endpoint).";
        errBox.hidden = false;
        return;
      }

      var btn = $("submit");
      btn.disabled = true;
      btn.textContent = cfg.texts.submitting;

      // application/x-www-form-urlencoded é uma "simple request": sem preflight CORS
      fetch(cfg.endpoint, { method: "POST", body: buildPayload(form, utm) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || res.ok !== true) throw new Error((res && res.error) || "erro");
          showSuccess();
        })
        .catch(function () {
          errBox.textContent = cfg.texts.errorMessage;
          errBox.hidden = false;
          btn.disabled = false;
          btn.textContent = cfg.texts.submit;
        });
    });
  }

  init();
})();
