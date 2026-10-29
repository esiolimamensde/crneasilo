const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { criarApp } = require("../api/server");

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "smma-"));
const app = criarApp({
  dbPath: ":memory:", uploadDir: path.join(tmp, "up"), outboxLog: path.join(tmp, "outbox.log"), siteDir: path.join(tmp, "site"),
  adminToken: "segredo-de-teste", limites: { janelaMs: 60000, maxEnvios: 100, tempoMinimoMs: 0 },
});
let servidor, base;
test.before(async () => { await new Promise((r) => { servidor = app.listen(0, r); }); base = `http://127.0.0.1:${servidor.address().port}`; });
test.after(() => servidor.close());

const post = (tipo, campos, arquivos = []) => {
  const fd = new FormData();
  for (const [k, v] of Object.entries({ _t: String(Date.now() - 10000), ...campos })) fd.append(k, v);
  for (const a of arquivos) fd.append(a.campo, new Blob([a.bytes]), a.nome);
  return fetch(`${base}/api/${tipo}`, { method: "POST", body: fd, headers: { Accept: "application/json" } }).then(async (r) => ({ status: r.status, corpo: await r.json() }));
};
const amanhaUtil = () => { const d = new Date(); do { d.setDate(d.getDate() + 1); } while ([0, 6].includes(d.getDay())); return d.toISOString().slice(0, 10); };
const contatoOk = { nome: "Maria Silva", email: "maria@exemplo.com", assunto: "duvida", mensagem: "Olá, tenho uma dúvida.", consentimento: "sim" };
const JPG = Buffer.concat([Buffer.from([0xff, 0xd8, 0xff, 0xe0]), Buffer.alloc(32)]);

test("contato válido gera protocolo no formato SMMA-AAAA-NNNNNN", async () => {
  const r = await post("contato", contatoOk);
  assert.equal(r.status, 201);
  assert.match(r.corpo.protocolo, /^SMMA-\d{4}-\d{6}$/);
});

test("protocolos são sequenciais e consultáveis sem dados pessoais", async () => {
  const a = await post("contato", contatoOk), b = await post("contato", contatoOk);
  assert.equal(Number(b.corpo.protocolo.slice(-6)), Number(a.corpo.protocolo.slice(-6)) + 1);
  const c = await fetch(`${base}/api/protocolo/${b.corpo.protocolo}`).then((r) => r.json());
  assert.equal(c.situacao, "Recebido");
  assert.ok(!JSON.stringify(c).includes("maria@exemplo.com"));
});

test("consulta de protocolo: formato inválido (400) e inexistente (404)", async () => {
  assert.equal((await fetch(`${base}/api/protocolo/abc`)).status, 400);
  assert.equal((await fetch(`${base}/api/protocolo/SMMA-2000-000001`)).status, 404);
});

test("validação no servidor devolve mensagens específicas por campo", async () => {
  const r = await post("contato", { nome: "", email: "invalido", assunto: "x", mensagem: "", consentimento: "" });
  assert.equal(r.status, 422);
  assert.match(r.corpo.erros.nome, /Preencha o campo/);
  assert.match(r.corpo.erros.email, /e-mail válido/);
  assert.match(r.corpo.erros.assunto, /opção válida/);
  assert.ok(r.corpo.erros.mensagem && r.corpo.erros.consentimento);
});

test("honeypot preenchido: finge sucesso e não registra", async () => {
  const antes = app.locals.db.prepare("SELECT COUNT(*) n FROM protocolos").get().n;
  const r = await post("contato", { ...contatoOk, website: "http://spam" });
  assert.equal(r.status, 200); assert.equal(r.corpo.protocolo, undefined);
  assert.equal(app.locals.db.prepare("SELECT COUNT(*) n FROM protocolos").get().n, antes);
});

test("denúncia anônima não guarda identificação", async () => {
  const r = await post("denuncia", { identificacao: "anonima", nome: "Fulano", email: "fulano@exemplo.com", telefone: "34999990000", categoria: "queimada", endereco: "Rua A, 10", descricao: "Fogo no terreno." });
  assert.equal(r.status, 201);
  const linha = app.locals.db.prepare("SELECT anonimo, dados FROM protocolos WHERE numero = ?").get(r.corpo.protocolo);
  assert.equal(linha.anonimo, 1);
  assert.ok(!/Fulano|fulano|34999990000/.test(linha.dados));
});

test("denúncia identificada exige nome, e-mail e consentimento", async () => {
  const r = await post("denuncia", { identificacao: "identificada", categoria: "queimada", endereco: "Rua A", descricao: "x" });
  assert.equal(r.status, 422);
  assert.ok(r.corpo.erros.nome && r.corpo.erros.email && r.corpo.erros.consentimento);
});

test("upload: aceita imagem real e rejeita arquivo disfarçado", async () => {
  const base1 = { identificacao: "anonima", categoria: "descarte", endereco: "Rua B", descricao: "Lixo na calçada" };
  const ok = await post("denuncia", base1, [{ campo: "fotos", nome: "foto.jpg", bytes: JPG }]);
  assert.equal(ok.status, 201);
  assert.ok(fs.readdirSync(path.join(tmp, "up", ok.corpo.protocolo)).some((f) => f.endsWith(".jpg")));
  const ruim = await post("denuncia", base1, [{ campo: "fotos", nome: "foto.jpg", bytes: Buffer.from("MZ executavel") }]);
  assert.equal(ruim.status, 422); assert.ok(ruim.corpo.erros.fotos);
});

