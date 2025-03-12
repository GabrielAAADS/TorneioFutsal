import { useEffect, useState, useContext } from 'react';
import { buscarProfessores, excluirProfessor } from '../services/professorService';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Professores() {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [professores, setProfessores] = useState([]);

    useEffect(() => {
        carregarProfessores();
    }, []);

    const carregarProfessores = async () => {
        try {
            const response = await buscarProfessores();
            setProfessores(response.data);
        } catch (error) {
            console.error('Erro ao carregar professores:', error);
            alert('Erro ao carregar professores.');
        }
    };

    const handleExcluir = async (id: string) => {
        if (id !== user?.id) {
            alert("Você só pode excluir sua própria conta.");
            return;
        }

        if (confirm('Tem certeza que deseja excluir sua conta?')) {
            try {
                await excluirProfessor();
                alert('Conta excluída!');
            } catch (error) {
                console.error('Erro ao excluir conta:', error);
                alert('Erro ao excluir conta.');
            }
        }
    };

    return (
        <div className="p-4">
            <h1 className="text-xl font-bold mb-4">Professores</h1>

            <ul className="mt-4">
                {professores.map((prof: any) => (
                    <li key={prof.id} className="border p-2 flex justify-between">
                        <span>{prof.nome} - {prof.email}</span>
                        <div>
                            <button 
                                onClick={() => navigate(`/perfil/${prof.id}`)} 
                                className="bg-blue-500 text-white p-1 mx-1"
                            >
                                Detalhes
                            </button>

                            {user?.id === prof.id && (
                                <>
                                    <button 
                                        onClick={() => navigate(`/perfil/${prof.id}?edit=true`)} 
                                        className="bg-yellow-500 text-white p-1 mx-1"
                                    >
                                        Editar
                                    </button>
                                    <button onClick={() => handleExcluir(prof.id)} className="bg-red-500 text-white p-1">
                                        Excluir
                                    </button>
                                </>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
