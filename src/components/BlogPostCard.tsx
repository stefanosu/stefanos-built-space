import { useState } from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BlogPostCardProps {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags?: string[];
  index: number;
}

// Complete literal class strings so Tailwind's content scanner can pick them up.
// Cards further back in the stack sit slightly narrower and dimmer to read as
// "behind" the card in front, without any sideways tilt.
const INSETS = [
  "md:mx-0",
  "md:mx-3",
  "md:mx-6",
  "md:mx-9",
  "md:mx-12",
  "md:mx-14",
];

const BASE_Z_INDEX = 40;
const HOVER_Z_INDEX = 100;

const BlogPostCard = ({
  slug,
  title,
  excerpt,
  date,
  readTime,
  tags,
  index,
}: BlogPostCardProps) => {
  const [isActive, setIsActive] = useState(false);
  const inset = INSETS[Math.min(index, INSETS.length - 1)];
  const restingZIndex = BASE_Z_INDEX - index;
  const isBackCard = index > 0;

  return (
    <div
      className={cn(
        "group relative",
        index > 0 && "md:-mt-16",
        inset,
        "md:transition-all md:duration-300 md:ease-out",
        isBackCard && "md:opacity-90",
        "md:hover:-translate-y-3 md:hover:scale-[1.015] md:hover:opacity-100 md:hover:mx-0",
        "md:focus-within:-translate-y-3 md:focus-within:scale-[1.015] md:focus-within:opacity-100 md:focus-within:mx-0"
      )}
      style={{ zIndex: isActive ? HOVER_Z_INDEX : restingZIndex }}
      onMouseEnter={() => setIsActive(true)}
      onMouseLeave={() => setIsActive(false)}
      onFocus={() => setIsActive(true)}
      onBlur={() => setIsActive(false)}
    >
      <Link
        to={`/writing/${slug}`}
        className="block rounded-xl bg-card border border-border/50 shadow-soft transition-shadow duration-300 group-hover:shadow-medium group-hover:border-accent/30 group-focus-within:shadow-medium group-focus-within:border-accent/30 overflow-hidden"
      >
        <div className="px-8 py-6 space-y-3">
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

          {/* Mobile: excerpt/tags/CTA always visible, matching the plain list fallback */}
          <p className="text-muted-foreground leading-relaxed line-clamp-3 md:hidden">
            {excerpt}
          </p>

          {tags && tags.length > 0 && (
            <div className="flex flex-wrap gap-2 md:hidden">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-secondary text-sm rounded-full text-foreground/80"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-accent font-medium pt-1 md:hidden">
            Read More
            <ArrowRight className="w-4 h-4" />
          </div>
        </div>

        {/* Desktop: hidden preview that pops open on hover/focus */}
        <div
          className="hidden md:grid transition-[grid-template-rows] duration-300 ease-out [grid-template-rows:0fr] group-hover:[grid-template-rows:1fr] group-focus-within:[grid-template-rows:1fr]"
        >
          <div className="overflow-hidden">
            <div className="px-8 pb-7 pt-1 space-y-4 border-t border-border/50 mt-3">
              <p className="text-muted-foreground leading-relaxed line-clamp-3 pt-4">
                {excerpt}
              </p>

              {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-secondary text-sm rounded-full text-foreground/80 transition-all duration-200 hover:bg-accent/20 hover:scale-105"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-accent font-medium group-hover:gap-3 transition-all">
                Read More
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlogPostCard;
