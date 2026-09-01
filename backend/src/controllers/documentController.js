// Controllers: tratam entrada/saída HTTP e validação básica, delegando as
// regras de negócio para a camada de serviço.

const documentService = require('../services/documentService');

function upload(req, res) {
  if (!req.file) {
    return res.status(400).json({ erro: 'Nenhum arquivo foi enviado' });
  }

  const document = documentService.registerUpload(req.file, req.body.owner);
  return res.status(201).json(document);
}

function list(req, res) {
  const documents = documentService.listDocuments(req.query.owner);
  return res.status(200).json(documents);
}

function download(req, res) {
  const result = documentService.getDocumentForDownload(req.params.id);
  if (!result) {
    return res.status(404).json({ erro: 'Documento não encontrado' });
  }

  return res.download(result.filePath, result.document.originalName, (err) => {
    if (err && !res.headersSent) {
      res.status(500).json({ erro: 'Falha ao ler o arquivo do documento' });
    }
  });
}

module.exports = {
  upload,
  list,
  download,
};
