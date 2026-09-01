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

test('o app backend é exportado', () => {
  assert.ok(app, 'o app deve estar definido');
  assert.strictEqual(typeof app, 'function', 'o app Express deve ser uma função');
});

test('GET /health deve retornar status ok', async () => {
  await withServer(async (baseUrl) => {
    const response = await fetch(`${baseUrl}/health`);
    assert.strictEqual(response.status, 200);
    const data = await response.json();
    assert.deepStrictEqual(data, { status: 'ok' });
  });
});

test('POST /upload deve criar um documento com sucesso', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    const file = new Blob(['conteudo do arquivo de teste'], { type: 'text/plain' });
    formData.append('file', file, 'relatorio.txt');
    formData.append('owner', 'maria');

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(response.status, 201, 'deve retornar status 201 Created');
    const document = await response.json();
    assert.ok(document.id, 'deve possuir um ID');
    assert.strictEqual(document.originalName, 'relatorio.txt');
    assert.strictEqual(document.owner, 'maria');
    assert.strictEqual(document.size, 28);
    assert.ok(document.uploadedAt);
  });
});

test('POST /upload deve retornar erro 400 quando nenhum arquivo for enviado', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    formData.append('owner', 'joao');

    const response = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });

    assert.strictEqual(response.status, 400);
    const data = await response.json();
    assert.ok(data.message);
  });
});

test('GET /documents deve listar todos os documentos e permitir filtragem por owner', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    const file = new Blob(['conteudo de teste para lista'], { type: 'text/plain' });
    formData.append('file', file, 'lista.txt');
    formData.append('owner', 'carlos');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    const createdDoc = await uploadResponse.json();

    const listResponse = await fetch(`${baseUrl}/documents`);
    assert.strictEqual(listResponse.status, 200);
    const documents = await listResponse.json();
    assert.ok(Array.isArray(documents));
    assert.ok(documents.some((doc) => doc.id === createdDoc.id));

    const filteredResponse = await fetch(`${baseUrl}/documents?owner=carlos`);
    assert.strictEqual(filteredResponse.status, 200);
    const filteredDocs = await filteredResponse.json();
    assert.ok(Array.isArray(filteredDocs));
    assert.ok(filteredDocs.every((doc) => doc.owner === 'carlos'));
  });
});

test('GET /documents/:id/download deve baixar o documento cadastrado com sucesso', async () => {
  await withServer(async (baseUrl) => {
    const formData = new FormData();
    const content = 'conteudo binario ou texto para download';
    const file = new Blob([content], { type: 'text/plain' });
    formData.append('file', file, 'download-teste.txt');

    const uploadResponse = await fetch(`${baseUrl}/upload`, {
      method: 'POST',
      body: formData,
    });
    const createdDoc = await uploadResponse.json();

    const downloadResponse = await fetch(`${baseUrl}/documents/${createdDoc.id}/download`);
    assert.strictEqual(downloadResponse.status, 200);
    const downloadedText = await downloadResponse.text();
    assert.strictEqual(downloadedText, content);
  });
});

test('GET /documents/:id/download deve retornar 404 para id inexistente', async () => {
  await withServer(async (baseUrl) => {
    const downloadResponse = await fetch(`${baseUrl}/documents/id-inexistente-123/download`);
    assert.strictEqual(downloadResponse.status, 404);
    const data = await downloadResponse.json();
    assert.ok(data.message);
  });
});
