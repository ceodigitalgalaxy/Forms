(function () {
  "use strict";

  var cfg = window.FORM_CONFIG;
  var $ = function (id) { return document.getElementById(id); };
  var UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content", "gclid", "fbclid"];
  var OTHER = "Outro";
  var LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  var canHover = window.matchMedia("(hover: hover)").matches;

  // ---------------------------------------------------------------
  // Tema / identidade visual
  // ---------------------------------------------------------------
  function loadFont(font) {
    if (!font || !font.family) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" +
      encodeURIComponent(font.family).replace(/%20/g, "+") +
      ":wght@" + (font.weights || "400;700") + "&display=swap";
    document.head.appendChild(link);
  }

  function applyBrand() {
    var b = cfg.brand, c = b.colors, root = document.documentElement.style;
    root.setProperty("--bg", c.background);
    root.setProperty("--bg-end", c.backgroundEnd);
    root.setProperty("--text", c.text);
    root.setProperty("--button", c.button);
    root.setProperty("--button-text", c.buttonText);
    root.setProperty("--accent", c.accent);
    root.setProperty("--error", c.error);
    root.setProperty("--radius", b.radius);

    loadFont(b.font);
    loadFont(b.headingFont);
    if (b.font) root.setProperty("--font", '"' + b.font.family + '", system-ui, sans-serif');
    if (b.headingFont) root.setProperty("--font-heading", '"' + b.headingFont.family + '", var(--font)');

    var t = cfg.texts;
    document.title = t.pageTitle;
    document.querySelector('meta[name="description"]').content = t.subheadline;
    document.querySelector('meta[name="theme-color"]').content = c.backgroundEnd;
    $("favicon").href = b.favicon;
    $("apple-icon").href = b.favicon;
    $("brand-link").href = b.website;
    $("brand-logo").src = b.logo;
    $("brand-name").textContent = b.name;
    $("welcome-logo").src = b.logo;
    $("welcome-logo").alt = b.name;
    $("headline").textContent = t.headline;
    $("subheadline").textContent = t.subheadline;
    $("start-btn").textContent = t.start;
    $("welcome-hint").textContent = t.duration;
    $("welcome-hint").hidden = !t.duration;
    $("success-title").textContent = t.successTitle;
    $("success-message").textContent = t.successMessage;
  }

  // ---------------------------------------------------------------
  // Estrutura: cada item de "fields" é uma tela. Um item pode ser um
  // campo ou um grupo ({ type: "group", label, fields: [...] }).
  // ---------------------------------------------------------------
  function allFields() {
    return cfg.fields.reduce(function (acc, q) { return acc.concat(fieldsOf(q)); }, []);
  }

  function fieldsOf(q) { return q.type === "group" ? q.fields : [q]; }
  function isChoice(f) { return f.type === "radio" || f.type === "checkboxes"; }

  // ---------------------------------------------------------------
  // Renderização
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

  function icon(path, size, className) {
    var ns = "http://www.w3.org/2000/svg";
    var s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24");
    s.setAttribute("width", size);
    s.setAttribute("height", size);
    s.setAttribute("aria-hidden", "true");
    if (className) s.setAttribute("class", className);
    var p = document.createElementNS(ns, "path");
    p.setAttribute("d", path);
    p.setAttribute("fill", "none");
    p.setAttribute("stroke", "currentColor");
    p.setAttribute("stroke-width", "2.5");
    p.setAttribute("stroke-linecap", "round");
    p.setAttribute("stroke-linejoin", "round");
    s.appendChild(p);
    return s;
  }
  var CHECK = "M20 6 9 17l-5-5";
  var ARROW = "M5 12h14m-6-6 6 6-6 6";

  function numberTag(number) {
    return number ? el("span", { className: "field__num" }, [document.createTextNode(number), icon(ARROW, 14)]) : null;
  }

  function labelFor(f, number) {
    return el("label", { className: "field__label", for: "f-" + f.name }, [
      numberTag(number),
      document.createTextNode(f.label),
      f.required && cfg.markRequired ? el("span", { className: "field__req", text: "*", "aria-hidden": "true" }) : null
    ]);
  }

  function hintFor(f) {
    var text = f.hint;
    if (!text && f.type === "checkboxes") {
      text = f.max ? "Escolha até " + f.max + " opções." : "Marque quantas quiser.";
    }
    return text ? el("p", { className: "field__hint", text: text }) : null;
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
      className: "choices",
      role: type === "radio" ? "radiogroup" : "group",
      "aria-labelledby": id + "-lbl",
      "aria-describedby": id + "-err"
    }, options.map(function (o, i) {
      return el("label", { className: "choice" }, [
        el("input", { type: type, name: f.name, value: o, id: i === 0 ? id : undefined }),
        el("span", { className: "choice__body" }, [
          el("span", { className: "choice__key", text: LETTERS[i], "aria-hidden": "true" }),
          el("span", { className: "choice__text", text: o }),
          icon(CHECK, 18, "choice__check")
        ])
      ]);
    }));
    var other = f.other ? el("input", {
      className: "input choice-other",
      type: "text",
      name: f.name + "__outro",
      placeholder: f.otherPlaceholder || "Digite aqui…",
      "aria-label": f.label + " – outro",
      maxlength: 200,
      enterkeyhint: "next",
      hidden: true
    }) : null;
    return [group, other];
  }

  function renderField(f, number) {
    var id = "f-" + f.name;
    var common = { id: id, name: f.name, "aria-describedby": id + "-err", enterkeyhint: "next" };
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
        control = el("textarea", Object.assign({
          className: "textarea", rows: f.rows || 2, placeholder: f.placeholder || "Digite sua resposta aqui…"
        }, common));
        wrap.append(labelFor(f, number), control);
        break;

      default:
        control = el("input", Object.assign({
          className: "input",
          type: f.type || "text",
          placeholder: f.placeholder || "Digite sua resposta aqui…",
          autocomplete: f.autocomplete,
          maxlength: f.maxlength,
          inputmode: f.type === "tel" ? "tel" : undefined
        }, common));
        if (f.type === "tel") control.addEventListener("input", maskPhone);
        wrap.append(labelFor(f, number), control);
    }

    wrap.appendChild(el("span", { className: "field__error", id: id + "-err", role: "alert" }));
    return wrap;
  }

  function renderGroup(g, number) {
    var legend = el("legend", { className: "field__label group__legend" }, [numberTag(number), document.createTextNode(g.label)]);
    var grid = el("div", { className: "group__grid" }, g.fields.map(function (f) { return renderField(f); }));
    return el("fieldset", { className: "group" }, [legend, grid]);
  }

  function renderStep(q, i, total) {
    var last = i === total - 1;
    var btn = el("button", { type: "button", className: "btn", "data-action": "next" }, [
      document.createTextNode(last ? cfg.texts.submit : cfg.texts.ok),
      last ? null : icon(CHECK, 18)
    ]);
    var hint = el("span", { className: "step__hint" }, [
      document.createTextNode("pressione "), el("strong", { text: "Enter ↵" })
    ]);
    return el("section", { className: "step", tabindex: "-1", "aria-label": "Pergunta " + (i + 1) + " de " + total }, [
      el("div", { className: "step__inner" }, [
        q.type === "group" ? renderGroup(q, i + 1) : renderField(q, i + 1),
        el("div", { className: "step__actions" }, [btn, hint]),
        last ? el("p", { className: "form__error", id: "form-error", role: "alert", hidden: true }) : null
      ])
    ]);
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
      otherInput.hidden = !otherBox.checked;
      if (otherBox.checked && changed === otherBox) otherInput.focus();
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
      if (f.required && !v) msg = "Preencha este campo.";
      else if (v && f.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) msg = "Informe um e-mail válido.";
      else if (v && f.type === "tel" && !/^\d{10,11}$/.test(v.replace(/\D/g, ""))) msg = "Informe o número com DDD.";
      form.elements[f.name].setAttribute("aria-invalid", msg ? "true" : "false");
    }

    errEl.textContent = msg;
    wrap.classList.toggle("field--invalid", !!msg);
    return !msg;
  }

  function isAnswered(q, form) {
    var needed = fieldsOf(q).filter(function (f) { return f.required; });
    return (needed.length ? needed : fieldsOf(q)).every(function (f) { return fieldValue(f, form) !== ""; });
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

  // ---------------------------------------------------------------
  // Navegação entre telas (uma pergunta por vez)
  // ---------------------------------------------------------------
  function init() {
    applyBrand();
    var utm = captureUtm();
    var form = $("lead-form");
    var total = cfg.fields.length;
    var stepsBox = $("steps");
    cfg.fields.forEach(function (q, i) { stepsBox.appendChild(renderStep(q, i, total)); });

    // steps[0] = boas-vindas; steps[i] = pergunta i
    var steps = [form.querySelector(".step--welcome")].concat(Array.prototype.slice.call(stepsBox.children));
    var current = 0;
    var sending = false;

    function updateProgress() {
      var done = cfg.fields.filter(function (q) { return isAnswered(q, form); }).length;
      $("progress-fill").style.width = (100 * done / total) + "%";
    }

    function focusStep(n) {
      var target = steps[n].querySelector(".input:not([hidden]), .select, .textarea");
      if (target && canHover) target.focus({ preventScroll: true });
      else steps[n].focus({ preventScroll: true });
    }

    function show(n) {
      if (n === current || n < 0 || n >= steps.length) return;
      steps[current].classList.remove("is-active", "from-below", "from-above", "shake");
      steps[n].classList.remove("from-below", "from-above", "shake");
      steps[n].classList.add("is-active", n > current ? "from-below" : "from-above");
      current = n;
      window.scrollTo(0, 0);
      $("nav").hidden = n === 0;
      $("nav-prev").disabled = n <= 1;
      $("nav-next").disabled = n === steps.length - 1;
      focusStep(n);
    }

    function shake(step) {
      step.classList.remove("shake", "from-below", "from-above");
      void step.offsetWidth; // reinicia a animação
      step.classList.add("shake");
    }

    function validateStep(n, focus) {
      var firstInvalid = null;
      fieldsOf(cfg.fields[n - 1]).forEach(function (f) {
        if (!validateField(f, form) && !firstInvalid) firstInvalid = f;
      });
      if (firstInvalid && focus) {
        shake(steps[n]);
        var sel = '[data-field="' + firstInvalid.name + '"] ';
        var node = form.querySelector(sel + ".input:not([hidden]), " + sel + ".select, " + sel + ".textarea");
        if (node) node.focus({ preventScroll: true });
      }
      return !firstInvalid;
    }

    function next() {
      if (sending) return;
      if (current === 0) return show(1);
      if (!validateStep(current, true)) return;
      if (current < steps.length - 1) return show(current + 1);
      submit();
    }

    function submit() {
      for (var n = 1; n < steps.length; n++) {
        if (!validateStep(n, false)) { show(n); validateStep(n, true); return; }
      }
      var errBox = $("form-error");
      errBox.hidden = true;

      if (!cfg.endpoint) {
        errBox.textContent = "Configuração pendente: defina a URL do Google Apps Script em config.js (endpoint).";
        errBox.hidden = false;
        return;
      }

      var btn = steps[steps.length - 1].querySelector('[data-action="next"]');
      sending = true;
      btn.disabled = true;
      btn.textContent = cfg.texts.submitting;

      // application/x-www-form-urlencoded é uma "simple request": sem preflight CORS
      fetch(cfg.endpoint, { method: "POST", body: buildPayload(form, utm) })
        .then(function (r) { return r.json(); })
        .then(function (res) {
          if (!res || res.ok !== true) throw new Error((res && res.error) || "erro");
          if (cfg.redirectUrl) { location.href = cfg.redirectUrl; return; }
          form.hidden = true;
          $("nav").hidden = true;
          $("progress-fill").style.width = "100%";
          $("success-view").classList.add("is-active", "from-below");
          $("success-view").focus({ preventScroll: true });
          window.scrollTo(0, 0);
        })
        .catch(function () {
          sending = false;
          errBox.textContent = cfg.texts.errorMessage;
          errBox.hidden = false;
          btn.disabled = false;
          btn.textContent = cfg.texts.submit;
        });
    }

    // Botões OK / Começar / setas
    form.addEventListener("click", function (e) {
      if (e.target.closest('[data-action="next"]')) next();
    });
    $("nav-prev").addEventListener("click", function () { show(current - 1); });
    $("nav-next").addEventListener("click", next);
    form.addEventListener("submit", function (e) { e.preventDefault(); next(); });

    // Teclado: Enter avança, letras (A, B, C…) escolhem opções
    document.addEventListener("keydown", function (e) {
      if (e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      var tag = e.target.tagName;

      if (e.key === "Enter") {
        if (tag === "BUTTON" || tag === "A" || (tag === "TEXTAREA" && e.shiftKey)) return;
        e.preventDefault();
        next();
        return;
      }

      var q = cfg.fields[current - 1];
      var typing = (tag === "INPUT" && e.target.type === "text") || tag === "TEXTAREA";
      if (!q || !isChoice(q) || typing || e.key.length !== 1) return;
      var box = boxesOf(q, form)[LETTERS.indexOf(e.key.toUpperCase())];
      if (box && !box.disabled) {
        e.preventDefault();
        box.click();
        var choice = box.closest(".choice");
        choice.classList.add("pulse");
        setTimeout(function () { choice.classList.remove("pulse"); }, 300);
      }
    });

    // Validação em tempo real + avanço automático na escolha única
    cfg.fields.forEach(function (q, qi) {
      fieldsOf(q).forEach(function (f) {
        var wrap = form.querySelector('[data-field="' + f.name + '"]');
        ["input", "change"].forEach(function (evt) {
          wrap.addEventListener(evt, function (e) {
            if (isChoice(f) && evt === "change") syncChoices(f, form, e.target);
            if (wrap.classList.contains("field--invalid")) validateField(f, form);
            updateProgress();

            if (evt === "change" && q === f && f.type === "radio" && e.target.type === "radio" && e.target.value !== OTHER) {
              setTimeout(function () { if (current === qi + 1) next(); }, 450);
            }
          });
        });
        wrap.addEventListener("focusout", function (e) {
          if (e.target.value && e.target.type !== "radio" && e.target.type !== "checkbox") validateField(f, form);
        });
      });
    });

    updateProgress();
    steps[0].focus({ preventScroll: true });
  }

  init();
})();
