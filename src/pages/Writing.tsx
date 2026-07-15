import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { PenLine, Loader2 } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogStack from "@/components/BlogStack";
import { Button } from "@/components/ui/button";
import { fetchPosts, type PostMeta } from "@/data/blogPosts";

const Writing = () => {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchPosts()
      .then(setPosts)
      .catch((err) => setError(err.message || "Failed to load posts"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 animate-fade-in">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
                <h1 className="text-5xl md:text-6xl font-semibold">Writing</h1>
                <Button asChild variant="outline" size="sm" className="mt-2">
                  <Link to="/writing/admin">
                    <PenLine className="w-4 h-4" />
                    New Post
                  </Link>
                </Button>
              </div>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                Thoughts on software engineering, clean architecture, personal
                growth, and lessons learned building meaningful technology.
              </p>
              <p className="hidden md:block text-sm text-muted-foreground/70 mt-4 italic">
                Hover over a post to preview it.
              </p>
            </div>

            <div className="animate-slide-up">
              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                </div>
              ) : error ? (
                <div className="text-center py-16 text-destructive">
                  <p>{error}</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <p>No posts yet.</p>
                </div>
              ) : (
                <BlogStack posts={posts} />
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Writing;
