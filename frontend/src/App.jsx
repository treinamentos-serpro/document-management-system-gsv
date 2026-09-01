import { useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent.jsx';
import DocumentList from './components/DocumentList.jsx';
import { listDocuments, uploadDocument } from './services/documentApi.js';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  async function fetchDocuments() {
    setIsLoading(true);
    setError('');

    try {
      const nextDocuments = await listDocuments();
      setDocuments(nextDocuments);
    } catch (loadError) {
      setError(loadError.message || 'Não foi possível carregar os documentos.');
    } finally {
      setIsLoading(false);
    }
  }

  async function handleUpload(file, owner) {
    await uploadDocument(file, owner);
    await fetchDocuments();
  }

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <main style={styles.main}>
      <div style={styles.container}>
        <header style={styles.header}>
          <h1>Document Management System</h1>
          <p style={styles.subtitle}>Upload, listagem e download de arquivos</p>
        </header>

        <UploadComponent onUploadSuccess={handleUpload} />

        {error ? <p style={styles.error}>{error}</p> : null}

        {isLoading ? (
          <p>Carregando documentos...</p>
        ) : (
          <DocumentList documents={documents} onRefresh={fetchDocuments} />
        )}
      </div>
    </main>
  );
}

const styles = {
  main: {
    fontFamily: 'system-ui, sans-serif',
    minHeight: '100vh',
    background: '#f3f4f6',
    padding: '2rem 1rem',
  },
  container: {
    maxWidth: '960px',
    margin: '0 auto',
  },
  header: {
    marginBottom: '1.5rem',
  },
  subtitle: {
    margin: '0.25rem 0 0',
    color: '#475569',
  },
  error: {
    color: '#b91c1c',
    fontWeight: 600,
    marginBottom: '1rem',
  },
};
