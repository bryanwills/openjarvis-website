# OpenJarvis Website Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Astro landing site for OpenJarvis, deployed to GitHub Pages at `openjarvis.stanford.edu`, without touching the existing docs site.

**Architecture:** A static Astro site in a new repo `open-jarvis/website`. Single scrolling page composed of section components; editable copy lives in Markdown content collections + a typed config. GitHub Actions builds and deploys to Pages; a `CNAME` file + Pages setting bind the Stanford custom domain (DNS already points there).

**Tech Stack:** Astro 5 (static output), TypeScript, vanilla CSS (no UI framework), vitest for unit-testable logic, GitHub Actions (`actions/deploy-pages`).

## Global Constraints

- Custom domain served at **root** → `astro.config.mjs`: `site: 'https://openjarvis.stanford.edu'`, **no `base`** (assets must resolve at `/`).
- Brand palette (verbatim from OpenJarvis `frontend/src/index.css`): bg `#fafafa`/`#f9f9f9`, surface `#ffffff`, text `#09090b`, text-secondary `#52525b`/`#71717a`, **accent `#0891b2`**, accent-hover `#0e7490`, amber `#f59e0b`. Light + dark, responsive.
- Tagline (verbatim): **"Personal AI, On Personal Devices"**. Subhead: **"Build personal AI that runs on your hardware. Cloud APIs are optional."**
- Canonical links: GitHub `https://github.com/open-jarvis/OpenJarvis` · Docs `https://open-jarvis.github.io/OpenJarvis/` · Discord `https://discord.gg/CMVBmDQ5Fj` · Paper `https://arxiv.org/abs/2605.17172` · Releases `https://github.com/open-jarvis/OpenJarvis/releases` · IPW `https://www.intelligence-per-watt.ai/`.
- The Five Primitives (verbatim concepts): Intelligence, Engine, Agents, Tools & Memory, Learning.
- Do NOT modify the OpenJarvis repo's Pages/docs. This is an isolated new repo.
- License/footer line: "Local-first by default · A Stanford research project · Apache-2.0".
- Build target dir for local work: `~/openjarvis-website` (or any clean dir); push to `open-jarvis/website`.

## File Structure

```
openjarvis-website/
├── package.json, astro.config.mjs, tsconfig.json, vitest.config.ts
├── public/
│   ├── CNAME                       # "openjarvis.stanford.edu"
│   ├── favicon.ico
│   ├── logo-horizontal.png, logo-circular.png, architecture.png
│   └── showcase/{coding-assistant,cost-savings,discord-companion,morning-brief,persistent-memory}.png
├── src/
│   ├── styles/global.css           # theme vars (zinc+cyan), light/dark, resets
│   ├── config/site.ts              # links, hero copy, nav/footer data (typed)
│   ├── lib/clipboard.ts            # copy-to-clipboard helper (unit-tested)
│   ├── content.config.ts           # collections: features, showcase (zod schemas)
│   ├── content/features/*.md       # 5 primitives (editable copy)
│   ├── content/showcase/*.md       # 5 showcase items (editable copy)
│   ├── layouts/Base.astro          # head/meta/OG, theme, Nav+Footer slots
│   ├── components/{Nav,Hero,Terminal,FeatureCard,Features,ShowcaseGallery,HowItWorks,Research,Community,Footer,Section}.astro
│   └── pages/index.astro           # composes the page
├── .github/workflows/deploy.yml
└── README.md
```

## Human / org-admin steps (NOT done by the implementer — checklist for Jon)

1. Create the GitHub repo `open-jarvis/website` (public).
2. After first deploy: repo **Settings → Pages** → set Source = GitHub Actions; set Custom domain = `openjarvis.stanford.edu`; once the cert provisions, enable **Enforce HTTPS**.
3. (Separately) take down `open-jarvis.vercel.app`.

---

### Task 1: Scaffold the Astro project

