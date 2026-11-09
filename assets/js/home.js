/* Home page: hero air field, system diagram, cooling/heating switch and the demo booking form.
   Ported from the original J&D page. Text comes from the page (translated at build time). */
(function () {
  "use strict";
  var $ = function (s) { return document.querySelector(s); };
  var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  var heatMode = function () { return document.body.classList.contains("heat"); };
  var css = getComputedStyle(document.documentElement);
  var rgb = function (name, fallback) {
    var h = (css.getPropertyValue(name) || fallback).trim().replace("#", "");
    return [0, 2, 4].map(function (i) { return parseInt(h.substr(i, 2), 16); });
  };

  /* hero air field: particles drift through a flow field, cool at the top and warm at the bottom */
  var cv = $("#air");
  if (cv && cv.getContext) {
    var cx = cv.getContext("2d"), W = 0, H = 0, DPR = Math.min(2, window.devicePixelRatio || 1), parts = [];
    var mouse = { x: -999, y: -999 }, night = rgb("--night", "#0b0d0e"), cold = rgb("--cold", "#8cc8ec"), heat = rgb("--heat", "#f0884a");
    var spawn = function (any) { return { x: any ? Math.random() * W : -20, y: Math.random() * H, life: 0, max: 120 + Math.random() * 220, s: 0.6 + Math.random() * 1.4 }; };
    var size = function () {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * DPR; cv.height = H * DPR; cx.setTransform(DPR, 0, 0, DPR, 0, 0);
      var n = Math.round(Math.min(900, W * H / 1400)); parts = [];
      for (var i = 0; i < n; i++) parts.push(spawn(true));
    };
    var field = function (x, y, t) { return Math.sin(y * 0.006 + t * 0.0004) * 1.1 + Math.cos(x * 0.004 - t * 0.0003) * 0.8 + Math.sin((x + y) * 0.002 + t * 0.0002) * 0.6; };
    var draw = function (t) {
      cx.fillStyle = "rgba(" + night.join(",") + ",.16)"; cx.fillRect(0, 0, W, H);
      var hot = heatMode();
      for (var i = 0; i < parts.length; i++) {
        var p = parts[i], a = field(p.x, p.y, t);
        var vx = Math.cos(a * 0.6) * p.s * 1.6 + 0.9, vy = Math.sin(a) * p.s * 0.9;
        var dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
        if (d2 < 22000) { var f = (22000 - d2) / 22000; vx += dx / Math.sqrt(d2 + 1) * f * 3; vy += dy / Math.sqrt(d2 + 1) * f * 3; }
        var nx = p.x + vx, ny = p.y + vy, k = ny / H;
        var mix = hot ? 0.35 + k * 0.65 : Math.max(0, k * 1.25 - 0.35);
        var c = [0, 1, 2].map(function (j) { return Math.round(cold[j] + (heat[j] - cold[j]) * mix); });
        cx.strokeStyle = "rgba(" + c.join(",") + "," + (0.55 * Math.sin(Math.PI * p.life / p.max)) + ")"; cx.lineWidth = 0.9;
        cx.beginPath(); cx.moveTo(p.x, p.y); cx.lineTo(nx, ny); cx.stroke();
        p.x = nx; p.y = ny; p.life++;
        if (p.life > p.max || p.x > W + 20 || p.y < -20 || p.y > H + 20) { var q = spawn(false); q.x = Math.random() * W * 0.3 - 20; parts[i] = q; }
      }
    };
    var running = true;
    var loop = function (t) { if (running) draw(t); requestAnimationFrame(loop); };
    size();
    window.addEventListener("resize", size);
    cv.parentElement.addEventListener("pointermove", function (e) { var r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    cv.parentElement.addEventListener("pointerleave", function () { mouse.x = mouse.y = -999; });
    if (reduce) { for (var s = 0; s < 260; s++) draw(s * 16); }
    else {
      if ("IntersectionObserver" in window) new IntersectionObserver(function (es) { running = es[0].isIntersecting; }).observe(cv);
      requestAnimationFrame(loop);
    }
  }

  /* system diagram: the step in the middle of the screen lights up its part */
  var diagram = $("#diagram"), dataEl = $("#dg-data");
  if (!diagram || !dataEl) return;
  var data = JSON.parse(dataEl.textContent), steps = [].slice.call(document.querySelectorAll(".step"));
  var partEls = {}, current = steps.length ? steps[0].getAttribute("data-part") : "tstat";
  [].forEach.call(diagram.querySelectorAll(".part"), function (g) { partEls[g.getAttribute("data-part")] = g; });
  var rd = [].slice.call(document.querySelectorAll("#stageRead span"));
  var setReadings = function () {
    var r = data.readings[heatMode() ? "heat" : "cool"][current];
    if (!r) return;
    rd.forEach(function (s, i) { s.firstChild.textContent = r[i * 2] + " "; s.querySelector("b").textContent = r[i * 2 + 1]; });
  };
  var activate = function (step) {
    steps.forEach(function (s) { s.classList.toggle("on", s === step); });
    current = step.getAttribute("data-part");
    Object.keys(partEls).forEach(function (k) { partEls[k].classList.toggle("on", k === current); });
    diagram.classList.add("focus");
    $("#stepNo").textContent = ("0" + (steps.indexOf(step) + 1)).slice(-2);
    $("#stepName").textContent = step.getAttribute("data-name");
    setReadings();
  };
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) activate(e.target); }); }, { rootMargin: "-48% 0px -48% 0px" });
    steps.forEach(function (s) { io.observe(s); });
  }
  if (steps.length) activate(steps[0]);

  /* cooling / heating */
  var mCool = $("#mCool"), mHeat = $("#mHeat");
  var setMode = function (h) {
    document.body.classList.toggle("heat", h);
    mCool.setAttribute("aria-pressed", String(!h)); mHeat.setAttribute("aria-pressed", String(h));
    $("#tsTxt").textContent = h ? "70°" : "72°";
    $("#lnSuction").textContent = h ? data.hot_gas_line : data.suction_line;
    var out = $("#outT"); if (out) out.textContent = h ? "38°F" : "94°F";
    setReadings();
  };
  if (mCool && mHeat) {
    mCool.addEventListener("click", function () { setMode(false); });
    mHeat.addEventListener("click", function () { setMode(true); });
  }
})();

/* Demo booking form (sample brand only): checks the fields and shows what would happen, sends nothing. */
(function () {
  "use strict";
  var form = document.querySelector("form[data-demo]");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var note = form.querySelector(".form-note"), done = form.querySelector(".done-msg");
    var f = form.elements, name = f.namedItem("name"), phone = f.namedItem("phone"), email = f.namedItem("email");
    if (!name.value.trim() || !(phone.value.trim() || email.value.trim())) {
      note.textContent = form.getAttribute("data-missing");
      (name.value.trim() ? phone : name).focus();
      return;
    }
    note.textContent = "";
    done.hidden = false;
    done.focus();
  });
})();
