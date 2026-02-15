import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PortfolioCard from "@/components/PortfolioCard";

const PortfolioPage = () => {
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
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-6xl mx-auto">
            <div className="mb-16 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-6">Portfolio</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                A collection of projects demonstrating expertise in full-stack
                development, clean architecture, and building scalable systems
                that solve real problems.
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
