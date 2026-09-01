async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: {
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    let errorMessage = `Erro ${response.status}`;
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.erro || errorMessage;
    } catch {
      try {
        const errorText = await response.text();
        if (errorText) errorMessage = errorText;
      } catch {
        // Fallback mantém a mensagem padronizada
      }
    }
    throw new Error(errorMessage);
  }

  return response;
}

export async function uploadDocument(file, owner = 'anonymous') {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('owner', owner);

  const response = await request('/upload', {
    method: 'POST',
    body: formData,
  });

  return response.json();
}

export async function listDocuments() {
  const response = await request('/documents');
  return response.json();
}

export async function downloadDocument(id) {
  const response = await request(`/documents/${id}/download`);
  return response.blob();
}
