// Repositório de documentos: metadados em memória + acesso ao filesystem local.
//
// Restrição do projeto: os arquivos físicos residem em backend/storage e os
// metadados (id, nome original, tamanho, data, dono) ficam em memória nesta fase.

const path = require('node:path');
const fs = require('node:fs');

const STORAGE_DIR = process.env.DMS_STORAGE_DIR || path.join(__dirname, '../../storage');
const documents = new Map();

function ensureStorageDir() {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function moveFileToStorage(tempPath, storedName) {
  ensureStorageDir();
  const destination = path.join(STORAGE_DIR, storedName);
  fs.renameSync(tempPath, destination);
  return destination;
}

function saveDocument(document) {
  documents.set(document.id, document);
  return document;
}

function listDocuments(owner) {
  const all = Array.from(documents.values()).map((document) => ({
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
  }));

  if (owner) {
    return all.filter((doc) => doc.owner === owner);
  }

  return all;
}

function findDocumentById(id) {
  return documents.get(id) || null;
}

function resolveStoragePath(storedName) {
  return path.join(STORAGE_DIR, storedName);
}

module.exports = {
  STORAGE_DIR,
  moveFileToStorage,
  saveDocument,
  listDocuments,
  findDocumentById,
  resolveStoragePath,
};
