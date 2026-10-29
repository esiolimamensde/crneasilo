/* Calendário: visualização em lista (HTML do servidor) + mês (JS), filtro por tipo e exportação .ics / Google Agenda */
(function () {
  var MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"];
  var TIPOS = { campanha: "Campanha", evento: "Evento", data: "Data comemorativa", prazo: "Prazo de serviço" };
  var eventos = [], ref = new Date(), tipoAtual = "", ultimoFoco = null;

  function pad(n) { return String(n).padStart(2, "0"); }
  function iso(a, m, d) { return a + "-" + pad(m + 1) + "-" + pad(d); }
  function compacto(s) { return s.replace(/-/g, ""); }
  function maisUmDia(s) { var d = new Date(s + "T12:00:00Z"); d.setUTCDate(d.getUTCDate() + 1); return d.toISOString().slice(0, 10); }
  function br(s) { var p = s.split("-"); return p[2] + "/" + p[1] + "/" + p[0]; }
  function esc(t) { return String(t || "").replace(/\\/g, "\\\\").replace(/;/g, "\;").replace(/,/g, "\\,").replace(/\n/g, "\\n"); }

  function ics(ev) {
    var fim = maisUmDia(ev.dataFim || ev.data);
    var linhas = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//SMMA Frutal//Calendario Ambiental//PT-BR", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + compacto(ev.data) + "-" + encodeURIComponent(ev.titulo).slice(0, 30) + "@meioambiente.frutal.mg.gov.br",
      "DTSTAMP:" + new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d+/, ""),
      "DTSTART;VALUE=DATE:" + compacto(ev.data), "DTEND;VALUE=DATE:" + compacto(fim),
      "SUMMARY:" + esc(ev.titulo), "DESCRIPTION:" + esc(ev.descricao), "LOCATION:" + esc(ev.local), "END:VEVENT", "END:VCALENDAR"];
    return linhas.join("\r\n");
  }
  function baixarIcs(ev) {
    var blob = new Blob([ics(ev)], { type: "text/calendar;charset=utf-8" });
    var a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "evento-" + ev.data + ".ics"; document.body.appendChild(a); a.click();
    setTimeout(function () { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  function linkGoogle(ev) {
    return "https://calendar.google.com/calendar/render?action=TEMPLATE&text=" + encodeURIComponent(ev.titulo) +
      "&dates=" + compacto(ev.data) + "/" + compacto(maisUmDia(ev.dataFim || ev.data)) +
      "&details=" + encodeURIComponent(ev.descricao || "") + "&location=" + encodeURIComponent(ev.local || "");
  }

  // ---- diálogo de detalhes ----
  function abrir(ev, origem) {
    var dlg = document.getElementById("cal-dialogo");
    ultimoFoco = origem;
    document.getElementById("dlg-titulo").textContent = ev.titulo;
    document.getElementById("dlg-meta").textContent = TIPOS[ev.tipo] + " · " + br(ev.data) + (ev.dataFim ? " a " + br(ev.dataFim) : "") + (ev.hora ? " · " + ev.hora : "") + (ev.local ? " · " + ev.local : "");
    document.getElementById("dlg-desc").textContent = ev.descricao || "";
    document.getElementById("dlg-google").href = linkGoogle(ev);
    document.getElementById("dlg-ics").onclick = function () { baixarIcs(ev); };
    if (dlg.showModal) dlg.showModal(); else dlg.setAttribute("open", "");
  }

  // ---- visão em mês ----
  function desenhar() {
    var ano = ref.getFullYear(), mes = ref.getMonth();
    document.getElementById("mes-titulo").textContent = MESES[mes] + " de " + ano;
    var tbody = document.querySelector("#cal-tabela tbody");
    tbody.innerHTML = "";
    var primeiro = new Date(ano, mes, 1).getDay(), dias = new Date(ano, mes + 1, 0).getDate();
    var hoje = new Date(), hojeIso = iso(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
    var d = 1 - primeiro;
    while (d <= dias) {
      var tr = document.createElement("tr");
      for (var c = 0; c < 7; c++, d++) {
        var td = document.createElement("td");
        if (d < 1 || d > dias) { td.className = "fora"; td.setAttribute("aria-hidden", "true"); tr.appendChild(td); continue; }
        var data = iso(ano, mes, d);
        if (data === hojeIso) td.className = "hoje";
        var n = document.createElement("span"); n.className = "num"; n.textContent = d; td.appendChild(n);
        eventos.forEach(function (ev) {
          if (tipoAtual && ev.tipo !== tipoAtual) return;
          if (data < ev.data || data > (ev.dataFim || ev.data)) return;
          var b = document.createElement("button"); b.type = "button"; b.className = "cal-evt"; b.setAttribute("data-tipo", ev.tipo);
          b.textContent = ev.titulo; b.setAttribute("aria-label", ev.titulo + ", " + br(data) + ", " + TIPOS[ev.tipo]);
          b.addEventListener("click", function () { abrir(ev, b); });
          td.appendChild(b);
        });
        tr.appendChild(td);
      }
      tbody.appendChild(tr);
    }
  }

  function modo(mes) {
    document.getElementById("visao-mes").hidden = !mes;
    document.getElementById("visao-lista").hidden = mes;
    document.getElementById("modo-mes").setAttribute("aria-pressed", String(mes));
    document.getElementById("modo-lista").setAttribute("aria-pressed", String(!mes));
    if (mes) desenhar();
  }

  function filtrarLista() {
    var n = 0;
    document.querySelectorAll("#cal-lista [data-evento]").forEach(function (li) {
      var ok = !tipoAtual || li.getAttribute("data-tipo") === tipoAtual;
      li.hidden = !ok; if (ok) n++;
    });
    var c = document.getElementById("cal-contador");
    if (c) c.textContent = n ? n + (n === 1 ? " item" : " itens") + " no calendário." : "Nenhum item para este filtro.";
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Botões "Adicionar ao calendário" na lista
    document.querySelectorAll(".js-add-cal").forEach(function (b) {
      b.hidden = false;
      b.addEventListener("click", function () {
        abrir({ titulo: b.dataset.titulo, data: b.dataset.data, dataFim: b.dataset.fim || null, local: b.dataset.local, descricao: b.dataset.descricao,
          tipo: b.closest("[data-evento]").getAttribute("data-tipo"), hora: "" }, b);
      });
    });
    document.getElementById("dlg-fechar").addEventListener("click", function () {
      var dlg = document.getElementById("cal-dialogo"); if (dlg.close) dlg.close(); else dlg.removeAttribute("open");
    });
    document.getElementById("cal-dialogo").addEventListener("close", function () { if (ultimoFoco) ultimoFoco.focus(); });

    document.getElementById("cal-tipo").addEventListener("change", function (e) {
      tipoAtual = e.target.value; filtrarLista();
      if (!document.getElementById("visao-mes").hidden) desenhar();
    });
    filtrarLista();

    fetch("/dados/eventos.json").then(function (r) { return r.json(); }).then(function (d) {
      eventos = d;
      document.getElementById("cal-modo-box").hidden = false;
      document.getElementById("modo-lista").addEventListener("click", function () { modo(false); });
      document.getElementById("modo-mes").addEventListener("click", function () { modo(true); });
      document.getElementById("mes-ant").addEventListener("click", function () { ref = new Date(ref.getFullYear(), ref.getMonth() - 1, 1); desenhar(); });
      document.getElementById("mes-prox").addEventListener("click", function () { ref = new Date(ref.getFullYear(), ref.getMonth() + 1, 1); desenhar(); });
      document.getElementById("mes-hoje").addEventListener("click", function () { ref = new Date(); desenhar(); });
    }).catch(function () { /* a lista em HTML continua disponível */ });
  });
})();
