// API mínima da Secretaria de Meio Ambiente: formulários, protocolos e agendamentos.
// Uso: `npm run build && npm run serve:api`  (serve o site em _site e a API em /api)
const fs = require("node:fs");
const path = require("node:path");
const crypto = require("node:crypto");
const express = require("express");
const multer = require("multer");
const baseConfig = require("./config");
const { abrir } = require("./db");
const { registrar, FORMATO } = require("./protocolo");
const { validar, validarAgenda, tipoDoArquivo } = require("./validacao");
const { enviar } = require("./email");

const TIPOS = ["contato", "solicitacao", "denuncia", "agendamento", "arborizacao", "newsletter"];
const ROTULO_TIPO = { contato: "Mensagem de contato", solicitacao: "Solicitação", denuncia: "Denúncia ambiental", agendamento: "Agendamento", arborizacao: "Arborização" };
const SITUACOES = { recebido: "Recebido", em_analise: "Em análise", em_atendimento: "Em atendimento", concluido: "Concluído", arquivado: "Arquivado" };
const CAMPOS_ARQUIVO = { contato: ["anexo"], solicitacao: ["anexos"], denuncia: ["fotos"], arborizacao: ["fotos"], agendamento: [], newsletter: [] };

const esc = (t) => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dataBR = (iso) => { const d = new Date(iso); return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`; };

function criarApp(opcoes = {}) {
  const config = { ...baseConfig, ...opcoes };
  const db = abrir(config.dbPath);
  const app = express();
  if (config.trustProxy) app.set("trust proxy", 1);
  app.disable("x-powered-by");

  // ---- cabeçalhos de segurança ----
  app.use((req, res, next) => {
    res.set({
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "SAMEORIGIN",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
    });
    if (req.path.startsWith("/api/")) res.set("Cache-Control", "no-store");
    if (config.corsOrigin) {
      res.set({ "Access-Control-Allow-Origin": config.corsOrigin, "Access-Control-Allow-Headers": "Content-Type, Authorization", "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS" });
      if (req.method === "OPTIONS") return res.sendStatus(204);
    }
    next();
  });

  // ---- limite de envios por IP (em memória; IPs não são gravados) ----
  const envios = new Map();
  function limitado(req, max) {
    const agora = Date.now(), chave = req.ip;
    const lista = (envios.get(chave) || []).filter((t) => agora - t < config.limites.janelaMs);
    lista.push(agora); envios.set(chave, lista);
    if (envios.size > 5000) for (const [k, v] of envios) if (!v.some((t) => agora - t < config.limites.janelaMs)) envios.delete(k);
    return lista.length > max;
  }

  function responder(req, res, status, corpo) {
    if (req.accepts(["json", "html"]) === "html") {
      const msg = corpo.ok ? `Recebido com sucesso. ${corpo.protocolo ? "Seu protocolo: <strong>" + esc(corpo.protocolo) + "</strong>." : ""} ${esc(corpo.mensagem || "")}` : Object.values(corpo.erros || {}).concat(corpo.mensagem || []).map(esc).join("<br>");
      return res.status(status).type("html").send(`<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Resultado do envio</title><body style="font-family:system-ui;max-width:40rem;margin:2rem auto;padding:0 1rem;line-height:1.6"><h1>${corpo.ok ? "Recebemos o seu pedido" : "Não foi possível enviar"}</h1><p>${msg}</p><p><a href="/">Voltar ao início</a></p></body></html>`);
    }
    return res.status(status).json(corpo);
  }

  const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: config.arquivos.maxBytes, files: config.arquivos.maxArquivos, fields: 40, fieldSize: 20 * 1024 } }).any();
  const corpoSimples = [express.urlencoded({ extended: false, limit: "100kb" }), express.json({ limit: "100kb" })];

  // ---- envio de formulários ----
  app.post("/api/:tipo", (req, res, next) => {
    if (!TIPOS.includes(req.params.tipo)) return next();
    const ehMultipart = (req.headers["content-type"] || "").startsWith("multipart/");
    const processar = ehMultipart ? (cb) => upload(req, res, cb) : (cb) => { express.urlencoded({ extended: false, limit: "100kb" })(req, res, (e) => e ? cb(e) : express.json({ limit: "100kb" })(req, res, cb)); };
    processar((erroUpload) => {
      tratar(req, res, erroUpload).catch((e) => { console.error(e); responder(req, res, 500, { ok: false, mensagem: `Erro interno. Tente novamente ou ligue para ${config.telefone}.` }); });
    });
  });

  async function tratar(req, res, erroUpload) {
    const tipo = req.params.tipo;
    const corpo = req.body || {};

    // Armadilha para robôs: campo invisível preenchido => finge sucesso e descarta
    if (corpo.website) return responder(req, res, 200, { ok: true, mensagem: "Recebido." });

    const temTempo = corpo._t !== undefined && corpo._t !== "";
    if (limitado(req, temTempo ? config.limites.maxEnvios : 3)) return responder(req, res, 429, { ok: false, mensagem: "Muitos envios em pouco tempo. Aguarde alguns minutos e tente de novo." });
    if (temTempo) {
      const t = Number(corpo._t);
      if (!Number.isFinite(t) || Date.now() - t < config.limites.tempoMinimoMs) return responder(req, res, 422, { ok: false, mensagem: "O envio foi muito rápido. Aguarde alguns segundos e envie novamente." });
    }

    if (erroUpload) {
      const campo = erroUpload.field || CAMPOS_ARQUIVO[tipo][0] || "arquivos";
      const msg = erroUpload.code === "LIMIT_FILE_SIZE" ? "Cada arquivo pode ter até 5 MB." : erroUpload.code === "LIMIT_FILE_COUNT" || erroUpload.code === "LIMIT_UNEXPECTED_FILE" ? "Quantidade de arquivos acima do permitido." : "Não foi possível ler o envio.";
      return responder(req, res, 422, { ok: false, erros: { [campo]: msg } });
    }

    const { dados, erros } = validar(tipo, corpo);

    // arquivos: extensão permitida + assinatura real
    const arquivos = [];
    for (const f of req.files || []) {
      if (!CAMPOS_ARQUIVO[tipo].includes(f.fieldname)) { erros[f.fieldname] = "Este formulário não aceita arquivos neste campo."; continue; }
      const real = tipoDoArquivo(f.buffer);
      if (!real) { erros[f.fieldname] = `O arquivo “${f.originalname}” não é permitido. Use JPG, PNG, WebP ou PDF.`; continue; }
      if (tipo === "denuncia" && real === "pdf") { erros[f.fieldname] = "Envie fotos em JPG, PNG ou WebP."; continue; }
      arquivos.push({ buffer: f.buffer, ext: real, campo: f.fieldname });
    }

    let agenda = null;
    if (tipo === "agendamento" && !erros.data && !erros.horario) {
      const msg = validarAgenda(dados.data, dados.horario);
      if (msg) erros[dados.horario && !config.horarios.includes(dados.horario) ? "horario" : "data"] = msg;
      else {
        const { n } = db.prepare("SELECT COUNT(*) AS n FROM agendamentos WHERE data = ? AND horario = ?").get(dados.data, dados.horario);
        if (n >= config.vagasPorHorario) erros.horario = "Esse horário acabou de ser preenchido. Escolha outro.";
        else agenda = { data: dados.data, horario: dados.horario };
      }
    }

    if (Object.keys(erros).length) return responder(req, res, 422, { ok: false, erros });

    // ---- newsletter: sem protocolo ----
    if (tipo === "newsletter") {
      db.prepare("INSERT OR IGNORE INTO newsletter (email, consentimento_em) VALUES (?, ?)").run(dados.email.toLowerCase(), new Date().toISOString());
      return responder(req, res, 200, { ok: true, mensagem: "Inscrição recebida. Você pode pedir o cancelamento a qualquer momento pelo Fale conosco." });
    }

    // ---- denúncia anônima: não guarda nenhum dado de identificação ----
    const anonimo = tipo === "denuncia" && dados.identificacao === "anonima";
    if (anonimo) { delete dados.nome; delete dados.email; delete dados.telefone; delete dados.consentimento; }

    const numero = registrar(db, { tipo, dados, anonimo, agenda });

    if (arquivos.length) {
      const pasta = path.join(config.uploadDir, numero);
      fs.mkdirSync(pasta, { recursive: true });
      arquivos.forEach((a, i) => fs.writeFileSync(path.join(pasta, `${a.campo}-${i + 1}.${a.ext}`), a.buffer, { mode: 0o640 }));
    }

    // e-mails (sem bloquear a resposta)
    const resumo = `${ROTULO_TIPO[tipo]} — protocolo ${numero}`;
    if (dados.email) {
      let texto = `Olá${dados.nome ? ", " + dados.nome : ""}!\n\nRecebemos o seu pedido na Secretaria Municipal de Meio Ambiente de Frutal.\nProtocolo: ${numero}\n`;
      if (agenda) texto += `Agendamento: ${agenda.data.split("-").reverse().join("/")} às ${agenda.horario}.\n`;
      texto += `\nAcompanhe em /servicos/consultar-protocolo/ com este número.\n\nEsta é uma mensagem automática.`;
      enviar({ para: dados.email, assunto: `Confirmação — ${resumo}`, texto }, config);
    }
    if (config.notificarEmail) enviar({ para: config.notificarEmail, assunto: `Novo protocolo: ${resumo}`, texto: `Novo registro ${numero} (${tipo}). Consulte as rotas administrativas da API para detalhes.` }, config);

    const mensagem = agenda ? `Agendamento registrado para ${agenda.data.split("-").reverse().join("/")} às ${agenda.horario}. ${dados.email ? "Enviamos a confirmação para o seu e-mail." : ""}`
      : anonimo ? "Sua denúncia anônima foi registrada. Use o número acima para acompanhar o andamento." : dados.email ? "Enviamos uma confirmação para o seu e-mail." : "Guarde este número para acompanhar.";
    return responder(req, res, 201, { ok: true, protocolo: numero, mensagem });
  }

  // ---- consulta de protocolo ----
  app.get("/api/protocolo/:numero", (req, res) => {
    const n = String(req.params.numero).toUpperCase();
    if (!FORMATO.test(n)) return res.status(400).json({ ok: false, mensagem: "Número de protocolo inválido." });
    if (limitado(req, 60)) return res.status(429).json({ ok: false, mensagem: "Muitas consultas. Aguarde alguns minutos." });
    const p = db.prepare("SELECT numero, tipo, situacao, criado_em, atualizado_em FROM protocolos WHERE numero = ?").get(n);
    if (!p) return res.status(404).json({ ok: false, mensagem: "Protocolo não encontrado." });
    res.json({ ok: true, numero: p.numero, tipo: ROTULO_TIPO[p.tipo], situacao: SITUACOES[p.situacao] || p.situacao, criadoEm: dataBR(p.criado_em), atualizadoEm: dataBR(p.atualizado_em) });
  });

  // ---- horários de agendamento ----
  app.get("/api/agendamento/horarios", (req, res) => {
    const data = String(req.query.data || "");
    const erro = validarAgenda(data, config.horarios[0]);
    if (erro) return res.json({ ok: true, horarios: [], mensagem: erro });
    const ocupados = db.prepare("SELECT horario, COUNT(*) AS n FROM agendamentos WHERE data = ? GROUP BY horario").all(data);
    const cheios = new Set(ocupados.filter((o) => o.n >= config.vagasPorHorario).map((o) => o.horario));
    const livres = config.horarios.filter((h) => !cheios.has(h));
    res.json({ ok: true, horarios: livres, mensagem: livres.length ? "" : "Todos os horários deste dia estão preenchidos. Escolha outra data." });
  });

  // ---- rotas administrativas simples (token em ADMIN_TOKEN) ----
  function admin(req, res, next) {
    if (!config.adminToken) return res.status(404).json({ ok: false });
    const dado = Buffer.from(String(req.headers.authorization || "").replace(/^Bearer\s+/i, ""));
    const certo = Buffer.from(config.adminToken);
    if (dado.length !== certo.length || !crypto.timingSafeEqual(dado, certo)) return res.status(401).json({ ok: false, mensagem: "Não autorizado." });
    next();
  }
  app.get("/api/admin/protocolos", admin, (req, res) => {
    const linhas = db.prepare("SELECT numero, tipo, situacao, anonimo, dados, criado_em, atualizado_em FROM protocolos ORDER BY criado_em DESC LIMIT 200").all();
    res.json({ ok: true, protocolos: linhas.map((l) => ({ ...l, dados: JSON.parse(l.dados) })) });
  });
  app.patch("/api/admin/protocolos/:numero", admin, corpoSimples, (req, res) => {
    const situacao = req.body && req.body.situacao;
    if (!SITUACOES[situacao]) return res.status(422).json({ ok: false, mensagem: "Situação inválida.", validas: Object.keys(SITUACOES) });
    const r = db.prepare("UPDATE protocolos SET situacao = ?, atualizado_em = ? WHERE numero = ?").run(situacao, new Date().toISOString(), String(req.params.numero).toUpperCase());
    if (!r.changes) return res.status(404).json({ ok: false, mensagem: "Protocolo não encontrado." });
    res.json({ ok: true });
  });

  app.use("/api", (req, res) => res.status(404).json({ ok: false, mensagem: "Rota não encontrada." }));

  // ---- site estático ----
  app.use(express.static(config.siteDir, { extensions: ["html"], maxAge: "1h", setHeaders: (res, p) => { if (/\.(woff2|svg|css|js)$/.test(p) && p.includes(`${path.sep}assets${path.sep}`)) res.set("Cache-Control", "public, max-age=86400"); } }));
  app.use((req, res) => {
    const f = path.join(config.siteDir, "404.html");
    res.status(404);
    fs.existsSync(f) ? res.sendFile(f) : res.type("text").send("Página não encontrada.");
  });

  // eslint-disable-next-line no-unused-vars
  app.use((err, req, res, next) => { console.error(err); res.status(500).json({ ok: false, mensagem: "Erro interno." }); });

  app.locals.db = db;
  return app;
}

if (require.main === module) {
  const app = criarApp();
  app.listen(baseConfig.porta, () => console.log(`Site e API em http://localhost:${baseConfig.porta}`));
}

module.exports = { criarApp };
