const path = require("node:path");

const raiz = path.resolve(__dirname, "..");
const env = process.env;

module.exports = {
  porta: parseInt(env.PORT || "3000", 10),
  siteDir: env.SITE_DIR || path.join(raiz, "_site"),
  dbPath: env.DB_PATH || path.join(__dirname, "data", "smma.sqlite"),
  uploadDir: env.UPLOAD_DIR || path.join(__dirname, "uploads"),
  outboxLog: env.OUTBOX_LOG || path.join(__dirname, "data", "outbox.log"),
  corsOrigin: env.CORS_ORIGIN || "", // vazio = mesmo domínio
  trustProxy: env.TRUST_PROXY === "1",
  adminToken: env.ADMIN_TOKEN || "", // vazio = rotas administrativas desligadas
  notificarEmail: env.NOTIFY_EMAIL || "", // e-mail da Secretaria que recebe avisos de novos protocolos
  smtp: env.SMTP_HOST
    ? { host: env.SMTP_HOST, port: parseInt(env.SMTP_PORT || "587", 10), secure: env.SMTP_SECURE === "1", auth: env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined, from: env.SMTP_FROM || env.SMTP_USER }
    : null,
  limites: { janelaMs: 10 * 60 * 1000, maxEnvios: parseInt(env.RATE_MAX || "10", 10), tempoMinimoMs: parseInt(env.TEMPO_MINIMO_MS || "3000", 10) },
  // Horários de atendimento para agendamento — a Secretaria deve confirmar [●]
  horarios: (env.HORARIOS || "08:00,09:00,10:00,11:00,13:00,14:00,15:00,16:00").split(","),
  vagasPorHorario: parseInt(env.VAGAS_POR_HORARIO || "1", 10),
  arquivos: { maxBytes: 5 * 1024 * 1024, maxArquivos: 5 },
  telefone: env.SITE_TELEFONE || "o telefone da Secretaria",
};
