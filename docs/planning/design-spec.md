# OpenJarvis Project Website — Design Spec

**Date:** 2026-06-22
**Status:** Approved (design), pending spec review → implementation plan
**Owner:** Jon Saad-Falcon

## Goal

Ship a polished, standalone **project landing site** for OpenJarvis — a "here's what we
do" page for a wider, non-technical-and-technical audience — served at the
Stanford-associated URL **`openjarvis.stanford.edu`**. Modeled on clean open-source
project sites (OpenClaw, Home Assistant, AppSmith): a single page that explains the
project and funnels visitors to GitHub, the docs, Discord, downloads, and the paper.

## Non-goals

- **Not** moving or replacing the documentation. Docs stay at
  `https://open-jarvis.github.io/OpenJarvis/` (mkdocs, deployed by the existing
  `docs.yml`), completely untouched.
- Not a web app or dashboard — this is a static brochure/landing site.
- Not multi-page (for now): single scrolling page with anchored sections; can grow later.
- The defunct `open-jarvis.vercel.app` is **out of scope** here; tracked separately as a
  takedown cleanup item (Jon to remove; no utility).

## Architecture & hosting

- **New dedicated repo:** `open-jarvis/website` (Astro source). A separate repo is
  required because the `OpenJarvis` repo already uses its single GitHub Pages slot for the
  docs; isolating the site guarantees the docs site is unaffected.
- **Framework:** **Astro** (static-site generator). Component-based, ships ~zero JS,
  content authored in Markdown/front-matter so non-developers (e.g. Elena) can edit copy
  via single-file changes. Builds to static HTML.
- **Deploy:** GitHub Actions → GitHub Pages via `actions/upload-pages-artifact` +
  `actions/deploy-pages` (same pattern as `docs.yml`). Push to `main` → auto rebuild +
  deploy. A `public/CNAME` file (or Pages config) pins the custom domain.
- **Domain mapping:**

  ```
  openjarvis.stanford.edu            → new Astro landing site  (open-jarvis/website)
  open-jarvis.github.io/OpenJarvis/  → existing docs           (OpenJarvis repo, unchanged)
  ```

### DNS / Pages state

- ✅ **DNS done:** Stanford NetDB created `openjarvis.stanford.edu` as a CNAME →
  `open-jarvis.github.io` (request fulfilled). Confirmed no conflicting
  MX/TXT.
- ⚠️ **Pending (human, org-admin):** the GitHub side is not wired yet — no repo currently
  claims the custom domain (`OpenJarvis` Pages `cname` is empty; no org-apex
  `open-jarvis.github.io` repo exists). Required steps Jon performs:
  1. Create `open-jarvis/website` (or approve agent creation if the token has org rights).
  2. In its Pages settings: set custom domain `openjarvis.stanford.edu`, then enable
     **Enforce HTTPS** once GitHub provisions the TLS cert (minutes–hours after the domain
     resolves).
- A second CNAME (e.g. `docs.openjarvis.stanford.edu`) is **not** needed under this design.

## Visual identity

Approved direction: **minimal & centered** (OpenClaw-style) — calm, generous whitespace,
single accent. Reuses the existing OpenJarvis brand for consistency with the desktop app
and docs:

