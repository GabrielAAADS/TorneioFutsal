import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";

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
    <div className="w-screen h-screen flex flex-col bg-[#515070]">
      <div className="flex flex-col items-center justify-center flex-grow mt-16">
        <div className="w-full max-w-2xl h-[210px] bg-[#515070] flex flex-col items-center justify-center relative">
          <div className="text-center text-white font-bold font-['Montserrat']">
            <h1 className="text-4xl">FUTSAL</h1>
            <h2 className="text-lg">TOURNAMENT REGISTRATION</h2>
          </div>
        </div>

        <form onSubmit={handleLogin} className="w-[300px] mt-6 bg-white p-6 rounded shadow-md">
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

      <div className="w-full fixed bottom-0 left-0">
        <Footer />
      </div>
    </div>
  );
}
