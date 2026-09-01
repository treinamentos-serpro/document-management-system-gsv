// Repositório de documentos: metadados em memória + acesso ao filesystem local.
//
// Restrição do projeto: os arquivos físicos residem em backend/storage e os
// metadados (id, nome original, tamanho, data, dono) ficam em memória nesta fase.

const path = require('node:path');

const STORAGE_DIR = process.env.DMS_STORAGE_DIR || path.join(__dirname, '../../storage');
const documents = new Map();

function saveDocument(document) {
  documents.set(document.id, document);
  return document;
}

function listDocuments() {
  return Array.from(documents.values()).map((document) => ({
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  }));
}

function findDocumentById(id) {
  return documents.get(id) || null;
}

function resolveStoragePath(storedName) {
  return path.join(STORAGE_DIR, storedName);
}

module.exports = {
  STORAGE_DIR,
  saveDocument,
  listDocuments,
  findDocumentById,
  resolveStoragePath,
};
