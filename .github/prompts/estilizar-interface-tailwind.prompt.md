---
description: Melhora o visual da interface do DMS com Tailwind CSS 3, sem alterar a lógica de negócio.
name: estilizar-interface-tailwind
argument-hint: nenhum
agent: ui-tailwind-designer
---

# Melhorar visual da interface com Tailwind CSS 3

Aplica uma revisão visual completa da interface do projeto Document Management System, preservando a funcionalidade atual e sem alterar a arquitetura ou a regra de negócio.

## Objetivo

Modernizar a UI do frontend usando Tailwind CSS 3, mantendo a aplicação simples, responsiva e consistente com a proposta do sistema.

## Escopo

- Ajustar os componentes funcionais em `frontend/src/components`
- Melhorar o layout principal em `frontend/src/App.jsx`
- Garantir consistência visual entre upload, listagem e download
- Usar classes utilitárias do Tailwind CSS 3 em vez de estilos inline, quando possível
- Otimizar a experiência em telas desktop e mobile
- Não mudar os endpoints ou a estrutura do backend

## Regras

1. Mantenha a estrutura funcional atual do React e dos hooks.
2. Preserve os nomes dos componentes e a organização por pasta.
3. Evite duplicação de código; reutilize componentes e estilos consistentes.
4. Não adicione lógica de negócio nova; foque apenas em apresentação.
5. Se necessário, configure o Tailwind 3 no projeto antes da estilização, sem quebrar a configuração existente.
6. Ajuste a interface para deixar upload, lista e botão de download mais claros e elegantes.
7. Use espaçamento, contraste, cards, bordas e estados de loading/erro com melhor UX.
8. Mantenha mensagens e comentários em português.

## Arquivos esperados

- `frontend/src/App.jsx`
- `frontend/src/components/UploadComponent.jsx`
- `frontend/src/components/DocumentList.jsx`
- `frontend/src/components/DownloadButton.jsx`
- `frontend/src/index.css` (ou criação, se necessário)
- `frontend/tailwind.config.js`
- `frontend/postcss.config.js`

## Entrega esperada

- Interface visualmente melhorada e profissional
- Uso coerente de Tailwind CSS 3
- Layout responsivo e fácil de usar
- Nenhuma regressão funcional na operação de upload/listagem/download
