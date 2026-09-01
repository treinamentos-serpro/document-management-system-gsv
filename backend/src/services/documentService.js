// Regras de negócio para registro, listagem e download de documentos.

const crypto = require('node:crypto');
const path = require('node:path');
const fs = require('node:fs');
const repository = require('../repositories/documentRepository');

function sanitizeFileName(fileName) {
  if (!fileName) return 'file';
  return path.basename(fileName).replace(/[^a-zA-Z0-9_.-]/g, '_');
}

function cleanupTempFile(filePath) {
  if (filePath && fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch {
      // Ignora erro ao remover arquivo temporário durante tratamento de exceção
    }
  }
}

function uploadDocument(file, owner = 'anonymous') {
  if (!file) {
    const error = new Error('Arquivo obrigatório.');
    error.statusCode = 400;
    throw error;
  }

  const safeOriginalName = sanitizeFileName(file.originalname);
  const id = crypto.randomUUID();
  const timestamp = new Date().toISOString();
  const storedName = `${id}-${safeOriginalName}`;

  try {
    const filePath = repository.moveFileToStorage(file.path, storedName);

    const document = {
      id,
      originalName: file.originalname,
      storedName,
      filePath,
      size: file.size,
      uploadedAt: timestamp,
      owner: owner || 'anonymous',
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
  } catch (error) {
    cleanupTempFile(file.path);
    throw error;
  }
}

function listDocuments(owner) {
  return repository.listDocuments(owner);
}

function getDocumentById(id) {
  return repository.findDocumentById(id);
}

module.exports = {
  uploadDocument,
  listDocuments,
  getDocumentById,
};
