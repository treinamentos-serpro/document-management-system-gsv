// Lista de documentos enviados, com opção de download por item.

import DownloadButton from './DownloadButton';

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  return `${(bytes / 1024).toFixed(1)} KB`;
}

export default function DocumentList({ documents }) {
  if (documents.length === 0) {
    return <p>Nenhum documento enviado ainda.</p>;
  }

  return (
    <table>
      <thead>
        <tr>
          <th>Nome</th>
          <th>Tamanho</th>
          <th>Enviado em</th>
          <th>Dono</th>
          <th>Ação</th>
        </tr>
      </thead>
      <tbody>
        {documents.map((doc) => (
          <tr key={doc.id}>
            <td>{doc.originalName}</td>
            <td>{formatSize(doc.size)}</td>
            <td>{new Date(doc.uploadedAt).toLocaleString('pt-BR')}</td>
            <td>{doc.owner || '-'}</td>
            <td>
              <DownloadButton documentId={doc.id} fileName={doc.originalName} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
