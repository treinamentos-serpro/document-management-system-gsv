// Repositório de documentos: metadados em memória + acesso ao filesystem local.
//
// Restrição do projeto: os arquivos físicos residem em backend/storage e os
// metadados (id, nome original, tamanho, data, dono) ficam em memória nesta fase.

const path = require('path');

const STORAGE_DIR = process.env.DMS_STORAGE_DIR || path.join(__dirname, '../../storage');

// Map<id, metadata> mantido em memória durante o ciclo de vida do processo.
const documents = new Map();

function save(document) {
  documents.set(document.id, document);
  return document;
}

function findAll(owner) {
  const all = Array.from(documents.values());
  return owner ? all.filter((doc) => doc.owner === owner) : all;
}

function findById(id) {
  return documents.get(id) || null;
}

function resolveStoragePath(storedName) {
  return path.join(STORAGE_DIR, storedName);
}

module.exports = {
  STORAGE_DIR,
  save,
  findAll,
  findById,
  resolveStoragePath,
};
