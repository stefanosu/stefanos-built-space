export interface Env {
  POSTS_KV: KVNamespace;
  CORS_ORIGIN: string;
  ADMIN_PASSWORD_HASH: string;
}

export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  readTime: string;
  tags: string[];
}

export interface PostMeta {
  slug: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  tags: string[];
}

const POSTS_INDEX_KEY = "posts:index";

function postKey(slug: string): string {
  return `post:${slug}`;
}

function corsHeaders(origin: string, allowedOrigin: string): HeadersInit {
  const isAllowed =
    origin === allowedOrigin ||
    origin === "http://localhost:5173" ||
    origin === "http://localhost:4173";
  return {
    "Access-Control-Allow-Origin": isAllowed ? origin : allowedOrigin,
    "Access-Control-Allow-Methods": "GET, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Max-Age": "86400",
  };
}

function jsonResponse(
  data: unknown,
  status: number,
  origin: string,
  allowedOrigin: string
): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders(origin, allowedOrigin),
    },
  });
}

async function sha256Hex(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function verifyAuth(request: Request, env: Env): Promise<boolean> {
  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const token = authHeader.slice(7);
  const hash = await sha256Hex(token);
  return hash.toLowerCase() === env.ADMIN_PASSWORD_HASH.toLowerCase();
}

async function getIndex(kv: KVNamespace): Promise<PostMeta[]> {
  const raw = await kv.get(POSTS_INDEX_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as PostMeta[];
  } catch {
    return [];
  }
}

async function setIndex(kv: KVNamespace, index: PostMeta[]): Promise<void> {
  await kv.put(POSTS_INDEX_KEY, JSON.stringify(index));
}

async function handleListPosts(
  env: Env,
  origin: string
): Promise<Response> {
  const index = await getIndex(env.POSTS_KV);
  return jsonResponse(index, 200, origin, env.CORS_ORIGIN);
}

async function handleGetPost(
  slug: string,
  env: Env,
  origin: string
): Promise<Response> {
  const raw = await env.POSTS_KV.get(postKey(slug));
  if (!raw) {
    return jsonResponse({ error: "Post not found" }, 404, origin, env.CORS_ORIGIN);
  }
  try {
    const post = JSON.parse(raw) as BlogPost;
    return jsonResponse(post, 200, origin, env.CORS_ORIGIN);
  } catch {
    return jsonResponse({ error: "Invalid post data" }, 500, origin, env.CORS_ORIGIN);
  }
}

async function handlePutPost(
  slug: string,
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  if (!(await verifyAuth(request, env))) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin, env.CORS_ORIGIN);
  }

  let post: BlogPost;
  try {
    post = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON body" }, 400, origin, env.CORS_ORIGIN);
  }

  // Validate required fields
  if (!post.slug || !post.title || !post.content || !post.date) {
    return jsonResponse(
      { error: "Missing required fields: slug, title, content, date" },
      400,
      origin,
      env.CORS_ORIGIN
    );
  }

  // Ensure slug in URL matches slug in body
  if (post.slug !== slug) {
    return jsonResponse(
      { error: "Slug in URL must match slug in body" },
      400,
      origin,
      env.CORS_ORIGIN
    );
  }

  // Store full post
  await env.POSTS_KV.put(postKey(slug), JSON.stringify(post));

  // Update index
  const index = await getIndex(env.POSTS_KV);
  const meta: PostMeta = {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt || "",
    date: post.date,
    readTime: post.readTime || "",
    tags: post.tags || [],
  };

  const existingIdx = index.findIndex((p) => p.slug === slug);
  if (existingIdx >= 0) {
    index[existingIdx] = meta;
  } else {
    index.push(meta);
  }

  // Sort by date descending
  index.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  await setIndex(env.POSTS_KV, index);

  return jsonResponse(post, existingIdx >= 0 ? 200 : 201, origin, env.CORS_ORIGIN);
}

async function handleDeletePost(
  slug: string,
  request: Request,
  env: Env,
  origin: string
): Promise<Response> {
  if (!(await verifyAuth(request, env))) {
    return jsonResponse({ error: "Unauthorized" }, 401, origin, env.CORS_ORIGIN);
  }

  // Check if post exists
  const existing = await env.POSTS_KV.get(postKey(slug));
  if (!existing) {
    return jsonResponse({ error: "Post not found" }, 404, origin, env.CORS_ORIGIN);
  }

  // Delete post
  await env.POSTS_KV.delete(postKey(slug));

  // Update index
  const index = await getIndex(env.POSTS_KV);
  const filtered = index.filter((p) => p.slug !== slug);
  await setIndex(env.POSTS_KV, filtered);

  return jsonResponse({ success: true }, 200, origin, env.CORS_ORIGIN);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || env.CORS_ORIGIN;

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders(origin, env.CORS_ORIGIN),
      });
    }

    const path = url.pathname;

    // Route: GET /posts
    if (path === "/posts" && request.method === "GET") {
      return handleListPosts(env, origin);
    }

    // Route: /posts/:slug
    const slugMatch = path.match(/^\/posts\/([a-z0-9-]+)$/);
    if (slugMatch) {
      const slug = slugMatch[1];

      if (request.method === "GET") {
        return handleGetPost(slug, env, origin);
      }
      if (request.method === "PUT") {
        return handlePutPost(slug, request, env, origin);
      }
      if (request.method === "DELETE") {
        return handleDeletePost(slug, request, env, origin);
      }
    }

    return jsonResponse({ error: "Not found" }, 404, origin, env.CORS_ORIGIN);
  },
};
