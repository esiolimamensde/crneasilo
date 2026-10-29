/* Busca global: sugestões (combobox ARIA) e página de resultados com filtros por tipo */
(function () {
  var indice = null, carregando = null;
  var ROTULOS = { servico: "Serviço", noticia: "Notícia", documento: "Documento", projeto: "Projeto", evento: "Evento", pagina: "Página" };

  function norm(s) { return (s || "").toString().toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, ""); }
  function carregar() {
    if (indice) return Promise.resolve(indice);
    if (!carregando) carregando = fetch("/busca-index.json").then(function (r) { return r.json(); }).then(function (d) {
      indice = d.map(function (i) { i._t = norm(i.titulo); i._x = norm(i.titulo + " " + (i.resumo || "") + " " + (i.palavras || "")); return i; });
      return indice;
    });
    return carregando;
  }
  function buscar(q, tipo) {
    var termos = norm(q).split(/\s+/).filter(Boolean);
    if (!termos.length) return [];
    return indice.map(function (i) {
      if (tipo && i.tipo !== tipo) return null;
      var pts = 0;
      for (var k = 0; k < termos.length; k++) {
        if (i._x.indexOf(termos[k]) === -1) return null;
        pts += i._t.indexOf(termos[k]) !== -1 ? 3 : 1;
      }
      return { i: i, p: pts };
    }).filter(Boolean).sort(function (a, b) { return b.p - a.p; }).map(function (x) { return x.i; });
  }

  // ---------- sugestões no campo do cabeçalho ----------
  function sugestoes() {
    var input = document.getElementById("busca-q");
    var lista = document.getElementById("busca-sugestoes");
    var status = document.getElementById("busca-status");
    if (!input || !lista) return;
    var ativo = -1, itens = [];
    function fechar() { lista.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); ativo = -1; }
    function marcar(n) {
      var as = lista.querySelectorAll("a");
      as.forEach(function (a, k) { a.setAttribute("aria-selected", String(k === n)); });
      ativo = n;
      if (n >= 0) input.setAttribute("aria-activedescendant", as[n].id); else input.removeAttribute("aria-activedescendant");
    }
    function mostrar() {
      var q = input.value.trim();
      if (q.length < 2) { fechar(); return; }
      carregar().then(function () {
        itens = buscar(q).slice(0, 6);
        lista.innerHTML = "";
        itens.forEach(function (it, k) {
          var li = document.createElement("li"); li.setAttribute("role", "presentation");
          var a = document.createElement("a"); a.href = it.url; a.id = "sug-" + k; a.setAttribute("role", "option"); a.setAttribute("aria-selected", "false");
          var t = document.createElement("span"); t.textContent = it.titulo;
          var tp = document.createElement("span"); tp.className = "tipo"; tp.textContent = ROTULOS[it.tipo] || it.tipo;
          a.appendChild(t); a.appendChild(tp); li.appendChild(a); lista.appendChild(li);
        });
        var todos = document.createElement("li"); todos.setAttribute("role", "presentation");
        var at = document.createElement("a"); at.href = "/busca/?q=" + encodeURIComponent(q); at.id = "sug-todos"; at.setAttribute("role", "option"); at.setAttribute("aria-selected", "false");
        at.textContent = itens.length ? "Ver todos os resultados" : "Nenhuma sugestão. Buscar assim mesmo";
        todos.appendChild(at); lista.appendChild(todos);
        lista.hidden = false; input.setAttribute("aria-expanded", "true");
        if (status) status.textContent = itens.length + (itens.length === 1 ? " sugestão disponível" : " sugestões disponíveis") + ". Use as setas para navegar.";
      }).catch(fechar);
    }
    input.addEventListener("input", mostrar);
    input.addEventListener("keydown", function (e) {
      var as = lista.querySelectorAll("a");
      if (lista.hidden) return;
      if (e.key === "ArrowDown") { e.preventDefault(); marcar((ativo + 1) % as.length); }
      else if (e.key === "ArrowUp") { e.preventDefault(); marcar((ativo - 1 + as.length) % as.length); }
      else if (e.key === "Enter" && ativo >= 0) { e.preventDefault(); as[ativo].click(); }
      else if (e.key === "Escape") { fechar(); }
    });
    document.addEventListener("click", function (e) { if (!e.target.closest(".busca-topo")) fechar(); });
    input.addEventListener("focus", function () { carregar(); });
  }

  // ---------- página de resultados ----------
  function pagina() {
    var cont = document.getElementById("resultados");
    if (!cont) return;
    var form = document.getElementById("form-busca-pagina");
    var q = new URLSearchParams(location.search).get("q") || "";
    var campo = document.getElementById("q-pagina"), tipo = document.getElementById("tipo-busca");
    var resumo = document.getElementById("resumo-busca");
    campo.value = q;
    function render() {
      carregar().then(function () {
        var termo = campo.value.trim();
        cont.innerHTML = "";
        if (!termo) { resumo.textContent = "Digite o que você procura."; return; }
        var res = buscar(termo, tipo.value);
        resumo.textContent = res.length + (res.length === 1 ? " resultado" : " resultados") + " para “" + termo + "”" + (tipo.value ? " em " + ROTULOS[tipo.value].toLowerCase() + "s" : "") + ".";
        if (!res.length) { cont.innerHTML = '<div class="sem-resultados"><p><strong>Nada encontrado.</strong></p><p>Tente outras palavras, como “denúncia”, “poda” ou “licença”.</p></div>'; return; }
        res.slice(0, 50).forEach(function (it) {
          var li = document.createElement("li");
          li.className = "card card-link";
          var b = document.createElement("span"); b.className = "badge badge-azul"; b.textContent = ROTULOS[it.tipo] || it.tipo;
          var h = document.createElement("h2"); var a = document.createElement("a"); a.href = it.url; a.textContent = it.titulo; h.appendChild(a);
          var p = document.createElement("p"); p.textContent = it.resumo || "";
          li.appendChild(b); li.appendChild(h); li.appendChild(p); cont.appendChild(li);
        });
      });
    }
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var u = new URL(location.href); u.searchParams.set("q", campo.value.trim()); history.replaceState(null, "", u); render();
    });
    tipo.addEventListener("change", render);
    render();
  }

  document.addEventListener("DOMContentLoaded", function () { sugestoes(); pagina(); });
})();
