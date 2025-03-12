import { useEffect, useState } from "react";
import { useParams, useNavigate, NavLink, Route, Routes } from "react-router-dom";
import { buscarEquipePorID, atualizarEquipe, excluirEquipe } from "../services/equipeService";
import Jogadores from "../pages/Jogadores";

export default function EquipeDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [equipe, setEquipe] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoLema, setNovoLema] = useState("");

  useEffect(() => {
    async function carregarEquipe() {
    if (!id) {
        alert("Erro: ID da equipe não fornecido.");
        navigate("/torneios");
        return;
    }

    try {
        const response = await buscarEquipePorID(id);
        console.log(response)
        setEquipe(response.data.equipe);
        setNovoNome(response.data.equipe.nome);
        setNovoLema(response.data.equipe.lema || "");
    } catch (error) {
        console.error("Erro ao buscar equipe:", error);
        alert("Erro ao buscar equipe.");
        navigate("/torneios");
    } finally {
        setLoading(false);
    }
    }

    carregarEquipe();
  }, [id, navigate]);

  const handleSalvarEdicao = async () => {
    if (!equipe?.id || !equipe?.id_torneio) {
        alert("Erro: ID da equipe ou do torneio está indefinido.");
        return;
    }

    try {
      await atualizarEquipe(equipe.id, {
        nome: novoNome,
        lema: novoLema,
        id_torneio: equipe.id_torneio,
      });      
      setEquipe((prev: any) => ({ ...prev, nome: novoNome, lema: novoLema }));
      alert("Equipe atualizada com sucesso!");
      setEditando(false);
    } catch (error) {
      console.error("Erro ao atualizar equipe:", error);
      alert("Erro ao atualizar equipe.");
    }
  };

  const handleExcluirEquipe = async () => {
    if (!equipe?.id) {
      alert("Erro: ID da equipe está indefinido.");
      return;
    }

    if (!window.confirm("Tem certeza que deseja excluir esta equipe?")) return;

    try {
      await excluirEquipe(equipe.id);
      alert("Equipe excluída com sucesso!");
      navigate("/torneios");
    } catch (error) {
      console.error("Erro ao excluir equipe:", error);
      alert("Erro ao excluir equipe.");
    }
  };

  if (loading) return <p>Carregando...</p>;
  if (!equipe) return <p>Equipe não encontrada.</p>;

  return (
    <div className="p-4">
      <h1 className="text-xl font-bold mb-4">Detalhes da Equipe</h1>

      <div className="border-b mb-4 flex space-x-4">
        <NavLink to={`/equipe/${id}/informacoes`} className="p-2">Informações</NavLink>
        <NavLink to={`/equipe/${id}/jogadores`} className="p-2">Jogadores</NavLink>
      </div>

      <Routes>
        <Route path="informacoes" element={
          <div>
            {editando ? (
              <>
                <input value={novoNome} onChange={(e) => setNovoNome(e.target.value)} className="border p-2 w-full" />
                <input value={novoLema} onChange={(e) => setNovoLema(e.target.value)} className="border p-2 w-full mt-2" />
                <button onClick={handleSalvarEdicao} className="bg-green-500 text-white p-2 rounded mt-2">Salvar</button>
                <button onClick={() => setEditando(false)} className="bg-gray-500 text-white p-2 rounded mt-2 ml-2">Cancelar</button>
              </>
            ) : (
              <>
                <p><strong>Nome:</strong> {equipe.nome}</p>
                <p><strong>Lema:</strong> {equipe.lema || "Nenhum lema definido"}</p>
                <button onClick={() => setEditando(true)} className="bg-blue-500 text-white p-2 rounded mt-4">Editar Informações</button>
              </>
            )}

            <button onClick={handleExcluirEquipe} className="bg-red-500 text-white p-2 rounded mt-4 block">
              Excluir Equipe
            </button>
          </div>
        } />

        <Route path="jogadores" element={<Jogadores idEquipe={id!} />} />
      </Routes>
    </div>
  );
}
