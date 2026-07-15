import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { blogPosts } from "@/data/blogPosts";
import { Button } from "@/components/ui/button";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((p) => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Post Not Found</h1>
            <Button asChild variant="outline">
              <Link to="/writing">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Writing
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        <article className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-3xl mx-auto">
            <Button
              asChild
              variant="ghost"
              className="mb-8 -ml-4 hover:text-accent"
            >
              <Link to="/writing">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Writing
              </Link>
            </Button>

            <header className="mb-12 animate-fade-in">
              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-6">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {post.date}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {post.readTime}
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-semibold mb-6 leading-tight">
                {post.title}
              </h1>

              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-card border border-border/50 text-sm rounded-full text-foreground/80"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </header>

            <div className="animate-slide-up">
              <MarkdownRenderer content={post.content} />
            </div>
          </div>
        </article>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPost;
