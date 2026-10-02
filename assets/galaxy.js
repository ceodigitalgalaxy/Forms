/**
 * Galáxia animada de fundo (canvas).
 *
 * - setLevel(0..1): a galáxia se forma conforme o progresso do formulário
 * - pulse():        pequeno "salto" para frente a cada pergunta
 * - charge():       acelera enquanto as respostas são enviadas
 * - launch(cb):     decolagem (velocidade da luz + clarão); cb no pico do clarão
 * - calm():         volta ao ritmo normal (ex.: erro no envio)
 */
window.Galaxy = (function () {
  "use strict";

  var canvas, ctx, w = 0, h = 0, dpr = 1;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var small = window.matchMedia("(max-width: 600px)").matches;

  var STAR_COUNT = small ? 150 : 320;
  var GALAXY_COUNT = small ? 520 : 1100;
  var BASE_SPEED = 0.035;

  var stars = [], dust = [];
  var level = 0, shownLevel = 0;      // progresso (0..1) e valor suavizado
  var speed = BASE_SPEED, targetSpeed = BASE_SPEED;
  var spin = 0, spinSpeed = 0.00012;
  var galaxyScale = 1, flash = 0;
  var launchState = null;
  var last = 0, running = false;

  function rand(a, b) { return a + Math.random() * (b - a); }
  function gauss() { return (Math.random() + Math.random() + Math.random() - 1.5) / 1.5; }

  // Estrelas em 3D, vindo em direção à tela
  function makeStar(star, anyDepth) {
    star = star || {};
    star.x = rand(-1, 1);
    star.y = rand(-1, 1);
    star.z = anyDepth ? rand(0.05, 1) : 1;
    star.pz = star.z;
    star.tw = rand(0, Math.PI * 2);     // fase do brilho
    star.rank = Math.random();          // quanto menor, mais cedo aparece
    return star;
  }

  // Partículas da galáxia em espiral (3 braços)
  function makeDust() {
    dust = [];
    for (var i = 0; i < GALAXY_COUNT; i++) {
      var arm = i % 3;
      var t = Math.pow(Math.random(), 0.75);               // 0 = núcleo, 1 = borda
      var angle = arm * (Math.PI * 2 / 3) + t * 4.4 + gauss() * 0.35;
      var spread = 0.05 + 0.12 * (1 - t);
      dust.push({
        t: t,
        a: angle,
        r: t + gauss() * spread,
        off: gauss() * spread,
        s: rand(0.5, 1.6) * (1.2 - t * 0.5),
        hue: t < 0.25 ? 0 : (Math.random() < 0.3 ? 2 : 1), // 0 núcleo, 1 violeta, 2 lilás
        tw: rand(0, Math.PI * 2)
      });
    }
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ---------------------------------------------------------------
  function drawGalaxy(time) {
    var lv = shownLevel;
    var cx = small ? w * 0.5 : w * 0.76;
    var cy = small ? h * 0.78 : h * 0.62;
    var R = Math.min(w, h) * (small ? 0.62 : 0.5) * (0.55 + 0.45 * lv) * galaxyScale;
    var reach = 0.22 + 0.78 * lv;                    // até onde os braços já se formaram
    var alphaBase = 0.18 + 0.5 * lv;
    var tilt = 0.5, rot = -0.45;
    var cosR = Math.cos(rot), sinR = Math.sin(rot);

    // brilho do núcleo e nebulosa
    var glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.1);
    glow.addColorStop(0, "rgba(183,148,255," + (0.18 + 0.32 * lv) * galaxyScale + ")");
    glow.addColorStop(0.35, "rgba(90,26,199," + (0.08 + 0.16 * lv) + ")");
    glow.addColorStop(1, "rgba(59,0,142,0)");
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.ellipse(cx, cy, R * 1.1, R * 1.1 * 0.75, rot, 0, Math.PI * 2);
    ctx.fill();

    for (var i = 0; i < dust.length; i++) {
      var p = dust[i];
      if (p.t > reach) continue;
      var a = p.a + spin * (1.6 - p.t);              // núcleo gira mais rápido
      var px = Math.cos(a) * p.r * R + p.off * R * 0.4;
      var py = Math.sin(a) * p.r * R * tilt;
      var x = cx + px * cosR - py * sinR;
      var y = cy + px * sinR + py * cosR;
      var edgeFade = Math.min(1, (reach - p.t) / 0.12);
      var tw = 0.75 + 0.25 * Math.sin(time * 0.002 + p.tw);
      ctx.globalAlpha = alphaBase * edgeFade * tw;
      ctx.fillStyle = p.hue === 0 ? "#F3ECFF" : p.hue === 1 ? "#9D6BFF" : "#D9C6FF";
      ctx.fillRect(x, y, p.s, p.s);
    }
    ctx.globalAlpha = 1;
  }

  function drawStars(time, dt) {
    var cx = w / 2, cy = h / 2, fov = Math.max(w, h) * 0.55;
    var visible = 0.35 + 0.65 * shownLevel;         // mais estrelas conforme avança
    var streak = speed > 0.12;
    ctx.lineCap = "round";

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.pz = s.z;
      s.z -= speed * dt * 0.0006;
      if (s.z <= 0.02) { makeStar(s, false); s.pz = s.z; continue; }
      if (s.rank > visible && !launchState) continue;

      var x = cx + (s.x / s.z) * fov;
      var y = cy + (s.y / s.z) * fov;
      if (x < -50 || x > w + 50 || y < -50 || y > h + 50) { makeStar(s, false); continue; }

      var depth = 1 - s.z;
      var tw = 0.65 + 0.35 * Math.sin(time * 0.003 + s.tw);
      var alpha = Math.min(1, depth * 1.3) * tw * (0.55 + 0.45 * shownLevel);

      if (streak) {
        var px = cx + (s.x / s.pz) * fov;
        var py = cy + (s.y / s.pz) * fov;
        ctx.strokeStyle = "rgba(230,215,255," + Math.min(1, alpha + 0.2) + ")";
        ctx.lineWidth = Math.max(0.6, depth * 2.2);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(x, y);
        ctx.stroke();
      } else {
        var size = Math.max(0.6, depth * 2.1);
        ctx.globalAlpha = alpha;
        ctx.fillStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.arc(x, y, size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // ---------------------------------------------------------------
  function frame(time) {
    if (!running) return;
    var dt = Math.min(50, time - (last || time));
    last = time;

    shownLevel += (level - shownLevel) * Math.min(1, dt * 0.003);
    speed += (targetSpeed - speed) * Math.min(1, dt * 0.004);
    spin += spinSpeed * dt * (1 + speed * 6);

    if (launchState) stepLaunch(time);

    ctx.clearRect(0, 0, w, h);
    drawGalaxy(time);
    drawStars(time, dt);

    if (flash > 0.001) {
      // clarão violeta que nasce no topo, por onde a estrela saiu
      var g = ctx.createRadialGradient(w / 2, 0, 0, w / 2, 0, Math.max(w, h) * 1.15);
      g.addColorStop(0, "rgba(255,255,255," + flash + ")");
      g.addColorStop(0.35, "rgba(205,180,255," + flash * 0.85 + ")");
      g.addColorStop(1, "rgba(90,26,199," + flash * 0.55 + ")");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
    }
    requestAnimationFrame(frame);
  }

  // Linha do tempo da decolagem
  function stepLaunch(time) {
    var L = launchState;
    var t = time - L.start;
    L.lastFrame = performance.now();
    if (t < 200) {                                    // conteúdo sai de cena
      targetSpeed = 0.12;
    } else if (t < 1200) {                            // acelera até a velocidade da luz
      var k = (t - 200) / 1000;
      // se for preciso esperar algo antes do clarão, segue viajando em velocidade da luz
      if (k > 0.7 && L.waiting && L.waiting()) { k = 0.7; L.start = time - (200 + 0.7 * 1000); }
      targetSpeed = 0.25 + Math.pow(k, 2.2) * 3.2;
      galaxyScale = 1 - 0.55 * k;
      flash = Math.max(0, (k - 0.75) / 0.25) * 0.9;
    } else if (t < 1450) {                            // clarão
      flash = 0.9;
      if (!L.fired) { L.fired = true; if (L.cb) L.cb(); }
      targetSpeed = BASE_SPEED * 2;
      speed = 0.3;
      galaxyScale = 1;
    } else if (t < 2400) {                            // dissipa e volta ao cruzeiro
      flash = 0.9 * (1 - (t - 1450) / 950);
    } else {
      flash = 0;
      targetSpeed = BASE_SPEED;
      launchState = null;
    }
  }

  // ---------------------------------------------------------------
  return {
    init: function (el) {
      canvas = el;
      if (!canvas || !canvas.getContext) return;
      ctx = canvas.getContext("2d");
      for (var i = 0; i < STAR_COUNT; i++) stars.push(makeStar(null, true));
      makeDust();
      resize();
      window.addEventListener("resize", resize);
      document.addEventListener("visibilitychange", function () {
        running = !document.hidden;
        if (running) { last = 0; requestAnimationFrame(frame); }
      });
      running = true;
      if (reduced) { BASE_SPEED = 0.005; speed = targetSpeed = BASE_SPEED; spinSpeed = 0.00003; }
      requestAnimationFrame(frame);
    },
    setLevel: function (v) { level = Math.max(0, Math.min(1, v)); },
    pulse: function () {
      if (reduced || launchState) return;
      speed = 0.16;                                   // salto curto, desacelera sozinho
      targetSpeed = BASE_SPEED;
    },
    charge: function () { if (!reduced && !launchState) targetSpeed = 0.12; },
    calm: function () { if (!launchState) targetSpeed = BASE_SPEED; },
    // waiting(): enquanto retornar true, a viagem continua antes do clarão
    launch: function (cb, waiting) {
      var fire = function () { if (!L.fired) { L.fired = true; if (cb) cb(); } };
      var L = { start: performance.now(), cb: cb, waiting: waiting, fired: false };
      if (!ctx || reduced) {
        var poll = setInterval(function () { if (!waiting || !waiting()) { clearInterval(poll); fire(); } }, 100);
        return;
      }
      launchState = L;
      // Segurança: com a aba em segundo plano a animação pausa; o resultado aparece mesmo assim
      var guard = setInterval(function () {
        if (L.fired) { clearInterval(guard); return; }
        var paused = performance.now() - (L.lastFrame || L.start) > 600;   // aba em segundo plano
        if (paused && (!waiting || !waiting())) { clearInterval(guard); fire(); }
      }, 300);
    },
    // Cancela a decolagem (ex.: falha no envio)
    abort: function () {
      launchState = null;
      flash = 0;
      galaxyScale = 1;
      targetSpeed = BASE_SPEED;
    }
  };
})();
