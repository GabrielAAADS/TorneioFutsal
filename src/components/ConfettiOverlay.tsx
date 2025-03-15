import { useMemo } from 'react';

export default function ConfettiOverlay() {
  const confettiPieces = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 100; i++) {
      arr.push({
        left: Math.random() * 100,
        delay: Math.random() * 2, 
        color: getRandomColor(),
        size: Math.random() * 8 + 4 
      });
    }
    return arr;
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {confettiPieces.map((piece, idx) => (
        <div
          key={idx}
          style={{
            position: 'absolute',
            top: '-10%',
            left: piece.left + '%',
            width: piece.size + 'px',
            height: piece.size + 'px',
            backgroundColor: piece.color,
            animation: `fall 3s ${piece.delay}s ease-in-out forwards`
          }}
        />
      ))}
      <style>{`
        @keyframes fall {
          0% { transform: translateY(0); }
          100% { transform: translateY(120vh) rotate(720deg); }
        }
      `}</style>
    </div>
  );
}

function getRandomColor(): string {
  const colors = ['#FF6363', '#FFBD44', '#49DCB1', '#4DA8F7', '#A080FF', '#FF66C4', '#FFD700'];
  return colors[Math.floor(Math.random() * colors.length)];
}
