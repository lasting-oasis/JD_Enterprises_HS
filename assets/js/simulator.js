/* Profit simulator: recomputes a year from the sliders. Same sums as kit_finance.profit_year(); no network,
   no storage, works from a file. Numbers in US format in both languages, like the rest of the kit. */
(function () {
  "use strict";
  var root = document.querySelector("[data-sim]");
  var dataEl = document.getElementById("sim-data");
  if (!root || !dataEl) return;
  var data = JSON.parse(dataEl.textContent);
  var form = root.querySelector("[data-sim-form]");
  var usd = new Intl.NumberFormat("en-US", {style: "currency", currency: "USD", maximumFractionDigits: 0, minimumFractionDigits: 0});

  function money(x) { return usd.format(Math.round(x)).replace("-$0", "$0"); }
  function pct(x) { return (Math.round(x * 1000) / 10).toString() + "%"; }
  function show(key, text) {
    var el = root.querySelector('[data-sim-out="' + key + '"]');
    if (el) el.textContent = text;
  }
  function fieldText(input) {
    var v = Number(input.value);
    switch (input.dataset.unit) {
      case "money": return money(v);
      case "percent": return v + "%";
      case "decimal": return v.toFixed(1);
      default: return v.toLocaleString("en-US");
    }
  }
  function values() {
    var v = {};
    data.fields.forEach(function (f) { v[f.key] = Number(form.elements[f.key].value); });
    return v;
  }
  function year(v) {
    var service = v.techs * v.calls * data.weeks * v.ticket;
    var install = v.estimates * 12 * v.close / 100 * v.price;
    var plans = v.members * v.plan_price;
    var revenue = service + install + plans;
    var gross = revenue * v.margin / 100;
    var overhead = v.overhead * 12;
    var net = gross - overhead;
    return {service: service, install: install, plans: plans, revenue: revenue, gross: gross, overhead: overhead,
            net: net, direct: revenue - gross, netMargin: revenue ? net / revenue : 0,
            breakeven: overhead / (v.margin / 100), plansShare: revenue ? plans / revenue : 0};
  }
  var pending = 0;
  function update() {
    data.fields.forEach(function (f) {
      var input = form.elements[f.key];
      var text = fieldText(input);
      var out = document.getElementById("sim-" + f.key + "-out");
      if (out) out.textContent = text;
      input.setAttribute("aria-valuetext", text);
    });
    var y = year(values());
    var loss = y.net < 0;
    ["service", "install", "plans", "revenue", "gross", "overhead", "breakeven"].forEach(function (k) { show(k, money(y[k])); });
    show("net", money(y.net));
    show("mini", money(y.net));
    show("net_label", loss ? data.text.loss_word : data.text.net);
    show("mini_label", loss ? data.text.loss_word : data.text.net);
    root.querySelector('[data-sim-out="net"]').classList.toggle("is-loss", loss);
    show("net_margin", pct(y.netMargin));
    show("plans_share", pct(y.plansShare));
    var total = y.direct + y.overhead + Math.max(y.net, 0);
    ["direct", "overhead", "net"].forEach(function (k) {
      var share = total ? Math.max(y[k], 0) / total : 0;
      root.querySelector('[data-sim-seg="' + k + '"]').style.width = (share * 100).toFixed(2) + "%";
      show("share_" + k, pct(share));
    });
    var lossEl = root.querySelector('[data-sim-out="loss"]');
    lossEl.hidden = !loss;
    lossEl.textContent = loss ? data.text.loss.replace("{amount}", money(-y.net)) : "";
    clearTimeout(pending);  // announce once the slider settles, not on every step
    pending = setTimeout(function () {
      show("summary", data.text.summary.replace("{net}", money(y.net)).replace("{revenue}", money(y.revenue)));
    }, 400);
  }
  form.addEventListener("input", update);
  form.addEventListener("submit", function (e) { e.preventDefault(); });
  form.addEventListener("reset", function () { setTimeout(update, 0); });
  update();
})();