**Files:**
- Create: `openjarvis-website/package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `.gitignore`, `src/pages/index.astro` (temporary)

**Interfaces:**
- Produces: a buildable Astro project; `npm run build` emits `dist/`.

- [ ] **Step 1:** Scaffold in a clean dir:
```bash
cd ~ && npm create astro@latest openjarvis-website -- --template minimal --no-install --no-git --typescript strict --skip-houston
cd openjarvis-website
```
- [ ] **Step 2:** Add vitest + set `astro.config.mjs`:
```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
export default defineConfig({
  site: 'https://openjarvis.stanford.edu',
  // No `base`: custom domain serves at root.
});
```
- [ ] **Step 3:** Create `vitest.config.ts`:
```ts
import { defineConfig } from 'vitest/config';
export default defineConfig({ test: { environment: 'node', include: ['src/**/*.test.ts'] } });
```
- [ ] **Step 4:** Add scripts + deps to `package.json` (`"test": "vitest run"`, `"build": "astro build"`, devDep `vitest`). Install:
```bash
npm install && npm install -D vitest
```
- [ ] **Step 5:** Verify build:
```bash
npm run build
```
Expected: "Complete!" and a `dist/index.html` exists.
- [ ] **Step 6:** Commit:
```bash
git init && git add -A && git commit -m "chore: scaffold Astro project"
```

---

### Task 2: Clipboard helper (the one piece of real logic — TDD)

**Files:**
- Create: `src/lib/clipboard.ts`, `src/lib/clipboard.test.ts`

**Interfaces:**
- Produces: `copyText(text: string, nav?: { clipboard?: { writeText(t: string): Promise<void> } }): Promise<boolean>` — returns true on success, false if no clipboard API. Used by `Terminal.astro`'s copy button.

- [ ] **Step 1: Write the failing test** — `src/lib/clipboard.test.ts`:
```ts
import { describe, it, expect, vi } from 'vitest';
import { copyText } from './clipboard';

