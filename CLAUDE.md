# CLAUDE.md

@AGENTS.md

## Claude Code notes

The shared project instructions are in `AGENTS.md` (imported above). Everything
below is specific to Claude Code.

- This is a tiny static site, so read `index.html`, `style.css` and `script.js`
  in full before making changes. They are small enough to fit comfortably in context.
- Make edits with targeted replacements rather than rewriting whole files, to keep
  diffs small and reviewable.
- When a change touches an id, class or anchor, search all three files
  (`grep -n "name" index.html style.css script.js`) and update every reference.
- For visual changes, serve the site (`python3 -m http.server 8000`) and describe
  what you expect to see; ask the user to confirm in the browser if you can't check yourself.
- Ask before: adding dependencies or tooling, editing contact details, prices or legal wording, or renaming section anchors.
- Write user-facing copy in Swedish. Reply to the user in whatever language they use.

## Commands

- No build, lint or test tooling. There is nothing to install.
- Serve locally with `python3 -m http.server 8000`, then open http://localhost:8000.
  On Windows, use `py -m http.server 8000` if `python3` isn't found.
- Manual checks are listed under "Before you finish" in `AGENTS.md`.

## Deployment

- Pushing to `main` deploys to production on Vercel. Make changes on a branch and only push finished work to `main`.

## How the pieces connect

- `index.html` is the only page. Sections are anchored by id (`#lador`, `#sorter`, `#bestall`, `#om-oss`, `#vanliga-fragor`, `#kontakt`, `#top`), and the header nav links point at them.
- `script.js` only handles the mobile menu and finds elements by id (`navToggle`, `navLinks`). Renaming one in `index.html` breaks it without an error.
- SEO data (title, description, canonical, Open Graph, `Bakery` JSON-LD) lives in the `<head>` of `index.html`; `robots.txt` and `sitemap.xml` sit in the repo root. Keep them consistent with the visible page text.
- There is no contact form: customers order by Instagram DM or SMS (no phone calls) and pay with Swish.

## Business documents

- These Claude artifacts belong to the business (links and descriptions are in the README):
  - Affärsplan – Balder Bageri UF (Claude Docs document): https://claude.ai/artifact/BXozTzDyttkhK3qZS3mjPZ
  - Balder Bageri Flyer A7 (design canvas, source of `../inspiration/Balder Bageri Flyer A7.html`): https://claude.ai/artifact/KnijXfmihD9SqDmF1fL5of
  - Fredagsfika – bordsskylt (design canvas for the in-person table sign; its section was removed from the site): https://claude.ai/artifact/NYqCwYVpbZG8BcBEX2Y9uK
- Read them with the Artifact tool's `read` action, not a web fetch. When site facts change, tell the user which of these may need the same update; don't edit them unless asked.
- Exported copies and other business files live outside the repo in `../docs`: the business plan (`Affärsplan – Balder Bageri UF.docx`), budget and bookkeeping (`.xlsx`), and the box and ingredient label sheets (`Balder_Bageri_*_Avery_L7651.docx`). The README lists them.
- They describe the same business as the site. When prices, sorts, delivery details or contact details change on the site, tell the user which of these documents may need the same update. Don't edit them unless asked.
- The ingredient labels are the source for allergen information. Don't put allergen claims on the site that the labels don't support.
- Never copy figures from the budget or bookkeeping onto the site or into the repo: the repo is public on GitHub.
