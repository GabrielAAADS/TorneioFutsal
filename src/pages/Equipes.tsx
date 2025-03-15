import { useEffect, useState } from 'react';
import { buscarEquipes, excluirEquipe } from '../services/equipeService';
import * as Dialog from '@radix-ui/react-dialog';
import EquipeForm from '../components/EquipeForm';
import { Match } from '../components/Match';
import ConfettiOverlay from '../components/ConfettiOverlay';

interface Equipe {
  id: string;
  nome: string;
  lema?: string;
  id_torneio: string;
}

export default function Equipes({
  idTorneio,
  onEquipeAlterada,
  tournamentDate
}: {
  idTorneio: string;
  onEquipeAlterada: () => void;
  tournamentDate?: string;
}) {
  const [equipes, setEquipes] = useState<Equipe[]>([]);
  const [equipeSelecionada, setEquipeSelecionada] = useState<Equipe | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const [teams, setTeams] = useState<(Equipe | null)[]>([]);
  const [round1Winners, setRound1Winners] = useState<(Equipe | null)[]>([null, null, null, null]);
  const [round2Winners, setRound2Winners] = useState<(Equipe | null)[]>([null, null]);
  const [finalWinner, setFinalWinner] = useState<Equipe | null>(null);

  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    carregarEquipes();
  }, [idTorneio]);

  useEffect(() => {
    if (equipes.length > 8) {
      alert('Este torneio tem mais de 8 equipes! Exibindo apenas as 8 primeiras...');
    }

    const eq: (Equipe | null)[] = [...equipes.slice(0, 8)];

    while (eq.length < 8) {
      eq.push(null);
    }
    setTeams(eq);
    setRound1Winners([null, null, null, null]);
    setRound2Winners([null, null]);
    setFinalWinner(null);
    setShowConfetti(false); 
  }, [equipes]);

  useEffect(() => {
    if (finalWinner) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);
    }
  }, [finalWinner]);

  const carregarEquipes = async () => {
    try {
      const response = await buscarEquipes();
      const eqFiltradas = response.data.filter(
        (equipe: Equipe) => equipe.id_torneio === idTorneio
      );
      setEquipes(eqFiltradas);
    } catch (error) {
      console.error('Erro ao carregar equipes:', error);
      alert('Erro ao carregar equipes.');
    }
  };

  useEffect(() => {
    if (finalWinner && round2Winners[0] && round2Winners[1]) {
      const vice = round2Winners[0]?.id === finalWinner.id ? round2Winners[1] : round2Winners[0];
      if (vice) {
        const resultadosSalvos = JSON.parse(localStorage.getItem("resultados") || "[]");
        resultadosSalvos.push({
          data: new Date().toISOString(),
          champion: finalWinner,
          vice: vice,
          pontos: {
            champion: 10,
            vice: 5
          }
        });
        localStorage.setItem("resultados", JSON.stringify(resultadosSalvos));
      }
    }
  }, [finalWinner, round2Winners]);

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

  const handleClickTeam = (
    team: Equipe | null,
    matchIndex: number,
    round: number
  ) => {
    if (!team) return;
    if (round === 1) {
      const newWinners = [...round1Winners];
      newWinners[matchIndex] = team;
      setRound1Winners(newWinners);
    } else if (round === 2) {
      const newWinners = [...round2Winners];
      newWinners[matchIndex] = team;
      setRound2Winners(newWinners);
    } else if (round === 3) {
      setFinalWinner(team);
    }
  };

  const avancarRound1 = () => {
    const newRound2 = [...round2Winners];
    newRound2[0] = round1Winners[0];
    newRound2[1] = round1Winners[1];
    setRound2Winners(newRound2);
  };

  const prepararFinal = () => {
    setFinalWinner(null);
  };

  const finalizar = () => {
    if (match7[0] && match7[1]) {
      alert('Clique no time que vencer a final!');
    } else {
      alert('Defina os finalistas primeiro!');
    }
  };
  
  const match1 = [teams[0], teams[1]];
  const match2 = [teams[2], teams[3]];
  const match3 = [teams[4], teams[5]];
  const match4 = [teams[6], teams[7]];
  const match5 = [round1Winners[0], round1Winners[1]];
  const match6 = [round1Winners[2], round1Winners[3]];
  const match7 = [round2Winners[0], round2Winners[1]];

  const trophyKeyframes = `
    @keyframes rotateTrophy {
      0% { transform: rotate(0deg) }
      100% { transform: rotate(360deg) }
    }
  `;

  function getMatchDate(startDate: string | undefined, round: number, matchIndex: number): string {
    if (!startDate) return '';
    
    const [datePart] = startDate.split(',');
    const [day, month, year] = datePart.trim().split('/');
    const isoDate = `${year}-${month}-${day}T00:00:00`;
    
    const baseDate = new Date(isoDate);
    if (isNaN(baseDate.getTime())) return 'Data Inválida';
    
    let offset = 0;
    if (round === 1) offset = matchIndex + 1; 
    if (round === 2) offset = 5 + matchIndex; 
    if (round === 3) offset = 7 + matchIndex;
    
    baseDate.setDate(baseDate.getDate() + offset);
    return baseDate.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }

  const resetBracket = () => {
    const eq: (Equipe | null)[] = [...equipes.slice(0, 8)];
    while (eq.length < 8) {
      eq.push(null);
    }
    setTeams(eq);
    setRound1Winners([null, null, null, null]);
    setRound2Winners([null, null]);
    setFinalWinner(null);
    setShowConfetti(false);
  };

  return (
    <div className="p-4 text-center">
        {showConfetti && <ConfettiOverlay />}

        <h1 className="text-xl font-semibold mb-4">Equipes</h1>

        <button
          onClick={() => {
            setEquipeSelecionada(null);
            setIsOpen(true);
          }}
          className="bg-blue-500 text-white p-2 rounded mb-4"
        >
          Adicionar Equipe
        </button>

        <style>{trophyKeyframes}</style>

      <div className="flex justify-center items-center space-x-4 mb-6">
        <button
          onClick={avancarRound1}
          className="bg-blue-500 text-white px-2 py-1 rounded"
        >
          Avançar Round 1
        </button>
        <button
          onClick={prepararFinal}
          className="bg-green-500 text-white px-2 py-1 rounded"
        >
          Preparar Final
        </button>
        <button
          onClick={finalizar}
          className="bg-purple-500 text-white px-2 py-1 rounded"
        >
          Finalizar
        </button>
      </div>

      <h1 className="text-xl font-semibold mb-6">Chaveamento</h1>

      <button 
        onClick={resetBracket} 
        className="bg-purple-500 hover:bg-purple-600 text-white py-1 px-2 rounded mb-2 text-sm">
        Resetar
      </button>

      {finalWinner && (
        <div className="mt-2">
          <h2 className="font-bold text-lg">Vencedor: {finalWinner.nome}</h2>
        </div>
      )}
    
      <div className="mt-6 p-4 border rounded bg-gray-50">
        <div className="flex justify-center items-start space-x-8">
          <div className="flex flex-col space-y-4">
            <Match
              teams={match1}
              round={1}
              matchIndex={0}
              onClickTeam={handleClickTeam}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              loading={loading}
              tournamentDate={tournamentDate}
              getMatchDate={getMatchDate}
            />
            <Match
              teams={match2}
              round={1}
              matchIndex={1}
              onClickTeam={handleClickTeam}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              loading={loading}
              tournamentDate={tournamentDate}
              getMatchDate={getMatchDate}
            />
            <Match
              teams={match3}
              round={1}
              matchIndex={2}
              onClickTeam={handleClickTeam}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              loading={loading}
              tournamentDate={tournamentDate}
              getMatchDate={getMatchDate}
            />
            <Match
              teams={match4}
              round={1}
              matchIndex={3}
              onClickTeam={handleClickTeam}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              loading={loading}
              tournamentDate={tournamentDate}
              getMatchDate={getMatchDate}
            />
          </div>

          <div className="flex flex-col space-y-8 mt-32">
            <Match
              teams={match5}
              round={2}
              matchIndex={0}
              onClickTeam={handleClickTeam}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              loading={loading}
              tournamentDate={tournamentDate}
              getMatchDate={getMatchDate}
            />
            <Match
              teams={match6}
              round={2}
              matchIndex={1}
              onClickTeam={handleClickTeam}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              loading={loading}
              tournamentDate={tournamentDate}
              getMatchDate={getMatchDate}
            />
          </div>

          <div className="flex flex-col space-y-16 mt-32 relative">
            {(
            <div className="absolute right-[-50px] top-[70%] transform -translate-y-[70%]">
                <svg
                  width="64"
                  height="64"
                  viewBox="0 0 64 64"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ animation: 'glow 2s ease-in-out infinite' }}
                >
                  <defs>
                    <linearGradient id="goldGradient" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#FFD700" />
                      <stop offset="100%" stopColor="#FF8C00" />
                    </linearGradient>
                    <filter id="glowFilter" x="-50%" y="-50%" width="200%" height="200%">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                      <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                      </feMerge>
                    </filter>
                  </defs>
                  <path
                    d="M16 12 H48 V20 C48 28,44 36,32 36 C20 36,16 28,16 20 V12 Z"
                    fill="url(#goldGradient)"
                    filter="url(#glowFilter)"
                  />
                  <rect x="22" y="36" width="20" height="14" fill="url(#goldGradient)" filter="url(#glowFilter)" />
                  <path
                    d="M20 50 H44 L40 60 H24 L20 50 Z"
                    fill="url(#goldGradient)"
                    filter="url(#glowFilter)"
                  />
                </svg>
              </div>
            )}
            <Match
              teams={match7}
              round={3}
              matchIndex={0}
              onClickTeam={handleClickTeam}
              onEdit={handleEditar}
              onDelete={handleExcluir}
              loading={loading}
              tournamentDate={tournamentDate}
              getMatchDate={getMatchDate}
            />
            <style>{`
              @keyframes glow {
                0% { filter: drop-shadow(0 0 2px #FFD700); }
                50% { filter: drop-shadow(0 0 8px #FFD700); }
                100% { filter: drop-shadow(0 0 2px #FFD700); }
              }
            `}</style>
          </div>
        </div>
      </div>

      <Dialog.Root open={isOpen} onOpenChange={setIsOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center" />
            <Dialog.Content
              className="bg-white p-4 rounded shadow-md max-w-md w-full h-auto"
              style={{
                position: 'fixed',
                top: '20%',
                left: '50%',
                transform: 'translate(-50%, 0)'
              }}
            >
              <Dialog.Title className="text-lg font-bold mb-4">
                {equipeSelecionada ? 'Editar Equipe' : 'Criar Equipe'}
              </Dialog.Title>
              
              <EquipeForm
                equipe={equipeSelecionada}
                idTorneio={idTorneio}
                onEquipeCriada={async () => {
                  await carregarEquipes();
                  onEquipeAlterada();
                }}
              />
            </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
