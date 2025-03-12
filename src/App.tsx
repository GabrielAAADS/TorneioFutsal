import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext, AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Torneios from './pages/Torneios';
import { JSX } from "react";
import EquipeDetalhes from './pages/EquipeDetalhes';
import Professores from './pages/Professores';
import PerfilProfessor from './pages/PerfilProfessor';

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user } = useContext(AuthContext);

  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/torneios" element={<ProtectedRoute><Torneios /></ProtectedRoute>} />
          
          <Route path="/equipe/:id/*" element={<ProtectedRoute><EquipeDetalhes /></ProtectedRoute>} />

          <Route path="/professores" element={<ProtectedRoute><Professores /></ProtectedRoute>} />

          <Route path="/professor/detalhes" element={<PerfilProfessor />} />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
