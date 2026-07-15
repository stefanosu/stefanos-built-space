// OG tag injection worker that fetches post metadata from the posts-api worker.
// Deployed via GitHub Actions - see .github/workflows/deploy-worker.yml

const POSTS_API_URL = "https://posts-api.stefanosugbit.workers.dev";

const DEFAULT_OG = {
  title: "Stefanos Ugbit • Software Engineer & Published Author",
  description: "Full-stack software engineer and published author. Building reliable software with clean architecture, and writing poetry that explores personal growth.",
  image: "https://stefanosugbit.com/og-preview.png"
};

// Cache for posts metadata (refreshed every 5 minutes)
let postsCache = null;
let cacheTime = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

async function getPostsMetadata() {
  const now = Date.now();
  if (postsCache && (now - cacheTime) < CACHE_TTL) {
    return postsCache;
  }

  try {
    const response = await fetch(POSTS_API_URL + "/posts");
    if (!response.ok) {
      console.error("Failed to fetch posts:", response.status);
      return postsCache || {};
    }

    const posts = await response.json();
    // Convert array to object keyed by slug
    const postsMap = {};
    for (const post of posts) {
      postsMap[post.slug] = {
        title: post.title,
        description: post.excerpt,
        image: "https://stefanosugbit.com/og-preview.png"
      };
    }

    postsCache = postsMap;
    cacheTime = now;
    return postsMap;
  } catch (err) {
    console.error("Error fetching posts:", err);
    return postsCache || {};
  }
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

addEventListener("fetch", function(event) {
  event.respondWith(handleRequest(event.request));
});

async function handleRequest(request) {
  const url = new URL(request.url);
  const path = url.pathname;

  // Check if this is a blog post URL
  const blogMatch = path.match(/^\/writing\/([^\/]+)\/?$/);

  // Fetch posts metadata if this might be a blog post
  let blogPosts = {};
  if (blogMatch) {
    blogPosts = await getPostsMetadata();
  }

  // Fetch the original response
  const response = await fetch(request);

  // Only modify HTML responses
  const contentType = response.headers.get("Content-Type") || "";
  if (!contentType.includes("text/html")) {
    return response;
  }

  let html = await response.text();

  // Determine which OG tags to use
  let og = DEFAULT_OG;
  if (blogMatch) {
    const slug = blogMatch[1];
    if (blogPosts[slug]) {
      og = blogPosts[slug];
    }
  }

  // Replace OG tags
  html = html
    .replace(
      /<meta\s+property="og:title"[\s\S]*?\/>/,
      '<meta property="og:title" content="' + escapeHtml(og.title) + '" />'
    )
    .replace(
      /<meta\s+property="og:description"[\s\S]*?\/>/,
      '<meta property="og:description" content="' + escapeHtml(og.description) + '" />'
    )
    .replace(
      /<meta\s+property="og:url"[\s\S]*?\/>/,
      '<meta property="og:url" content="https://stefanosugbit.com' + path + '" />'
    )
    .replace(
      /<meta\s+property="og:image"[\s\S]*?\/>/,
      '<meta property="og:image" content="' + og.image + '" />'
    )
    .replace(
      /<meta\s+name="twitter:title"[\s\S]*?\/>/,
      '<meta name="twitter:title" content="' + escapeHtml(og.title) + '" />'
    )
    .replace(
      /<meta\s+name="twitter:description"[\s\S]*?\/>/,
      '<meta name="twitter:description" content="' + escapeHtml(og.description) + '" />'
    )
    .replace(
      /<meta\s+name="twitter:url"[\s\S]*?\/>/,
      '<meta name="twitter:url" content="https://stefanosugbit.com' + path + '" />'
    )
    .replace(
      /<meta\s+name="twitter:image"[\s\S]*?\/>/,
      '<meta name="twitter:image" content="' + og.image + '" />'
    )
    .replace(
      /<title>[^<]*<\/title>/,
      blogMatch && blogPosts[blogMatch[1]]
        ? '<title>' + escapeHtml(og.title) + ' | Stefanos Ugbit</title>'
        : '<title>' + escapeHtml(og.title) + '</title>'
    );

  // Set og:type to article for blog posts
  if (blogMatch) {
    html = html.replace(
      /<meta\s+property="og:type"[\s\S]*?\/>/,
      '<meta property="og:type" content="article" />'
    );
  }

  // Return 200 for valid blog posts (GitHub Pages returns 404 for SPA routes)
  const status = blogMatch && blogPosts[blogMatch[1]] ? 200 : response.status;

  return new Response(html, {
    status: status,
    headers: { "Content-Type": "text/html;charset=UTF-8" }
  });
}
