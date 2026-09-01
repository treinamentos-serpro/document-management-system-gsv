import { useState } from 'react';
import { uploadDocument } from '../services/documentApi.js';

export default function UploadComponent({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [owner, setOwner] = useState('anonymous');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();

    if (!file) {
      setError('Selecione um arquivo antes de enviar.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const uploadedDoc = await uploadDocument(file, owner || 'anonymous');
      setFile(null);
      setOwner('anonymous');
      event.target.reset();
      await onUploadSuccess?.(uploadedDoc);
    } catch (uploadError) {
      setError(uploadError.message || 'Não foi possível enviar o arquivo.');
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section style={styles.section}>
      <h2>Upload de documento</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Arquivo
          <input
            type="file"
            onChange={(event) => setFile(event.target.files?.[0] || null)}
            style={styles.input}
          />
        </label>

        <label style={styles.label}>
          Dono
          <input
            type="text"
            value={owner}
            onChange={(event) => setOwner(event.target.value)}
            placeholder="anonymous"
            style={styles.input}
          />
        </label>

        <button type="submit" disabled={isUploading} style={styles.button}>
          {isUploading ? 'Enviando...' : 'Enviar documento'}
        </button>
      </form>

      {error ? <p style={styles.error}>{error}</p> : null}
    </section>
  );
}

const styles = {
  section: {
    border: '1px solid #dfe3e8',
    borderRadius: '12px',
    padding: '1rem',
    marginBottom: '1.5rem',
    background: '#f9fafb',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  label: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.35rem',
    fontWeight: 600,
  },
  input: {
    padding: '0.6rem 0.75rem',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    fontSize: '1rem',
  },
  button: {
    padding: '0.7rem 1rem',
    border: 'none',
    borderRadius: '8px',
    background: '#166534',
    color: '#fff',
    fontWeight: 700,
    cursor: 'pointer',
  },
  error: {
    marginTop: '0.75rem',
    color: '#b91c1c',
    fontWeight: 600,
  },
};
