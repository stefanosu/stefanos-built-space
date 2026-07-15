/**
 * Migration script to move existing posts from static .ts files to Cloudflare KV.
 *
 * Prerequisites:
 * 1. Create KV namespace: cd posts-api && npx wrangler kv:namespace create POSTS_KV
 * 2. Update posts-api/wrangler.toml with the KV namespace ID
 * 3. Run this script: npm run migrate-posts
 *
 * This script:
 * - Reads all posts from src/data/posts/*.ts
 * - Uploads each post to KV as post:{slug}
 * - Creates a posts:index with all post metadata
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
}

interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
}

const POSTS_DIR = path.join(__dirname, "..", "src", "data", "posts");
const POSTS_API_DIR = path.join(__dirname, "..", "posts-api");
const KV_NAMESPACE_BINDING = "POSTS_KV";

function parsePostFile(filePath: string): BlogPost | null {
  const content = fs.readFileSync(filePath, "utf-8");

  // Extract fields using regex
  const slugMatch = content.match(/slug:\s*["']([^"']+)["']/);
  const titleMatch = content.match(/title:\s*\n?\s*["'](.+?)["'],?\s*\n/s) ||
    content.match(/title:\s*["'](.+?)["']/);
  const excerptMatch = content.match(/excerpt:\s*\n?\s*["'](.+?)["'],?\s*\n/s) ||
    content.match(/excerpt:\s*["'](.+?)["']/);
  const dateMatch = content.match(/date:\s*["']([^"']+)["']/);
  const readTimeMatch = content.match(/readTime:\s*["']([^"']+)["']/);
  const tagsMatch = content.match(/tags:\s*\[([\s\S]*?)\]/);

  // Extract content (between backticks)
  const contentMatch = content.match(/content:\s*`([\s\S]*?)`\s*,?\s*\n\s*date:/);

  if (!slugMatch || !titleMatch) {
    console.warn(`Could not parse ${filePath}`);
    return null;
  }

  const tags: string[] = [];
  if (tagsMatch) {
    const tagsStr = tagsMatch[1];
    const tagMatches = tagsStr.matchAll(/["']([^"']+)["']/g);
    for (const match of tagMatches) {
      tags.push(match[1]);
    }
  }

  return {
    slug: slugMatch[1],
    title: titleMatch[1].replace(/\s+/g, " ").trim(),
    excerpt: excerptMatch ? excerptMatch[1].replace(/\s+/g, " ").trim() : "",
    content: contentMatch ? contentMatch[1].trim() : "",
    date: dateMatch ? dateMatch[1] : new Date().toISOString().slice(0, 10),
    readTime: readTimeMatch ? readTimeMatch[1] : "1 min read",
    tags,
  };
}

function kvPut(key: string, value: string): void {
  const tempFile = `/tmp/kv-value-${Date.now()}.json`;
  fs.writeFileSync(tempFile, value);

  try {
    execSync(
      `npx wrangler kv:key put --binding=${KV_NAMESPACE_BINDING} "${key}" --path="${tempFile}"`,
      {
        cwd: POSTS_API_DIR,
        stdio: "inherit"
      }
    );
  } finally {
    fs.unlinkSync(tempFile);
  }
}

async function main() {
  console.log("Starting migration...\n");

  // Check if posts-api directory exists
  if (!fs.existsSync(POSTS_API_DIR)) {
    console.error("posts-api directory not found. Please ensure it exists.");
    process.exit(1);
  }

  // Check if wrangler.toml has KV namespace configured
  const wranglerConfig = fs.readFileSync(path.join(POSTS_API_DIR, "wrangler.toml"), "utf-8");
  if (wranglerConfig.includes("REPLACE_WITH_KV_NAMESPACE_ID")) {
    console.error("Please configure the KV namespace ID in posts-api/wrangler.toml first.");
    console.error("Run: cd posts-api && npx wrangler kv:namespace create POSTS_KV");
    process.exit(1);
  }

  // Read all post files
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".ts"));
  console.log(`Found ${files.length} post files\n`);

  const posts: BlogPost[] = [];
  const index: PostMeta[] = [];

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    console.log(`Parsing ${file}...`);

    const post = parsePostFile(filePath);
    if (post) {
      posts.push(post);
      index.push({
        slug: post.slug,
        title: post.title,
        excerpt: post.excerpt,
        date: post.date,
        readTime: post.readTime,
        tags: post.tags,
      });
      console.log(`  -> ${post.title}`);
    }
  }

  // Sort index by date descending
  index.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  console.log("\nUploading posts to KV...\n");

  // Upload each post
  for (const post of posts) {
    console.log(`Uploading post:${post.slug}...`);
    kvPut(`post:${post.slug}`, JSON.stringify(post));
  }

  // Upload index
  console.log("\nUploading posts:index...");
  kvPut("posts:index", JSON.stringify(index));

  console.log("\nMigration complete!");
  console.log(`Migrated ${posts.length} posts.`);
}

main().catch(console.error);
