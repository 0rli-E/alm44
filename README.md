# alm44

A small editorial website for **alm44** — a renovated cabin in
Außerteuchen, Carinthia. Built with [Astro](https://astro.build).

Tone: editorial, German-first, restraint over volume. Inspired by
[theplacetobe.world](https://theplacetobe.world) — moody photography,
asymmetric scenes, soft palette pulled from the printed alm44 flyer.

---

## Run it

Requires Node.js 20+.

```bash
npm install
npm run dev    # http://localhost:4321
```

Build & preview:

```bash
npm run build
npm run preview
```

---

## Structure

```
src/
├── components/
│   ├── Nav.astro         Top-right burger + fullscreen overlay
│   ├── Footer.astro      Minimal footer
│   └── Scene.astro       Reusable image+prose editorial block
├── layouts/
│   └── Base.astro        HTML shell, meta, fonts, scroll-reveal
├── pages/
│   ├── index.astro       Hütte (home)
│   ├── umgebung.astro    Surroundings
│   ├── buchung.astro     Pricing + booking + Anfrage form
│   ├── kontakt.astro     Contact + standort
│   ├── impressum.astro   Verbatim from falkertsee13.at/impressum
│   └── datenschutz.astro Draft Datenschutzerklärung
└── styles/
    └── global.css        Palette, type, layout helpers
public/
├── images/               Curated photos (~22 selected from 71)
└── favicon.svg
```

The full set of source photos lives in `Alm44/` (gitignored — kept on
disk only). Selected photos are copied into `public/images/` with
semantic names (e.g. `hero-home.jpg`, `wohnen-kachelofen.jpg`).

---

## What still needs your input

These are marked as `TODO` in the code where they apply.

- **Smoobu booking widget** — `src/pages/buchung.astro` has a
  placeholder block with the standard Smoobu embed snippet commented
  in. Drop in the actual `SMOOBU_PROPERTY_ID` once the Smoobu apartment
  is set up. Until then the Anfrage form below it is the fallback — it
  POSTs to `/api/contact` and sends mail via Resend (see Deploying).
- **Domain** — `alm44.at` is set in `astro.config.mjs` but not yet
  attached to the Cloudflare Pages project. See Deploying → Domain.
- **Photo selection** — `public/images/` is a first pass. Swap any
  filename with another from `Alm44/` to change the photo for that
  slot. File names are semantic (e.g. `kueche.jpg`, `bad.jpg`) so
  there's no other code to change.
- **Photo optimisation** — current files are iPhone originals (3–8 MB
  each). For production, run them through Sharp or ImageOptim before
  deploy, or migrate to Astro's `<Image>` component (imports from
  `src/assets/` instead of `public/`).
- **Datenschutz** — `src/pages/datenschutz.astro` is a draft. Adjust
  to the final host and any embedded services before publishing.
- **English version** — currently DE only. To add EN, create
  `src/pages/en/` with translated copies, plus a small language switch
  in `Nav.astro`.

---

## Editing the site

### Change copy

All German prose lives directly inside the page files
(`src/pages/*.astro`). Open the file, edit between the tags. Save.
The dev server reloads instantly.

### Add or change a scene

Use the existing `<Scene>` component:

```astro
<Scene
  src="/images/your-photo.jpg"
  alt="Beschreibung des Bilds"
  eyebrow="Kurzes Label"
  scriptLine="optional"
  title="der Hauptsatz."
  caption="optionale Bildunterschrift"
  reverse
>
  <p>Erster Absatz.</p>
  <p>Zweiter Absatz.</p>
</Scene>
```

`reverse` flips image to the right. Drop it for image-left.

### Tune the design

All design tokens (colors, type, spacing) live as CSS variables at the
top of `src/styles/global.css`. Change the values, the whole site
follows.

---

## Deploying

**The site runs on Cloudflare Pages.** It is live at
`https://alm44.pages.dev`. Deploys happen automatically: push to
`main` on GitHub, Cloudflare builds and publishes.

The site is *almost* static, with one exception that determines the
host: `functions/api/contact.js` is a **Cloudflare Pages Function**
that handles the Anfrage form. Plain static hosting (an FTP upload of
`dist/` to All-inkl, a Netlify drag-and-drop, Vercel) would serve the
pages fine but **silently break the contact form** — the POST to
`/api/contact` would 404. Do not move the site off Cloudflare Pages
without replacing that endpoint first.

### Required Cloudflare setting

The Function needs one environment variable in the Pages project
(Settings → Environment variables, Production):

- `RESEND_API_KEY` — from resend.com/api-keys

Optional: `MAIL_TO` (default `alm44@gmx.at`), `MAIL_FROM`.

Without `RESEND_API_KEY` the form responds with a 503 and a message
asking the visitor to mail directly. **Send a test enquiry after any
deploy that touches the form.**

### Domain

`alm44.at` is live and attached to the Pages project. `site:` in
`astro.config.mjs` is set to `https://alm44.at` to match, so canonical
tags, `og:url`, `og:image` and `sitemap-index.xml` all point at the real
domain.

Before this was set, the site served on `alm44.at` while declaring
`https://alm44.pages.dev/` as its canonical URL — telling search engines
the authoritative copy lived on the preview domain, and making shared
link previews resolve to pages.dev. If you ever change the domain, change
`site:` in the same commit.

---

## Source material

- **Flyer** (`Alm44/Infos alm44.pdf`) — primary source for property
  details, palette, and tone.
- **Photos** (`Alm44/IMG_*.jpg`) — 71 originals, of which ~22 are
  curated into the build.
- **Impressum** — taken verbatim from
  [falkertsee13.at/impressum](https://falkertsee13.at/impressum/).

---

Built with care. If something feels off, change it — this is a tiny
codebase by design.
