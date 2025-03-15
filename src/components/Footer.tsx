import logo from "../assets/Group 10.png";  // Importe a logo

export default function Footer() {
  return (
    <footer className="w-full h-[69px] bg-white flex items-center justify-between px-6">
      {/* Logo no canto esquerdo */}
      <img src={logo} alt="Logo" className="h-8 w-auto" />

      <div className="text-xs text-[#898989] font-normal font-['Exo_2']">
        © Copyright 2019 Todos os direitos
      </div>
    </footer>
  );
}
