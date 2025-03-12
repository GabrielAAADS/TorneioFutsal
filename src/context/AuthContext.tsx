import { createContext, useState, useEffect } from "react";
import { loginProfessor } from "../services/professorService";

interface User {
  id: string;
  nome: string;
  email: string;
  token: string;
}

interface AuthContextProps {
  user: User | null;
  login: (email: string, senha: string, onLoginSuccess: () => void) => Promise<boolean>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, senha: string, onLoginSuccess: () => void): Promise<boolean> => {
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
      
      onLoginSuccess();

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
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
