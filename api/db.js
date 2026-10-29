// Armazenamento em SQLite (módulo nativo do Node.js, sem dependências externas)
const fs = require("node:fs");
const path = require("node:path");
const { DatabaseSync } = require("node:sqlite");

function abrir(caminho) {
  if (caminho !== ":memory:") fs.mkdirSync(path.dirname(caminho), { recursive: true });
  const db = new DatabaseSync(caminho);
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS protocolos (
      numero TEXT PRIMARY KEY,
      ano INTEGER NOT NULL,
      seq INTEGER NOT NULL,
      tipo TEXT NOT NULL,
      situacao TEXT NOT NULL DEFAULT 'recebido',
      anonimo INTEGER NOT NULL DEFAULT 0,
      dados TEXT NOT NULL,
      criado_em TEXT NOT NULL,
      atualizado_em TEXT NOT NULL,
      UNIQUE (ano, seq)
    );
    CREATE TABLE IF NOT EXISTS agendamentos (
      protocolo TEXT PRIMARY KEY REFERENCES protocolos(numero),
      data TEXT NOT NULL,
      horario TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_agenda ON agendamentos (data, horario);
    CREATE TABLE IF NOT EXISTS newsletter (
      email TEXT PRIMARY KEY,
      consentimento_em TEXT NOT NULL
    );
  `);
  return db;
}

module.exports = { abrir };
