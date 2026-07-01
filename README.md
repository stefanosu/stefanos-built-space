# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/15dadaa6-8fbe-4123-9b71-24a09a84416b

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/15dadaa6-8fbe-4123-9b71-24a09a84416b) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Writing posts from the site (`/writing/admin`)

There's a hidden editor at `/writing/admin` (not linked from navigation) that lets
you write and publish blog posts directly from the browser. Publishing commits a
new file under `src/data/posts/` straight to GitHub via the Contents API, which
triggers the normal GitHub Pages deploy.

To use it, you need two things configured — neither of which is required for the
site to build or run otherwise:

1. **Admin password** — the page is gated by a password whose SHA-256 hash is
   baked in at build time via `VITE_ADMIN_PASSWORD_HASH`.
   - Locally: copy `.env.local.example` to `.env.local` and fill in a hash (see
     the instructions in that file for generating one).
   - In production: add `VITE_ADMIN_PASSWORD_HASH` as a GitHub Actions repo secret
     (Settings → Secrets and variables → Actions) so it's available to the build
     step in `.github/workflows/deploy-pages.yml` / `pages.yml`.
2. **GitHub token** — once past the password screen, the editor asks for a GitHub
   personal access token used to commit posts. Use a fine-grained token scoped
   only to this repo's "Contents: Read and write" permission; it's stored only in
   your browser (localStorage, if you opt in) and sent only to GitHub's API.

This is a soft gate, not a security boundary — since this is a static site, the
password hash and the admin route both live in the shipped JS bundle. Treat the
GitHub token as the real credential, and revoke/rotate it from GitHub whenever you
want to lock things down.

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/15dadaa6-8fbe-4123-9b71-24a09a84416b) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
