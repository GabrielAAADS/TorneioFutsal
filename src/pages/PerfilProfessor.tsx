import { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { buscarProfessorPorID, atualizarProfessor, excluirProfessor } from "../services/professorService";
import { AuthContext } from "../context/AuthContext";

export default function PerfilProfessor() {
    const navigate = useNavigate();
    const { user, logout } = useContext(AuthContext);
    const id = user?.id;

    const [professor, setProfessor] = useState<any>(null);
    const [editando, setEditando] = useState(false);
    const [nome, setNome] = useState("");
    const [cref, setCref] = useState("");
    const [email, setEmail] = useState("");
    const [novaSenha, setNovaSenha] = useState("");
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        async function carregarProfessor() {
            if (!id) {
                console.error("Erro: ID do professor não encontrado.");
                return;
            }

            try {
                console.log("🔍 Buscando professor com ID:", id);
                const response = await buscarProfessorPorID(id);
                console.log(response);
                setProfessor(response.data.professor);
                setNome(response.data.professor.nome);
                setCref(response.data.professor.cref);
                setEmail(response.data.professor.email);
            } catch (error) {
                console.error("❌ Erro ao buscar professor:", error);
            } finally {
                setCarregando(false);
            }
        }

        carregarProfessor();
    }, [id]);

    const handleSalvarEdicao = async () => {
        try {
            if (!professor) return;
            console.log(nome, cref, email, novaSenha);

            const dadosAtualizados: any = { nome, cref, email };
            if (novaSenha.trim() !== "") dadosAtualizados.senha = novaSenha;

            await atualizarProfessor(dadosAtualizados);
            setProfessor({ ...professor, nome, cref, email });
            alert("Perfil atualizado com sucesso!");
            setEditando(false);
        } catch (error) {
            console.error("❌ Erro ao atualizar perfil:", error);
            alert("Erro ao atualizar perfil.");
        }
    };

    const handleExcluir = async () => {
        if (!id) return;

        if (confirm("Tem certeza que deseja excluir sua conta?")) {
            try {
                await excluirProfessor();
                alert("Conta excluída!");
                logout();
                navigate("/login");
            } catch (error) {
                console.error("❌ Erro ao excluir conta:", error);
                alert("Erro ao excluir conta.");
            }
        }
    };

    if (carregando) return <p>Carregando...</p>;
    if (!professor) return <p>Erro ao carregar perfil.</p>;

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-2xl font-bold mb-6">Perfil do Professor</h1>

            {editando ? (
                <>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} className="border p-2 w-full mb-2 rounded" placeholder="Nome" />
                    <input value={cref} onChange={(e) => setCref(e.target.value)} className="border p-2 w-full mb-2 rounded" placeholder="CREF" />
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="border p-2 w-full mb-2 rounded" placeholder="Email" />
                    <input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} className="border p-2 w-full mb-4 rounded" placeholder="Nova Senha (opcional)" />
                    <button onClick={handleSalvarEdicao} className="bg-green-500 hover:bg-green-600 text-white p-2 rounded">Salvar</button>
                </>
            ) : (
                <>
                    <p className="mb-2"><strong>Nome:</strong> {professor.nome}</p>
                    <p className="mb-2"><strong>CREF:</strong> {professor.cref}</p>
                    <p className="mb-4"><strong>Email:</strong> {professor.email}</p>
                </>
            )}

            {user?.id === professor.id && (
                <>
                    <button onClick={() => setEditando(true)} className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded mt-4">Editar</button>
                    <button onClick={handleExcluir} className="bg-red-500 hover:bg-red-600 text-white p-2 rounded mt-4 block">Excluir Conta</button>
                </>
            )}

            <button onClick={() => navigate("/professores")} className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded mt-4">Voltar</button>
        </div>
    );
}
