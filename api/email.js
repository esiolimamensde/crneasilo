// Envio de e-mails. Sem SMTP configurado, registra em api/data/outbox.log (útil em desenvolvimento).
const fs = require("node:fs");
const path = require("node:path");
const baseConfig = require("./config");

let transporte = null;
function obterTransporte(config) {
  if (!config.smtp) return null;
  if (!transporte) transporte = require("nodemailer").createTransport(config.smtp);
  return transporte;
}

async function enviar({ para, assunto, texto }, config = baseConfig) {
  if (!para) return;
  const t = obterTransporte(config);
  try {
    if (t) await t.sendMail({ from: config.smtp.from, to: para, subject: assunto, text: texto });
    else {
      fs.mkdirSync(path.dirname(config.outboxLog), { recursive: true });
      fs.appendFileSync(config.outboxLog, JSON.stringify({ em: new Date().toISOString(), para, assunto, texto }) + "\n");
    }
  } catch (e) {
    console.error("Falha ao enviar e-mail:", e.message); // não derruba o protocolo já registrado
  }
}

module.exports = { enviar };
