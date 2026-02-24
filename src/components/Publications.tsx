import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AnimatedSection } from "./AnimatedSection";
import { Button } from "./ui/button";

const Publications = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <AnimatedSection>
            <Link to="/publications" className="block group">
              <div className="bg-gradient-to-r from-accent/10 to-accent/5 rounded-2xl p-8 md:p-10 border border-accent/20 hover:border-accent/40 transition-all duration-300 hover:shadow-medium">
                <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
                  <div className="flex-shrink-0">
                    <div className="w-20 rounded-lg overflow-hidden shadow-soft group-hover:scale-105 transition-transform duration-300">
                      <img
                        src="/shadow-work-cover.jpg"
                        alt="Shadow Work"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <p className="text-sm text-accent font-medium uppercase tracking-wide mb-1">
                      Published Author
                    </p>
                    <h3 className="text-2xl md:text-3xl font-semibold group-hover:text-accent transition-colors">
                      Shadow Work — Poetry Collection
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      Exploring themes of self-discovery, growth, and life's deeper moments.
                    </p>
                  </div>
                  <div className="flex-shrink-0">
                    <Button
                      variant="outline"
                      className="border-accent/30 hover:bg-accent hover:text-accent-foreground transition-all duration-300 group-hover:border-accent"
                    >
                      Learn More
                      <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </div>
                </div>
              </div>
            </Link>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default Publications;
