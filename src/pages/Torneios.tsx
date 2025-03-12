import { useEffect, useState, useContext } from 'react';
import { buscarTorneios, buscarTorneioPorID, atualizarTorneio, excluirTorneio } from '../services/torneioService';
import { buscarEquipes } from '../services/equipeService';
import { AuthContext } from '../context/AuthContext';
import TorneioForm from '../components/TorneioForm';
import Equipes from './Equipes';
import * as Dialog from '@radix-ui/react-dialog';

interface Torneio {
  id: string;
  descricao: string;
  data: string;
  campus: string;
  equipes?: string[];
}

interface Equipe {
  id: string;
  nome: string;
}

export default function Torneios() {
  const { user } = useContext(AuthContext);
  const [torneios, setTorneios] = useState<Torneio[]>([]);
  const [torneioSelecionado, setTorneioSelecionado] = useState<Torneio | null>(null);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [loadingEquipes, setLoadingEquipes] = useState(false);
  const { logout } = useContext(AuthContext);

  useEffect(() => {
    carregarTorneios();
    carregarEquipes();
  }, []);

  const carregarTorneios = async () => {
    try {
      const response = await buscarTorneios();
      console.log(response)
      setTorneios(response.data);
    } catch (error) {
      console.error('Erro ao carregar torneios:', error);
      alert('Erro ao carregar torneios.');
    }
  };

  const carregarEquipes = async () => {
    try {
      const response = await buscarEquipes();
      setEquipes(response.data);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      alert('Erro ao carregar equipes.');
    }
  };

  const handleSelecionarTorneio = async (id: string) => {
    try {
      setLoadingEquipes(true);
      const response = await buscarTorneioPorID(id);
      setTorneioSelecionado(response.data.torneio);

      console.log(response.data);

    setTimeout(() => {
      setIsManageOpen(true);
      console.log("✅ Abrindo modal com ID do torneio:", response.data.torneio.id);
    }, 0);

    } catch (error) {
      console.error('Erro ao buscar torneio:', error);
      alert('Erro ao buscar torneio.');
    } finally {
      setLoadingEquipes(false);
    }
  };

  const handleSalvarTorneio = async () => {
    if (!torneioSelecionado) return;
  
    const formData = new FormData();
    formData.append("descricao", torneioSelecionado.descricao);
    formData.append("data", torneioSelecionado.data);
    formData.append("campus", torneioSelecionado.campus);
  
    try {
      await atualizarTorneio(torneioSelecionado.id, formData);
      alert("Torneio atualizado com sucesso!");
      setIsOpen(false);
      carregarTorneios();
    } catch (error) {
      console.error("Erro ao atualizar torneio:", error);
      alert("Erro ao atualizar torneio.");
    }
  };

  return (
    <div className="p-4">
      <button onClick={logout} className="bg-red-500 text-white p-2 rounded">
        Sair
      </button>

      <h1 className="text-xl font-bold mb-4">Torneios</h1>
      <TorneioForm onTorneioCriado={carregarTorneios} />

      <ul className="mt-4">
        {torneios.map((torneio) => (
          <li key={torneio.id} className="border p-2 flex justify-between">
            <span>{torneio.descricao} - {torneio.campus}</span>
            <div>
              <button onClick={() => handleSelecionarTorneio(torneio.id)} className="bg-blue-500 text-white p-1 mx-1">Gerenciar Equipes</button>
              <button onClick={() => { setTorneioSelecionado(torneio); setIsOpen(true); }} className="bg-yellow-500 text-white p-1 mx-1">Editar</button>
              <button 
                onClick={async () => {
                  if (confirm("Tem certeza que deseja excluir este torneio?")) {
                    await excluirTorneio(torneio.id);
                    carregarTorneios();
                  }
                }} 
                className="bg-red-500 text-white p-1">
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
            <Dialog.Title className="text-lg font-bold">Editar Torneio</Dialog.Title>
            <input
              value={torneioSelecionado?.descricao || ''}
              onChange={(e) => setTorneioSelecionado((prev) => prev ? { ...prev, descricao: e.target.value } : prev)}
              className="border p-2 w-full"
              placeholder="Descrição"
            />
            <input
              value={torneioSelecionado?.data || ''}
              onChange={(e) => setTorneioSelecionado((prev) => prev ? { ...prev, data: e.target.value } : prev)}
              type="date"
              className="border p-2 w-full mt-2"
              placeholder="Data"
            />
            <input
              value={torneioSelecionado?.campus || ''}
              onChange={(e) => setTorneioSelecionado((prev) => prev ? { ...prev, campus: e.target.value } : prev)}
              className="border p-2 w-full mt-2"
              placeholder="Campus"
            />

            <h3 className="mt-4">Adicionar Equipes</h3>
            <select
              multiple
              className="border p-2 w-full"
              onChange={(e) =>
                setTorneioSelecionado((prev) =>
                  prev
                    ? {
                        ...prev,
                        equipes: [...e.target.selectedOptions].map((opt) => opt.value),
                      }
                    : prev
                )
              }
            >
              {equipes.map((equipe) => (
                <option key={equipe.id} value={equipe.id} selected={torneioSelecionado?.equipes?.includes(equipe.id)}>
                  {equipe.nome}
                </option>
              ))}
            </select>

            <div className="flex justify-end gap-2 mt-4">
              <Dialog.Close asChild>
                <button className="bg-red-500 text-white p-2 rounded">Cancelar</button>
              </Dialog.Close>
                <button onClick={handleSalvarTorneio} className="bg-green-500 text-white p-2 rounded">Salvar</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isManageOpen} onOpenChange={setIsManageOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
            <Dialog.Title className="text-lg font-bold">Gerenciar Equipes</Dialog.Title>
            <Dialog.Description className="text-sm text-gray-600">
              Selecione ou adicione equipes ao torneio.
            </Dialog.Description>

            {loadingEquipes ? (
              <p>Carregando equipes...</p>
            ) : torneioSelecionado ? (
              <Equipes idTorneio={torneioSelecionado ? torneioSelecionado.id : ""} onEquipeAlterada={carregarTorneios} />
            ) : (
              <p>Nenhum torneio selecionado</p>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
