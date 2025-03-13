import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import { cadastrarProfessor } from "../services/professorService"; // 🔹 Importação nomeada corrigida

export default function Register() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [cref, setCref] = useState(""); // Novo estado para CREF
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    if (senha !== confirmarSenha) {
      alert("As senhas não coincidem.");
      return;
    }

    try {
      await cadastrarProfessor({ nome, cref, email, senha }); // Enviando o cref agora
      alert("Cadastro realizado com sucesso!");
      navigate("/login");
    } catch (error) {
      console.error("Erro ao cadastrar:", error);
      alert("Erro ao realizar o cadastro. Tente novamente.");
    }
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-[#515070]">
      <div className="flex flex-col items-center justify-start flex-grow pt-12 pb-8"> {/* Ajustei o padding inferior para 'pb-8' */}
        <div className="w-full max-w-2xl h-[210px] bg-[#515070] flex flex-col items-center justify-center relative">
          <div className="text-center text-white font-bold font-['Montserrat']">
            <h1 className="text-4xl">CADASTRAR</h1>
          </div>
        </div>

        <form onSubmit={handleRegister} className="w-[400px] bg-white p-6 rounded shadow-md">
          <label className="block text-gray-700 font-bold">NOME</label>
          <input
            type="text"
            placeholder="Digite seu nome"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block text-gray-700 font-bold">CREF</label>
          <input
            type="text"
            placeholder="Digite seu CREF"
            value={cref}
            onChange={(e) => setCref(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block text-gray-700 font-bold">E-MAIL</label>
          <input
            type="email"
            placeholder="Digite seu e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block text-gray-700 font-bold">SENHA</label>
          <input
            type="password"
            placeholder="Digite sua senha"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className="w-full p-2 border rounded mb-4"
          />

          <label className="block text-gray-700 font-bold">CONFIRMAR SENHA</label>
          <input
            type="password"
            placeholder="Confirme sua senha"
            value={confirmarSenha}
            onChange={(e) => setConfirmarSenha(e.target.value)}
            className="w-full p-2 border rounded mb-6"
          />

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
            CADASTRAR
          </button>

          <p 
            className="text-center text-gray-600 mt-4 cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Já tem uma conta? Faça login
          </p>
        </form>
      </div>

      <div className="w-full fixed bottom-0 left-0">
        <Footer />
      </div>
    </div>
  );
}
