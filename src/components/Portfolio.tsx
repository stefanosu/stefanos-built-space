import PortfolioCard from "./PortfolioCard";

const Portfolio = () => {
  const projects = [
    {
      title: "FinanceTracker",
      description:
        "A full-stack personal finance management system with expense tracking, multi-account management, analytics dashboards, and an AI-powered budget assistant using Claude for personalized financial guidance.",
      techStack: [".NET 8", "Next.js", "TypeScript", "PostgreSQL", "Claude API"],
      githubUrl: "https://github.com/stefanosu/FinanceTrackerApp",
      liveUrl: "https://finance-tracker-app-ivory.vercel.app",
      imageUrl: "/financetracker-analytics.png",
    },
  ];

  return (
    <section id="portfolio" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-semibold mb-12 text-center animate-fade-in">
            Portfolio
          </h2>
          <p className="text-center text-muted-foreground mb-16 text-lg max-w-3xl mx-auto animate-slide-up">
            A selection of projects demonstrating expertise in full-stack
            development, clean architecture, and building scalable systems that
            solve real problems.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {projects.map((project, index) => (
              <PortfolioCard key={index} {...project} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Portfolio;
