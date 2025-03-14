import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { FaBars, FaUserCircle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Group 10.png";  // Importe a logo

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="w-full h-[60px] bg-gray-800 flex justify-between items-center px-6 shadow-md">
      <FaBars 
        className="text-white text-2xl cursor-pointer hover:text-gray-400 transition duration-200"
        onClick={() => navigate("/torneios")} 
      />

      <div className="flex items-center space-x-4">
        {user && (
          <FaUserCircle
            className="text-white text-3xl cursor-pointer hover:text-gray-400 transition duration-200"
            onClick={() => navigate("/professor/detalhes")}
          />
        )}

        <button 
          onClick={logout} 
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition duration-200"
        >
          Sair
        </button>
      </div>

      {/* Logo no canto direito */}
      <img src={logo} alt="Logo" className="h-10 w-auto" />
    </header>
  );
}
