# Especificação - Document Management System

## 1. Objetivo

Prover um sistema web simples para upload, listagem e download de documentos,
com armazenamento estritamente local e gestão básica por usuário.

## 2. Escopo

### Dentro do escopo

- Upload de documentos (multipart/form-data)
- Listagem dos documentos enviados
- Download de um documento pelo identificador
- Associação de cada documento a um usuário (owner) simples, sem autenticação real

### Fora do escopo

- Armazenamento externo ou em nuvem (S3, etc.)
- Versionamento de documentos
- Autenticação/autorização completa (login, senha, sessões)
- Edição ou exclusão de documentos
- Persistência em banco de dados (fase inicial usa memória)

## 3. Requisitos funcionais

| ID    | Requisito                                                                               |
| ----- | ---------------------------------------------------------------------------------------- |
| RF-01 | O usuário pode enviar um documento via `POST /upload`                                    |
| RF-02 | O usuário pode listar os documentos enviados via `GET /documents`                        |
| RF-03 | O usuário pode baixar um documento pelo identificador via `GET /documents/:id/download`  |
| RF-04 | O sistema deve rejeitar upload sem arquivo anexado, retornando erro claro                |
| RF-05 | O sistema deve retornar 404 ao tentar baixar um documento inexistente                    |
| RF-06 | Cada documento listado deve exibir nome original, tamanho e data de upload               |

## 4. Requisitos não funcionais

| ID     | Requisito                                                                    |
| ------ | ----------------------------------------------------------------------------- |
| RNF-01 | Arquivos gravados no filesystem local via `multer` com `diskStorage`, na pasta `backend/storage` |
| RNF-02 | Metadados dos documentos mantidos em memória nesta fase (sem banco de dados)  |
| RNF-03 | Configuração via variáveis de ambiente (12-Factor), ex.: `PORT`, diretório de storage |
| RNF-04 | Backend organizado em Clean Architecture simples: routes → controllers → services → repositories |
| RNF-05 | Erros tratados nos limites do sistema (entrada HTTP, leitura/escrita de arquivos) |
| RNF-06 | Mensagens ao usuário e comentários de código em português; nomes de símbolos em inglês |

## 5. Modelo de dados (metadados do documento)

| Campo        | Tipo   | Descrição                                                                      |
| ------------ | ------ | ------------------------------------------------------------------------------- |
| id           | string | Identificador único do documento (ex.: uuid)                                    |
| originalName | string | Nome original do arquivo enviado                                                |
| storedName   | string | Nome do arquivo gravado em disco (evita colisões)                               |
| mimeType     | string | Tipo MIME do arquivo                                                            |
| size         | number | Tamanho em bytes                                                                |
| uploadedAt   | string | Data/hora do upload (ISO 8601)                                                 |
| owner        | string | Identificador do usuário dono (enviado no upload, ex.: header ou campo do form) |

Observação: os metadados residem em memória (ex.: array/Map no repository), reiniciando
a cada restart do servidor. Os arquivos físicos permanecem em `backend/storage`.

## 6. Contratos de API

### POST /upload

- Entrada: multipart/form-data com campo `file` (arquivo) e campo `owner` (string, opcional/simples)
- Sucesso (201): JSON com os metadados do documento criado

  ```json
  {
    "id": "uuid",
    "originalName": "contrato.pdf",
    "mimeType": "application/pdf",
    "size": 10240,
    "uploadedAt": "2026-09-01T12:00:00.000Z",
    "owner": "usuario1"
  }
  ```

- Erros:
  - 400 quando nenhum arquivo é enviado

### GET /documents

- Entrada: nenhuma (opcionalmente filtro por `owner` via query string)
- Sucesso (200): lista de metadados de documentos

  ```json
  [
    { "id": "uuid", "originalName": "contrato.pdf", "size": 10240, "uploadedAt": "...", "owner": "usuario1" }
  ]
  ```

### GET /documents/:id/download

- Entrada: `id` do documento na URL
- Sucesso (200): conteúdo binário do arquivo, com `Content-Disposition` usando o `originalName`
- Erros:
  - 404 quando o `id` não existe

## 7. Decisões arquiteturais

- Backend em Clean Architecture simples: `routes/` define endpoints e delega para
  `controllers/`; `controllers/` trata entrada/saída HTTP e validação básica;
  `services/` concentra regras de negócio (ex.: gerar id, validar arquivo);
  `repositories/` cuida da persistência (gravação em disco via multer + metadados em memória).
- Fluxo de dependência único: routes → controllers → services → repositories (camadas
  internas não conhecem camadas externas).
- Frontend em componentes React funcionais com Hooks, organizado em `components/`,
  `pages/`, `services/`; comunicação via `fetch` usando prefixo `/api` (proxy do Vite).
- Armazenamento estritamente local: `multer` com `diskStorage` gravando em `backend/storage`;
  nenhum provedor externo de armazenamento.

## 8. Plano de execução

1. Backend — camada de repositório: implementar `documentRepository` (metadados em
   memória) e configuração do `multer` `diskStorage` apontando para `backend/storage`.
2. Backend — camada de serviço: `documentService` com regras para registrar upload
   (gerar id, montar metadados) e consultar/baixar documentos.
3. Backend — camada de controller: `documentController` tratando request/response HTTP
   e validações básicas (arquivo ausente, id inexistente).
4. Backend — camada de rotas: registrar `POST /upload`, `GET /documents` e
   `GET /documents/:id/download` em `routes/`, plugando no `app.js`.
5. Backend — testes: cobrir os três endpoints com `node:test` (casos de sucesso e erro).
6. Frontend — serviço de API: criar cliente em `services/` para chamar `/api/upload`,
   `/api/documents` e `/api/documents/:id/download`.
7. Frontend — páginas/componentes: página de listagem de documentos e formulário de
   upload, reutilizando componentes simples.
8. Frontend — integração final: configurar proxy `/api` no `vite.config.js` (se ainda
   não configurado) e validar o fluxo completo manualmente.

> Nota: as etapas 1-8 acima são apenas o roteiro documentado na especificação; a
> implementação de código não faz parte deste documento.
