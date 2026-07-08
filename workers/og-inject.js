// Cloudflare Worker to inject dynamic OG tags for blog posts
// Fetches post metadata from posts-meta.json generated at build time

const ORIGIN = "https://stefanosugbit.github.io/stefanos-built-space";
const SITE_URL = "https://stefanosugbit.com";

const DEFAULT_OG = {
  title: "Stefanos Ugbit - Software Engineer & Published Author",
  description: "Full-stack software engineer and published author. Building reliable software with clean architecture, and writing poetry that explores personal growth.",
  image: `${SITE_URL}/og-preview.png`
};

// Cache for posts metadata (refreshed on each deployment)
let postsCache = null;
let postsCacheTime = 0;
const CACHE_TTL = 60 * 1000; // 1 minute cache

async function getPostsMeta() {
  const now = Date.now();
  if (postsCache && (now - postsCacheTime) < CACHE_TTL) {
    return postsCache;
  }

  try {
    const response = await fetch(`${ORIGIN}/posts-meta.json`);
    if (response.ok) {
      postsCache = await response.json();
      postsCacheTime = now;
      return postsCache;
    }
  } catch (e) {
    console.error("Failed to fetch posts-meta.json:", e);
  }

  return {};
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Check if this is a blog post URL
    const blogMatch = path.match(/^\/writing\/([^\/]+)\/?$/);

    // Fetch the original response from GitHub Pages
    const originUrl = new URL(path, ORIGIN);
    originUrl.search = url.search;

    const response = await fetch(originUrl.toString(), {
      headers: request.headers,
    });

    // Only modify HTML responses
    const contentType = response.headers.get("Content-Type") || "";
    if (!contentType.includes("text/html")) {
      return response;
    }

    let html = await response.text();

    // Determine which OG tags to use
    let og = DEFAULT_OG;
    let isValidPost = false;

    if (blogMatch) {
      const slug = blogMatch[1];
      const posts = await getPostsMeta();

      if (posts[slug]) {
        og = {
          title: posts[slug].title,
          description: posts[slug].description,
          image: posts[slug].image
        };
        isValidPost = true;
      }
    }

    // Replace OG tags
    html = html
      .replace(
        /<meta\s+property="og:title"[\s\S]*?\/>/,
        `<meta property="og:title" content="${escapeHtml(og.title)}" />`
      )
      .replace(
        /<meta\s+property="og:description"[\s\S]*?\/>/,
        `<meta property="og:description" content="${escapeHtml(og.description)}" />`
      )
      .replace(
        /<meta\s+property="og:url"[\s\S]*?\/>/,
        `<meta property="og:url" content="${SITE_URL}${path}" />`
      )
      .replace(
        /<meta\s+property="og:image"[\s\S]*?\/>/,
        `<meta property="og:image" content="${og.image}" />`
      )
      .replace(
        /<meta\s+name="twitter:title"[\s\S]*?\/>/,
        `<meta name="twitter:title" content="${escapeHtml(og.title)}" />`
      )
      .replace(
        /<meta\s+name="twitter:description"[\s\S]*?\/>/,
        `<meta name="twitter:description" content="${escapeHtml(og.description)}" />`
      )
      .replace(
        /<meta\s+name="twitter:url"[\s\S]*?\/>/,
        `<meta name="twitter:url" content="${SITE_URL}${path}" />`
      )
      .replace(
        /<meta\s+name="twitter:image"[\s\S]*?\/>/,
        `<meta name="twitter:image" content="${og.image}" />`
      )
      .replace(
        /<title>[^<]*<\/title>/,
        isValidPost
          ? `<title>${escapeHtml(og.title)} | Stefanos Ugbit</title>`
          : `<title>${escapeHtml(og.title)}</title>`
      );

    // Set og:type to article for blog posts
    if (isValidPost) {
      html = html.replace(
        /<meta\s+property="og:type"[\s\S]*?\/>/,
        `<meta property="og:type" content="article" />`
      );
    }

    // Return 200 for valid blog posts (GitHub Pages returns 404 for SPA routes)
    const status = isValidPost ? 200 : response.status;

    return new Response(html, {
      status: status,
      headers: {
        "Content-Type": "text/html;charset=UTF-8",
        "Cache-Control": "public, max-age=60"
      }
    });
  }
};

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
