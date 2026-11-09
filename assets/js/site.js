/* HVAC showcase: menu, language memory, section label. No dependencies. */
(function () {
  "use strict";
  var menu = document.getElementById("menu");
  var burger = document.querySelector(".burger");
  var closeBtn = menu ? menu.querySelector(".menu-close") : null;
  var outside = document.querySelectorAll("header.top, main, footer, nav.pill, .skip");

  function setInert(on) {
    for (var i = 0; i < outside.length; i++) {
      if (on) outside[i].setAttribute("inert", ""); else outside[i].removeAttribute("inert");
    }
  }
  function openMenu() {
    menu.hidden = false;
    burger.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    setInert(true);
    var first = menu.querySelector("a, button");
    if (first) first.focus();
  }
  function closeMenu() {
    menu.hidden = true;
    burger.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    setInert(false);
    burger.focus();
  }
  if (menu && burger) {
    burger.addEventListener("click", function () { if (menu.hidden) openMenu(); else closeMenu(); });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    document.addEventListener("keydown", function (e) {
      if (menu.hidden) return;
      if (e.key === "Escape") { closeMenu(); return; }
      if (e.key === "Tab") {
        var items = menu.querySelectorAll("a, button");
        var first = items[0], last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  // Remember the visitor's language choice (used by the root page redirect).
  var langLinks = document.querySelectorAll("[data-lang]");
  for (var j = 0; j < langLinks.length; j++) {
    langLinks[j].addEventListener("click", function (e) {
      try { localStorage.setItem("lang", e.currentTarget.getAttribute("data-lang")); } catch (err) { /* storage unavailable */ }
    });
  }

  // The floating nav shows the name of the section in view.
  var label = document.querySelector(".pill-label span");
  var sections = document.querySelectorAll("[data-label]");
  if (label && sections.length > 1 && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) label.textContent = entry.target.getAttribute("data-label");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    sections.forEach(function (s) { io.observe(s); });
  }
})();
