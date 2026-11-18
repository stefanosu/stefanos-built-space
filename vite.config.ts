import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

/**
 * Vite plugin to generate posts-meta.json at build time.
 * This file is used by the Cloudflare Worker to inject OG tags dynamically.
 * Updated to read from MDX files in content/posts directory.
 */
function generatePostsMeta(): Plugin {
  return {
    name: "generate-posts-meta",
    writeBundle: {
      sequential: true,
      handler: async () => {
        const postsDir = path.resolve(__dirname, "content/posts");
        const distDir = path.resolve(__dirname, "dist");
        const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".mdx"));

        const posts: Record<string, { title: string; description: string; image: string }> = {};

        for (const file of postFiles) {
          const content = fs.readFileSync(path.join(postsDir, file), "utf-8");

          // Parse YAML frontmatter from MDX files
          const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
          if (!frontmatterMatch) continue;

          const frontmatter = frontmatterMatch[1];

          // Extract slug
          const slugMatch = frontmatter.match(/slug:\s*(.+)/);
          if (!slugMatch) continue;
          const slug = slugMatch[1].trim();

          // Extract title
          const titleMatch = frontmatter.match(/title:\s*(.+)/);
          const title = titleMatch ? titleMatch[1].trim().replace(/^["']|["']$/g, "") : slug;

          // Extract excerpt (description)
          const excerptMatch = frontmatter.match(/excerpt:\s*(.+)/);
          const description = excerptMatch
            ? excerptMatch[1].trim().replace(/^["']|["']$/g, "")
            : "";

          // Check for ogImage field, fallback to default
          const imageMatch = frontmatter.match(/ogImage:\s*(.+)/);
          const image = imageMatch
            ? imageMatch[1].trim().replace(/^["']|["']$/g, "")
            : "https://stefanosugbit.com/og-preview.png";

          posts[slug] = { title, description, image };
        }

        fs.writeFileSync(
          path.join(distDir, "posts-meta.json"),
          JSON.stringify(posts, null, 2)
        );

        console.log(`✓ Generated posts-meta.json with ${Object.keys(posts).length} posts`);
      },
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    generatePostsMeta(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
