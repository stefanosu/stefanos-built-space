import type { BlogPost } from "@/data/types";

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
}

const API_URL = import.meta.env.VITE_POSTS_API_URL || "https://posts-api.stefanosugbit.workers.dev";

export class PostsApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "PostsApiError";
    this.status = status;
  }
}

function authHeaders(password: string): HeadersInit {
  return {
    Authorization: `Bearer ${password}`,
    "Content-Type": "application/json",
  };
}

export async function fetchPosts(): Promise<PostMeta[]> {
  const res = await fetch(`${API_URL}/posts`);
  if (!res.ok) {
    throw new PostsApiError(`Failed to fetch posts: ${res.status}`, res.status);
  }
  return res.json();
}

export async function fetchPost(slug: string): Promise<BlogPost | null> {
  const res = await fetch(`${API_URL}/posts/${slug}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new PostsApiError(`Failed to fetch post: ${res.status}`, res.status);
  }
  return res.json();
}

export async function savePost(password: string, post: BlogPost): Promise<BlogPost> {
  const res = await fetch(`${API_URL}/posts/${post.slug}`, {
    method: "PUT",
    headers: authHeaders(password),
    body: JSON.stringify(post),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new PostsApiError(
      data.error || `Failed to save post: ${res.status}`,
      res.status
    );
  }
  return res.json();
}

export async function deletePost(password: string, slug: string): Promise<void> {
  const res = await fetch(`${API_URL}/posts/${slug}`, {
    method: "DELETE",
    headers: authHeaders(password),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new PostsApiError(
      data.error || `Failed to delete post: ${res.status}`,
      res.status
    );
  }
}
