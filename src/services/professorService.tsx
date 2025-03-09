import api from './api';

export const cadastrarProfessor = async (data: { nome: string; cref: string; email: string; senha: string }) => {
  return api.post('/professor', data);
};

export const loginProfessor = async (data: { email: string; senha: string }) => {
  return api.post('/professor/login', data);
};

export const buscarProfessores = async () => {
  return api.get('/professor');
};

export const buscarProfessorPorID = async (id: string) => {
  return api.get(`/professor/${id}`);
};

export const atualizarProfessor = async (data: { nome?: string; cref?: string }) => {
  return api.put('/professor', data);
};

export const editarEmailSenha = async (data: { email?: string; senha?: string }) => {
  return api.patch('/professor', data);
};

export const excluirProfessor = async () => {
  return api.delete('/professor');
};
