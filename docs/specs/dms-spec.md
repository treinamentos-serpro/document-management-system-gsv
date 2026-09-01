# Especificação do Document Management System (DMS)

## 1. Objetivo

O sistema deve permitir que usuários cadastrem, consultem e baixem documentos de forma simples e confiável, mantendo arquivos localmente no filesystem da aplicação e metadados em memória durante esta fase inicial.

## 2. Escopo

### Dentro do escopo

- Upload de documentos em formato de arquivo
- Listagem dos documentos cadastrados
- Download de um documento pelo identificador
- Registro de metadados do documento (nome original, tamanho, data de upload e dono)
- Persistência local do arquivo em `backend/storage`
- Organização do backend em camadas seguindo Clean Architecture simples
- Suporte básico de validação de entrada HTTP e tratamento de erros

### Fora do escopo

- Armazenamento em nuvem, S3 ou qualquer provedor externo
- Controle de permissões por perfil ou papel do usuário
- Versionamento de arquivos
- Busca avançada por conteúdo do documento
- Compartilhamento público ou links temporários
- Multi-tenancy com banco de dados externo

## 3. Requisitos funcionais

| ID | Requisito |
| --- | --- |
| RF-01 | O sistema deve permitir o upload de um arquivo para o armazenamento local. |
| RF-02 | O sistema deve rejeitar requisições de upload sem arquivo ou com payload inválido. |
| RF-03 | O sistema deve gerar um identificador único para cada documento enviado. |
| RF-04 | O sistema deve registrar o nome original do arquivo, o tamanho em bytes, a data de upload e o dono do documento. |
| RF-05 | O sistema deve listar todos os documentos persistidos em memória. |
| RF-06 | O sistema deve permitir a consulta de um documento por identificador. |
| RF-07 | O sistema deve disponibilizar o download do arquivo físico correspondente ao documento. |
| RF-08 | O sistema deve retornar erro 404 quando o documento solicitado não existe. |
| RF-09 | O sistema deve responder com 400 quando a requisição de upload não contém um arquivo válido. |
| RF-10 | O sistema deve manter o comportamento mínimo de saúde do backend via endpoint `/health`. |

## 4. Requisitos não funcionais

| ID | Requisito |
| --- | --- |
| RNF-01 | Os arquivos devem ser armazenados localmente no filesystem da aplicação, na pasta `backend/storage`, usando `multer` com `diskStorage`. |
| RNF-02 | Os metadados devem ser mantidos em memória durante esta fase, sem persistência em banco de dados. |
| RNF-03 | A configuração de ambiente deve seguir princípios 12-Factor e permitir ajustes por variáveis de ambiente. |
| RNF-04 | O backend deve seguir a separação por camadas: `routes`, `controllers`, `services` e `repositories`. |
| RNF-05 | O código deve priorizar simplicidade, legibilidade e manutenção, sem overengineering. |
| RNF-06 | O sistema deve tratar erros de leitura/escrita de arquivos de forma segura e previsível. |

## 5. Modelo de dados

### Entidade Documento

| Campo | Tipo | Obrigatório | Descrição |
| --- | --- | --- | --- |
| id | string | Sim | Identificador único do documento. |
| originalName | string | Sim | Nome original do arquivo enviado pelo cliente. |
| storedName | string | Sim | Nome do arquivo salvo no filesystem local. |
| filePath | string | Sim | Caminho absoluto ou relativo do arquivo armazenado em `backend/storage`. |
| size | number | Sim | Tamanho em bytes do arquivo. |
| uploadedAt | string | Sim | Data e hora de upload no formato ISO 8601. |
| owner | string | Sim | Identificador do usuário dono do documento. |
| contentType | string | Não | Tipo MIME detectado no upload, quando disponível. |

### Observações

- A referência do arquivo físico deve ser mantida em memória para permitir o download posterior.
- O identificador do documento deve ser estável e usado nas rotas de consulta e download.
- A propriedade `owner` pode usar valor padrão como `anonymous` para esta fase inicial, quando o usuário não for informado.

## 6. Contratos de API

### 6.1 Endpoint: `POST /upload`

#### Objetivo

Receber um arquivo no formato multipart/form-data e registrar o documento no sistema.

#### Requisição

- Método: `POST`
- URL: `/upload`
- Content-Type: `multipart/form-data`
- Campo obrigatório: `file`
- Campo opcional: `owner`

Exemplo:

```bash
curl -X POST http://localhost:3000/upload \
  -F "file=@documento.pdf" \
  -F "owner=usuario-123"
```

#### Resposta de sucesso

- Status: `201 Created`
- Body:

```json
{
  "id": "7f2d7b2e-9bf1-4ec5-a2ae-5c8d7a4a6d9b",
  "originalName": "documento.pdf",
  "storedName": "7f2d7b2e-9bf1-4ec5-a2ae-5c8d7a4a6d9b-documento.pdf",
  "size": 15342,
  "uploadedAt": "2026-09-01T12:34:56.000Z",
  "owner": "usuario-123"
}
```

