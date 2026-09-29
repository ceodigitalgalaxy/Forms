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
  // Estrutura: "fields" pode conter campos soltos ou grupos
  // ({ type: "group", label, fields: [...] }). Cada item de primeiro
  // nível é uma pergunta (numerada quando cfg.numbered = true).
  // ---------------------------------------------------------------
  var OTHER = "Outro";

  function allFields() {
    return cfg.fields.reduce(function (acc, q) {
      return acc.concat(q.type === "group" ? q.fields : [q]);
    }, []);
  }

  function isChoice(f) { return f.type === "radio" || f.type === "checkboxes"; }

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

  function labelFor(f, number) {
    return el("label", { className: "field__label", for: "f-" + f.name }, [
      number ? el("span", { className: "field__num", text: number + "." }) : null,
      document.createTextNode(f.label),
      f.required && cfg.markRequired !== false
        ? el("span", { className: "field__req", text: "*", "aria-hidden": "true" }) : null
    ]);
  }

  function hintFor(f) {
    var text = f.hint;
    if (!text && f.type === "checkboxes") {
      text = f.max ? "Escolha até " + f.max + " opções." : "Marque quantas quiser.";
    }
    return text ? el("p", { className: "field__hint", id: "f-" + f.name + "-hint", text: text }) : null;
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

  function renderChoices(f, id) {
    var type = f.type === "radio" ? "radio" : "checkbox";
    var options = f.options.concat(f.other ? [OTHER] : []);
    var group = el("div", {
      className: "choices" + (f.layout === "list" ? " choices--list" : ""),
      role: type === "radio" ? "radiogroup" : "group",
      "aria-labelledby": id + "-lbl",
      "aria-describedby": id + "-err"
    }, options.map(function (o, i) {
      return el("label", { className: "choice choice--" + type }, [
        el("input", { type: type, name: f.name, value: o, id: i === 0 ? id : undefined }),
        el("span", { text: o })
      ]);
    }));
    var other = f.other ? el("input", {
      className: "input choice-other",
      type: "text",
      name: f.name + "__outro",
      placeholder: f.otherPlaceholder || "Qual?",
      "aria-label": f.label + " – outro",
      maxlength: 200,
      hidden: true
    }) : null;
    return [group, other];
  }

  function renderField(f, number) {
    var id = "f-" + f.name;
    var common = { id: id, name: f.name, "aria-describedby": id + "-err" };
    var wrap = el("div", { className: "field" + (f.width === "half" ? " field--half" : ""), "data-field": f.name });
    var control;

    switch (f.type) {
      case "select":
        control = el("select", Object.assign({ className: "select" }, common),
          [el("option", { value: "", text: "Selecione…" })].concat(
            f.options.map(function (o) { return el("option", { value: o, text: o }); })));
        wrap.append(labelFor(f, number), control);
        break;

      case "radio":
      case "checkboxes":
        var lbl = labelFor(f, number); lbl.id = id + "-lbl"; lbl.removeAttribute("for");
        wrap.append(lbl);
        var hint = hintFor(f);
        if (hint) wrap.append(hint);
        renderChoices(f, id).forEach(function (n) { if (n) wrap.append(n); });
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
        wrap.append(labelFor(f, number), control);
        break;

      default:
        control = el("input", Object.assign({
          className: "input",
          type: f.type || "text",
          placeholder: f.placeholder,
          autocomplete: f.autocomplete,
          maxlength: f.maxlength,
          inputmode: f.type === "tel" ? "tel" : undefined
        }, common));
        if (f.type === "tel") control.addEventListener("input", maskPhone);
        wrap.append(labelFor(f, number), control);
    }

    wrap.appendChild(el("span", { className: "field__error", id: id + "-err" }));
    return wrap;
  }

  function renderGroup(g, number) {
    var legend = el("legend", { className: "field__label group__legend" }, [
      number ? el("span", { className: "field__num", text: number + "." }) : null,
      document.createTextNode(g.label)
    ]);
    var grid = el("div", { className: "form__grid" }, g.fields.map(function (f) { return renderField(f); }));
    return el("fieldset", { className: "field group" }, [legend, grid]);
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
  // Múltipla escolha: opção exclusiva, limite máximo e campo "Outro"
  // ---------------------------------------------------------------
  function boxesOf(f, form) {
    return Array.prototype.slice.call(form.querySelectorAll('input[name="' + f.name + '"]'));
  }

  function syncChoices(f, form, changed) {
    var boxes = boxesOf(f, form);
    var exclusive = f.exclusive || [];

    if (f.type === "checkboxes") {
      if (changed && changed.checked) {
        var changedIsExclusive = exclusive.indexOf(changed.value) !== -1;
        boxes.forEach(function (b) {
          if (b === changed) return;
          if (changedIsExclusive || exclusive.indexOf(b.value) !== -1) b.checked = false;
        });
      }
      if (f.max) {
        var count = boxes.filter(function (b) { return b.checked; }).length;
        boxes.forEach(function (b) { b.disabled = !b.checked && count >= f.max; });
      }
    }

    if (f.other) {
      var otherBox = boxes.filter(function (b) { return b.value === OTHER; })[0];
      var otherInput = form.elements[f.name + "__outro"];
      var show = otherBox.checked;
      otherInput.hidden = !show;
      if (show && changed === otherBox) otherInput.focus();
    }
  }

  // ---------------------------------------------------------------
  // Valores e validação
  // ---------------------------------------------------------------
  function fieldValue(f, form) {
    if (isChoice(f)) {
      return boxesOf(f, form)
        .filter(function (b) { return b.checked; })
        .map(function (b) {
          if (f.other && b.value === OTHER) {
            var t = form.elements[f.name + "__outro"].value.trim();
            return t ? OTHER + ": " + t : OTHER;
          }
          return b.value;
        })
        .join("; ");
    }
    if (f.type === "checkbox") return form.elements[f.name].checked ? "sim" : "";
    return form.elements[f.name].value.trim();
  }

  function validateField(f, form) {
    var wrap = form.querySelector('[data-field="' + f.name + '"]');
    var errEl = wrap.querySelector(".field__error");
    var msg = "";

    if (isChoice(f)) {
      var checked = boxesOf(f, form).filter(function (b) { return b.checked; });
      var otherChecked = checked.some(function (b) { return b.value === OTHER; });
      if (f.required && !checked.length) msg = f.type === "radio" ? "Escolha uma opção." : "Escolha pelo menos uma opção.";
      else if (f.max && checked.length > f.max) msg = "Escolha no máximo " + f.max + " opções.";
      else if (f.other && otherChecked && !form.elements[f.name + "__outro"].value.trim()) msg = "Conte qual é a outra opção.";
    } else if (f.type === "checkbox") {
      if (f.required && !form.elements[f.name].checked) msg = "É necessário aceitar para continuar.";
    } else {
      var v = form.elements[f.name].value.trim();
      if (f.required && !v) msg = "Campo obrigatório.";
      else if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Informe um e-mail válido.";
      else if (v && f.type === "tel" && !/^\d{10,11}$/.test(v.replace(/\D/g, ""))) msg = "Informe um telefone com DDD.";
      form.elements[f.name].setAttribute("aria-invalid", msg ? "true" : "false");
    }

    errEl.textContent = msg;
    wrap.classList.toggle("field--invalid", !!msg);
    return !msg;
  }

  // ---------------------------------------------------------------
  // Progresso (perguntas respondidas)
  // ---------------------------------------------------------------
  function isAnswered(q, form) {
    if (q.type !== "group") return fieldValue(q, form) !== "";
    var needed = q.fields.filter(function (f) { return f.required; });
    return (needed.length ? needed : q.fields).every(function (f) { return fieldValue(f, form) !== ""; });
  }

  function updateProgress(form) {
    if (!cfg.showProgress) return;
    var total = cfg.fields.length;
    var done = cfg.fields.filter(function (q) { return isAnswered(q, form); }).length;
    $("progress-fill").style.width = (100 * done / total) + "%";
    $("progress-text").textContent = done + " de " + total + " respondidas";
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
    var fields = allFields();
    fields.forEach(function (f) {
      var value = fieldValue(f, form);
      if (f.type === "checkbox" && !value) value = "não";
      data.append(f.name, value);
    });
    Object.keys(utm).forEach(function (k) { data.append(k, utm[k]); });
    data.append("pagina", location.href.split("?")[0]);
    data.append("referencia", document.referrer || "");
    data.append("_hp", form.elements._hp.value);
    data.append("_fields", fields.map(function (f) { return f.name; }).join(","));
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
    if (cfg.numbered) container.classList.add("form__grid--survey");
    cfg.fields.forEach(function (q, i) {
      var number = cfg.numbered ? i + 1 : null;
      container.appendChild(q.type === "group" ? renderGroup(q, number) : renderField(q, number));
    });
    $("progress").hidden = !cfg.showProgress;
    updateProgress(form);

    // Validação em tempo real: limpa o erro enquanto a pessoa corrige o campo.
    // Erros de formato só aparecem ao sair de um campo preenchido, para não
    // mover o layout (e "perder" cliques) ao sair de um campo vazio.
    allFields().forEach(function (f) {
      var wrap = form.querySelector('[data-field="' + f.name + '"]');
      ["input", "change"].forEach(function (evt) {
        wrap.addEventListener(evt, function (e) {
          if (isChoice(f) && evt === "change") syncChoices(f, form, e.target);
          var revalidate = wrap.classList.contains("field--invalid") ||
            (evt === "change" && (f.type === "select" || (f.type === "radio" && !f.other)));
          if (revalidate) validateField(f, form);
          updateProgress(form);
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
      allFields().forEach(function (f) {
        if (!validateField(f, form) && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid) {
        var sel = '[data-field="' + firstInvalid.name + '"] ';
        var node = form.querySelector(sel + "input:not([disabled]):not([hidden]), " + sel + "select, " + sel + "textarea");
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
