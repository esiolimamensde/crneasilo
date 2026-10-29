/* Mapa da denúncia: carregado somente quando o cidadão pede (privacidade e desempenho) */
(function () {
  var CENTRO = [-20.0258, -48.9344]; // Frutal (MG) — aproximado
  document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("mapa-ativar"), aviso = document.getElementById("mapa-aviso"), alvo = document.getElementById("mapa-denuncia");
    if (!btn || !alvo) return;
    btn.hidden = false; aviso.textContent = "O mapa é opcional. Ele carrega mapas do OpenStreetMap quando você clica no botão.";
    var lat = document.getElementById("latitude"), lng = document.getElementById("longitude"), info = document.getElementById("mapa-coord");

    function css(href) { var l = document.createElement("link"); l.rel = "stylesheet"; l.href = href; document.head.appendChild(l); }
    btn.addEventListener("click", function () {
      btn.disabled = true; btn.textContent = "Carregando mapa…";
      css("/assets/vendor/leaflet/leaflet.css");
      var s = document.createElement("script"); s.src = "/assets/vendor/leaflet/leaflet.js";
      s.onerror = function () { btn.disabled = false; btn.textContent = "Não foi possível carregar. Tentar de novo"; };
      s.onload = function () {
        alvo.hidden = false; btn.hidden = true;
        var L = window.L, mapa = L.map(alvo).setView(CENTRO, 13), marcador = null;
        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, attribution: "© Colaboradores do OpenStreetMap" }).addTo(mapa);
        function marcar(p) {
          if (marcador) marcador.setLatLng(p); else marcador = L.marker(p).addTo(mapa);
          lat.value = p.lat.toFixed(6); lng.value = p.lng.toFixed(6);
          info.textContent = "Local marcado: latitude " + lat.value + ", longitude " + lng.value + ".";
        }
        mapa.on("click", function (e) { marcar(e.latlng); });
        // Alternativa por teclado: marcar o centro atual do mapa
        var centro = document.createElement("button"); centro.type = "button"; centro.className = "btn btn-terciario";
        centro.textContent = "Marcar o centro do mapa como local"; centro.style.marginTop = ".5rem";
        centro.addEventListener("click", function () { marcar(mapa.getCenter()); });
        alvo.insertAdjacentElement("afterend", centro);
        var limpar = document.createElement("button"); limpar.type = "button"; limpar.className = "btn btn-terciario"; limpar.textContent = "Remover marcação"; limpar.style.cssText = "margin:.5rem 0 0 .5rem";
        limpar.addEventListener("click", function () { if (marcador) { mapa.removeLayer(marcador); marcador = null; } lat.value = lng.value = ""; info.textContent = "Marcação removida."; });
        centro.insertAdjacentElement("afterend", limpar);
      };
      document.body.appendChild(s);
    });
  });
})();
