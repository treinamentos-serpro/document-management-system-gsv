// Controllers: tratam entrada/saída HTTP e validação básica, delegando as
// regras de negócio para a camada de serviço.

const path = require('node:path');
const documentService = require('../services/documentService');

function upload(req, res) {
  const file = req.file;

  try {
    const document = documentService.uploadDocument(file, req.body?.owner || 'anonymous');
    return res.status(201).json(document);
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      message: error.message || 'Erro ao enviar documento.',
    });
  }
}

function listDocuments(req, res) {
  const documents = documentService.listDocuments(req.query?.owner);
  return res.status(200).json(documents);
}

function download(req, res) {
  const { id } = req.params;
  const document = documentService.getDocumentById(id);

  if (!document) {
    return res.status(404).json({ message: 'Documento não encontrado.' });
  }

  const safeFileName = path.basename(document.originalName || 'download');

  return res.download(document.filePath, safeFileName, (error) => {
    if (error && !res.headersSent) {
      return res.status(500).json({ message: 'Erro ao baixar documento.' });
    }

    return undefined;
  });
}

module.exports = {
  upload,
  listDocuments,
  download,
};
