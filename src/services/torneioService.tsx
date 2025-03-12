import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cadastrarTorneio = async (data: FormData) => {
  return api.post('/torneio', data, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() } });
};

export const buscarTorneios = async () => {
  return api.get('/torneio', { headers: { ...getAuthHeaders() } });
};

export const buscarTorneioPorID = async (id: string) => {
  return api.get(`/torneio/${id}`, { headers: { ...getAuthHeaders() } });
};

export const atualizarTorneio = async (id: string, data: FormData) => {
  return api.put(`/torneio/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data', ...getAuthHeaders() } });
};

export const excluirTorneio = async (id: string) => {
  return api.delete(`/torneio/${id}`, { headers: { ...getAuthHeaders() } });
};
