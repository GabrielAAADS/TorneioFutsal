import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cadastrarEquipe = async (data: { nome: string; lema?: string; id_torneio: string }) => {
  return api.post('/equipe', data, { headers: { ...getAuthHeaders() } });
};

export const buscarEquipes = async () => {
  return api.get('/equipe', { headers: { ...getAuthHeaders() } });
};

export const buscarEquipePorID = async (id: string) => {
  return api.get(`/equipe/${id}`, { headers: { ...getAuthHeaders() } });
};

// export const atualizarEquipe = async (id: string, data: { nome?: string; lema?: string }) => {
//   return api.put(`/equipe/${id}`, data, { headers: { ...getAuthHeaders() } });
// };

export const atualizarEquipe = async (id: string, data: any) => {
  try {
    const response = await api.put(`/equipe/${id}`, data, { headers: { ...getAuthHeaders() } });
    return response.data;
  } catch (error: any) {
    throw new Error(error.response?.data?.mensagem || "Erro ao atualizar equipe.");
  }
};

export const excluirEquipe = async (id: string) => {
  return api.delete(`/equipe/${id}`, { headers: { ...getAuthHeaders() } });
};
