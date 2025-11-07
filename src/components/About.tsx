import { Code2, Palette, Heart } from "lucide-react";

const About = () => {
  return (
    <section id="about" className="py-24 bg-gradient-subtle">
      <div className="container mx-auto px-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-12 text-center">About Me</h2>
          
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="bg-card rounded-xl p-8 shadow-soft border border-border/50">
              <Code2 className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-3">Engineering</h3>
              <p className="text-muted-foreground leading-relaxed">
                Full-stack software engineer experienced in .NET / C# backend development, 
                React / Next.js front-end, and cloud architecture.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-8 shadow-soft border border-border/50">
              <Palette className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-3">Passions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Building tech that empowers growth, community, and learning. 
                Writing about software craftsmanship and personal development.
              </p>
            </div>
            
            <div className="bg-card rounded-xl p-8 shadow-soft border border-border/50">
              <Heart className="w-10 h-10 text-accent mb-4" />
              <h3 className="text-xl font-semibold mb-3">Beyond Code</h3>
              <p className="text-muted-foreground leading-relaxed">
                Boxing, fitness, poetry, personal growth, and travel. 
                Mentorship in tech and giving back to the community.
              </p>
            </div>
          </div>
          
          <div className="bg-card rounded-xl p-12 shadow-medium border border-border/50">
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className="w-48 h-48 bg-secondary rounded-full flex items-center justify-center text-6xl font-bold text-muted-foreground flex-shrink-0">
                SU
              </div>
              
              <div className="flex-1 space-y-6">
                <p className="text-lg leading-relaxed">
                  I'm a full-stack software engineer with deep experience in building 
                  scalable, maintainable systems. My work spans <span className="text-accent font-medium">.NET / C#</span> backend 
                  development, <span className="text-accent font-medium">React / Next.js</span> front-end applications, and 
                  cloud architecture with distributed systems.
                </p>
                
                <p className="text-lg leading-relaxed">
                  I'm passionate about building technology that empowers growth, strengthens 
                  community, and enables learning. I write about software craftsmanship, 
                  clean architecture, and personal development — and I believe in the power 
                  of mentorship and giving back to the tech community.
                </p>
                
                <p className="text-lg leading-relaxed">
                  Outside of engineering, you'll find me training in boxing, exploring fitness, 
                  writing poetry, focusing on personal growth, and traveling to new places.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
