import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import PortfolioCard from "./PortfolioCard";
import { Button } from "./ui/button";

const Portfolio = () => {
  // Placeholder projects - ready to be filled
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
    <section className="py-24">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Portfolio</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A collection of projects showcasing clean architecture, thoughtful design, 
              and meaningful user experiences.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {placeholderProjects.map((project, index) => (
              <PortfolioCard key={index} {...project} />
            ))}
          </div>
          
          <div className="text-center">
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-border hover:bg-secondary"
            >
              <Link to="/portfolio">
                View All Projects
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