describe('copyText', () => {
  it('writes text via the clipboard API and returns true', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const ok = await copyText('hello', { clipboard: { writeText } });
    expect(writeText).toHaveBeenCalledWith('hello');
    expect(ok).toBe(true);
  });
  it('returns false when no clipboard API is present', async () => {
    expect(await copyText('x', {})).toBe(false);
  });
});
```
- [ ] **Step 2: Run, verify fail:** `npx vitest run src/lib/clipboard.test.ts` → FAIL ("Cannot find module './clipboard'").
- [ ] **Step 3: Implement** — `src/lib/clipboard.ts`:
```ts
export async function copyText(
  text: string,
  nav: { clipboard?: { writeText(t: string): Promise<void> } } = (globalThis as any).navigator ?? {},
): Promise<boolean> {
  if (!nav?.clipboard?.writeText) return false;
  try { await nav.clipboard.writeText(text); return true; } catch { return false; }
}
```
- [ ] **Step 4: Run, verify pass:** `npx vitest run src/lib/clipboard.test.ts` → PASS (2 tests).
- [ ] **Step 5: Commit:** `git add src/lib && git commit -m "feat: clipboard copy helper with tests"`

---

### Task 3: Brand assets + CNAME

**Files:**
- Create: `public/CNAME`, `public/logo-horizontal.png`, `public/logo-circular.png`, `public/favicon.ico`, `public/architecture.png`, `public/showcase/*.png`

**Interfaces:** Produces static assets referenced by components via root paths (`/logo-horizontal.png`, `/showcase/coding-assistant.png`, etc.).

- [ ] **Step 1:** Write `public/CNAME` containing exactly: `openjarvis.stanford.edu`
- [ ] **Step 2:** Copy assets from a local OpenJarvis checkout (adjust `$OJ`):
```bash
OJ=/lambda/nfs/lambda-stanford/jonsf/scratch_v10/OpenJarvis
cp "$OJ/assets/OpenJarvis_Horizontal_Logo.png" public/logo-horizontal.png
cp "$OJ/assets/OpenJarvis_Circular_Logo.png" public/logo-circular.png
cp "$OJ/frontend/public/favicon.ico" public/favicon.ico
cp "$OJ/docs/assets/OpenJarvis_Architecture.png" public/architecture.png
mkdir -p public/showcase && cp "$OJ"/docs/assets/showcase/*.png public/showcase/
```
- [ ] **Step 3:** Verify: `ls public/ public/showcase/` shows all files; `cat public/CNAME` = the domain.
- [ ] **Step 4:** Build copies them: `npm run build && ls dist/CNAME dist/showcase/` → present.
- [ ] **Step 5: Commit:** `git add public && git commit -m "chore: import brand assets + CNAME"`

---

### Task 4: Site config + content collections

**Files:**
- Create: `src/config/site.ts`, `src/content.config.ts`, `src/content/features/{1-intelligence,2-engine,3-agents,4-tools-memory,5-learning}.md`, `src/content/showcase/{coding-assistant,cost-savings,discord-companion,morning-brief,persistent-memory}.md`

**Interfaces:**
- Produces: `site` (links/hero copy) from `src/config/site.ts`; content collections `features` and `showcase` (schema-validated; build fails if a field is missing — this is the test).

- [ ] **Step 1:** `src/config/site.ts`:
```ts
export const site = {
  name: 'OpenJarvis',
  tagline: 'Personal AI, On Personal Devices',
  subhead: 'Build personal AI that runs on your hardware. Cloud APIs are optional.',
  links: {
    github: 'https://github.com/open-jarvis/OpenJarvis',
    docs: 'https://open-jarvis.github.io/OpenJarvis/',
    discord: 'https://discord.gg/CMVBmDQ5Fj',
    paper: 'https://arxiv.org/abs/2605.17172',
    releases: 'https://github.com/open-jarvis/OpenJarvis/releases',
    ipw: 'https://www.intelligence-per-watt.ai/',
  },
  install: 'curl -fsSL open-jarvis.github.io/install.sh | bash',
  footerNote: 'Local-first by default · A Stanford research project · Apache-2.0',
} as const;
```
- [ ] **Step 2:** `src/content.config.ts`:
```ts
import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
const features = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/features' }),
  schema: z.object({ title: z.string(), order: z.number(), summary: z.string() }),
});
const showcase = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/showcase' }),
  schema: z.object({ title: z.string(), image: z.string(), order: z.number(), summary: z.string() }),
});
export const collections = { features, showcase };
```
- [ ] **Step 3:** Create the 5 feature files (verbatim concepts). Example `src/content/features/1-intelligence.md`:
```md
---
title: Intelligence
order: 1
summary: Pick a model, or let OpenJarvis pick one for your hardware. Manages the full catalog of local models across providers.
---
```
Repeat for: `2-engine.md` ("Engine" / "The inference runtime — Ollama, vLLM, SGLang, llama.cpp, and cloud APIs. Auto-detects your hardware and recommends the best fit."), `3-agents.md` ("Agents" / "Multi-step reasoning with tool use. Eight built-in agent types, from simple chat to orchestrated workflows."), `4-tools-memory.md` ("Tools & Memory" / "Web search, calculator, file I/O, code interpreter, retrieval, persistent local state, and any external MCP server."), `5-learning.md` ("Learning" / "Your AI gets better over time. Every interaction generates traces that drive automatic improvements to weights, prompts, and agent behavior.").
- [ ] **Step 4:** Create the 5 showcase files. Example `src/content/showcase/coding-assistant.md`:
```md
---
title: Coding Assistant
image: /showcase/coding-assistant.png
order: 1
summary: A local coding agent that reads your repo and edits files.
---
```
Repeat for `cost-savings.md`, `discord-companion.md`, `morning-brief.md`, `persistent-memory.md` (image `/showcase/<name>.png`, ascending order, a one-line summary each).
- [ ] **Step 5:** Verify schema validation = build passes: `npm run build` → Complete. (Temporarily break a field, confirm build FAILS, then restore — proves the schema is the guard.)
- [ ] **Step 6: Commit:** `git add src/config src/content.config.ts src/content && git commit -m "feat: site config + content collections"`

---

### Task 5: Global theme CSS + Base layout

**Files:**
- Create: `src/styles/global.css`, `src/layouts/Base.astro`

**Interfaces:**
- Produces: `Base.astro` with props `{ title?: string; description?: string }`, a `<slot/>`, theme CSS vars, light/dark, favicon + OG/meta. Consumed by `index.astro`.

- [ ] **Step 1:** `src/styles/global.css` — define `:root` light vars + `@media (prefers-color-scheme: dark)` overrides using the Global-Constraints palette; box-sizing reset; base typography; `.container{max-width:1100px;margin:0 auto;padding:0 24px}`; `.btn`/`.btn-primary`(bg accent)/`.btn-outline`; smooth scroll. (Use exact hex values from Global Constraints.)
- [ ] **Step 2:** `src/layouts/Base.astro`:
```astro
---
import '../styles/global.css';
import { site } from '../config/site';
const { title = site.name, description = site.subhead } = Astro.props;
---
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{title} — {site.tagline}</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={site.name} />
    <meta property="og:description" content={description} />
    <meta property="og:type" content="website" />
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body><slot /></body>
</html>
```
- [ ] **Step 3:** Verify: `npm run build` and `grep -q 'Personal AI' dist/index.html` after index uses Base (placeholder index for now can import Base). Expected: build Complete.
- [ ] **Step 4: Commit:** `git add src/styles src/layouts && git commit -m "feat: theme + base layout"`

---

### Task 6: Nav + Footer

**Files:** Create `src/components/Nav.astro`, `src/components/Footer.astro`

**Interfaces:** Produces `Nav` (logo + anchor links #features/#showcase/#research/#community + Docs/GitHub) and `Footer` (link columns from `site.links` + `site.footerNote`). No props.

- [ ] **Step 1:** Write `Nav.astro` — sticky header, `<img src="/logo-horizontal.png" alt="OpenJarvis">`, nav anchors, and a `Docs`/`GitHub ★` link from `site.links`. Mobile: collapses to logo + GitHub.
- [ ] **Step 2:** Write `Footer.astro` — columns (Project: GitHub, Docs, Releases; Community: Discord, Paper) from `site.links`, plus `site.footerNote`.
- [ ] **Step 3:** Verify after wiring into index (Task 10) — for now: `npm run build` Complete; `grep -c 'discord.gg/CMVBmDQ5Fj' dist/index.html` ≥ 1 once composed.
- [ ] **Step 4: Commit:** `git add src/components/Nav.astro src/components/Footer.astro && git commit -m "feat: nav + footer"`

---

### Task 7: Hero + Terminal

**Files:** Create `src/components/Terminal.astro`, `src/components/Hero.astro`

**Interfaces:** Produces `Terminal` (renders the validated command block on dark bg + a copy button wired to `copyText` from `src/lib/clipboard`, copying `site.install`) and `Hero` (centered tagline/subhead/CTAs above `Terminal`). Consumed by `index.astro`.

- [ ] **Step 1:** `Terminal.astro` — dark block (`#0b0f14`), traffic-light dots, the validated lines (install → `jarvis init` → `jarvis ask "..."` → local-answer line → `jarvis serve` → localhost line) with accent prompts. A "Copy install" button with an inline `<script>` importing `copyText` and copying `site.install`; on success toggle the label to "Copied!" for 1.5s.
- [ ] **Step 2:** `Hero.astro` — centered: `<h1>` tagline (two lines), subhead, `.btn-primary` "Get Started" (→ `#quickstart`), `.btn-outline` "View on GitHub" (→ `site.links.github`), then `<Terminal/>`, then the footer micro-line.
- [ ] **Step 3:** Verify: `npm run build`; `grep -q 'jarvis serve' dist/index.html` once composed (Task 10) → present.
- [ ] **Step 4: Commit:** `git add src/components/Terminal.astro src/components/Hero.astro && git commit -m "feat: hero + terminal"`

---

### Task 8: Features (Five Primitives)

**Files:** Create `src/components/Section.astro`, `src/components/FeatureCard.astro`, `src/components/Features.astro`

**Interfaces:** `Section` = `{ id, title, kicker? }` + slot (reused by later sections). `FeatureCard` = `{ title, summary }`. `Features` loads the `features` collection (sorted by `order`) into a responsive card grid under `id="features"`.

- [ ] **Step 1:** `Section.astro` — `<section id={id}><div class="container"><p class="kicker">…</p><h2>{title}</h2><slot/></div></section>`.
- [ ] **Step 2:** `FeatureCard.astro` — card with title + summary, subtle border, hover lift, accent top-border.
- [ ] **Step 3:** `Features.astro`:
```astro
---
import { getCollection } from 'astro:content';
import Section from './Section.astro';
import FeatureCard from './FeatureCard.astro';
const items = (await getCollection('features')).sort((a, b) => a.data.order - b.data.order);
---
<Section id="features" title="Five primitives for personal AI" kicker="What's inside">
  <div class="grid">{items.map((f) => <FeatureCard title={f.data.title} summary={f.data.summary} />)}</div>
</Section>
```
- [ ] **Step 4:** Verify: after composition, `npm run build` and `grep -q 'Tools & Memory' dist/index.html` → present (proves all 5 render).
- [ ] **Step 5: Commit:** `git add src/components/Section.astro src/components/FeatureCard.astro src/components/Features.astro && git commit -m "feat: five-primitives section"`

---

### Task 9: Showcase + HowItWorks + Research + Community

**Files:** Create `src/components/ShowcaseGallery.astro`, `src/components/HowItWorks.astro`, `src/components/Research.astro`, `src/components/Community.astro`

**Interfaces:**
- `ShowcaseGallery` loads `showcase` collection → responsive image grid (`<img src={item.data.image} alt={item.data.title}>` + caption) under `id="showcase"`.
- `HowItWorks` (`id="how"`) — the "in the spirit of PyTorch" blurb + `<img src="/architecture.png">`.
- `Research` (`id="research"`) — "Backed by research" + the IPW stat (88.7% local, 5.3× 2023→2025) + buttons to `site.links.paper` and `site.links.ipw`.
- `Community` (`id="community"`) — Discord + GitHub + "Download desktop app" (→ `site.links.releases`) CTAs.

- [ ] **Step 1:** Write `ShowcaseGallery.astro` (mirror `Features.astro`'s collection pattern with `showcase`).
- [ ] **Step 2:** Write `HowItWorks.astro` with the architecture image (responsive, max-width 100%).
- [ ] **Step 3:** Write `Research.astro` and `Community.astro` using `site.links`.
- [ ] **Step 4:** Verify after composition: `npm run build`; `grep -q 'arxiv.org/abs/2605.17172' dist/index.html` and `grep -q 'architecture.png' dist/index.html` → present.
- [ ] **Step 5: Commit:** `git add src/components/ShowcaseGallery.astro src/components/HowItWorks.astro src/components/Research.astro src/components/Community.astro && git commit -m "feat: showcase, how-it-works, research, community"`

---

### Task 10: Compose the page + responsive/dark polish

**Files:** Modify `src/pages/index.astro`; Modify `src/styles/global.css` (responsive + dark refinements)

**Interfaces:** Consumes Base + all components; produces the final single page.

- [ ] **Step 1:** `src/pages/index.astro`:
```astro
---
import Base from '../layouts/Base.astro';
import Nav from '../components/Nav.astro';
import Hero from '../components/Hero.astro';
import Features from '../components/Features.astro';
import ShowcaseGallery from '../components/ShowcaseGallery.astro';
import HowItWorks from '../components/HowItWorks.astro';
import Research from '../components/Research.astro';
import Community from '../components/Community.astro';
import Footer from '../components/Footer.astro';
---
<Base>
  <Nav />
  <main>
    <Hero />
    <Features />
    <ShowcaseGallery />
    <HowItWorks />
    <Research />
    <Community />
  </main>
  <Footer />
</Base>
```
- [ ] **Step 2:** Add responsive breakpoints (grid → 1 col under 720px; nav collapse) and verify dark-mode vars on every section in `global.css`.
- [ ] **Step 3:** Full content verification:
```bash
npm run build
for s in "Personal AI" "jarvis serve" "Tools & Memory" "arxiv.org/abs/2605.17172" "discord.gg/CMVBmDQ5Fj" "architecture.png" "open-jarvis.github.io/OpenJarvis"; do grep -q "$s" dist/index.html && echo "OK: $s" || echo "MISSING: $s"; done
```
Expected: all "OK".
- [ ] **Step 4:** Visual check via the brainstorm companion (push `dist/index.html` or run `npm run dev` and forward the port) — confirm hero matches the approved mockup, responsive + dark look right.
- [ ] **Step 5: Commit:** `git add src/pages/index.astro src/styles/global.css && git commit -m "feat: compose landing page + responsive/dark"`

---

### Task 11: Deploy workflow + README + repo push

**Files:** Create `.github/workflows/deploy.yml`, `README.md`

**Interfaces:** Produces CI that builds + deploys to Pages on push to `main`.

- [ ] **Step 1:** `.github/workflows/deploy.yml`:
```yaml
name: Deploy site
on:
  push: { branches: [main] }
  workflow_dispatch:
permissions: { contents: read, pages: write, id-token: write }
concurrency: { group: pages, cancel-in-progress: true }
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: npm }
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with: { path: dist }
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment: { name: github-pages, url: "${{ steps.deployment.outputs.page_url }}" }
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```
- [ ] **Step 2:** `README.md` — what it is, `npm run dev`/`npm run build`/`npm test`, "edit copy in `src/content/` + `src/config/site.ts`", and the **human Pages steps** (custom domain `openjarvis.stanford.edu` + Enforce HTTPS).
- [ ] **Step 3:** Final local gate: `npm ci && npm run build && npm test` → build Complete, tests PASS.
- [ ] **Step 4: Commit:** `git add .github README.md && git commit -m "ci: Pages deploy workflow + README"`
- [ ] **Step 5: Push** (after Jon creates `open-jarvis/website`):
```bash
git branch -M main
git remote add origin https://github.com/open-jarvis/website.git
git push -u origin main
```
Then watch the `Deploy site` Action → green; Jon completes the Pages custom-domain + HTTPS steps; verify `https://openjarvis.stanford.edu` serves the site and `open-jarvis.github.io/OpenJarvis/` docs are unchanged.

---

## Self-Review

- **Spec coverage:** hero/look (T5–7,10) · five primitives (T8) · showcase (T9) · how-it-works+diagram (T9) · research/paper/IPW (T9) · community/CTA+download (T9) · quickstart/install one-liner (T7) · nav/footer (T6) · Markdown-editable content (T4) · CNAME/domain (T3,T11) · deploy (T11) · docs untouched (isolated repo, no OpenJarvis edits). ✓
- **Placeholders:** logic (clipboard) + config + schema + workflow + CNAME shown verbatim; component bodies described with exact props/IDs/asset paths and the verbatim copy is in T4/Global Constraints (DRY — components read it). Acceptable: presentational markup styling is left to the implementer's CSS within the fixed palette/IDs.
- **Type consistency:** `copyText` signature consistent (T2 ↔ T7); `site` shape (T4) used by Nav/Footer/Hero/Research/Community; collection field names (`order`,`summary`,`image`,`title`) consistent T4 ↔ T8/T9.
