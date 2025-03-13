import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// export const cadastrarJogador = async (data: { nome: string; posicao: string; idade: number; matricula: string; id_equipe: string }) => {
//   return api.post('/jogador', data, { headers: { ...getAuthHeaders() } });
// };

export const cadastrarJogador = async (data: FormData) => {
  return api.post('/jogador', data, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });
};

export const buscarJogadores = async () => {
  return api.get('/jogador', { headers: { ...getAuthHeaders() } });
};

export const buscarJogadorPorID = async (id: string) => {
  return api.get(`/jogador/${id}`, { headers: { ...getAuthHeaders() } });
};

export const atualizarJogador = async (id: string, data: FormData) => {
  return api.put(`/jogador/${id}`, data, {
    headers: { 
      ...getAuthHeaders(), 
      "Content-Type": "multipart/form-data" 
    }
  });
};

export const excluirJogador = async (id: string) => {
  return api.delete(`/jogador/${id}`, { headers: { ...getAuthHeaders() } });
};

export const transferirJogador = async (id: string, id_equipe: string) => {
  return api.patch(`/jogador/${id}/transferir`, { id_equipe }, { headers: { ...getAuthHeaders() } });
};
