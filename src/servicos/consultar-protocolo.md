---
title: Consultar protocolo
ordem: 7
icone: search
categoria: Acompanhamento
semFormulario: true
acaoUrl: "#consulta"
acaoTexto: Consultar protocolo
resumo: Acompanhe o andamento de qualquer solicitação, denúncia ou agendamento.
oQueE: Consulta do andamento de um pedido feito neste site, usando o número de protocolo recebido ao enviar o formulário.
quemPode: Qualquer pessoa que tenha o número de protocolo.
documentos:
  - Apenas o número de protocolo (exemplo SMMA-2026-000123)
passos:
  - Digite o número de protocolo no campo abaixo.
  - Clique em “Consultar protocolo”.
  - Veja a situação e a data da última atualização.
prazo: Resultado imediato.
custo: Gratuito.
canais:
  - { tipo: Online, texto: "esta página" }
  - { tipo: Telefone, texto: "[●]" }
baseLegal: ""
scripts: ["/assets/js/forms.js"]
---
<section id="consulta" aria-labelledby="h-cons">
  <h2 id="h-cons">Consulte seu protocolo</h2>
  <form class="form" data-consulta novalidate>
    <div class="campo">
      <label for="num-protocolo">Número do protocolo <span class="obrigatorio" aria-hidden="true">*</span></label>
      <p class="instrucao" id="num-instr">Formato: SMMA-ANO-NÚMERO. Exemplo: SMMA-2026-000123.</p>
      <input type="text" id="num-protocolo" name="numero" required aria-describedby="num-instr" autocomplete="off" pattern="SMMA-[0-9]{4}-[0-9]{6}">
    </div>
    <div><button class="btn btn-primario" type="submit">Consultar protocolo</button></div>
    <div id="resultado-protocolo" role="status" aria-live="polite"></div>
  </form>
</section>
