/* FAQ assistant: matches a question against this page's answers. Offline; nothing is sent anywhere. */
(function () {
  "use strict";
  var form = document.getElementById("ask"), dataEl = document.getElementById("faq-data");
  if (!form || !dataEl) return;
  var items = JSON.parse(dataEl.textContent), out = document.getElementById("ask-out"), input = document.getElementById("ask-q");
  var STOP = " the a an my i is do does should what how to of for and in it can will el la los las un una mi de del que es y en por para se con como cual ";
  var words = function (s) {
    return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/).filter(function (w) { return w.length > 1 && STOP.indexOf(" " + w + " ") < 0; });
  };
  items.forEach(function (it) { it.kw = words(it.k + " " + it.q); });
  var same = function (w, k) { return w === k || (w.length >= 4 && k.length >= 4 && k.indexOf(w.slice(0, 4)) === 0); };
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var q = words(input.value), best = null, bestScore = 0;
    items.forEach(function (it) {
      var score = q.filter(function (w) { return it.kw.some(function (k) { return same(w, k); }); }).length;
      if (score > bestScore) { bestScore = score; best = it; }
    });
    out.textContent = "";
    var p = document.createElement("p");
    if (!best) { p.textContent = form.getAttribute("data-none"); out.appendChild(p); return; }
    var head = document.createElement("p"); head.className = "ask-q"; head.textContent = best.q;
    p.textContent = best.a;
    var link = document.createElement("a"); link.href = "#faq-" + best.id; link.textContent = form.getAttribute("data-see");
    link.addEventListener("click", function () { var d = document.getElementById("faq-" + best.id); if (d) d.open = true; });
    out.appendChild(head); out.appendChild(p); out.appendChild(link);
  });
})();
