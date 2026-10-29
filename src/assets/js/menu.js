/* Menu hambúrguer acessível (mobile) */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.querySelector(".btn-menu");
    var nav = document.getElementById("menu-principal");
    if (!btn || !nav) return;
    function abrir(sim) {
      nav.classList.toggle("aberto", sim);
      btn.setAttribute("aria-expanded", String(sim));
    }
    btn.addEventListener("click", function () { abrir(btn.getAttribute("aria-expanded") !== "true"); });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") { abrir(false); btn.focus(); }
    });
    // Foco sai do menu aberto: fecha (somente em telas pequenas)
    nav.addEventListener("focusout", function (e) {
      if (nav.classList.contains("aberto") && e.relatedTarget && !nav.contains(e.relatedTarget) && e.relatedTarget !== btn) abrir(false);
    });
  });
})();
