import type { BlogPost } from "./types";

export type { BlogPost };

// Import MDX files from content/posts directory
const modules = import.meta.glob<string>("../../content/posts/*.mdx", {
  eager: true,
  query: "?raw",
  import: "default",
});

// Parse MDX frontmatter and content
function parseMDX(content: string): BlogPost {
  // Simple frontmatter parser (we'll use gray-matter on the server side)
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

  if (!frontmatterMatch) {
    throw new Error("Invalid MDX format");
  }

  const [, frontmatterStr, body] = frontmatterMatch;
  const frontmatter: Record<string, any> = {};

  // Parse YAML frontmatter
  const lines = frontmatterStr.split("\n");
  let currentKey = "";
  let inArray = false;
  let arrayValues: string[] = [];

  for (const line of lines) {
    if (line.trim().startsWith("-") && inArray) {
      // Array item
      const value = line.trim().substring(1).trim();
      arrayValues.push(value);
    } else if (line.includes(":")) {
      // Save previous array if exists
      if (inArray && currentKey) {
        frontmatter[currentKey] = arrayValues;
        arrayValues = [];
        inArray = false;
      }

      const colonIndex = line.indexOf(":");
      const key = line.substring(0, colonIndex).trim();
      const value = line.substring(colonIndex + 1).trim();

      if (value === "") {
        // This might be an array start
        currentKey = key;
        inArray = true;
        arrayValues = [];
      } else {
        frontmatter[key] = value;
      }
    }
  }

  // Save last array if exists
  if (inArray && currentKey) {
    frontmatter[currentKey] = arrayValues;
  }

  return {
    slug: frontmatter.slug || "",
    title: frontmatter.title || "",
    excerpt: frontmatter.excerpt || "",
    content: body.trim(),
    date: frontmatter.date || "",
    readTime: frontmatter.readTime || "",
    tags: frontmatter.tags || [],
  };
}

export const blogPosts: BlogPost[] = Object.values(modules)
  .map((content) => parseMDX(content))
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
