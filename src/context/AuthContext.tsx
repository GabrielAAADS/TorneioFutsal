import { createContext, useState, useEffect } from "react";
import { loginProfessor } from "../services/professorService";
import { useNavigate } from "react-router-dom";

interface User {
  id: string;
  nome: string;
  email: string;
  token: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, senha: string) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, senha: string): Promise<boolean> => {
    try {
      const response = await loginProfessor({ email, senha });
      const { token, professor } = response.data;

      const userData = {
        id: professor.id,
        nome: professor.nome,
        email: professor.email,
        token: token,
      };

      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
      navigate("/torneios", { replace: true });
      
      return true;
    } catch (error) {
      console.error("Erro no login:", error);
      alert("Erro ao fazer login. Verifique suas credenciais.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
