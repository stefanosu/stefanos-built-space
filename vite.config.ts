import { defineConfig, Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import fs from "fs";
import { componentTagger } from "lovable-tagger";

/**
 * Vite plugin to generate posts-meta.json at build time.
 * This file is used by the Cloudflare Worker to inject OG tags dynamically.
 */
function generatePostsMeta(): Plugin {
  return {
    name: "generate-posts-meta",
    writeBundle: {
      sequential: true,
      handler: async () => {
        const postsDir = path.resolve(__dirname, "src/data/posts");
        const distDir = path.resolve(__dirname, "dist");
        const postFiles = fs.readdirSync(postsDir).filter((f) => f.endsWith(".ts"));

        const posts: Record<string, { title: string; description: string; image: string }> = {};

        for (const file of postFiles) {
          const content = fs.readFileSync(path.join(postsDir, file), "utf-8");

          // Extract slug
          const slugMatch = content.match(/slug:\s*["']([^"']+)["']/);
          if (!slugMatch) continue;
          const slug = slugMatch[1];

          // Extract title - handle multi-line with template strings
          const titleMatch = content.match(/title:\s*\n?\s*["'](.+?)["'],?\s*\n/s) ||
            content.match(/title:\s*["'](.+?)["']/);
          const title = titleMatch ? titleMatch[1].replace(/\s+/g, " ").trim() : slug;

          // Extract excerpt (used as description) - handle multi-line
          const excerptMatch = content.match(/excerpt:\s*\n?\s*["'](.+?)["'],?\s*\n/s) ||
            content.match(/excerpt:\s*["'](.+?)["']/);
          const description = excerptMatch
            ? excerptMatch[1].replace(/\s+/g, " ").trim()
            : "";

          // Check for ogImage field, fallback to default
          const imageMatch = content.match(/ogImage:\s*["']([^"']+)["']/);
          const image = imageMatch
            ? imageMatch[1]
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
