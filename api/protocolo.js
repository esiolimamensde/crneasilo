// Número de protocolo no formato SMMA-AAAA-NNNNNN (sequencial por ano)
const FORMATO = /^SMMA-\d{4}-\d{6}$/;

function registrar(db, { tipo, dados, anonimo = false, agenda = null }) {
  const agora = new Date().toISOString();
  const ano = new Date().getFullYear();
  db.exec("BEGIN IMMEDIATE");
  try {
    const { prox } = db.prepare("SELECT COALESCE(MAX(seq), 0) + 1 AS prox FROM protocolos WHERE ano = ?").get(ano);
    const numero = `SMMA-${ano}-${String(prox).padStart(6, "0")}`;
    db.prepare("INSERT INTO protocolos (numero, ano, seq, tipo, anonimo, dados, criado_em, atualizado_em) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
      .run(numero, ano, prox, tipo, anonimo ? 1 : 0, JSON.stringify(dados), agora, agora);
    if (agenda) db.prepare("INSERT INTO agendamentos (protocolo, data, horario) VALUES (?, ?, ?)").run(numero, agenda.data, agenda.horario);
    db.exec("COMMIT");
    return numero;
  } catch (e) {
    db.exec("ROLLBACK");
    throw e;
  }
}

module.exports = { registrar, FORMATO };
