import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioCard from "@/components/PortfolioCard";

const PortfolioPage = () => {
  // Placeholder projects - ready to be filled
  const projects = [
    {
      title: "Enterprise SaaS Platform",
      description: "Placeholder for a large-scale SaaS application. Describe the architecture, scaling challenges, and how you solved complex distributed system problems.",
      techStack: ["React", "TypeScript", "Node.js", "PostgreSQL", "AWS"],
      githubUrl: "#",
      liveUrl: "#"
    },
    {
      title: "Real-time Collaboration Tool",
      description: "Placeholder for a real-time application. Explain WebSocket implementation, state synchronization, and performance optimization strategies.",
      techStack: ["Next.js", "Socket.io", "Redis", "Docker"],
      githubUrl: "#"
    },
    {
      title: "E-commerce Platform",
      description: "Placeholder for an e-commerce solution. Detail payment integration, inventory management, and user experience enhancements.",
      techStack: ["C#", ".NET Core", "Azure", "SQL Server"],
      githubUrl: "#",
      liveUrl: "#"
    },
    {
      title: "Developer Tools CLI",
      description: "Placeholder for a command-line tool. Share the problem it solves, adoption metrics, and how you designed the developer experience.",
      techStack: ["Node.js", "TypeScript", "Commander.js"],
      githubUrl: "#"
    },
    {
      title: "Mobile-First Web App",
      description: "Placeholder for a mobile-focused application. Discuss responsive design decisions, performance optimization, and PWA features.",
      techStack: ["React", "Tailwind CSS", "Service Workers"],
      githubUrl: "#",
      liveUrl: "#"
    },
    {
      title: "API Gateway Service",
      description: "Placeholder for a backend service. Explain microservices architecture, API design patterns, and monitoring solutions implemented.",
      techStack: ["C#", ".NET", "Docker", "Kubernetes", "Azure"],
      githubUrl: "#"
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Portfolio</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                A collection of projects demonstrating expertise in full-stack development, 
                clean architecture, and building scalable systems that solve real problems.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
              {projects.map((project, index) => (
                <PortfolioCard key={index} {...project} />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default PortfolioPage;
