import type { BlogPost } from "./types";
import { fetchPosts as apiFetchPosts, fetchPost as apiFetchPost } from "@/lib/postsApi";
import type { PostMeta } from "@/lib/postsApi";

export type { BlogPost };
export type { PostMeta };

export async function fetchPosts(): Promise<PostMeta[]> {
  return apiFetchPosts();
}

export async function fetchPost(slug: string): Promise<BlogPost | null> {
  return apiFetchPost(slug);
}
