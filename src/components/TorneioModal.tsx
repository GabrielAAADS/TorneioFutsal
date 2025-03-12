import * as Dialog from '@radix-ui/react-dialog';
import { atualizarTorneio } from '../services/torneioService';

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

interface TorneioModalProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  torneioSelecionado: Torneio | null;
  setTorneioSelecionado: (torneio: Torneio | null) => void;
  carregarTorneios: () => void;
  equipes: Equipe[];
}

export default function TorneioModal({ isOpen, setIsOpen, torneioSelecionado, setTorneioSelecionado, carregarTorneios, equipes }: TorneioModalProps) {
  const handleAtualizar = async () => {
    try {
      if (!torneioSelecionado) return;

      // Criando FormData para enviar os dados corretamente
      const formData = new FormData();
      formData.append('descricao', torneioSelecionado.descricao);
      formData.append('data', torneioSelecionado.data);
      formData.append('campus', torneioSelecionado.campus);

      // Adicionando equipes ao FormData
      if (torneioSelecionado.equipes) {
        torneioSelecionado.equipes.forEach((equipeId) => {
          formData.append('equipes[]', equipeId);
        });
      }

      await atualizarTorneio(torneioSelecionado.id, formData);

      alert('Torneio atualizado!');
      setIsOpen(false);
      carregarTorneios();
    } catch (error) {
      console.error('Erro ao atualizar torneio:', error);
      alert('Erro ao atualizar torneio.');
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
          <Dialog.Title className="text-lg font-bold">Editar Torneio</Dialog.Title>

          {/* Input para editar descrição */}
          <input
            value={torneioSelecionado?.descricao || ''}
            onChange={(e) =>
              setTorneioSelecionado((prev) =>
                prev ? { ...prev, descricao: e.target.value } : prev
              )
            }
            className="border p-2 w-full"
            placeholder="Descrição"
          />

          <input
            value={torneioSelecionado?.data || ''}
            onChange={(e) =>
              setTorneioSelecionado((prev) =>
                prev ? { ...prev, data: e.target.value } : prev
              )
            }
            type="date"
            className="border p-2 w-full mt-2"
            placeholder="Data"
          />

          <input
            value={torneioSelecionado?.campus || ''}
            onChange={(e) =>
              setTorneioSelecionado((prev) =>
                prev ? { ...prev, campus: e.target.value } : prev
              )
            }
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
            <button onClick={handleAtualizar} className="bg-green-500 text-white p-2 rounded">Salvar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
