import { useEffect, useState } from 'react';
import { buscarEquipes } from '../services/equipeService';
import { transferirJogador } from '../services/jogadorSerice';
import * as Dialog from '@radix-ui/react-dialog';

interface Jogador {
  id: string;
  nome: string;
  id_equipe: string;
}

export default function JogadorTransferencia({ jogador, onTransferenciaConcluida }: { jogador: Jogador; onTransferenciaConcluida: () => void }) {
  const [equipes, setEquipes] = useState<{ id: string; nome: string }[]>([]);
  const [novaEquipe, setNovaEquipe] = useState(jogador.id_equipe);

  useEffect(() => {
    carregarEquipes();
  }, []);

  const carregarEquipes = async () => {
    try {
      const response = await buscarEquipes();
      setEquipes(response.data);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      alert('Erro ao carregar equipes.');
    }
  };

  const handleTransferir = async () => {
    if (novaEquipe === jogador.id_equipe) {
      alert("O jogador já está nesta equipe!");
      return;
    }
    try {
      await transferirJogador(jogador.id, novaEquipe);
      onTransferenciaConcluida();
      alert("Jogador transferido com sucesso!");
    } catch (error) {
      console.error("Erro ao transferir jogador:", error);
      alert("Erro ao transferir jogador.");
    }
  };
  

  return (
    <Dialog.Root>
      <Dialog.Trigger className="bg-blue-500 text-white p-2 rounded">Mover Jogador</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50" />
        <Dialog.Content className="fixed bg-white p-6 rounded shadow-md inset-1/3">
          <Dialog.Title className="text-lg font-bold">Transferir {jogador.nome}</Dialog.Title>
          <select value={novaEquipe} onChange={(e) => setNovaEquipe(e.target.value)} className="border p-2 w-full">
            {equipes.map((equipe) => (
              <option key={equipe.id} value={equipe.id}>{equipe.nome}</option>
            ))}
          </select>
          <div className="flex justify-end gap-2 mt-4">
            <Dialog.Close asChild>
              <button className="bg-red-500 text-white p-2 rounded">Cancelar</button>
            </Dialog.Close>
            <button onClick={handleTransferir} className="bg-green-500 text-white p-2 rounded">Confirmar</button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
