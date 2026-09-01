// Rotas de documentos: definem os endpoints e delegam para os controllers.
// Upload usa multer com diskStorage, gravando os arquivos em backend/storage.

const path = require('node:path');
const { Router } = require('express');
const multer = require('multer');
const documentController = require('../controllers/documentController');
const { STORAGE_DIR } = require('../repositories/documentRepository');

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, STORAGE_DIR);
  },
  filename: (_req, file, callback) => {
    const extension = path.extname(file.originalname || 'upload');
    const baseName = path.basename(file.originalname || 'upload', extension).replace(/[^a-zA-Z0-9_.-]/g, '_');
    callback(null, `temp-${Date.now()}-${baseName}${extension}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const router = Router();

router.post('/upload', upload.single('file'), documentController.upload);
router.get('/documents', documentController.listDocuments);
router.get('/documents/:id/download', documentController.download);

module.exports = router;
