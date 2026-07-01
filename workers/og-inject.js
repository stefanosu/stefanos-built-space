// Cloudflare Worker to inject dynamic OG tags for blog posts
// Deploy this via Cloudflare Dashboard or wrangler

const BLOG_POSTS = {
  "claude-code": {
    title: "I Built a Toy Payment Processor With Claude Code — Here's What That Workflow Actually Looked Like",
    description: "I built a toy payment processor with Claude Code to explore what AI-assisted engineering actually looks like when the design decisions stay yours.",
    image: "https://stefanosugbit.com/og-preview.png"
  },
  "testing-your-architecture-decisions": {
    title: "Testing Your Architecture Decisions",
    description: "How to validate architectural choices before they become expensive mistakes.",
    image: "https://stefanosugbit.com/og-preview.png"
  },
  "integration-testing-patterns-that-actually-work": {
    title: "Integration Testing Patterns That Actually Work",
    description: "Practical patterns for integration tests that are fast, reliable, and maintainable.",
    image: "https://stefanosugbit.com/og-preview.png"
  },
  "controllers-or-services-where-should-orchestration-live": {
    title: "Controllers or Services: Where Should Orchestration Live?",
    description: "Exploring where business logic orchestration belongs in your application architecture.",
    image: "https://stefanosugbit.com/og-preview.png"
  }
};

const DEFAULT_OG = {
  title: "Stefanos Ugbit • Software Engineer & Published Author",
  description: "Full-stack software engineer and published author. Building reliable software with clean architecture, and writing poetry that explores personal growth.",
  image: "https://stefanosugbit.com/og-preview.png"
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;

    // Check if this is a blog post URL
    const blogMatch = path.match(/^\/writing\/([^\/]+)\/?$/);

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
      if (BLOG_POSTS[slug]) {
        og = BLOG_POSTS[slug];
      }
    }

    // Replace OG tags - handle multi-line meta tags
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
        `<meta property="og:url" content="https://stefanosugbit.com${path}" />`
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
        `<meta name="twitter:url" content="https://stefanosugbit.com${path}" />`
      )
      .replace(
        /<meta\s+name="twitter:image"[\s\S]*?\/>/,
        `<meta name="twitter:image" content="${og.image}" />`
      )
      // Also update the page title for blog posts
      .replace(
        /<title>[^<]*<\/title>/,
        blogMatch && BLOG_POSTS[blogMatch[1]]
          ? `<title>${escapeHtml(og.title)} | Stefanos Ugbit</title>`
          : `<title>${escapeHtml(og.title)}</title>`
      );

    // Set og:type to article for blog posts
    if (blogMatch) {
      html = html.replace(
        /<meta\s+property="og:type"[\s\S]*?\/>/,
        `<meta property="og:type" content="article" />`
      );
    }

    // Return 200 for valid blog posts (GitHub Pages returns 404 for SPA routes)
    const status = blogMatch && BLOG_POSTS[blogMatch[1]] ? 200 : response.status;

    // Build clean headers
    const newHeaders = new Headers();
    newHeaders.set("Content-Type", "text/html;charset=UTF-8");

    return new Response(html, {
      status: status,
      headers: newHeaders
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
