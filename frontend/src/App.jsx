// Componente raiz do Document Management System: integra upload e listagem.

import { useCallback, useEffect, useState } from 'react';
import UploadComponent from './components/UploadComponent';
import DocumentList from './components/DocumentList';
import { listDocuments } from './services/documentApi';

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [erro, setErro] = useState(null);

  const carregarDocumentos = useCallback(async () => {
    try {
      const data = await listDocuments();
      setDocuments(data);
      setErro(null);
    } catch (err) {
      setErro(err.message);
    }
  }, []);

  useEffect(() => {
    carregarDocumentos();
  }, [carregarDocumentos]);

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', padding: '2rem' }}>
      <h1>Document Management System</h1>
      <UploadComponent onUploaded={carregarDocumentos} />
      <h2>Documentos enviados</h2>
      {erro && <p role="alert">{erro}</p>}
      <DocumentList documents={documents} />
    </main>
  );
}