#### Resposta de erro

- Status: `400 Bad Request`
- Body:

```json
{
  "message": "Arquivo obrigatório."
}
```

### 6.2 Endpoint: `GET /documents`

#### Objetivo

Listar todos os documentos registrados.

#### Requisição

- Método: `GET`
- URL: `/documents`

#### Resposta de sucesso

- Status: `200 OK`
- Body:

```json
[
  {
    "id": "7f2d7b2e-9bf1-4ec5-a2ae-5c8d7a4a6d9b",
    "originalName": "documento.pdf",
    "size": 15342,
    "uploadedAt": "2026-09-01T12:34:56.000Z",
    "owner": "usuario-123"
  }
]
```

### 6.3 Endpoint: `GET /documents/:id/download`

#### Objetivo

Baixar o conteúdo físico do documento associado ao identificador informado.

#### Requisição

- Método: `GET`
- URL: `/documents/:id/download`

#### Resposta de sucesso

- Status: `200 OK`
- Content-Type: definido pelo tipo do arquivo (ou fallback genérico)
- Body: conteúdo binário do arquivo

#### Resposta de erro

- Status: `404 Not Found`
- Body:

```json
{
  "message": "Documento não encontrado."
}
```

### 6.4 Endpoint: `GET /health`

#### Objetivo

Servir como verificação de disponibilidade do backend.

#### Resposta de sucesso

```json
{
  "status": "ok"
}
```

## 7. Decisões arquiteturais

- O backend será implementado em Express com CommonJS.
- A estrutura será organizada em camadas:
  - `routes/`: define endpoints e delega para controllers
  - `controllers/`: trata entrada/saída HTTP e validações básicas
  - `services/`: concentra regras de negócio
  - `repositories/`: cuida da persistência em memória e da referência do arquivo local
- O armazenamento físico será realizado no filesystem local usando `multer` com `diskStorage` e destino fixo em `backend/storage`.
- Os metadados serão registrados em memória, em um repositório simples, evitando complexidade desnecessária para esta fase.
- O frontend, se implementado em etapas posteriores, se comunicará com o backend via `fetch` com prefixo `/api` e será organizado por componentes e páginas.
- Não haverá integração com serviços externos de armazenamento ou banco de dados neste escopo inicial.

## 8. Plano de execução em etapas

### Etapa 1: Definição da especificação e contratos

- Validar objetivos, escopo e restrições do sistema.
- Registrar requisitos funcionais e não funcionais.
- Definir modelo de dados e contratos de API esperados.
- Produzir a especificação em `docs/specs/dms-spec.md`.

Critérios de aceite:
- Documento de especificação concluído e revisado.
- Arquitetura e restrições claras antes da implementação.

### Etapa 2: Estrutura do backend em Clean Architecture

- Criar diretórios e arquivos de organização:
  - `backend/src/routes`
  - `backend/src/controllers`
  - `backend/src/services`
  - `backend/src/repositories`
- Ajustar o bootstrap do Express em `backend/src/app.js` para registrar as rotas.

Critérios de aceite:
- Estrutura modular pronta.
- Fluxo de dependências respeitando `routes -> controllers -> services -> repositories`.

### Etapa 3: Persistência local e metadados em memória

- Configurar `multer` com `diskStorage` apontando para `backend/storage`.
- Implementar repositório em memória para armazenar documentos e seus metadados.
- Garantir que o nome do arquivo salvo e o caminho físico sejam rastreáveis.

Critérios de aceite:
- Arquivos gravados localmente.
- Metadados preservados em memória.
- Sem uso de provedores externos.

### Etapa 4: Implementação dos endpoints principais

- `POST /upload`: receber o arquivo e registrar o documento.
- `GET /documents`: listar todos os documentos.
- `GET /documents/:id/download`: recuperar o arquivo correspondente.
- `GET /health`: verificar funcionamento do backend.

Critérios de aceite:
- Endpoints respondem com os status e payloads esperados.
- Casos de erro são tratados com mensagens claras.

### Etapa 5: Validação e testes

- Escrever testes de comportamento para upload, listagem e download.
- Verificar casos de falha, como arquivo ausente ou documento inexistente.
- Validar a execução do backend localmente com `npm test`.

Critérios de aceite:
- Testes automatizados passando.
- Cenários principais cobertos.

### Etapa 6: Preparação para o próximo passo do frontend

- Confirmar que a API atende ao contrato esperado e pode ser consumida pelo frontend.
- Preparar a base para integração do cliente web em etapas posteriores.

Critérios de aceite:
- Backend pronto para consumo por interface frontend.
- Sem alteração de escopo para armazenamento externo ou versionamento.

## 9. Critérios de sucesso do projeto

O projeto será considerado concluído para esta fase quando:

- o backend estiver organizado em camadas;
- o upload local com `multer` estiver funcionando;
- a listagem de documentos refletir os metadados em memória;
- o download do arquivo físico estiver operacional;
- a API respeitar os contratos descritos acima;
- os testes relevantes passarem sem regressão funcional.
