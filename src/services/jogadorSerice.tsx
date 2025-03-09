import api from './api';

export const cadastrarJogador = async (data: { nome: string; posicao: string; idade: number; matricula: string; id_equipe: string }) => {
  return api.post('/jogador', data);
};

export const buscarJogadores = async () => {
  return api.get('/jogador');
};

export const buscarJogadorPorID = async (id: string) => {
  return api.get(`/jogador/${id}`);
};

export const atualizarJogador = async (id: string, data: { nome?: string; posicao?: string; idade?: number }) => {
  return api.put(`/jogador/${id}`, data);
};

export const excluirJogador = async (id: string) => {
  return api.delete(`/jogador/${id}`);
};

export const transferirJogador = async (id: string, id_equipe: string) => {
  return api.patch(`/jogador/${id}/transferir`, { id_equipe });
};
