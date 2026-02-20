import { useEffect, useState } from "react";
import { useKonamiCode } from "@/hooks/useKonamiCode";

const CONFETTI_COLORS = ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];

interface ConfettiPiece {
  id: number;
  left: number;
  color: string;
  delay: number;
  size: number;
}

export function EasterEgg() {
  const { activated, reset } = useKonamiCode();
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    if (activated) {
      // Generate confetti
      const pieces: ConfettiPiece[] = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        delay: Math.random() * 0.5,
        size: Math.random() * 8 + 4,
      }));
      setConfetti(pieces);
      setShowMessage(true);

      // Add party mode to body
      document.body.classList.add("party-mode");

      // Clean up after animation
      const timer = setTimeout(() => {
        setConfetti([]);
        setShowMessage(false);
        document.body.classList.remove("party-mode");
        reset();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [activated, reset]);

  if (!activated && confetti.length === 0 && !showMessage) {
    return null;
  }

  return (
    <>
      {/* Confetti */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {confetti.map((piece) => (
          <div
            key={piece.id}
            className="absolute top-0"
            style={{
              left: `${piece.left}%`,
              width: piece.size,
              height: piece.size,
              backgroundColor: piece.color,
              borderRadius: Math.random() > 0.5 ? "50%" : "0",
              animation: `confetti-fall 3s ease-in forwards`,
              animationDelay: `${piece.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Secret Message */}
      {showMessage && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-[9998]">
          <div className="bg-card/95 backdrop-blur-md border border-accent rounded-2xl p-8 shadow-medium animate-reveal-scale">
            <p className="text-2xl md:text-3xl font-semibold text-center">
              <span className="block text-4xl mb-2">🎮</span>
              You found the secret!
            </p>
            <p className="text-muted-foreground text-center mt-2">
              Thanks for exploring.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
