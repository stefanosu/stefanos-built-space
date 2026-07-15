import type { BlogPost } from "./types";

export type { BlogPost };

const modules = import.meta.glob<{ default: BlogPost }>("./posts/*.ts", {
  eager: true,
});

export const blogPosts: BlogPost[] = Object.values(modules)
  .map((m) => m.default)
  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
