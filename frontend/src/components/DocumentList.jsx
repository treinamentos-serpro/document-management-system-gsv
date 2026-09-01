import DownloadButton from './DownloadButton.jsx';
import { formatFileSize } from '../utils/formatters.js';

export default function DocumentList({ documents, onRefresh }) {
  if (!documents.length) {
    return (
      <section style={styles.section}>
        <div style={styles.header}>
          <h2>Documentos</h2>
          <button type="button" onClick={onRefresh} style={styles.refreshButton}>
            Atualizar
          </button>
        </div>
        <p>Nenhum documento enviado ainda.</p>
      </section>
    );
  }

  return (
    <section style={styles.section}>
      <div style={styles.header}>
        <h2>Documentos</h2>
        <button type="button" onClick={onRefresh} style={styles.refreshButton}>
          Atualizar
        </button>
      </div>

      <ul style={styles.list}>
        {documents.map((document) => (
          <li key={document.id} style={styles.item}>
            <div>
              <strong>{document.originalName}</strong>
              <div style={styles.meta}>
                <span>Tamanho: {formatFileSize(document.size)}</span>
                <span>Enviado em: {new Date(document.uploadedAt).toLocaleString('pt-BR')}</span>
                <span>Dono: {document.owner || '-'}</span>
              </div>
            </div>

            <DownloadButton documentId={document.id} documentName={document.originalName} />
          </li>
        ))}
      </ul>
    </section>
  );
}

const styles = {
  section: {
    border: '1px solid #dfe3e8',
    borderRadius: '12px',
    padding: '1rem',
    background: '#fff',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    gap: '1rem',
  },
  refreshButton: {
    border: '1px solid #cbd5e1',
    borderRadius: '8px',
    padding: '0.5rem 0.75rem',
    background: '#f8fafc',
    cursor: 'pointer',
  },
  list: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  item: {
    border: '1px solid #e2e8f0',
    borderRadius: '10px',
    padding: '0.75rem',
    display: 'flex',
    justifyContent: 'space-between',
    gap: '1rem',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  meta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.2rem',
    color: '#475569',
    fontSize: '0.85rem',
    marginTop: '0.35rem',
  },
};
