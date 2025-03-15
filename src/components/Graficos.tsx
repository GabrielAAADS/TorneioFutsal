import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

interface Resultado {
  data: string;
  champion: { id: string; nome: string; [key: string]: any };
  vice: { id: string; nome: string; [key: string]: any };
  pontos: {
    champion: number;
    vice: number;
  };
}

export default function Graficos() {
  const [resultados, setResultados] = useState<Resultado[]>([]);
  const [substitutions, setSubstitutions] = useState<any[]>([]);

  const championCountByTeam: { [id: string]: { nome: string; count: number } } = {};
  const viceCountByTeam: { [id: string]: { nome: string; count: number } } = {};

  useEffect(() => {
    const dados = localStorage.getItem("resultados");
    const dadoSubs = localStorage.getItem("substitutions");

    if (dados) {
      setResultados(JSON.parse(dados));
    }
    if (dadoSubs) {
        setSubstitutions(JSON.parse(dadoSubs));
    }

  }, []);

  const pontosPorTime: { [timeId: string]: { nome: string; pontos: number } } = {};

  resultados.forEach((res) => {
    if (res.champion) {
      const id = res.champion.id;
      if (!championCountByTeam[id]) {
        championCountByTeam[id] = { nome: res.champion.nome, count: 0 };
      }
      championCountByTeam[id].count++;
    }
    if (res.vice) {
      const id = res.vice.id;
      if (!viceCountByTeam[id]) {
        viceCountByTeam[id] = { nome: res.vice.nome, count: 0 };
      }
      viceCountByTeam[id].count++;
    }
  });

  const teams = Array.from(
    new Set([...Object.keys(championCountByTeam), ...Object.keys(viceCountByTeam)])
  );
  const teamLabels = teams.map(
    (id) => championCountByTeam[id]?.nome || viceCountByTeam[id]?.nome || id
  );
  const championCounts = teams.map((id) => championCountByTeam[id]?.count || 0);
  const viceCounts = teams.map((id) => viceCountByTeam[id]?.count || 0);
  
  const groupedBarData = {
    labels: teamLabels,
    datasets: [
      {
        label: "Campeão",
        data: championCounts,
        backgroundColor: "rgba(54, 162, 235, 0.6)"
      },
      {
        label: "Vice-campeão",
        data: viceCounts,
        backgroundColor: "rgba(255, 206, 86, 0.6)"
      }
    ]
  };

  const ranking = Object.values(pontosPorTime).sort((a, b) => b.pontos - a.pontos);

  const totalResultados = resultados.length;
  const substitutionsByPosition: { [pos: string]: number } = {};

  substitutions.forEach(sub => {
    if (substitutionsByPosition[sub.posicao]) {
      substitutionsByPosition[sub.posicao] += 1;
    } else {
      substitutionsByPosition[sub.posicao] = 1;
    }
  });

  const substitutionsBarData = {
    labels: Object.keys(substitutionsByPosition),
    datasets: [
      {
        label: "Substituições",
        data: Object.values(substitutionsByPosition),
        backgroundColor: "rgba(255, 99, 132, 0.6)"
      }
    ]
  };

  return (
    <div className="p-4 container mx-auto max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Relatórios e Gráficos</h1>
      <p>Total de resultados capturados: {totalResultados}</p>
      {resultados.length === 0 ? (
        <p>Nenhum resultado de partidas capturado ainda.</p>
      ) : (
        <>
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Classificação (Pontos Corridos)</h2>
            {ranking.length === 0 ? (
              <p>Nenhum time pontuado ainda.</p>
            ) : (
              <div className="overflow-auto max-w-lg mx-auto">
               <table className="min-w-full border">
                <thead>
                  <tr>
                    <th className="border px-4 py-2">Posição</th>
                    <th className="border px-4 py-2">Time</th>
                    <th className="border px-4 py-2">Pontos</th>
                  </tr>
                </thead>
                <tbody>
                  {ranking.map((team, index) => (
                    <tr key={team.nome}>
                      <td className="border px-4 py-2">{index + 1}º</td>
                      <td className="border px-4 py-2">{team.nome}</td>
                      <td className="border px-4 py-2">{team.pontos}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            )}
          </div>
          <div>
          <h2 className="text-xl font-semibold mb-2">Desempenho por Time (Campeão vs. Vice)</h2>
            {teams.length === 0 ? (
                <p>Nenhum registro de campeão/vice encontrado.</p>
            ) : (
              <div className="max-w-lg mx-auto h-72">
                <Bar data={groupedBarData} />
              </div>
            )}
          </div>
        </>
      )}
        <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Substituições por Posição</h2>
            {Object.keys(substitutionsByPosition).length === 0 ? (
            <p>Nenhuma substituição registrada ainda.</p>
            ) : (
              <div className="max-w-lg mx-auto h-72">
                <Bar data={substitutionsBarData} />
              </div>
            )}
        </div>
    </div>
  );
}
