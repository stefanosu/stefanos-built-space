import { Button } from "./ui/button";

const Portfolio = () => {
  return (
    <section id="portfolio" className="py-24 md:py-24 py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center animate-fade-in">Portfolio</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-3xl mx-auto animate-slide-up">
            A selection of projects demonstrating expertise in full-stack development, 
            clean architecture, and building scalable systems that solve real problems.
          </p>
          
          <div className="text-center py-16 space-y-8">
            <p className="text-muted-foreground text-lg italic">
              I'm curating the best work to showcase here soon.
            </p>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all duration-300"
            >
              <a href="#contact">Contact me for examples</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
