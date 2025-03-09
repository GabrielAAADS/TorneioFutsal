import api from './api';

export const cadastrarTorneio = async (data: FormData) => {
  return api.post('/torneio', data, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const buscarTorneios = async () => {
  return api.get('/torneio');
};

export const buscarTorneioPorID = async (id: string) => {
  return api.get(`/torneio/${id}`);
};

export const atualizarTorneio = async (id: string, data: FormData) => {
  return api.put(`/torneio/${id}`, data, { headers: { 'Content-Type': 'multipart/form-data' } });
};

export const excluirTorneio = async (id: string) => {
  return api.delete(`/torneio/${id}`);
};
