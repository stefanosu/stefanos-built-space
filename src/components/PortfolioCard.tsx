import { ExternalLink, Github } from "lucide-react";
import { Button } from "./ui/button";

interface PortfolioCardProps {
  title: string;
  description: string;
  techStack: string[];
  githubUrl?: string;
  liveUrl?: string;
  imageUrl?: string;
}

const PortfolioCard = ({
  title,
  description,
  techStack,
  githubUrl,
  liveUrl,
  imageUrl,
}: PortfolioCardProps) => {
  return (
    <article className="bg-card rounded-xl overflow-hidden shadow-soft border border-border/50 hover:shadow-medium hover:-translate-y-2 transition-all duration-300 group">
      <div className="aspect-video bg-secondary flex items-center justify-center relative overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={`Screenshot of ${title} project`}
            className="w-full h-full object-contain bg-[#0f1729]"
          />
        ) : (
          <div className="text-6xl font-bold text-muted-foreground/20">
            {title.charAt(0)}
          </div>
        )}
        <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-all duration-300"></div>
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-t from-accent/20 to-transparent"></div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <h3 className="text-2xl font-semibold group-hover:text-accent transition-colors">
          {title}
        </h3>

        <p className="text-muted-foreground leading-relaxed">{description}</p>

        <div className="flex flex-wrap gap-2">
          {techStack.map((tech, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-secondary text-sm rounded-full text-foreground/80 transition-all duration-200 hover:bg-accent/20 hover:scale-105"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-3 pt-2">
          {githubUrl && (
            <Button
              asChild
              variant="outline"
              size="sm"
              className="border-border hover:bg-secondary"
            >
              <a
                href={githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${title} source code on GitHub (opens in new tab)`}
              >
                <Github className="w-4 h-4 mr-2" aria-hidden="true" />
                Code
              </a>
            </Button>
          )}
          {liveUrl && (
            <Button
              asChild
              size="sm"
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`View ${title} live demo (opens in new tab)`}
              >
                <ExternalLink className="w-4 h-4 mr-2" aria-hidden="true" />
                Live Demo
              </a>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
};

export default PortfolioCard;
