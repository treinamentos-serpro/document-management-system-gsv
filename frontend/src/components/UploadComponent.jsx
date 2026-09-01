// Formulário de upload de documentos.

import { useState } from 'react';
import { uploadDocument } from '../services/documentApi';

export default function UploadComponent({ onUploaded }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setErro('Selecione um arquivo antes de enviar');
      return;
    }

    setEnviando(true);
    setErro(null);

    try {
      const documento = await uploadDocument(file, owner);
      setFile(null);
      setOwner('');
      event.target.reset();
      onUploaded?.(documento);
    } catch (err) {
      setErro(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Enviar documento</h2>
      <div>
        <label htmlFor="file">Arquivo</label>
        <input
          id="file"
          type="file"
          onChange={(event) => setFile(event.target.files[0] ?? null)}
        />
      </div>
      <div>
        <label htmlFor="owner">Usuário (owner)</label>
        <input
          id="owner"
          type="text"
          value={owner}
          onChange={(event) => setOwner(event.target.value)}
        />
      </div>
      <button type="submit" disabled={enviando}>
        {enviando ? 'Enviando...' : 'Enviar'}
      </button>
      {erro && <p role="alert">{erro}</p>}
    </form>
  );
}
