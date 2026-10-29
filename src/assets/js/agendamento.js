/* Agendamento: mostra campo da escola e busca horários disponíveis */
(function () {
  document.addEventListener("DOMContentLoaded", function () {
    var tipo = document.getElementById("tipoAgendamento"), escola = document.getElementById("bloco-escola");
    var data = document.getElementById("data"), horario = document.getElementById("horario"), status = document.getElementById("horarios-status");
    if (!tipo || !data) return;
    var base = (document.querySelector('meta[name="api-base"]') || {}).content || "";
    var hoje = new Date(); hoje.setDate(hoje.getDate() + 1);
    data.min = hoje.toISOString().slice(0, 10);

    tipo.addEventListener("change", function () { escola.hidden = tipo.value !== "palestra"; });
    data.addEventListener("change", function () {
      horario.innerHTML = '<option value="">Selecione…</option>'; horario.disabled = true;
      if (!data.value) return;
      status.textContent = "Buscando horários…";
      fetch(base + "/api/agendamento/horarios?data=" + encodeURIComponent(data.value)).then(function (r) { return r.json(); }).then(function (r) {
        if (!r.horarios || !r.horarios.length) { status.textContent = r.mensagem || "Não há horários nesta data. Escolha outro dia útil."; return; }
        r.horarios.forEach(function (h) { var o = document.createElement("option"); o.value = h; o.textContent = h; horario.appendChild(o); });
        horario.disabled = false; status.textContent = r.horarios.length + " horários disponíveis. Escolha um no campo acima.";
      }).catch(function () { status.textContent = "Não foi possível buscar os horários agora. Tente novamente ou ligue para a Secretaria."; });
    });
  });
})();
