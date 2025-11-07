import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

const Hero = () => {
  return (
    <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Abstract geometric background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-6xl md:text-7xl font-bold tracking-tight text-balance">
              Stefanos Ugbit
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground font-light">
              Software Engineer <span className="text-accent">•</span> Builder
            </p>
          </div>
          
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto leading-relaxed text-balance">
            I build reliable, thoughtful software — with a focus on clarity, clean architecture, 
            and meaningful user experience.
          </p>
          
          <div className="flex gap-4 justify-center pt-4">
            <Button 
              asChild
              size="lg"
              className="bg-accent hover:bg-accent/90 text-accent-foreground font-medium"
            >
              <a href="#about">
                Learn More
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
            <Button 
              asChild
              variant="outline" 
              size="lg"
              className="border-border hover:bg-secondary"
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
