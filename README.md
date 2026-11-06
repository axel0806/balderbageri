# Balder Bageri UF

Website for **Balder Bageri UF**, a student-run company (UF-företag) in Skellefteå, Sweden. We bake cookies at home and deliver them the same day.

**Live site:** https://balderbageri.sigmaaxel.se

## About the company

Balder Bageri UF is run by Milian Tamminen and Axel Furtenbach within Ung Företagsamhet. Customers order by Instagram DM, pay with Swish in advance and get free home delivery to Centrum and Anderstorp (Wed, Fri or Sat, 16–19).

- Small box (Liten låda): 6 cookies, 79 kr
- Large box (Stor låda): 12 cookies, up to 3 kinds, 149 kr
- Kinds: Chocolate chip cookies, Kolakakor, Havrekakor, Hallongrottor, plus Kladdkakecookies for Christmas and Valentine's Day

## About this repository

A plain static one-page site with no framework, bundler or package manager. The design follows the company's printed flyers (`assets/inspiration/`).

```
index.html        # Page markup, meta tags and JSON-LD structured data
style.css         # All styling (design tokens as CSS custom properties)
script.js         # Mobile navigation toggle
robots.txt        # Crawler rules and sitemap pointer
sitemap.xml       # Single-page sitemap (update lastmod when content changes)
site.webmanifest  # Web app metadata
favicon.svg, icon-*.png, apple-touch-icon.png, og-image.png
assets/           # Logos and Instagram QR code
```

`assets/legacy-assets/` holds files from the previous IT-consultancy site and is not used.

The site is written in Swedish. Fonts (Fraunces and Instrument Sans) are loaded from Google Fonts. Brand colours: wine `#522834`, deep wine `#3F1C27`, beige `#E3E2DC`, plus cream `#F5EFE3` and gold `#E1A43A` from the flyers.

## Running locally

No installation is needed. Serve the folder with any static server:

```bash
py -m http.server 8000   # or python3 on macOS/Linux
```

Then visit http://localhost:8000.

## SEO

The page has a unique title and description, a canonical URL, Open Graph tags, and `Bakery` JSON-LD (no street address, since the bakery is run from home). When content, prices or delivery areas change, update the page text, the JSON-LD in `index.html` and `lastmod` in `sitemap.xml` together.

## Deployment

The site is hosted on [Vercel](https://vercel.com). Changes pushed to `main` are deployed automatically, so do development on a branch.

## Working with AI coding agents

Project conventions for AI assistants are documented in [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md).

## Contact

- Instagram: [@balderbageri](https://www.instagram.com/balderbageri)
- Phone and Swish: 070-221 16 96

## Legal

Balder Bageri UF is run by students and is not a registered limited company (aktiebolag). © 2026 Balder Bageri UF.
