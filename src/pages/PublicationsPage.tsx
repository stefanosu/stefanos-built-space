import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ExternalLink, Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AnimatedSection } from "@/components/AnimatedSection";

const PublicationsPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="mb-16 animate-fade-in text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                Publications
              </h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                Beyond code, I express myself through the written word.
              </p>
            </div>

            <AnimatedSection>
              <div className="bg-card rounded-2xl p-8 md:p-12 shadow-medium border border-border/50">
                <div className="flex flex-col md:flex-row gap-10 items-start">
                  {/* Book Cover */}
                  <div className="flex-shrink-0 mx-auto md:mx-0">
                    <div className="w-48 rounded-lg shadow-medium overflow-hidden border border-border/50">
                      <img
                        src="/shadow-work-cover.jpg"
                        alt="Shadow Work by Stefanos Ugbit"
                        className="w-full h-auto object-cover"
                      />
                    </div>
                  </div>

                  {/* Book Details */}
                  <div className="flex-1 space-y-6">
                    <div>
                      <span className="text-sm text-accent font-medium uppercase tracking-wide">
                        Poetry Collection
                      </span>
                      <h2 className="text-3xl md:text-4xl font-bold mt-2">
                        Shadow Work
                      </h2>
                      <p className="text-muted-foreground mt-1">
                        By Stefanos Ugbit
                      </p>
                    </div>

                    <p className="text-lg text-muted-foreground leading-relaxed">
                      A collection of poetry exploring themes of self-discovery,
                      personal growth, and the journey through life's deeper
                      moments. These poems invite readers to confront their inner
                      shadows and emerge with greater understanding.
                    </p>

                    <div className="flex flex-wrap gap-4 pt-2">
                      <Button
                        asChild
                        size="lg"
                        className="bg-accent hover:bg-accent-hover text-accent-foreground font-medium transition-all duration-300 hover:scale-105"
                      >
                        <a
                          href="https://www.amazon.com/Shadow-Work-Stefanos-Ugbit/dp/9370926941"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Get it on Amazon
                          <ExternalLink className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>

            {/* Author's Note */}
            <AnimatedSection delay={200}>
              <div className="mt-12 bg-card rounded-2xl p-8 md:p-10 shadow-soft border border-border/50">
                <div className="flex items-start gap-4">
                  <Quote className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="text-xl font-semibold mb-4">
                      From the Author
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      Writing poetry has always been my way of processing life —
                      the struggles, the growth, and the quiet moments of
                      reflection. Shadow Work represents years of personal
                      exploration distilled into words. I hope these poems
                      resonate with you on your own journey.
                    </p>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PublicationsPage;
