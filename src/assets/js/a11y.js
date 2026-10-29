/* Controles de acessibilidade: tamanho da fonte, alto contraste e VLibras */
(function () {
  var CHAVE = "smma-a11y";
  var html = document.documentElement;
  var estado = { fonte: 0, contraste: false };
  try { estado = Object.assign(estado, JSON.parse(localStorage.getItem(CHAVE) || "{}")); } catch (e) {}

  function salvar() { try { localStorage.setItem(CHAVE, JSON.stringify(estado)); } catch (e) {} }
  function aplicar() {
    ["fs-1", "fs-2", "fs-3"].forEach(function (c) { html.classList.remove(c); });
    if (estado.fonte > 0) html.classList.add("fs-" + estado.fonte);
    html.classList.toggle("alto-contraste", !!estado.contraste);
    var bc = document.getElementById("contraste");
    if (bc) bc.setAttribute("aria-pressed", String(!!estado.contraste));
  }
  function avisar(msg) {
    var r = document.getElementById("busca-status");
    if (r) { r.textContent = ""; setTimeout(function () { r.textContent = msg; }, 50); }
  }

  document.addEventListener("DOMContentLoaded", function () {
    aplicar();
    var on = function (id, fn) { var el = document.getElementById(id); if (el) el.addEventListener("click", fn); };
    on("fonte-mais", function () { estado.fonte = Math.min(3, estado.fonte + 1); aplicar(); salvar(); avisar("Letra maior"); });
    on("fonte-menos", function () { estado.fonte = Math.max(0, estado.fonte - 1); aplicar(); salvar(); avisar("Letra menor"); });
    on("fonte-normal", function () { estado.fonte = 0; aplicar(); salvar(); avisar("Tamanho normal da letra"); });
    on("contraste", function () { estado.contraste = !estado.contraste; aplicar(); salvar(); avisar(estado.contraste ? "Alto contraste ativado" : "Alto contraste desativado"); });
    on("libras", function () {
      var b = document.querySelector("[vw-access-button]");
      if (b) b.click(); else avisar("O VLibras ainda está carregando. Tente novamente em instantes.");
    });
  });
})();
