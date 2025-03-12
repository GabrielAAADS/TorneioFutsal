import { useEffect, useState } from 'react';
import { cadastrarEquipe, buscarEquipes, atualizarEquipe, excluirEquipe } from '../services/equipeService';
import * as Dialog from '@radix-ui/react-dialog';
import EquipeForm from '../components/EquipeForm';

interface Equipe {
  id: string;
  nome: string;
  lema?: string;
  id_torneio: string;
}

export default function Equipes({ idTorneio, onEquipeAlterada }: { idTorneio: string, onEquipeAlterada: () => void  }) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState<Equipe | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    carregarEquipes();
  }, [idTorneio]);

  const carregarEquipes = async () => {
    try {
      const response = await buscarEquipes();
      setEquipes(response.data.filter((equipe: Equipe) => equipe.id_torneio === idTorneio));
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      alert('Erro ao carregar equipes.');
    }
  };

  const handleEditar = (equipe: Equipe) => {
    setEquipeSelecionada(equipe);
    setIsOpen(true);
  };

  const handleExcluir = async (id: string) => {
    if (loading) return;
    if (confirm('Tem certeza que deseja excluir esta equipe?')) {
        try {
            setLoading(true);
            await excluirEquipe(id);
            alert('Equipe excluída!');
            await carregarEquipes();
            onEquipeAlterada();
        } catch (error) {
            console.error('Erro ao excluir equipe:', error);
            alert('Erro ao excluir equipe.');
        } finally {
            setLoading(false);
        }
    }
};

console.log("ID do Torneio passado para EquipeForm:", idTorneio);

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Equipes</h1>
      
      <button onClick={() => setIsOpen(true)} className="bg-blue-500 text-white p-2 rounded">
        Adicionar Equipe
      </button>
      
      <ul className="mt-4">
        {equipes.map((equipe) => (
          <li key={equipe.id} className="border p-2 flex justify-between">
            <span>{equipe.nome} - {equipe.lema}</span>
            <div>
              <button onClick={() => handleEditar(equipe)} className="bg-yellow-500 text-white p-1 mx-1">Editar</button>
              <button 
                onClick={() => handleExcluir(equipe.id)} 
                className={`bg-red-500 text-white p-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`} 
                disabled={loading}
              >
                {loading ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </li>
        ))}
      </ul>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
          <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
            <Dialog.Title className="text-lg font-bold">{equipeSelecionada ? 'Editar Equipe' : 'Criar Equipe'}</Dialog.Title>
            <EquipeForm equipe={equipeSelecionada} idTorneio={idTorneio} onEquipeCriada={carregarEquipes} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
