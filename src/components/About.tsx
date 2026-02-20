import { Code2, Palette, Heart } from "lucide-react";
import { AnimatedSection } from "./AnimatedSection";

const About = () => {
  const cards = [
    {
      icon: Code2,
      title: "Engineering",
      description:
        "Full-stack software engineer experienced in .NET / C# backend development, React / Next.js front-end, and cloud architecture.",
    },
    {
      icon: Palette,
      title: "Passions",
      description:
        "Building tech that empowers growth, community, and learning. Writing about software craftsmanship and personal development.",
    },
    {
      icon: Heart,
      title: "Beyond Code",
      description:
        "Boxing, fitness, poetry, personal growth, and travel. Mentorship in tech and giving back to the community.",
    },
  ];

  return (
    <section id="about" className="py-24 md:py-24 py-16 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold mb-16 text-center animate-fade-in">
            About Me
          </h2>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {cards.map((card, index) => (
              <AnimatedSection key={index} delay={index * 100}>
                <div className="bg-card rounded-2xl p-8 shadow-soft border border-border/50 hover:border-accent/30 hover:-translate-y-2 hover:shadow-medium transition-all duration-300 group h-full">
                  <card.icon className="w-10 h-10 text-accent mb-4 transition-transform duration-300 group-hover:scale-110" />
                  <h3 className="text-xl font-semibold mb-3 group-hover:text-accent transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {card.description}
                  </p>
                </div>
              </AnimatedSection>
            ))}
          </div>

          <AnimatedSection delay={300}>
            <div className="bg-card rounded-2xl p-12 shadow-medium border border-border/50 hover:border-accent/20 transition-all duration-300">
              <div className="max-w-3xl mx-auto space-y-6">
                <p className="text-lg leading-relaxed">
                  I'm a software engineer who cares about building things the
                  right way — with clarity, clean architecture, and thoughtful
                  execution. I enjoy working across the stack, from .NET and C# on
                  the backend to React and Next.js on the frontend, with a focus
                  on maintainability and user experience.
                </p>

                <p className="text-lg leading-relaxed">
                  I'm especially interested in how technology can support
                  learning, community, and growth. I value simple solutions, clear
                  communication, and writing code that's easy to understand and
                  extend.
                </p>

                <p className="text-lg leading-relaxed">
                  Outside of engineering, I'm committed to personal development. I
                  box, train, read, and write — and I try to approach my work and
                  life with presence, patience, and discipline.
                </p>
              </div>
            </div>
          </AnimatedSection>
        </div>
      </div>
    </section>
  );
};

export default About;
