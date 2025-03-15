import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import { JSX } from "react";
import Login from './pages/Login';
import Register from './pages/RegistrarProfessor'; 
import Torneios from './pages/Torneios';
import PerfilProfessor from './pages/PerfilProfessor';
import EquipeDetalhes from './pages/EquipeDetalhes';
import Professores from './pages/Professores';
import Header from './components/Header';
import Footer from './components/Footer';
import Graficos from './components/Graficos';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useContext(AuthContext);
  console.log(user)
  return <AuthProvider> {user ? children : <Navigate to="/login" replace />} </AuthProvider>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/*"
            element={
              <div className="flex flex-col min-h-screen w-full container mx-auto px-4 py-6">
                <Header />
                <div className="flex-grow">
                  <Routes>
                    <Route path="/torneios" element={<ProtectedRoute><Torneios /></ProtectedRoute>} />
                    <Route path="/professor/detalhes" element={<ProtectedRoute><PerfilProfessor /></ProtectedRoute>} />
                    <Route path="/professores" element={<ProtectedRoute><Professores /></ProtectedRoute>} />
                    <Route path="/equipe/:id/*" element={<ProtectedRoute><EquipeDetalhes /></ProtectedRoute>} />
                    <Route path="/graficos" element={<ProtectedRoute><Graficos /></ProtectedRoute>} />
                    <Route path="*" element={<Navigate to="/torneios" replace />} />
                  </Routes>
                </div>
                <Footer />
              </div>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
