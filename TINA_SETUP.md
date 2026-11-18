# Tina CMS Setup Guide

This document explains how to complete the Tina CMS integration for your blog.

## What Was Done

The Tina CMS integration has been implemented with the following changes:

### ✅ Completed
- Installed Tina CMS dependencies (`tinacms`, `@tinacms/cli`, `gray-matter`)
- Created Tina configuration (`tina/config.ts`)
- Migrated all 7 blog posts from TypeScript to MDX format (`content/posts/*.mdx`)
- Updated data loading to read from MDX files
- Replaced AdminWrite page with redirect to Tina admin
- Updated build scripts to include Tina build step
- Updated GitHub Actions workflow with Tina environment variables
- Cleaned up deprecated files:
  - Removed `src/data/posts/*.ts` (old TypeScript posts)
  - Removed `posts-api/` directory
  - Removed `src/lib/postsApi.ts`
  - Removed `src/components/admin/` directory
  - Removed `.github/workflows/deploy-posts-api.yml`

### 📂 New File Structure
```
content/
└── posts/           # MDX blog posts with YAML frontmatter
    ├── docs-bigger-than-code.mdx
    ├── claude-code.mdx
    └── ... (7 posts total)

tina/
└── config.ts        # Tina CMS configuration

.env.local           # Local environment variables (gitignored)
.env.example         # Template for environment variables
```

## Next Steps: Tina Cloud Setup

To complete the integration and get the CMS working, follow these steps:

### 1. Create Tina Cloud Account (5 minutes)

1. Go to https://tina.io
2. Sign up for a free account (free tier includes 2 users, unlimited repos)
3. Click "Create Project" or "New Project"

### 2. Connect Your GitHub Repository (2 minutes)

1. In Tina Cloud dashboard, click "Connect Repository"
2. Authorize Tina to access your GitHub account
3. Select this repository: `stefanos-built-space`
4. Set the branch to `main`

### 3. Get Your Credentials (1 minute)

After connecting the repository, Tina will show you:

- **Client ID**: A string like `abc123def456`
- **Read-Only Token**: A longer string like `eyJhbGciOiJ...`

### 4. Configure Local Environment (1 minute)

Update your `.env.local` file with the real credentials:

```bash
# Replace placeholder values with real ones from Tina Cloud
VITE_TINA_CLIENT_ID=your_actual_client_id
TINA_TOKEN=your_actual_token
```

### 5. Configure GitHub Secrets (2 minutes)

Add these secrets to your GitHub repository:

1. Go to your GitHub repository settings
2. Navigate to: Settings → Secrets and variables → Actions
3. Click "New repository secret" and add:
   - Name: `VITE_TINA_CLIENT_ID` → Value: (your client ID)
   - Name: `VITE_TINA_TOKEN` → Value: (your token)

### 6. Test Locally (2 minutes)

```bash
# Start the dev server with Tina
npm run dev

# Visit http://localhost:8080 to see your site
# Visit http://localhost:8080/admin/index.html to access Tina CMS
```

You should see:
- Main site works at http://localhost:8080
- Tina admin interface at http://localhost:8080/admin/index.html
- Visiting `/writing/admin` redirects to Tina admin

### 7. Deploy to Production (Automatic)

Once you commit and push these changes:

```bash
git add .
git commit -m "feat: integrate Tina CMS for blog management"
git push origin main
```

GitHub Actions will:
1. Run `tinacms build` to generate the admin interface
2. Run `vite build` to build your site
3. Deploy to GitHub Pages

## Using Tina CMS

### Creating a New Post

1. Visit https://stefanosugbit.com/admin/index.html (or `/writing/admin`)
2. Log in with GitHub OAuth
3. Click "Posts" → "Create New"
4. Fill in the fields:
   - **Title**: Post title
   - **Slug**: URL-friendly identifier (e.g., "my-new-post")
   - **Excerpt**: Short description for the post list
   - **Date**: Publication date
   - **Read Time**: Estimated reading time (e.g., "5 min read")
   - **Tags**: Array of tags (e.g., ["TypeScript", "Testing"])
   - **Body**: Markdown content with live preview
5. Click "Save"

Tina will automatically commit the new post to your GitHub repo!

### Editing an Existing Post

1. Visit the admin interface
2. Click "Posts"
3. Select the post to edit
4. Make your changes with live preview
5. Click "Save"

Changes are committed to GitHub and automatically deployed.

### Content Model

Each post has this structure (defined in `tina/config.ts`):

```typescript
{
  title: string         // Post title
  slug: string          // URL identifier
  excerpt: string       // Short description
  date: datetime        // Publication date
  readTime: string      // e.g., "5 min read"
  tags: string[]        // Array of tags
  body: rich-text       // Markdown content
}
```

## Verification Checklist

After setup, verify:

- [ ] All 7 existing posts render correctly at `/writing`
- [ ] Can access Tina admin at `/admin/index.html`
- [ ] GitHub OAuth login works in Tina admin
- [ ] Can create a new test post via Tina
- [ ] New post appears in the post list
- [ ] Can edit existing posts with live preview
- [ ] Changes commit to GitHub automatically
- [ ] GitHub Pages build succeeds
- [ ] OG tags work for social sharing

## Troubleshooting

### "Client not configured properly" Error

**Problem**: Build fails with "Missing clientId, token"

**Solution**:
- Make sure `.env.local` has real Tina Cloud credentials (not placeholders)
- For GitHub Actions, verify secrets are set in repository settings

### "Project not found" Error

**Problem**: Tina Cloud returns 404 when checking client information.

**Solution**:
- Verify `VITE_TINA_CLIENT_ID` matches the client ID of the Tina Cloud project connected to this repository.
- Verify the read-only token belongs to that project and the configured branch exists.
- Remove any accidental whitespace when saving the GitHub secrets.

### Admin Interface Shows 404

**Problem**: `/admin/index.html` returns 404

**Solution**:
- Run `tinacms build` to generate the admin interface
- Check that `public/admin/` directory exists after build
- Verify `.gitignore` includes `public/admin` (it's generated at build time)

### Posts Not Loading

**Problem**: Posts don't appear on the site

**Solution**:
- Verify MDX files exist in `content/posts/`
- Check browser console for errors
- Ensure frontmatter format is correct (YAML between `---` markers)

### Cannot Save Posts in Admin

**Problem**: Saving posts fails in Tina admin

**Solution**:
- Verify GitHub OAuth authorization in Tina Cloud dashboard
- Check that Tina Cloud is connected to the correct repository
- Ensure you have write permissions to the repository

## Benefits Over Previous Setup

✅ **Working CMS**: Unlike the broken localStorage admin, Tina works immediately
✅ **Git-based**: All content commits directly to GitHub with full history
✅ **Secure auth**: GitHub OAuth instead of localStorage password
✅ **Visual editor**: Rich text editing with live preview
✅ **Less code**: Removed ~500 lines of custom admin code
✅ **Free tier**: Perfect for personal blogs (2 users, unlimited repos)
✅ **Mobile-friendly**: Write from anywhere with internet access

## Support

- Tina Documentation: https://tina.io/docs
- Tina Discord: https://discord.com/invite/zumN63Ybpf
- GitHub Issues: https://github.com/tinacms/tinacms/issues