test("upload acima de 5 MB é recusado", async () => {
  const grande = Buffer.concat([JPG, Buffer.alloc(5 * 1024 * 1024)]);
  const r = await post("denuncia", { identificacao: "anonima", categoria: "descarte", endereco: "Rua B", descricao: "Lixo" }, [{ campo: "fotos", nome: "g.jpg", bytes: grande }]);
  assert.equal(r.status, 422); assert.match(r.corpo.erros.fotos, /5 MB/);
});

test("agendamento: horários, reserva e conflito", async () => {
  const data = amanhaUtil();
  const h = await fetch(`${base}/api/agendamento/horarios?data=${data}`).then((r) => r.json());
  assert.ok(h.horarios.length > 0);
  const corpo = { tipoAgendamento: "atendimento", data, horario: h.horarios[0], nome: "João", email: "joao@exemplo.com", consentimento: "sim" };
  const a = await post("agendamento", corpo);
  assert.equal(a.status, 201);
  const b = await post("agendamento", corpo);
  assert.equal(b.status, 422); assert.match(b.corpo.erros.horario, /preenchido/);
  const h2 = await fetch(`${base}/api/agendamento/horarios?data=${data}`).then((r) => r.json());
  assert.ok(!h2.horarios.includes(corpo.horario));
});

test("agendamento: recusa fim de semana e datas passadas", async () => {
  const sab = new Date(); sab.setDate(sab.getDate() + ((6 - sab.getDay() + 7) % 7 || 7));
  const r = await post("agendamento", { tipoAgendamento: "atendimento", data: sab.toISOString().slice(0, 10), horario: "09:00", nome: "A", email: "a@b.co", consentimento: "sim" });
  assert.equal(r.status, 422); assert.match(r.corpo.erros.data, /dia útil/);
  const p = await post("agendamento", { tipoAgendamento: "atendimento", data: "2020-01-06", horario: "09:00", nome: "A", email: "a@b.co", consentimento: "sim" });
  assert.match(p.corpo.erros.data, /a partir de amanhã/);
});

test("palestra exige escola; solicitação de licença exige documento", async () => {
  const p = await post("agendamento", { tipoAgendamento: "palestra", data: amanhaUtil(), horario: "09:00", nome: "A", email: "a@b.co", consentimento: "sim" });
  assert.ok(p.corpo.erros.escola);
  const l = await post("solicitacao", { assunto: "licenca-previa", nome: "A", email: "a@b.co", endereco: "Rua", descricao: "x", consentimento: "sim" });
  assert.ok(l.corpo.erros.documento);
});

test("envio rápido demais (campo _t) é recusado", async () => {
  const fd = new FormData(); Object.entries({ ...contatoOk, _t: String(Date.now()) }).forEach(([k, v]) => fd.append(k, v));
  const app2 = criarApp({ dbPath: ":memory:", siteDir: tmp, uploadDir: tmp, outboxLog: path.join(tmp, "o2.log"), limites: { janelaMs: 60000, maxEnvios: 100, tempoMinimoMs: 5000 } });
  const s = await new Promise((r) => { const x = app2.listen(0, () => r(x)); });
  const r = await fetch(`http://127.0.0.1:${s.address().port}/api/contato`, { method: "POST", body: fd, headers: { Accept: "application/json" } });
  s.close(); assert.equal(r.status, 422);
});

test("limite de envios por IP (429)", async () => {
  const app3 = criarApp({ dbPath: ":memory:", siteDir: tmp, uploadDir: tmp, outboxLog: path.join(tmp, "o3.log"), limites: { janelaMs: 60000, maxEnvios: 2, tempoMinimoMs: 0 } });
  const s = await new Promise((r) => { const x = app3.listen(0, () => r(x)); });
  const url = `http://127.0.0.1:${s.address().port}/api/newsletter`;
  const enviar = () => { const fd = new FormData(); fd.append("email", "a@b.co"); fd.append("consentimento", "sim"); fd.append("_t", String(Date.now() - 9000)); return fetch(url, { method: "POST", body: fd, headers: { Accept: "application/json" } }); };
  const codigos = []; for (let i = 0; i < 4; i++) codigos.push((await enviar()).status);
  s.close(); assert.deepEqual(codigos.slice(0, 2), [200, 200]); assert.equal(codigos[3], 429);
});

test("e-mail de confirmação é registrado no outbox (sem SMTP)", async () => {
  await post("contato", contatoOk);
  await new Promise((r) => setTimeout(r, 50));
  assert.match(fs.readFileSync(path.join(tmp, "outbox.log"), "utf8"), /maria@exemplo.com/);
});

test("rotas administrativas exigem token", async () => {
  assert.equal((await fetch(`${base}/api/admin/protocolos`)).status, 401);
  const h = { Authorization: "Bearer segredo-de-teste", "Content-Type": "application/json" };
  const lista = await fetch(`${base}/api/admin/protocolos`, { headers: h }).then((r) => r.json());
  const n = lista.protocolos[0].numero;
  assert.equal((await fetch(`${base}/api/admin/protocolos/${n}`, { method: "PATCH", headers: h, body: JSON.stringify({ situacao: "concluido" }) })).status, 200);
  assert.equal((await fetch(`${base}/api/protocolo/${n}`).then((r) => r.json())).situacao, "Concluído");
  assert.equal((await fetch(`${base}/api/admin/protocolos/${n}`, { method: "PATCH", headers: h, body: JSON.stringify({ situacao: "x" }) })).status, 422);
});

test("newsletter exige consentimento explícito", async () => {
  const sem = await post("newsletter", { email: "a@b.co" });
  assert.equal(sem.status, 422); assert.ok(sem.corpo.erros.consentimento);
  assert.equal((await post("newsletter", { email: "a@b.co", consentimento: "sim" })).status, 200);
});
