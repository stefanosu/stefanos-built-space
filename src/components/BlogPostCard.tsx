import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags?: string[];
}

const BlogPostCard = ({ slug, title, excerpt, date, readTime, tags }: BlogPostCardProps) => {
  return (
    <article className="bg-card rounded-xl p-8 shadow-soft border border-border/50 hover:shadow-medium transition-all duration-300 group">
      <Link to={`/writing/${slug}`}>
        <div className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {readTime}
            </span>
          </div>
          
          <h3 className="text-2xl font-semibold group-hover:text-accent transition-colors">
            {title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed line-clamp-3">
            {excerpt}
          </p>
          
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-secondary text-sm rounded-full text-foreground/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          <div className="flex items-center gap-2 text-accent font-medium pt-2 group-hover:gap-3 transition-all">
            Read More
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>
      </Link>
    </article>
  );
};

export default BlogPostCard;
