const { test } = require('node:test');
const assert = require('node:assert');
const app = require('../src/app');

async function withServer(fn) {
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));

  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await fn(baseUrl);
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error);
          return;
        }

        resolve();
      });
    });
  }
}

// Teste de fumaça do seed: garante que o app Express foi exportado.
test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('deve permitir upload, listagem e download de documentos', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    const file = new Blob(['conteudo do documento'], { type: 'text/plain' });
    formData.append('file', file, 'documento.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(uploadResponse.status, 201, 'o upload deve criar um documento');

    const uploadedDocument = await uploadResponse.json();
    assert.ok(uploadedDocument.id, 'o documento deve ter um identificador');
    assert.strictEqual(uploadedDocument.originalName, 'documento.txt');
    assert.strictEqual(uploadedDocument.size, 21);
    assert.strictEqual(uploadedDocument.owner, 'anonymous');

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200, 'a listagem deve retornar 200');

    const documents = await listResponse.json();
    assert.ok(Array.isArray(documents), 'a listagem deve devolver uma lista');
    assert.ok(
      documents.some((document) => document.id === uploadedDocument.id),
      'a lista deve incluir o documento recém-criado',
    );

    const downloadResponse = await fetch(`${baseUrl}/documents/${uploadedDocument.id}/download`);
    assert.strictEqual(downloadResponse.status, 200, 'o download deve retornar 200');
    assert.strictEqual(await downloadResponse.text(), 'conteudo do documento');
  });
});
