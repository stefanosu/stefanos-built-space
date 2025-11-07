import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated gradient background */}
      <div 
        className="absolute inset-0 bg-gradient-hero opacity-40 animate-gradient-shift"
        style={{ backgroundSize: '200% 200%' }}
      ></div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="space-y-6 animate-fade-in">
            <h1 className="text-5xl md:text-7xl font-semibold tracking-tight text-balance leading-tight">
              Stefanos Ugbit
            </h1>
          </div>
          
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed text-balance animate-slide-up animate-delay-200">
            Software engineer focused on clarity, clean architecture, and meaningful execution.
          </p>
          
          <div className="flex gap-4 justify-center pt-6 animate-slide-up animate-delay-350">
            <Button 
              asChild
              size="lg"
              className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium transition-all duration-300"
            >
              <a href="#portfolio">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="border-border hover:border-accent hover:text-accent transition-all duration-300"
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
