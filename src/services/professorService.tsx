import api from './api';

const getAuthHeaders = () => {
  const token = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")!).token : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const cadastrarProfessor = async (data: FormData) => {
  return api.post('/professor', data, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });
};


export const loginProfessor = async (data: { email: string; senha: string }) => {
  return api.post('/professor/login', data, { headers: { ...getAuthHeaders() } });
};

export const buscarProfessores = async () => {
  return api.get('/professor', { headers: { ...getAuthHeaders() } });
};

export const buscarProfessorPorID = async (id: string) => {
  return api.get(`/professor/${id}`, { headers: { ...getAuthHeaders() } });
};

export const atualizarProfessor = async (data: FormData) => {
  return api.put('/professor', data, { headers: { ...getAuthHeaders(), 'Content-Type': 'multipart/form-data' } });
};

export const editarEmailSenha = async (data: { email?: string; senha?: string }) => {
  return api.patch('/professor', data, { headers: { ...getAuthHeaders() } });
};

export const excluirProfessor = async () => {
  return api.delete('/professor', { headers: { ...getAuthHeaders() } });
};
