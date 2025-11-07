import PortfolioCard from "./PortfolioCard";

const Portfolio = () => {
  const placeholderProjects = [
    {
      title: "Project One",
      description: "A placeholder for your first featured project. Replace this with a real project description highlighting the problem solved and impact made.",
      techStack: ["React", "TypeScript", "Node.js"],
      githubUrl: "#",
      liveUrl: "#"
    },
    {
      title: "Project Two",
      description: "A placeholder for your second featured project. Describe the technical challenges, your approach, and the results achieved.",
      techStack: ["C#", ".NET", "Azure"],
      githubUrl: "#"
    },
    {
      title: "Project Three",
      description: "A placeholder for your third featured project. Share what you learned and how this project demonstrates your expertise.",
      techStack: ["Next.js", "PostgreSQL", "AWS"],
      githubUrl: "#",
      liveUrl: "#"
    }
  ];

  return (
    <section id="portfolio" className="py-24 md:py-24 py-16 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center animate-fade-in">Portfolio</h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-3xl mx-auto animate-slide-up">
            A selection of projects demonstrating expertise in full-stack development, 
            clean architecture, and building scalable systems that solve real problems.
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {placeholderProjects.map((project, index) => (
              <PortfolioCard key={index} {...project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
