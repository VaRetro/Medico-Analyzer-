# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/d3c5a4be-f7b6-41cb-8ec3-f8a30a9b12bb

## How can I edit this code?

There are several ways of editing your application.

# Corpus Quest AI

A Vite + React research platform. This README explains how to run and deploy the site WITHOUT using the Lovable website — just clone the repo and follow the steps below.

## Quick start (run locally, no Lovable required)

Prerequisites:
- Node.js 18+ and npm (or yarn/pnpm)
- Git

Clone and run locally:

```bash
npm run dev
```

Replace the placeholder repo URL with this repository if you cloned it directly:

```bash
git clone https://github.com/VaRetro/medico-analyzer.git
cd medico-analyzer
```
npm ci
npm run dev
```

Open the URL printed by Vite (commonly `http://127.0.0.1:8080` or `http://localhost:5173`).

If you prefer a single command on Windows that also opens your browser:

```cmd
npm run dev:open
```

## Edit locally (your IDE)

Open the project in VS Code or your preferred editor. The project uses TypeScript + React + Tailwind. Typical workflow:

1. Install dependencies: `npm ci`
2. Start dev server: `npm run dev`
3. Make changes, then commit and push to your repository.

## Technologies used

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

## Deploy options (no Lovable required)

- GitHub Pages: This repo includes a GitHub Actions workflow that builds and publishes `dist` to `gh-pages` on pushes to `main`.
- Vercel / Netlify: Recommended for one-click deployments and automatic previews. Both providers auto-detect Vite projects.

### One-click deploy (Vercel)

You can add a Vercel button to this README so others can deploy with one click. Example (replace `<PROJECT>` with your Vercel project if desired):

```markdown
[![Deploy to Vercel](https://vercel.com/button)](https://vercel.com/new/git/external?repository-url=https://github.com/VaRetro/medico-analyzer)
```

### Docker (run anywhere with Docker)

Build and run the container locally:

```bash
docker build -t medico-analyzer .
docker run --rm -p 8080:80 medico-analyzer
# or with docker-compose
docker-compose up --build
```

The app will be available at `http://localhost:8080`.

### .env.example

Copy `.env.example` to `.env` or `.env.local` and fill in any keys you require before running locally or deploying. Do NOT commit real secrets to the repo.

## Notes

- If the app needs runtime keys (Supabase, AI gateway), set them in a `.env` file locally or in your hosting provider's environment settings.
- For large files or production OCR, consider server-side extraction rather than client-side processing.
### Run locally (anyone with the repo link)

Clone and run locally:

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
npm ci
npm run dev
```

Open the printed local URL in your browser (usually `http://127.0.0.1:8080` or `http://localhost:5173`).

If you want a one-click deploy, use Vercel (recommended) — it will provide a live URL instantly after import.

## Run this website on any machine (step-by-step)

Follow these steps to run the site locally on Windows, macOS, or Linux. These instructions assume you have Git and Node.js installed (recommended Node 18+).

1) Clone the repository

```bash
git clone https://github.com/<owner>/<repo>.git
cd <repo>
```

2) Install dependencies

Use npm (recommended) to install exact packages from lockfile:

```bash
npm ci
```

If you prefer yarn or pnpm, run `yarn` or `pnpm install` instead.

3) Configure environment variables (optional)

If the app needs runtime keys (Supabase, AI gateway), create a `.env` or `.env.local` file in the project root with values prefixed by `VITE_` for client-side variables. Example:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=public-anon-key
# Optional server secrets (use provider secrets when deploying)
LOVABLE_API_KEY=sk_xxx
```

4) Start the dev server

Platform-agnostic (recommended):

```bash
npm run dev
```

Windows (cmd.exe) — the project includes a helper that opens your browser:

```cmd
npm run dev:open
```

5) Open the site

Open the URL printed by Vite in your browser, e.g. `http://127.0.0.1:8080/` or `http://localhost:5173`.

Troubleshooting
- Port in use: if the dev server reports "Port 8080 is in use", either kill the process using the port or start on another port:

```cmd
set VITE_PORT=5173 && npm run dev
# PowerShell: $env:VITE_PORT=5173; npm run dev
```

- Firewall / LAN access: to access the app from another device on your LAN, open port 8080 in your firewall or start Vite bound to 0.0.0.0 and allow the port in firewall settings.

- Build errors related to Tailwind directives (`@tailwind`, `@apply`): these are processed at build time by PostCSS; ignore editor lint warnings and run `npm run build` to verify.

Run a production build

```bash
npm run build
npm run preview   # serve the built dist locally for a quick smoke test
```

Alternative: run in Docker

If you prefer containerized runs, create a simple Dockerfile that installs Node, copies the repo, runs `npm ci`, and `npm run build`, then serves `dist` with a small static server.

Want me to add a one-click "Deploy to Vercel" badge and a Dockerfile? I can add either or both.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/features/custom-domain#custom-domain)
