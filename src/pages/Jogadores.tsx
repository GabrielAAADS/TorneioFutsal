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
  imagem?: string;
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
  imagem: z
    .instanceof(FileList)
    .refine((files) => files.length > 0, 'A imagem é obrigatória'),
});

export default function Jogadores({ idEquipe }: { idEquipe: string }) {
  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(schema),
  });

  const [jogadores, setJogadores] = useState<Jogador[]>([]);
  const [jogadorSelecionado, setJogadorSelecionado] = useState<Jogador | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const posicoes = Object.values(PosicaoFutsalEnum.Values);

  const [titulares, setTitulares] = useState<{[key: string]: Jogador | null}>({});
  const [reservas, setReservas] = useState<{[key: string]: Jogador | null}>({});

  useEffect(() => {
    carregarJogadores();
    const initTitulares: {[key: string]: Jogador | null} = {};
    const initReservas: {[key: string]: Jogador | null} = {};
    
    posicoes.forEach(pos => {
      initTitulares[pos] = null;
      initReservas[pos] = null;
    });
    setTitulares(initTitulares);
    setReservas(initReservas);

  }, [idEquipe]);

  const carregarJogadores = async () => {
    try {
      const response = await buscarJogadores();
      setJogadores(response.data.filter((jogador: Jogador) => jogador.id_equipe === idEquipe));
      distribuirJogadores(response.data.filter((j: Jogador) => j.id_equipe === idEquipe));
    } catch (error) {
      console.error('Erro ao carregar jogadores:', error);
      alert('Erro ao carregar jogadores.');
    }
  };

  const distribuirJogadores = (lista: Jogador[]) => {
    const newTitulares: {[key: string]: Jogador | null} = {};
    const newReservas: {[key: string]: Jogador | null} = {};
    posicoes.forEach(pos => {
      const jPos = lista.filter(j => j.posicao === pos);
      if (jPos.length === 0) {
        newTitulares[pos] = null;
        newReservas[pos] = null;
      } else if (jPos.length === 1) {
        newTitulares[pos] = jPos[0];
        newReservas[pos] = null;
      } else if (jPos.length >= 2) {
        newTitulares[pos] = jPos[0];
        newReservas[pos] = jPos[1];
        if (jPos.length > 2) {
          alert(`Limite máximo para a posição ${pos} atingido (2)!`);
        }
      }
    });
    setTitulares(newTitulares);
    setReservas(newReservas);
  };

  const trocarTitularReserva = (pos: string, modo: 'titular'|'reserva') => {
    if (!confirm("Mudar a escalação?")) return;

    const currentTitular = titulares[pos];
    const currentReserva = reservas[pos];

    setTitulares(prevTitulares => {
      const titular = prevTitulares[pos];
      const reserva = reservas[pos];
    
      setReservas(prev => ({
        ...prev,
        [pos]: titular
      }));
    
      return {
        ...prevTitulares,
        [pos]: reserva
      };
    });

    const substitutions = JSON.parse(localStorage.getItem("substitutions") || "[]");
    substitutions.push({
      time: new Date().toISOString(),
      idEquipe: idEquipe,
      posicao: pos,
      deTitular: currentTitular ? currentTitular.nome : null,
      deReserva: currentReserva ? currentReserva.nome : null,
      newTitular: currentReserva ? currentReserva.nome : null,
      newReserva: currentTitular ? currentTitular.nome : null
    });
    localStorage.setItem("substitutions", JSON.stringify(substitutions));
  };

  const handleEditar = async (id: string) => {
    try {
      const response = await buscarJogadorPorID(id);
      setJogadorSelecionado(response.data.jogador);
      setIsOpen(true);
    } catch (error) {
      console.error('Erro ao buscar jogador:', error);
      alert('Erro ao buscar jogador.');
    }
  };

  const handleAtualizar = async () => {
    try {
      if (!jogadorSelecionado) return;

      const formData = new FormData();
      formData.append("nome", jogadorSelecionado.nome);
      formData.append("posicao", jogadorSelecionado.posicao);
      formData.append("idade", jogadorSelecionado.idade.toString());
      formData.append("matricula", jogadorSelecionado.matricula);
      if (selectedFile) formData.append("imagem", selectedFile);

      await atualizarJogador(jogadorSelecionado.id, formData);

      alert('Jogador atualizado!');
      setJogadorSelecionado(null);
      setIsOpen(false);
      carregarJogadores();
    } catch (error) {
      console.error('Erro ao atualizar jogador:', error);
      alert('Erro ao atualizar jogador.');
    }
  };

  const onSubmit = async (data: any) => {
    try {
      const formData = new FormData();
      formData.append('nome', data.nome);
      formData.append('posicao', data.posicao);
      formData.append('idade', data.idade.toString());
      formData.append('matricula', data.matricula);
      formData.append('id_equipe', idEquipe);
      if (data.imagem && data.imagem[0]) {
        formData.append('imagem', data.imagem[0]);
      }
      
      await cadastrarJogador(formData);
      alert('Jogador cadastrado com sucesso!');
      reset();
      carregarJogadores();
    } catch (error) {
      console.error('Erro ao cadastrar jogador:', error);
      alert('Erro ao cadastrar jogador.');
    }
  };
  
  function getCoordsFor(pos: string) {
      switch (pos) {
        case 'Goleiro':
          return { top: '340%', left: '156%' };  
        case 'Fixo':
          return { top: '200%', left: '50%' };   
        case 'Ala Direita':
          return { top: '155%', left: '60%' };
        case 'Ala Esquerda':
          return { top: '30%', left: '40%' };
        case 'Pivô':
          return { top: '-80%', left: '50%' };
        default:
          return { top: '50%', left: '50%' };
      }
    }

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

        <input
          type="file"
          accept="image/*"
          {...register('imagem')}
          className="border p-2 w-full mt-2"
        />
        {errors.imagem && <p className="text-red-500">{errors.imagem.message}</p>}

        <button type="submit" className="bg-blue-500 text-white p-2 rounded w-full">Cadastrar</button>
      </form>
      
      <ul className="mt-4">
        {jogadores.map((jogador: Jogador) => (
          <li key={jogador.id} className="border p-2 flex justify-between">
            <span>{jogador.nome} - {jogador.posicao}</span>
            <div>
              <button onClick={() => { setJogadorSelecionado(jogador); setIsTransferOpen(true); }} className="bg-blue-500 text-white p-1 mx-1">Transferir</button>
              <button onClick={() => handleEditar(jogador.id)} className="bg-yellow-500 text-white p-1 mx-1">Editar</button>
              <button
                onClick={async () => {
                  try {
                    await excluirJogador(jogador.id);
                    carregarJogadores();
                  } catch (error) {
                    console.error("Erro ao excluir jogador:", error);
                  }
                }}
                className="bg-red-500 text-white p-1"
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <div className="flex mt-8">
        <div className="relative w-2/3 mr-4" style={{ minHeight: '300px' }}>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: 'url("/futsal-half-court.jpg")',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 0.8
            }}
          />
          <h2 className="font-bold mb-2">Titulares</h2>
          <div className="grid grid-cols-3 gap-4">
            {posicoes.map(pos => {
              const titular = titulares[pos];
              const coords = getCoordsFor(pos);

              return (
                <div key={pos} className="relative cursor-pointer flex flex-col items-center justify-center absolute"
                  style={{
                    top: coords.top,
                    left: coords.left,
                    transform: 'translate(-50%, -50%)'
                  }}
                  onClick={() => {
                    if (reservas[pos]) {
                      trocarTitularReserva(pos, 'titular');
                    }
                  }}
                  title="Clique para trocar com reserva"
                >
                  {titular ? (
                    <>
                      <img
                        src={`http://localhost:3000/uploads/${titular.imagem}`}
                        alt={titular.nome}
                        className="w-full h-28 w-32 object-cover rounded-full mx-auto"
                      />
                      <p className="text-center mt-2">{titular.nome}</p>
                    </>
                  ) : (
                    <div className="h-28 w-32 bg-gray-300 flex items-center justify-center rounded">
                      <span className="text-gray-700 ">Vazio - {pos}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="w-1/3 flex flex-col-reverse items-end p-4">
          <h2 className="font-bold mb-2">Reservas</h2>
          <div className="flex flex-col-reverse space-y-4">
            {posicoes.map(pos => {
              const reserva = reservas[pos];
              return (
                <div key={pos} className="relative cursor-pointer flex flex-col items-center justify-center"
                  onClick={() => {
                    if (titulares[pos]) {
                      trocarTitularReserva(pos, 'reserva');
                    }
                  }}
                  title="Clique para trocar com titular"
                >
                  {reserva ? (
                    <>
                      <img
                        src={`http://localhost:3000/uploads/${reserva.imagem}`}
                        alt={reserva.nome}
                        className="w-20 h-14 object-cover rounded"
                      />
                      <p className="text-center">{reserva.nome}</p>
                    </>
                  ) : (
                    <div className="w-full h-20 bg-gray-300 flex items-center justify-center rounded">
                      <span className="text-gray-700">Vazio - {pos}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

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

            <select
              value={jogadorSelecionado?.posicao || ''}
              onChange={(e) =>
                setJogadorSelecionado((prev) =>
                  prev ? { ...prev, posicao: e.target.value } : null
                )
              }
              className="border p-2 w-full mt-2"
            >
              {Object.values(PosicaoFutsalEnum.Values).map((posicao) => (
                <option key={posicao} value={posicao}>
                  {posicao}
                </option>
              ))}
            </select>

            <input
              value={jogadorSelecionado?.idade || ''}
              onChange={(e) => setJogadorSelecionado((prev) => prev ? { ...prev, idade: Number(e.target.value) } : prev)}
              type="number"
              className="border p-2 w-full mt-2"
              placeholder="Idade"
            />

            <input
              value={jogadorSelecionado?.matricula || ''}
              onChange={(e) =>
                setJogadorSelecionado((prev) =>
                  prev ? { ...prev, matricula: e.target.value } : null
                )
              }
              className="border p-2 w-full mt-2"
              placeholder="Matrícula"
            />

            {jogadorSelecionado?.imagem && (
              <img
                src={`http://localhost:3000/uploads/${jogadorSelecionado.imagem}`}
                alt="Imagem do jogador"
                className="mt-2 w-24 h-24 object-cover"
              />
            )}

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
              className="border p-2 w-full mt-2"
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
