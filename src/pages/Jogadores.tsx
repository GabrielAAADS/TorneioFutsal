import { useEffect, useState } from 'react';
import { cadastrarJogador, buscarJogadores, buscarJogadorPorID, atualizarJogador, excluirJogador } from '../services/jogadorSerice';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as Dialog from '@radix-ui/react-dialog';
import * as z from 'zod';
import JogadorTransferencia from './JogadorTransferencia';

interface Jogador {
  id: string;
  nome: string;
  posicao: string;
  idade: number;
  matricula: string;
  id_equipe: string;
}

export const PosicaoFutsalEnum = z.enum([
  'Goleiro',
  'Fixo',
  'Ala Direita',
  'Ala Esquerda',
  'Pivô',
]);

const schema = z.object({
  nome: z.string().min(3, 'O nome deve ter pelo menos 3 caracteres'),
  posicao: PosicaoFutsalEnum,
  idade: z.number().min(10, 'A idade mínima é 10 anos'),
  matricula: z.string().min(5, 'A matrícula deve ter pelo menos 5 caracteres'),
});

export default function Jogadores({ idEquipe }: { idEquipe: string }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [jogadorSelecionado, setJogadorSelecionado] = useState<Jogador | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);

  useEffect(() => {
    carregarJogadores();
  }, [idEquipe]);

  const carregarJogadores = async () => {
    try {
      const response = await buscarJogadores();
      setJogadores(response.data.filter((jogador: Jogador) => jogador.id_equipe === idEquipe));
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      alert('Erro ao carregar jogadores.');
    }
  };

  const handleEditar = async (id: string) => {
    try {
      const response = await buscarJogadorPorID(id);
      setJogadorSelecionado(response.data);
      setIsOpen(true);
    } catch (error) {
      console.error('Erro ao buscar jogador:', error);
      alert('Erro ao buscar jogador.');
    }
  };

  const handleAtualizar = async () => {
    try {
      if (!jogadorSelecionado) return;

      const { id, nome, posicao, idade } = jogadorSelecionado;
      await atualizarJogador(id, { nome, posicao, idade });

      alert('Jogador atualizado!');
      setJogadorSelecionado(null);
      setIsOpen(false);
      carregarJogadores();
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      alert('Erro ao atualizar jogador.');
    }
  };

  const onSubmit = async (jogador: any) => {
    try {
      const response = await cadastrarJogador({ ...jogador, id_equipe: idEquipe });
      alert('Jogador cadastrado com sucesso!');
      reset();
      carregarJogadores();
    } catch (error) {
      console.error('Erro ao cadastrar jogador:', error);
      alert('Erro ao cadastrar jogador.');
    }
  };
  
  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Jogadores</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <input {...register('nome')} placeholder="Nome do Jogador" className="border p-2 w-full" />
        {errors.nome && <p className="text-red-500">{errors.nome.message}</p>}

        <select {...register('posicao')} className="border p-2 w-full">
          {Object.values(PosicaoFutsalEnum.Values).map((posicao) => (
            <option key={posicao} value={posicao}>{posicao}</option>
          ))}
        </select>
        {errors.posicao && <p className="text-red-500">{errors.posicao.message}</p>}

        <input {...register('idade', { valueAsNumber: true })} placeholder="Idade" type="number" className="border p-2 w-full" />
        {errors.idade && <p className="text-red-500">{errors.idade.message}</p>}

        <input {...register('matricula')} placeholder="Matrícula" className="border p-2 w-full" />
        {errors.matricula && <p className="text-red-500">{errors.matricula.message}</p>}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Cadastrar</button>
      </form>
      
      <ul className="mt-4">
        {jogadores.map((jogador: Jogador) => (
          <li key={jogador.id} className="border p-2 flex justify-between">
            <span>{jogador.nome} - {jogador.posicao}</span>
            <div>
	          <button onClick={() => { setJogadorSelecionado(jogador); setIsTransferOpen(true); }} className="bg-blue-500 text-white p-1 mx-1">Mover</button>
              <button onClick={() => handleEditar(jogador.id)} className="bg-yellow-500 text-white p-1 mx-1">Editar</button>
              <button onClick={() => excluirJogador(jogador.id)} className="bg-red-500 text-white p-1">Excluir</button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
            <Dialog.Title className="text-lg font-bold">Editar Jogador</Dialog.Title>
            <input
              value={jogadorSelecionado?.nome || ''}
              onChange={(e) => setJogadorSelecionado((prev) => prev ? { ...prev, nome: e.target.value } : prev)}
              className="border p-2 w-full"
              placeholder="Nome"
            />
            <input
              value={jogadorSelecionado?.posicao || ''}
              onChange={(e) => setJogadorSelecionado((prev) => prev ? { ...prev, posicao: e.target.value } : prev)}
              className="border p-2 w-full mt-2"
              placeholder="Posição"
            />
            <input
              value={jogadorSelecionado?.idade || ''}
              onChange={(e) => setJogadorSelecionado((prev) => prev ? { ...prev, idade: Number(e.target.value) } : prev)}
              type="number"
              className="border p-2 w-full mt-2"
              placeholder="Idade"
            />
            <div className="flex justify-end gap-2 mt-4">
              <Dialog.Close asChild>
                <button className="bg-red-500 text-white p-2 rounded">Cancelar</button>
              </Dialog.Close>
              <button onClick={handleAtualizar} className="bg-green-500 text-white p-2 rounded">Salvar</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      
      <Dialog.Root open={isTransferOpen} onOpenChange={setIsTransferOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
            <Dialog.Title className="text-lg font-bold">Mover Jogador</Dialog.Title>
            {jogadorSelecionado && <JogadorTransferencia jogador={jogadorSelecionado} onTransferenciaConcluida={carregarJogadores} />}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
