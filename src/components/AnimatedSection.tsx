import { ReactNode } from "react";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { cn } from "@/lib/utils";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  animation?: "reveal-up" | "reveal-scale" | "fade-in";
  delay?: number;
}

export function AnimatedSection({
  children,
  className,
  animation = "reveal-up",
  delay = 0,
}: AnimatedSectionProps) {
  const { ref, isVisible } = useScrollAnimation<HTMLDivElement>({
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  });

  const animationClass = {
    "reveal-up": "animate-reveal-up",
    "reveal-scale": "animate-reveal-scale",
    "fade-in": "animate-fade-in",
  }[animation];

  return (
    <div
      ref={ref}
      className={cn(className)}
      style={{
        opacity: isVisible ? 1 : 0,
        animationDelay: isVisible ? `${delay}ms` : "0ms",
        animationFillMode: "forwards",
      }}
    >
      <div className={isVisible ? animationClass : ""} style={{ animationDelay: `${delay}ms` }}>
        {children}
      </div>
    </div>
  );
}
