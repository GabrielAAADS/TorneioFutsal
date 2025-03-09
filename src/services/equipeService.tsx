import api from './api';

export const cadastrarEquipe = async (data: { nome: string; lema?: string; id_torneio: string }) => {
  return api.post('/equipe', data);
};

export const buscarEquipes = async () => {
  return api.get('/equipe');
};

export const buscarEquipePorID = async (id: string) => {
  return api.get(`/equipe/${id}`);
};

export const atualizarEquipe = async (id: string, data: { nome?: string; lema?: string }) => {
  return api.put(`/equipe/${id}`, data);
};

export const excluirEquipe = async (id: string) => {
  return api.delete(`/equipe/${id}`);
};
