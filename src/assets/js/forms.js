/* Formulários: validação acessível no cliente, envio para a API e consulta de protocolo */
(function () {
  var base = (document.querySelector('meta[name="api-base"]') || {}).content || "";
  var TEL_FALHA = "Tente novamente em alguns minutos ou fale com a Secretaria pelo telefone ou presencialmente (veja a página Contato).";

  function rotuloDe(el) {
    var l = el.id && document.querySelector('label[for="' + el.id + '"]');
    if (!l) { var lg = el.closest("fieldset"); l = lg && lg.querySelector("legend"); }
    return l ? l.textContent.replace(/\*|\(obrigatório\)|\(opcional\)/g, "").replace(/\s+/g, " ").trim() : el.name;
  }
  function erroEl(el) { return document.getElementById(el.id + "-erro"); }

  function validar(el) {
    var v = el.value.trim(), r = rotuloDe(el);
    if (el.type === "checkbox") return el.required && !el.checked ? "Marque a caixa para concordar e continuar." : "";
    if (el.type === "file") {
      var max = (parseFloat(el.dataset.maxMb) || 5) * 1024 * 1024, n = el.files.length, lim = parseInt(el.dataset.maxArquivos || "1", 10);
      if (el.required && !n) return "Anexe pelo menos um arquivo em “" + r + "”.";
      if (n > lim) return "Envie no máximo " + lim + (lim === 1 ? " arquivo." : " arquivos.");
      for (var i = 0; i < n; i++) {
        if (el.files[i].size > max) return "O arquivo “" + el.files[i].name + "” é maior que " + el.dataset.maxMb + " MB.";
        if (!/\.(jpe?g|png|webp|pdf)$/i.test(el.files[i].name)) return "O arquivo “" + el.files[i].name + "” não é permitido. Use JPG, PNG, WebP ou PDF.";
      }
      return "";
    }
    if (el.required && !v) return el.tagName === "SELECT" ? "Escolha uma opção em “" + r + "”." : "Preencha o campo “" + r + "”.";
    if (!v) return "";
    if (el.type === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Informe um e-mail válido, como nome@exemplo.com.";
    if (el.type === "tel" && !/^\d{10,11}$/.test(v.replace(/\D/g, ""))) return "Informe o telefone com DDD, com 10 ou 11 números. Exemplo: (34) 99999-0000.";
    if (el.name === "documento" && !/^(\d{11}|\d{14})$/.test(v.replace(/\D/g, ""))) return "Informe um CPF (11 números) ou CNPJ (14 números).";
    if (el.type === "date" && el.min && v < el.min) return "Escolha uma data a partir de " + el.min.split("-").reverse().join("/") + ".";
    return "";
  }

  function mostrarErro(el, msg) {
    var e = erroEl(el);
    if (msg) { el.setAttribute("aria-invalid", "true"); if (e) { e.textContent = msg; e.hidden = false; } }
    else { el.removeAttribute("aria-invalid"); if (e) { e.textContent = ""; e.hidden = true; } }
  }

  function campos(form) {
    return Array.prototype.filter.call(form.querySelectorAll("input, select, textarea"), function (el) {
      return !el.disabled && el.type !== "hidden" && el.name !== "website" && el.type !== "submit" && el.type !== "radio" && !el.closest("[hidden]");
    });
  }

  function resumo(form, lista) {
    var box = form.querySelector("#resumo-erros");
    if (!box) return;
    if (!lista.length) { box.hidden = true; box.innerHTML = ""; return; }
    box.innerHTML = '<h2><svg class="icon" aria-hidden="true"><use href="#i-alert"/></svg> Corrija ' + (lista.length === 1 ? "1 campo" : lista.length + " campos") + " para continuar</h2><ul></ul>";
    var ul = box.querySelector("ul");
    lista.forEach(function (it) {
      var li = document.createElement("li"), a = document.createElement("a");
      a.href = "#" + (it.el.id || ""); a.textContent = it.msg;
      a.addEventListener("click", function (ev) { ev.preventDefault(); it.el.focus(); });
      li.appendChild(a); ul.appendChild(li);
    });
    box.hidden = false; box.focus();
  }

  function enviar(form) {
    var botao = form.querySelector('button[type="submit"]'), rotulo = botao.textContent;
    botao.disabled = true; botao.textContent = "Enviando…";
    var dados = new FormData(form);
    return fetch(base + form.getAttribute("action"), { method: "POST", body: dados, headers: { Accept: "application/json" } })
      .then(function (r) { return r.json().then(function (j) { return { status: r.status, corpo: j }; }); })
      .then(function (r) {
        botao.disabled = false; botao.textContent = rotulo;
        if (r.corpo && r.corpo.ok) return sucesso(form, r.corpo);
        var erros = (r.corpo && r.corpo.erros) || {}, lista = [];
        Object.keys(erros).forEach(function (nome) {
          var el = form.elements[nome];
          if (el && el.id) { mostrarErro(el, erros[nome]); lista.push({ el: el, msg: erros[nome] }); }
          else lista.push({ el: form.querySelector("button[type=submit]"), msg: erros[nome] });
        });
        if (!lista.length) lista.push({ el: botao, msg: (r.corpo && r.corpo.mensagem) || "Não foi possível enviar. " + TEL_FALHA });
        resumo(form, lista);
      })
      .catch(function () {
        botao.disabled = false; botao.textContent = rotulo;
        resumo(form, [{ el: botao, msg: "Não foi possível enviar agora. " + TEL_FALHA }]);
      });
  }

  function sucesso(form, r) {
    var conf = document.getElementById("confirmacao");
    form.hidden = true;
    var num = document.getElementById("numero-protocolo"); if (num && r.protocolo) num.textContent = r.protocolo;
    var msg = document.getElementById("msg-confirmacao"); if (msg) msg.textContent = r.mensagem || "";
    conf.hidden = false; conf.focus(); conf.scrollIntoView({ block: "center" });
  }

  function iniciarForm(form) {
    var t = form.querySelector('input[name="_t"]'); if (t) t.value = String(Date.now());
    // Denúncia: alterna identificada/anônima
    var radios = form.querySelectorAll('input[name="identificacao"]');
    if (radios.length) {
      var blocos = [document.getElementById("bloco-identificacao"), document.getElementById("bloco-consent")];
      var alternar = function () {
        var anonima = form.querySelector('input[name="identificacao"]:checked').value === "anonima";
        blocos.forEach(function (b) {
          if (!b) return;
          b.hidden = anonima;
          b.querySelectorAll("input, select, textarea").forEach(function (el) { el.disabled = anonima; mostrarErro(el, ""); });
        });
        // O consentimento só é exigido na denúncia identificada
        var c = document.getElementById("consentimento"); if (c) c.required = !anonima;
      };
      radios.forEach(function (r) { r.addEventListener("change", alternar); }); alternar();
    }
    form.addEventListener("input", function (e) { if (e.target.getAttribute && e.target.getAttribute("aria-invalid")) mostrarErro(e.target, validar(e.target)); });
    form.addEventListener("change", function (e) { if (e.target.type === "file") mostrarErro(e.target, validar(e.target)); });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var erros = [];
      campos(form).forEach(function (el) { var m = validar(el); mostrarErro(el, m); if (m) erros.push({ el: el, msg: m }); });
      resumo(form, erros);
      if (!erros.length) enviar(form);
    });
  }

  function iniciarConsulta(form) {
    var saida = document.getElementById("resultado-protocolo"), campo = document.getElementById("num-protocolo");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = campo.value.trim().toUpperCase();
      if (!/^SMMA-\d{4}-\d{6}$/.test(n)) {
        campo.setAttribute("aria-invalid", "true");
        saida.innerHTML = '<div class="alerta alerta-erro"><svg class="icon" aria-hidden="true"><use href="#i-x-circle"/></svg><div><span class="alerta-titulo">Número inválido</span>Use o formato SMMA-ANO-NÚMERO. Exemplo: SMMA-2026-000123.</div></div>';
        campo.focus(); return;
      }
      campo.removeAttribute("aria-invalid");
      saida.textContent = "Consultando…";
      fetch(base + "/api/protocolo/" + encodeURIComponent(n)).then(function (r) { return r.json().then(function (j) { return { ok: r.ok, j: j }; }); }).then(function (r) {
        if (!r.ok) { saida.innerHTML = '<div class="alerta alerta-aviso"><svg class="icon" aria-hidden="true"><use href="#i-alert"/></svg><div><span class="alerta-titulo">Protocolo não encontrado</span>Confira o número digitado. Se o erro continuar, fale conosco.</div></div>'; return; }
        var p = r.j;
        saida.innerHTML = '<div class="alerta alerta-sucesso"><svg class="icon" aria-hidden="true"><use href="#i-check-circle"/></svg><div><span class="alerta-titulo">Protocolo ' + p.numero + '</span><p>Tipo: ' + p.tipo + '<br>Situação: <strong>' + p.situacao + '</strong><br>Registrado em: ' + p.criadoEm + '<br>Última atualização: ' + p.atualizadoEm + '</p></div></div>';
      }).catch(function () { saida.textContent = "Não foi possível consultar agora. " + TEL_FALHA; });
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("form[data-tipo]").forEach(iniciarForm);
    document.querySelectorAll("form[data-consulta]").forEach(iniciarConsulta);
    // Pré-seleção por URL (?assunto=parceria)
    var a = new URLSearchParams(location.search).get("assunto"), sel = document.getElementById("assunto");
    if (a && sel && sel.querySelector('option[value="' + a + '"]')) sel.value = a;
  });
})();
