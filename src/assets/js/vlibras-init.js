/* Carrega o VLibras (widget oficial do governo federal) após a página ficar pronta */
(function () {
  function iniciar() {
    var s = document.createElement("script");
    s.src = "https://vlibras.gov.br/app/vlibras-plugin.js";
    s.async = true;
    s.onload = function () { try { new window.VLibras.Widget("https://vlibras.gov.br/app"); } catch (e) {} };
    document.body.appendChild(s);
  }
  if (document.readyState === "complete") iniciar(); else window.addEventListener("load", iniciar);
})();
