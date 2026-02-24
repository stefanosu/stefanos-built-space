import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useCallback } from "react";
import { Particles } from "./Particles";
import { useTypewriter } from "@/hooks/useTypewriter";

const Hero = () => {
  const [clickCount, setClickCount] = useState(0);
  const [isWiggling, setIsWiggling] = useState(false);
  const { displayedText, isComplete } = useTypewriter({
    text: "Stefanos Ugbit",
    speed: 100,
    delay: 300,
  });

  const handleNameClick = useCallback(() => {
    setClickCount((prev) => prev + 1);
    setIsWiggling(true);
    setTimeout(() => setIsWiggling(false), 500);
  }, []);

  const getNameStyle = () => {
    if (clickCount >= 7) {
      return "bg-gradient-to-r from-accent via-purple-500 to-pink-500 bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient-shift";
    }
    if (clickCount >= 5) {
      return "text-accent";
    }
    return "";
  };

  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div
        className="absolute inset-0 bg-gradient-hero opacity-40 animate-gradient-shift"
        style={{ backgroundSize: "200% 200%" }}
      ></div>

      {/* Floating particles */}
      <Particles />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fade-in">
            <h1
              className={`text-5xl md:text-7xl font-semibold tracking-tight text-balance leading-tight cursor-pointer select-none transition-all duration-300 ${getNameStyle()} ${isWiggling ? "animate-wiggle" : ""}`}
              onClick={handleNameClick}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleNameClick();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Click for a surprise"
            >
              {displayedText}
              {!isComplete && <span className="animate-pulse">|</span>}
            </h1>
            {clickCount >= 7 && (
              <p className="text-sm text-muted-foreground animate-fade-in">
                You found my colorful side!
              </p>
            )}
          </div>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance animate-slide-up animate-delay-200">
            Software engineer focused on clarity, clean architecture, and
            meaningful execution.
          </p>

          <div className="flex gap-4 justify-center pt-6 animate-slide-up animate-delay-350">
            <Button
              asChild
              size="lg"
              className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
            >
              <a href="#portfolio">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </a>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:border-accent hover:text-accent transition-all duration-300 hover:scale-105"
            >
              <a href="#contact">Get in Touch</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
