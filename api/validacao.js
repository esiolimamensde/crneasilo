// Regras de validação no servidor (espelham as mensagens do formulário no navegador)
const config = require("./config");

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const opcoes = (...v) => v;

const ASSUNTOS = {
  solicitacao: opcoes("requerimento", "informacao", "certidao", "licenca-previa", "licenca-instalacao", "licenca-operacao", "supressao", "outorga", "coleta-especial", "poda-residuo", "entulho", "outro"),
  contato: opcoes("duvida", "sugestao", "elogio", "reclamacao", "parceria", "imprensa", "acessibilidade", "outro"),
};

function digitos(s) { return String(s || "").replace(/\D/g, ""); }
const limpar = (v, max) => String(v ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

function dataIsoValida(s) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const d = new Date(s + "T12:00:00Z");
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : d;
}

const ESPEC = {
  contato: {
    nome: { r: "Nome completo", obrig: true, max: 120 },
    email: { r: "E-mail", obrig: true, max: 160, tipo: "email" },
    telefone: { r: "Telefone", max: 20, tipo: "tel" },
    assunto: { r: "Assunto", obrig: true, enum: ASSUNTOS.contato },
    mensagem: { r: "Mensagem", obrig: true, max: 3000 },
    consentimento: { r: "Consentimento", obrig: true, tipo: "aceite" },
  },
  solicitacao: {
    assunto: { r: "Assunto", obrig: true, enum: ASSUNTOS.solicitacao },
    nome: { r: "Nome completo", obrig: true, max: 120 },
    email: { r: "E-mail", obrig: true, max: 160, tipo: "email" },
    telefone: { r: "Telefone", max: 20, tipo: "tel" },
    documento: { r: "CPF ou CNPJ", max: 18, tipo: "documento", obrigSe: (b) => String(b.assunto || "").startsWith("licenca") || ["supressao", "outorga"].includes(b.assunto) },
    endereco: { r: "Endereço", obrig: true, max: 200 },
    descricao: { r: "Descrição", obrig: true, max: 3000 },
    consentimento: { r: "Consentimento", obrig: true, tipo: "aceite" },
  },
  denuncia: {
    identificacao: { r: "Identificação", obrig: true, enum: opcoes("identificada", "anonima") },
    nome: { r: "Nome completo", max: 120, obrigSe: (b) => b.identificacao === "identificada" },
    email: { r: "E-mail", max: 160, tipo: "email", obrigSe: (b) => b.identificacao === "identificada" },
    telefone: { r: "Telefone", max: 20, tipo: "tel" },
    categoria: { r: "Tipo de problema", obrig: true, enum: opcoes("queimada", "descarte", "desmatamento", "poluicao-hidrica", "poluicao-sonora", "maus-tratos", "outro") },
    endereco: { r: "Endereço ou local", obrig: true, max: 200 },
    latitude: { r: "Latitude", tipo: "coord", max: 12 },
    longitude: { r: "Longitude", tipo: "coord", max: 12 },
    quando: { r: "Quando aconteceu", tipo: "data" },
    descricao: { r: "Descrição", obrig: true, max: 2000 },
    consentimento: { r: "Consentimento", tipo: "aceite", obrigSe: (b) => b.identificacao === "identificada" },
  },
  agendamento: {
    tipoAgendamento: { r: "Tipo de agendamento", obrig: true, enum: opcoes("atendimento", "vistoria", "palestra") },
    escola: { r: "Escola ou instituição", max: 160, obrigSe: (b) => b.tipoAgendamento === "palestra" },
    data: { r: "Data", obrig: true, tipo: "data" },
    horario: { r: "Horário", obrig: true, max: 5 },
    nome: { r: "Nome completo", obrig: true, max: 120 },
    email: { r: "E-mail", obrig: true, max: 160, tipo: "email" },
    telefone: { r: "Telefone", max: 20, tipo: "tel" },
    descricao: { r: "Observações", max: 1000 },
    consentimento: { r: "Consentimento", obrig: true, tipo: "aceite" },
  },
  arborizacao: {
    pedido: { r: "Pedido", obrig: true, enum: opcoes("muda", "poda", "remocao") },
    endereco: { r: "Endereço", obrig: true, max: 200 },
    descricao: { r: "Descrição", obrig: true, max: 1500 },
    nome: { r: "Nome completo", obrig: true, max: 120 },
    email: { r: "E-mail", obrig: true, max: 160, tipo: "email" },
    telefone: { r: "Telefone", max: 20, tipo: "tel" },
    consentimento: { r: "Consentimento", obrig: true, tipo: "aceite" },
  },
  newsletter: {
    email: { r: "E-mail", obrig: true, max: 160, tipo: "email" },
    consentimento: { r: "Consentimento", obrig: true, tipo: "aceite" },
  },
};

