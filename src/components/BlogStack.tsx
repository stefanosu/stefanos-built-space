import BlogPostCard from "@/components/BlogPostCard";
import type { PostMeta } from "@/lib/postsApi";

interface BlogStackProps {
  posts: PostMeta[];
}

const BlogStack = ({ posts }: BlogStackProps) => {
  return (
    <div className="space-y-6 md:space-y-0 md:pt-4 md:pb-10">
      {posts.map((post, index) => (
        <BlogPostCard
          key={post.slug}
          slug={post.slug}
          title={post.title}
          excerpt={post.excerpt}
          date={post.date}
          readTime={post.readTime}
          tags={post.tags}
          index={index}
        />
      ))}
    </div>
  );
};

export default BlogStack;