- **Palette** (from the desktop app's `frontend/src/index.css`): zinc neutrals
  (`#fafafa` bg, `#09090b` text, `#52525b` secondary) + **cyan accent `#0891b2`** (hover
  `#0e7490`), amber `#f59e0b` as a secondary accent. Light + dark themes, responsive.
- **Logos / assets** imported from the OpenJarvis repo so the site is self-contained:
  - `assets/OpenJarvis_Circular_Logo.png`, `assets/OpenJarvis_Horizontal_Logo.png`, favicon
  - `docs/assets/OpenJarvis_Architecture.png`
  - `docs/assets/showcase/{coding-assistant,cost-savings,discord-companion,morning-brief,persistent-memory}.png`
- **Hero** (validated mockup): centered tagline "Personal AI, On Personal Devices" +
  subhead "Build personal AI that runs on your hardware. Cloud APIs are optional." +
  buttons **[Get Started] [View on GitHub]**, above a dark terminal block showing a real
  flow:

  ```
  $ curl -fsSL open-jarvis.github.io/install.sh | bash
  $ jarvis init                    # one-time setup & model pull
  $ jarvis ask "what's on my calendar today?"
    → answered locally on your GPU · 0 cloud calls · 1.2s
  $ jarvis serve                   # OpenAI-compatible API
    → live at http://localhost:8000
  ```

  Footer line: "Local-first by default · A Stanford research project · Apache-2.0".

## Content structure (single page, anchored sections)

Real copy/links from the repo; no placeholders.

1. **Hero** — tagline + subhead + CTAs + terminal (above).
2. **Quickstart** — the install one-liner with a copy button; pointer to docs.
3. **Features** — the **Five Primitives for Personal AI** as cards (verbatim concept from
   docs `index.md`): **Intelligence** (pick a model or let it pick for your hardware;
   manages the local model catalog) · **Engine** (inference runtime — Ollama, vLLM, SGLang,
   llama.cpp, cloud — auto-detects hardware) · **Agents** (multi-step reasoning + tool use;
   eight built-in agent types) · **Tools & Memory** (web search, calculator, file I/O, code
   interpreter, retrieval, persistent local state, any MCP server) · **Learning** (improves
   over time from local interaction traces — weights, prompts, agent behavior).
4. **Showcase** — screenshot gallery from `docs/assets/showcase/*` (coding assistant, cost
   savings, Discord companion, morning brief, persistent memory).
5. **How it works** — the "in the spirit of PyTorch" framing + the architecture diagram.
6. **Research** — "Backed by research": link to the paper (`arxiv.org/abs/2605.17172`) and
   the Intelligence-Per-Watt finding (88.7% of single-turn queries handled locally; 5.3×
   efficiency 2023→2025; `intelligence-per-watt.ai`).
7. **Community / CTA** — Discord (`discord.gg/CMVBmDQ5Fj`), GitHub, "Contribute".
8. **Footer** — Docs · GitHub · Discord · Paper · License · "A Stanford research project".

Header nav anchors to these sections + outbound **Docs** and **GitHub** links. A
**Download desktop app** link points to GitHub Releases (built by `desktop.yml`).

## Components / structure (Astro)

- `src/layouts/Base.astro` — `<head>`, theme CSS vars (zinc + cyan), light/dark, favicon,
  meta/OG tags, header + footer slots.
- `src/components/` — `Hero.astro`, `Terminal.astro` (copy-to-clipboard), `FeatureCard.astro`,
  `ShowcaseGallery.astro`, `Section.astro`, `Nav.astro`, `Footer.astro`.
- `src/content/` — Markdown/front-matter for editable copy (hero text, the five features,
  showcase captions, research blurb) so non-devs edit content without touching components.
- `src/pages/index.astro` — composes the sections.
- `public/` — `CNAME` (`openjarvis.stanford.edu`), imported logos/screenshots, favicon, robots/sitemap.
- `.github/workflows/deploy.yml` — build + deploy to Pages.

Each component has one clear purpose and a small, well-defined prop interface (heading,
body, links/images), independently understandable and reusable across sections.

## Success criteria

- `openjarvis.stanford.edu` serves the new site over HTTPS; `open-jarvis.github.io/OpenJarvis/`
  docs unchanged and still reachable.
- Single responsive page (mobile + desktop), light/dark, Lighthouse-clean (static, ~zero JS).
- All outbound links correct (GitHub, docs, Discord, paper, releases) and the install
  one-liner copy button works.
- Content editable via Markdown without touching component code.
- `main` push auto-deploys.

## Risks / mitigations

- **Pages custom-domain + HTTPS provisioning** can lag and is human/org-admin gated →
  documented checklist; site works at the Pages default URL meanwhile.
- **`CNAME` file vs Pages setting** must agree (both = `openjarvis.stanford.edu`) or Pages
  resets the domain → set both, verify once.
- **Asset drift** (showcase screenshots live in the OpenJarvis repo) → copy them into the
  `website` repo so the site is self-contained; revisit if they change often.
- **Repo creation rights** — confirm whether the agent token can create the org repo;
  otherwise Jon creates it (one click).

## Open decision (for spec review)

- **Where this spec/repo lives:** create `open-jarvis/website` now and seed it there, vs.
  keep this spec in the OpenJarvis repo until the website repo exists. (Default: create the
  dedicated repo.)
