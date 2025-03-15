interface Equipe {
  id: string;
  nome: string;
  lema?: string;
  id_torneio: string;
}

function getRandomTeamColor(id: string): string {
  const colorPalette = [
    '#EF4444', 
    '#F59E0B', 
    '#10B981', 
    '#3B82F6',
    '#6366F1',
    '#8B5CF6',
    '#EC4899',
    '#F43F5E' 
  ];
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colorPalette.length;
  return colorPalette[index];
}

export function Match({
  teams,
  round,
  matchIndex,
  onClickTeam,
  onEdit,
  onDelete,
  loading,
  tournamentDate,
  getMatchDate

}: {
  teams: (Equipe | null)[];
  round: number;
  matchIndex: number;
  onClickTeam: (team: Equipe | null, matchIndex: number, round: number) => void;
  onEdit: (equipe: Equipe) => void;
  onDelete: (id: string) => void;
  loading: boolean;
  tournamentDate?: string;
  getMatchDate: (startDate: string | undefined, round: number, matchIndex: number) => string;
}) {
  const defaultLogo = (
    <svg
      width="30"
      height="30"
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mr-2"
    >
      <circle cx="50" cy="50" r="50" fill="#4F46E5" />
      <text
        x="50%"
        y="54%"
        dominantBaseline="middle"
        textAnchor="middle"
        fill="#fff"
        fontSize="40"
      >
        T
      </text>
    </svg>
  );

  function getTeamInitials(name: string): string {
      const parts = name.split(' ').filter(Boolean);
      if (parts.length > 1) {
        let initials = parts.map(p => p[0].toUpperCase()).join('');
        if (initials.length > 3) {
          initials = initials.substring(0, 3);
        }
        return initials;
      } else {
        return name.substring(0, 3).toUpperCase();
      }
    }

  return (
    <div className="flex flex-col items-center bg-gray-100 p-2 rounded shadow w-40">
      {tournamentDate && (
        <div className="text-xs text-gray-500 mb-1">
          {getMatchDate(tournamentDate, round, matchIndex)}
        </div>
      )}
      {teams.map((team, i) => (
        <div
          key={i}
          className="flex items-center w-full mb-2 px-2 py-1 rounded hover:bg-gray-200 cursor-pointer"
          style={{
            backgroundColor: team ? getRandomTeamColor(team.id) : '#4F46E5',
            color: '#fff'
          }}
          onClick={() => onClickTeam(team, matchIndex, round)}
        >
          {team ? (
            <div className="flex items-center">
              <div className="w-6 h-6 bg-white text-black rounded-full flex items-center justify-center mr-2 text-sm font-bold">
                {getTeamInitials(team.nome)}
              </div>
            </div>
          ) : (
            <>
              {defaultLogo}
              <span className="text-sm font-semibold flex-1">---</span>
            </>
          )}

          {team && (
          <div className="flex items-center ml-auto space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit(team);
              }}
              className="text-[10px] w-8 h-6 flex items-center justify-center text-white hover:opacity-80"
              title="Editar"
            >
              ✏️
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(team.id);
              }}
              disabled={loading}
              className={`text-[10px] w-8 h-6 flex items-center justify-center hover:opacity-80 ${
                loading ? 'opacity-50' : ''
              } text-white`}
              title="Excluir"
            >
              ❌
            </button>
          </div>
          )}
        </div>
      ))}
    </div>
  );
}
