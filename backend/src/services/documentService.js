// Regras de negócio para registro, listagem e download de documentos.

const crypto = require('crypto');
const documentRepository = require('../repositories/documentRepository');

function registerUpload(file, owner) {
  const document = {
    id: crypto.randomUUID(),
    originalName: file.originalname,
    storedName: file.filename,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date().toISOString(),
    owner: owner || null,
  };

  return documentRepository.save(document);
}

function listDocuments(owner) {
  return documentRepository.findAll(owner);
}

function getDocumentForDownload(id) {
  const document = documentRepository.findById(id);
  if (!document) {
    return null;
  }

  return {
    document,
    filePath: documentRepository.resolveStoragePath(document.storedName),
  };
}

module.exports = {
  registerUpload,
  listDocuments,
  getDocumentForDownload,
};
