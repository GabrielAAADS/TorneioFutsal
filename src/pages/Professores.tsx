import { useEffect, useState } from 'react';
import { buscarProfessores, buscarProfessorPorID, cadastrarProfessor, atualizarProfessor, editarEmailSenha, excluirProfessor } from '../services/professorService';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as z from 'zod';

interface Professor {
    id: string;
    nome: string;
    cref: string;
    email: string;
}

const schema = z.object({
    nome: z.string().min(1, 'Nome obrigatório'),
    cref: z.string().min(1, 'CREF obrigatório'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export default function Professores() {
    const { register, handleSubmit, formState: { errors }, reset } = useForm({
        resolver: zodResolver(schema),
    });
    const [professores, setProfessores] = useState<Professor[]>([]);
    const [professorSelecionado, setProfessorSelecionado] = useState<Professor | null>(null);
    const [isOpen, setIsOpen] = useState(false);
    const [novoEmail, setNovoEmail] = useState('');
    const [novaSenha, setNovaSenha] = useState('');

    useEffect(() => {
        carregarProfessores();
    }, []);

    const carregarProfessores = async () => {
        try {
          const response = await buscarProfessores();
          setProfessores(response.data);
        } catch (error) {
          console.error('Erro ao carregar professores:', error);
          alert('Erro ao carregar professores.');
        }
    };

    const onSubmit = async (professor: any) => {
        try {
          const response = await cadastrarProfessor(professor);
          alert('Professor cadastrado com sucesso!');
          reset();
          carregarProfessores();
        } catch (error) {
          console.error('Erro ao cadastrar professor:', error);
          alert('Erro ao cadastrar professor.');
        }
    };

    const handleEditar = async (id: string) => {
        try {
          const response = await buscarProfessorPorID(id);
          setProfessorSelecionado(response.data);
          setNovoEmail(response.data.email);
          setIsOpen(true);
        } catch (error) {
          console.error('Erro ao buscar professor:', error);
          alert('Erro ao buscar professor.');
        }
    };

    const handleAtualizar = async () => {
        try {
          if (!professorSelecionado) return;

          const { nome, cref } = professorSelecionado;
        
          const response = await atualizarProfessor({ nome, cref });
          alert('Professor atualizado!');
          setProfessorSelecionado(null);
          setIsOpen(false);
          carregarProfessores();
        } catch (error) {
          console.error('Erro ao atualizar professor:', error);
          alert('Erro ao atualizar professor.');
        }
    };

    const handleAtualizarEmailSenha = async () => {
        try {
            await editarEmailSenha({ email: novoEmail, senha: novaSenha });
            alert('E-mail e senha atualizados com sucesso!');
            setIsOpen(false);
            carregarProfessores();
        } catch (error) {
            console.error('Erro ao atualizar e-mail/senha:', error);
            alert('Erro ao atualizar e-mail/senha.');
        }
    };

    const handleExcluir = async (id: string) => {
        if (confirm('Tem certeza que deseja excluir?')) {
          try {
            await excluirProfessor();
            alert('Professor excluído!');
            carregarProfessores();
          } catch (error) {
            console.error('Erro ao excluir professor:', error);
            alert('Erro ao excluir professor.');
          }
        }
    };

    return (
        <div className="p-4">
          <h1 className="text-xl font-bold mb-4">Professores</h1>
    
          {/* Formulário para Criar */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
            <input {...register('nome')} placeholder="Nome" className="border p-2 w-full" />
            {errors.nome && <p className="text-red-500">{errors.nome.message}</p>}
            
            <input {...register('cref')} placeholder="CREF" className="border p-2 w-full" />
            {errors.cref && <p className="text-red-500">{errors.cref.message}</p>}
            
            <input {...register('email')} placeholder="Email" type="email" className="border p-2 w-full" />
            {errors.email && <p className="text-red-500">{errors.email.message}</p>}
            
            <input {...register('senha')} placeholder="Senha" type="password" className="border p-2 w-full" />
            {errors.senha && <p className="text-red-500">{errors.senha.message}</p>}
            
            <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Cadastrar</button>
          </form>
    
          {/* Listagem de Professores */}
          <ul className="mt-4">
            {professores.map((prof: any) => (
              <li key={prof.id} className="border p-2 flex justify-between">
                <span>{prof.nome} - {prof.email}</span>
                <div>
                  <button onClick={() => handleEditar(prof.id)} className="bg-yellow-500 text-white p-1 mx-1">Editar</button>
                  <button onClick={() => handleExcluir(prof.id)} className="bg-red-500 text-white p-1">Excluir</button>
                </div>
              </li>
            ))}
          </ul>
    
          {/* Modal para Editar Professor */}
          <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
            <Dialog.Portal>
              <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
              <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
                <Dialog.Title className="text-lg font-bold">Editar Professor</Dialog.Title>
                
                <input
                  value={professorSelecionado?.nome || ''}
                  onChange={(e) => setProfessorSelecionado(prev => prev ? { ...prev, nome: e.target.value } : null)}
                  className="border p-2 w-full"
                  placeholder="Nome"
                />

                <input
                  value={professorSelecionado?.cref || ''}
                  onChange={(e) => setProfessorSelecionado(prev => prev ? { ...prev, cref: e.target.value } : null)}
                  className="border p-2 w-full mt-2"
                  placeholder="CREF"
                />

                <input
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="border p-2 w-full mt-2"
                  placeholder="Novo Email"
                />

                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="border p-2 w-full mt-2"
                  placeholder="Nova Senha"
                />

                <div className="flex justify-end gap-2 mt-4">
                  <button onClick={handleAtualizar} className="bg-green-500 text-white p-2 rounded">Salvar</button>
                  <button onClick={handleAtualizarEmailSenha} className="bg-blue-500 text-white p-2 rounded">Atualizar E-mail/Senha</button>
                </div>
              </Dialog.Content>
            </Dialog.Portal>
          </Dialog.Root>
        </div>
    );
}
