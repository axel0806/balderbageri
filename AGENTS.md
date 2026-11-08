# AGENTS.md

Guidance for AI coding agents working in this repository.

## Project overview

Single-page website for **Balder Bageri UF**, a Swedish student-run company (UF-företag)
in Skellefteå that bakes cookies at home and delivers them. Live at
https://balderbageri.sigmaaxel.se (hosted on Vercel). Goal: rank first in search for "Balder Bageri".

It is a plain static site: **no framework, no bundler, no package manager, no build step.**
Keep it that way unless the maintainer explicitly asks otherwise.

## Repository layout

```
assets/            # Logos, Instagram QR; legacy-assets/ = old IT site (unused)
index.html         # All markup, meta tags and JSON-LD
style.css          # All styling (design tokens as CSS custom properties)
script.js          # Mobile nav toggle only
robots.txt, sitemap.xml, site.webmanifest, favicon.svg, icon-*.png, og-image.png
vercel.json        # Redirects the old bitk-kappa.vercel.app host to the live domain
googleeb98a78338a1963e.html  # Google Search Console verification, keep
README.md
LICENSE.md
```

## Running locally

```bash
py -m http.server 8000   # python3 on macOS/Linux; then visit http://localhost:8000
```

There are no tests, linters or formatters. Verify changes manually in a browser (see "Before you finish").

## Deployment

Pushing to `main` deploys via Vercel. Treat `main` as production: don't commit half-finished work to it.

## Working principles

- **Think before coding.** State assumptions, ask when something is unclear.
- **Keep it simple.** Plain HTML, CSS and a few lines of vanilla JS.
- **Make surgical changes.** Touch only what the request needs and match the existing style.
- **Verify in the browser.** Define the check before editing, for example "nav link scrolls to `#lador` at 375px", and confirm it afterwards.

## Conventions

### Language and content
- The site is in **Swedish** (`<html lang="sv">`). All user-facing copy must be Swedish. Code comments and commit messages may be in English.
- Section anchors: `#top`, `#lador`, `#sorter`, `#bestall`, `#om-oss`, `#vanliga-fragor`, `#kontakt`. Don't rename them without updating nav links, CSS and JS together.
- Don't change factual claims (prices, delivery days and areas, phone/Swish number, Instagram handle, founders, the footer note "ej ett registrerat aktiebolag") unless the user explicitly provides the new values. The flyers in `../inspiration/` (outside the repo) are the source for the current ones.
- Keep the brand name spelled exactly "Balder Bageri" in title, h1, logo alt text, JSON-LD and footer.

### HTML
- Semantic elements; one `h1` only. Keep `aria-label`/`aria-expanded` on the nav toggle and `rel="noopener"` on external `target="_blank"` links.
- Images need `alt`, `width` and `height`; use `loading="lazy"` below the fold.

### CSS
- Colours, fonts and sizes live in CSS custom properties in `style.css`; reuse them.
- Palette: wine `#522834`, deep wine `#3F1C27`, beige `#E3E2DC`, cream `#F5EFE3`, gold `#E1A43A`.
- Fonts: Fraunces (headings, prices) and Instrument Sans (body), from Google Fonts.
- Mobile-first; check 375px, 768px and 1280px.

### JavaScript
- Vanilla ES6+ only. `script.js` relies on the ids `navToggle` and `navLinks`.

### SEO
- Keep title, meta description, canonical, Open Graph tags and the `Bakery` JSON-LD consistent with the visible page. When prices, areas or contact details change, update the page, the JSON-LD and `lastmod` in `sitemap.xml` together.
- Don't publish a street address (home bakery).

## Boundaries

- Don't add dependencies, build tooling, or a framework without asking first.
- Don't add analytics, cookies or trackers (GDPR). The one exception is Vercel Web Analytics (the `/_vercel/insights/script.js` tag at the end of `index.html`), which is cookie-free. Ad links use `?utm_source=…` so it can attribute visits.
- Never commit secrets or API keys.
- Don't reference anything in `assets/legacy-assets/`.

## Before you finish

1. Open the page and check there are no console errors.
2. Check the nav links scroll to the right sections, on desktop and mobile widths.
3. Check the mobile menu opens and closes.
4. Check new Swedish copy for spelling (å, ä, ö) and a friendly, plain tone.
5. If you touched SEO data, re-check the JSON-LD and meta tags in the page source.
