import { useEffect, useState } from 'react';
import { buscarTorneios, buscarTorneioPorID, atualizarTorneio, excluirTorneio } from '../services/torneioService';
import { buscarEquipes } from '../services/equipeService';
import TorneioForm from '../components/TorneioForm';
import Equipes from './Equipes';
import * as Dialog from '@radix-ui/react-dialog';

interface Torneio {
  id: string;
  descricao: string;
  data: string;
  campus: string;
  img_local: string;
  equipes?: string[];
  latitude?: string;
  longitude?: string;
}

interface Equipe {
  id: string;
  nome: string;
}

export default function Torneios() {
  const [torneios, setTorneios] = useState<Torneio[]>([]);
  const [torneioSelecionado, setTorneioSelecionado] = useState<Torneio | null>(null);
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isManageOpen, setIsManageOpen] = useState(false);
  const [loadingEquipes, setLoadingEquipes] = useState(false);
  const [localTexts, setLocalTexts] = useState<{ [id: string]: string }>({});
  
  useEffect(() => {
    carregarTorneios();
    carregarEquipes();
  }, []);

  const carregarTorneios = async () => {
    try {
      const response = await buscarTorneios();
      console.log(response)
      setTorneios(response.data);

      const partialMap: { [id: string]: string } = {};
      for (const t of torneios) {
        if (t.latitude && t.longitude) {
          const latNum = parseFloat(t.latitude);
          const lngNum = parseFloat(t.longitude);
          if (!isNaN(latNum) && !isNaN(lngNum)) {
            const address = await reverseGeocode(latNum, lngNum);
            partialMap[t.id] = address;
          }
        }
      }

   setLocalTexts(partialMap);
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

  async function reverseGeocode(lat: number, lng: number): Promise<string> {
     try {
       const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`;
       const resp = await fetch(url);
       if (!resp.ok) throw new Error("Falha ao buscar endereço");
       const data = await resp.json();
       return data.display_name || "Endereço não encontrado";
     } catch {
       return "Não foi possível obter endereço.";
     }
   }

  return (
    <div className="container mx-auto px-4 py-6">

      <nav className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h1 className="text-lg font-bold">Gestão de Torneios</h1>
      </nav>

      <h1 className="text-xl font-bold mb-4">Torneios</h1>
      <TorneioForm onTorneioCriado={carregarTorneios} />

      <ul className="mt-4">
        {torneios.map((torneio) => (
        <li key={torneio.id} className="border p-4 rounded shadow-md flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div className="flex-1">
            <h2 className="text-lg font-bold">{torneio.descricao}</h2>
            <p className="text-sm text-gray-600">{torneio.campus}</p>
            {localTexts[torneio.id] && (
              <p className="text-sm text-gray-500 mt-1">Local: {localTexts[torneio.id]}</p>
            )}
          </div>
          <div className="mt-2 md:mt-0">
            {torneio?.img_local && (
              <img
                src={`http://localhost:3000/uploads/${torneio?.img_local}`}
                alt="Imagem do torneio"
                className="w-24 h-24 m-4 object-cover rounded"
              />
            )}
          </div>
          <div className="mt-2 md:mt-0 flex flex-col space-y-1">
            <button onClick={() => handleSelecionarTorneio(torneio.id)} className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded">
              Gerenciar Equipes
            </button>
            <button onClick={() => { setTorneioSelecionado(torneio); setIsOpen(true); }} className="bg-yellow-500 hover:bg-yellow-600 text-white py-1 px-2 rounded">
              Editar
            </button>
            <button onClick={async () => {
              if (confirm("Tem certeza que deseja excluir este torneio?")) {
                await excluirTorneio(torneio.id);
                carregarTorneios();
              }
            }} className="bg-red-500 hover:bg-red-600 text-white py-1 px-2 rounded">
              Excluir
            </button>
          </div>
        </li>

        ))}
      </ul>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content 
            className="text-center fixed bg-white p-6 rounded shadow-md max-w-md w-full"
            style={{ position: 'fixed', top: '15%', left: '50%', transform: 'translate(-50%, 0)', height: '80%' }}
          >
            <Dialog.Title className="text-lg font-bold mb-4">Editar Torneio</Dialog.Title>
            <input 
              value={torneioSelecionado?.descricao || ''} 
              onChange={(e) => setTorneioSelecionado(prev => prev ? { ...prev, descricao: e.target.value } : prev)} 
              className="border p-2 w-full mb-2" 
              placeholder="Descrição" 
            />
            <input 
              value={torneioSelecionado?.data || ''} 
              onChange={(e) => setTorneioSelecionado(prev => prev ? { ...prev, data: e.target.value } : prev)} 
              type="date" 
              className="border p-2 w-full mb-2" 
              placeholder="Data" 
            />
            <input 
              value={torneioSelecionado?.campus || ''} 
              onChange={(e) => setTorneioSelecionado(prev => prev ? { ...prev, campus: e.target.value } : prev)} 
              className="border p-2 w-full mb-2" 
              placeholder="Campus" 
            />
            <h3 className="mt-4 mb-2 font-semibold">Adicionar Equipes</h3>
            <select 
              multiple 
              className="border p-2 w-full mb-4"
              onChange={(e) =>
                setTorneioSelecionado(prev => prev 
                  ? { ...prev, equipes: [...e.target.selectedOptions].map(opt => opt.value) } 
                  : prev
                )
              }
            >
              {equipes.map(equipe => (
                <option key={equipe.id} value={equipe.id} selected={torneioSelecionado?.equipes?.includes(equipe.id)}>
                  {equipe.nome}
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-2">
              <Dialog.Close asChild>
                <button className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded">Cancelar</button>
              </Dialog.Close>
              <button onClick={handleSalvarTorneio} className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded">
                Salvar
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      <Dialog.Root open={isManageOpen} onOpenChange={setIsManageOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="text-center fixed bg-white p-6 rounded shadow-md"
            style={{
              top: '10%',
              left: '50%',
              transform: 'translateX(-50%)',
              position: 'fixed'
            }}>
            <Dialog.Title className="text-lg font-bold mb-4">Gerenciar Equipes</Dialog.Title>
            <Dialog.Description className="text-sm mb-4 text-gray-600">
              Selecione ou adicione equipes ao torneio.
            </Dialog.Description>

            {loadingEquipes ? (
              <p>Carregando equipes...</p>
            ) : torneioSelecionado ? (
              <Equipes idTorneio={torneioSelecionado ? torneioSelecionado.id : ""} 
                onEquipeAlterada={carregarTorneios}
                tournamentDate={torneioSelecionado.data}
              />
            ) : (
              <p>Nenhum torneio selecionado</p>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