// Retorna { dados, erros }
function validar(tipo, corpo) {
  const espec = ESPEC[tipo];
  const dados = {}, erros = {};
  for (const [campo, regra] of Object.entries(espec)) {
    const bruto = corpo[campo];
    const valor = regra.tipo === "aceite" ? (bruto === "sim" || bruto === "on" || bruto === true ? "sim" : "") : limpar(bruto, regra.max || 200);
    const obrig = regra.obrig || (regra.obrigSe && regra.obrigSe(corpo));
    if (!valor) {
      if (obrig) erros[campo] = regra.tipo === "aceite" ? "Marque a caixa para concordar e continuar." : regra.enum ? `Escolha uma opção em “${regra.r}”.` : `Preencha o campo “${regra.r}”.`;
      continue;
    }
    if (regra.enum && !regra.enum.includes(valor)) { erros[campo] = `Escolha uma opção válida em “${regra.r}”.`; continue; }
    if (regra.tipo === "email" && !EMAIL.test(valor)) { erros[campo] = "Informe um e-mail válido, como nome@exemplo.com."; continue; }
    if (regra.tipo === "tel" && !/^\d{10,11}$/.test(digitos(valor))) { erros[campo] = "Informe o telefone com DDD, com 10 ou 11 números."; continue; }
    if (regra.tipo === "documento" && !/^(\d{11}|\d{14})$/.test(digitos(valor))) { erros[campo] = "Informe um CPF (11 números) ou CNPJ (14 números)."; continue; }
    if (regra.tipo === "data" && !dataIsoValida(valor)) { erros[campo] = `Informe uma data válida em “${regra.r}”.`; continue; }
    if (regra.tipo === "coord" && !/^-?\d{1,3}(\.\d+)?$/.test(valor)) { erros[campo] = "Coordenada inválida."; continue; }
    dados[campo] = valor;
  }
  return { dados, erros };
}

// Regras de data/horário do agendamento (dia útil futuro e horário existente)
function validarAgenda(data, horario) {
  const d = dataIsoValida(data);
  if (!d) return "Informe uma data válida.";
  const hoje = new Date().toISOString().slice(0, 10);
  if (data <= hoje) return "Escolha uma data a partir de amanhã.";
  if ([0, 6].includes(d.getUTCDay())) return "Escolha um dia útil, de segunda a sexta.";
  if (!config.horarios.includes(horario)) return "Escolha um dos horários disponíveis.";
  return "";
}

// Verifica o tipo real do arquivo pelos primeiros bytes (não confia só na extensão)
const ASSINATURAS = [
  { ext: "jpg", ok: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { ext: "png", ok: (b) => b.slice(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) },
  { ext: "webp", ok: (b) => b.slice(0, 4).toString() === "RIFF" && b.slice(8, 12).toString() === "WEBP" },
  { ext: "pdf", ok: (b) => b.slice(0, 5).toString() === "%PDF-" },
];
function tipoDoArquivo(buffer) {
  const a = ASSINATURAS.find((x) => buffer.length > 12 && x.ok(buffer));
  return a ? a.ext : null;
}

module.exports = { validar, validarAgenda, tipoDoArquivo, ESPEC, digitos, EMAIL };
