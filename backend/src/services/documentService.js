// Regras de negócio para registro, listagem e download de documentos.

const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const repository = require('../repositories/documentRepository');

const STORAGE_DIR = path.join(__dirname, '..', '..', 'storage');

function ensureStorageDir() {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

function uploadDocument(file, owner = 'anonymous') {
  if (!file) {
    const error = new Error('Arquivo obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  ensureStorageDir();

  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const storedName = `${id}-${file.originalname}`;
  const filePath = path.join(STORAGE_DIR, storedName);

  fs.renameSync(file.path, filePath);

  const document = {
    id,
    originalName: file.originalname,
    storedName,
    filePath,
    size: file.size,
    uploadedAt: timestamp,
    owner,
    contentType: file.mimetype || 'application/octet-stream',
  };

  repository.saveDocument(document);

  return {
    id: document.id,
    originalName: document.originalName,
    size: document.size,
    uploadedAt: document.uploadedAt,
    owner: document.owner,
    storedName: document.storedName,
  };
}

function listDocuments() {
  return repository.listDocuments();
}

function getDocumentById(id) {
  return repository.findDocumentById(id);
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentById,
};
