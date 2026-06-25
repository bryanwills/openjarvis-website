# OpenJarvis Website — Handoff

A standalone **Astro** landing site for OpenJarvis, to be served at **`openjarvis.stanford.edu`**.
This is a *separate* project from the OpenJarvis framework and from the docs site
(`https://open-jarvis.github.io/OpenJarvis/`, which stays exactly as-is — this repo does not touch it).

## Status

✅ The site is **built, reviewed, and deployable**. It's a single responsive page (light/dark, ~zero JS)
with all real copy/links, the approved hero + terminal, the Five Primitives, a showcase gallery, a
how-it-works diagram, a research section, and community CTAs. `npm run build` and `npm test` are green.

⚠️ **Not yet live** — three human/admin steps remain (see *Going live* below). DNS is already done.

## Run it locally

```bash
npm install        # Node 22+ required (see package.json "engines")
npm run dev        # local dev server (Vite) — open the printed URL
npm run build      # static build → dist/
npm test           # vitest (clipboard helper unit test)
```

## Where things live

| You want to change… | Edit… |
|---|---|
| Headline / links / install command / footer | `src/config/site.ts` |
| The five feature cards | `src/content/features/*.md` (Markdown front-matter) |
| Showcase items / captions | `src/content/showcase/*.md` |
| Section markup & styling | `src/components/*.astro` |
| Page order | `src/pages/index.astro` |
| Theme colors / dark mode / responsive | `src/styles/global.css` |
| Logos, screenshots, architecture diagram | `public/` (and `public/showcase/`) |

Content is intentionally in Markdown so copy can be edited without touching components.
The brand palette is zinc neutrals + cyan accent `#0891b2` (matches the OpenJarvis desktop app).

## Going live (admin steps — needs repo admin on `open-jarvis`)

1. **Pages source:** Settings → Pages → Source = **GitHub Actions**.
2. **Custom domain:** set `openjarvis.stanford.edu` (a `public/CNAME` file already pins it; DNS CNAME
   → `open-jarvis.github.io` is already provisioned via Stanford NetDB).
3. **HTTPS:** enable **Enforce HTTPS** once GitHub finishes provisioning the TLS cert (minutes–hours).

The deploy workflow (`.github/workflows/deploy.yml`) builds and deploys on every push to `main`.

> **Note on private repos:** GitHub Pages from a **private** repo requires a paid GitHub plan
> (Pro/Team/Enterprise). If the Action's deploy step fails with a Pages-not-available error, either
> upgrade the org plan or make this repo **public** before launch (it's the eventual public site anyway).

## Design context

See `docs/planning/` for the original design spec and the implementation plan (full rationale,
content decisions, and the section-by-section structure).

## Good first tasks for whoever picks this up

- Preview locally (`npm run dev`) and sanity-check copy/links against `src/config/site.ts`.
- Swap in nicer real screenshots if available (currently from the docs repo).
- Optional polish: add a sitemap/robots, Open Graph image, and a favicon set.
- When ready: do the three *Going live* steps and confirm `openjarvis.stanford.edu` serves over HTTPS.
