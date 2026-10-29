/* Aviso de cookies essenciais */
(function () {
  var CHAVE = "smma-cookies-ok";
  document.addEventListener("DOMContentLoaded", function () {
    var b = document.getElementById("cookie-banner");
    var ok = document.getElementById("cookie-ok");
    if (!b || !ok) return;
    var visto = false;
    try { visto = localStorage.getItem(CHAVE) === "1"; } catch (e) {}
    if (visto) return;
    b.hidden = false;
    ok.addEventListener("click", function () {
      try { localStorage.setItem(CHAVE, "1"); } catch (e) {}
      b.hidden = true;
    });
  });
})();
