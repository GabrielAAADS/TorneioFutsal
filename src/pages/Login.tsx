import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Header from "../components/Header";  // Importando o Header
import quadraImage from "../assets/quadra1.jpeg";  // Imagem com transparência

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await login(email, senha, () => {
      navigate("/torneios", { replace: true });
    });

    if (!success) {
      alert("Erro ao fazer login. Verifique suas credenciais.");
    }
  };

  return (
    <div
      className="w-screen h-screen flex flex-col bg-cover bg-center"
      style={{ backgroundImage: `url(${quadraImage})` }}
    >
      {/* Inserindo o Header */}
      <Header />

      {/* Camada semi-transparente para melhorar o contraste do conteúdo */}
      <div className="absolute inset-0 bg-black bg-opacity-50"></div>

      <div className="flex flex-col items-center justify-center flex-grow mt-16 px-4">
        {/* Centralizando o título */}
        <div className="w-full max-w-2xl text-center text-white font-bold font-['Montserrat'] relative z-10">
          <h1 className="text-4xl">FUTSAL</h1>
          <h2 className="text-lg mt-2">TOURNAMENT REGISTRATION</h2>
        </div>

        {/* Formulário de login */}
        <form onSubmit={handleLogin} className="w-[300px] mt-6 bg-white p-6 rounded shadow-md relative z-10">
          <h2 className="text-xl font-bold text-center mb-4">Login</h2>

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
            className="w-full p-2 border rounded mb-6"
          />

          <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded">
            LOGIN
          </button>

          <p className="text-center text-gray-600 mt-4 cursor-pointer hover:underline">
            Esqueci minha senha
          </p>
        </form>
      </div>

      {/* Rodapé fixo */}
      <div className="w-full fixed bottom-0 left-0">
        <Footer />
      </div>
    </div>
  );
}
