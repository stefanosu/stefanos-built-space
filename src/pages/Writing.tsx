import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BlogPostCard from "@/components/BlogPostCard";
import { blogPosts } from "@/data/blogPosts";

const Writing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 pt-24">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto">
            <div className="mb-16 animate-fade-in">
              <h1 className="text-5xl md:text-6xl font-semibold mb-6">Writing</h1>
              <p className="text-xl text-muted-foreground leading-relaxed max-w-3xl">
                Thoughts on software engineering, clean architecture, personal growth, 
                and lessons learned building meaningful technology.
              </p>
            </div>
            
            <div className="space-y-8 animate-slide-up">
              {blogPosts.map((post) => (
                <BlogPostCard
                  key={post.slug}
                  slug={post.slug}
                  title={post.title}
                  excerpt={post.excerpt}
                  date={post.date}
                  readTime={post.readTime}
                  tags={post.tags}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Writing;
