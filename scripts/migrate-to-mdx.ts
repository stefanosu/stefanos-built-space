/**
 * Migration script to convert TypeScript posts to MDX format with YAML frontmatter
 * for use with Tina CMS.
 *
 * This script:
 * - Reads all posts from src/data/posts/*.ts
 * - Converts each post to MDX format with YAML frontmatter
 * - Writes to content/posts/{slug}.mdx
 */

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

const POSTS_DIR = path.join(__dirname, "..", "src", "data", "posts");
const OUTPUT_DIR = path.join(__dirname, "..", "content", "posts");

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

function escapeYamlString(str: string): string {
  // If string contains special characters, wrap in quotes and escape quotes
  if (str.includes(":") || str.includes("#") || str.includes("\n") || str.includes('"')) {
    return `"${str.replace(/"/g, '\\"')}"`;
  }
  return str;
}

function convertToMDX(post: BlogPost): string {
  const frontmatter = `---
title: ${escapeYamlString(post.title)}
slug: ${post.slug}
excerpt: ${escapeYamlString(post.excerpt)}
date: ${post.date}
readTime: ${post.readTime}
tags:
${post.tags.map(tag => `  - ${escapeYamlString(tag)}`).join('\n')}
---

`;

  return frontmatter + post.content;
}

async function main() {
  console.log("Starting MDX migration...\n");

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    console.log("Created content/posts directory\n");
  }

  // Read all post files
  const files = fs.readdirSync(POSTS_DIR).filter(f => f.endsWith(".ts"));
  console.log(`Found ${files.length} post files\n`);

  let successCount = 0;

  for (const file of files) {
    const filePath = path.join(POSTS_DIR, file);
    console.log(`Processing ${file}...`);

    const post = parsePostFile(filePath);
    if (post) {
      const mdxContent = convertToMDX(post);
      const outputPath = path.join(OUTPUT_DIR, `${post.slug}.mdx`);

      fs.writeFileSync(outputPath, mdxContent, "utf-8");
      console.log(`  ✓ Created ${post.slug}.mdx`);
      successCount++;
    }
  }

  console.log(`\nMigration complete!`);
  console.log(`Successfully converted ${successCount} posts to MDX format.`);
  console.log(`\nOutput location: ${OUTPUT_DIR}`);
}

main().catch(console.error);
