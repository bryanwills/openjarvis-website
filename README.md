# OpenJarvis Website

Marketing and documentation site for [OpenJarvis](https://github.com/open-jarvis/OpenJarvis) — a local-first personal-AI framework. Built with [Astro](https://astro.build) and deployed to GitHub Pages at `https://openjarvis.stanford.edu`.

## Development

```bash
npm install        # install dependencies
npm run dev        # start local dev server at localhost:4321
npm run build      # production build → ./dist/
npm run preview    # preview the production build locally
npm test           # run vitest unit tests
```

## Editing content

- **Structured copy** (primitives, showcase cards, how-it-works steps, research papers, community links): edit the Markdown/MDX files under `src/content/` — each collection has a schema defined in `src/content/config.ts`.
- **Site-wide metadata** (name, tagline, nav links, footer links, install one-liner, social URLs): edit `src/config/site.ts`.
- **Component markup/styles**: components live in `src/components/`; pages in `src/pages/`.

## GitHub Pages setup (human / org-admin)

Once the `open-jarvis/website` repository exists and CI is green, complete these one-time steps in the GitHub repo settings:

1. **Enable Pages**: Settings → Pages → Source → select **GitHub Actions**.
2. **Set custom domain**: in the "Custom domain" field enter `openjarvis.stanford.edu` and save. GitHub will commit a `CNAME` file — the repo already has `public/CNAME` pinning the domain, so this is a no-op for the file but triggers cert provisioning.
3. **Enforce HTTPS**: once GitHub reports "DNS check successful" and the TLS certificate has provisioned (usually a few minutes), tick **Enforce HTTPS**.

> **DNS note:** the Stanford DNS CNAME (`openjarvis.stanford.edu → open-jarvis.github.io`) is already configured. `public/CNAME` in this repo pins the domain so it survives every deploy.
