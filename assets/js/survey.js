/* Feedback survey, demo mode (sample brand only): shows the thank-you message and sends nothing.
   With a form account set, the form posts normally. The page treats every answer the same way. */
(function () {
  "use strict";
  var form = document.querySelector("form.survey[data-demo]");
  if (!form) return;
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var done = form.querySelector(".done-msg");
    done.hidden = false;
    done.focus();
  });
})();
