/* Filtros de listas (notícias, projetos, documentos, FAQ) com "Carregar mais" acessível */
(function () {
  function norm(s) { return (s || "").toString().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""); }

  function iniciar(raiz) {
    var itens = Array.prototype.slice.call(raiz.parentNode.querySelectorAll("[data-item]"));
    var contador = raiz.parentNode.querySelector("[data-contador]");
    var vazio = raiz.parentNode.querySelector("[data-vazio]");
    var mais = raiz.parentNode.querySelector("[data-mais]");
    var porPagina = parseInt(raiz.getAttribute("data-pagina") || "0", 10);
    var controles = Array.prototype.slice.call(raiz.querySelectorAll("[data-f]"));
    var visiveis = porPagina || Infinity;
    var primeiro = true;

    // Preenche selects dinâmicos (ano, órgão) a partir dos itens
    controles.forEach(function (c) {
      if (c.tagName === "SELECT" && c.options.length === 1) {
        var chave = c.getAttribute("data-f"), vals = {};
        itens.forEach(function (i) { var v = i.getAttribute("data-" + chave); if (v) vals[v] = 1; });
        Object.keys(vals).sort(chave === "ano" ? function (a, b) { return b - a; } : undefined).forEach(function (v) {
          var o = document.createElement("option"); o.value = v; o.textContent = v; c.appendChild(o);
        });
      }
    });
    // Valores iniciais pela URL (?q=…&tipo=…)
    var params = new URLSearchParams(location.search);
    controles.forEach(function (c) { var v = params.get(c.getAttribute("data-f")); if (v) c.value = v; });

    function aplicar(manterPagina) {
      if (!manterPagina) visiveis = porPagina || Infinity;
      var f = {};
      controles.forEach(function (c) { f[c.getAttribute("data-f")] = c.value.trim(); });
      var termos = norm(f.q).split(/\s+/).filter(Boolean);
      var casam = itens.filter(function (i) {
        var t = norm(i.getAttribute("data-texto"));
        for (var k = 0; k < termos.length; k++) if (t.indexOf(termos[k]) === -1) return false;
        var ok = true;
        ["categoria", "tipo", "status", "tema", "orgao", "ano"].forEach(function (chave) {
          if (f[chave] && i.getAttribute("data-" + chave) !== f[chave]) ok = false;
        });
        var d = i.getAttribute("data-data");
        if (f.de && d && d < f.de) ok = false;
        if (f.ate && d && d > f.ate) ok = false;
        return ok;
      });
      itens.forEach(function (i) { i.hidden = true; });
      casam.forEach(function (i, n) { i.hidden = n >= visiveis; });
      if (vazio) vazio.hidden = casam.length > 0;
      if (mais) mais.hidden = casam.length <= visiveis;
      if (contador && !primeiro) contador.textContent = casam.length + (casam.length === 1 ? " resultado encontrado." : " resultados encontrados.");
      else if (contador) contador.textContent = "";
      primeiro = false;
      return casam;
    }

    controles.forEach(function (c) {
      c.addEventListener(c.tagName === "SELECT" || c.type === "date" ? "change" : "input", function () { aplicar(false); });
    });
    raiz.addEventListener("submit", function (e) { e.preventDefault(); });
    if (mais) mais.addEventListener("click", function () {
      var antes = visiveis;
      visiveis += porPagina;
      var casam = aplicar(true);
      // Move o foco para o primeiro item recém-exibido
      var novo = casam[antes];
      if (novo) { var alvo = novo.querySelector("a, button, summary") || novo; alvo.focus(); }
      if (contador) contador.textContent = "Mostrando " + Math.min(visiveis, casam.length) + " de " + casam.length + ".";
    });
    aplicar(false);
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-filtro]").forEach(iniciar);
  });
})();
