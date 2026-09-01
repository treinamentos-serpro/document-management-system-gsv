import { useState } from 'react';
import { downloadDocument } from '../services/documentApi.js';

export default function DownloadButton({ documentId, documentName }) {
  const [downloading, setDownloading] = useState(false);
  const [error, setError] = useState('');

  async function handleDownload() {
    setDownloading(true);
    setError('');

    try {
      const blob = await downloadDocument(documentId);
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = documentName;
      anchor.click();
      window.URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(downloadError.message || 'Não foi possível baixar o documento.');
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div>
      <button type="button" onClick={handleDownload} disabled={downloading} style={styles.button}>
        {downloading ? 'Baixando...' : 'Baixar'}
      </button>
      {error ? <div style={styles.error}>{error}</div> : null}
    </div>
  );
}

const styles = {
  button: {
    padding: '0.6rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid #1d4ed8',
    background: '#dbeafe',
    color: '#1e3a8a',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    color: '#b91c1c',
    fontSize: '0.8rem',
    marginTop: '0.4rem',
  },
};
