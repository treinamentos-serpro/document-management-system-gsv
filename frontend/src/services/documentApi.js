async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    headers: {
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || 'Erro ao comunicar com o backend.');
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
