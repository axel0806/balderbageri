# Balder IT Konsult UF

Website for **Balder IT Konsult UF**, a student-run company (UF-företag) from Skellefteå, Sweden. We help local businesses with web development, IT support and digitalisation.

**Live site:** https://balderbageri.sigmaaxel.se

> *Klarhet i det digitala mörkret.* ("Clarity in the digital darkness.")

## About the company

Balder IT Konsult UF was started in 2026 by a group of upper-secondary students in Skellefteå. The name comes from the Norse god Balder, known for wisdom and light. As a UF company we run a real business during the school year: we quote, deliver and invoice like any consultancy, just on a smaller scale.

**Services**

- **Web development:** websites and simple web shops that are fast, clear and easy to update
- **IT support & advice:** troubleshooting, cloud services and training
- **Digitalisation:** mapping manual routines and suggesting simple tools that save time

## About this repository

This repo contains the company's one-page website. It is a plain static site with no framework, bundler or package manager.

```
index.html   # Page markup (hero, about, services, process, contact)
style.css    # Styling
script.js    # Mobile navigation and contact form behaviour
```

The site is written in Swedish. Fonts (Space Grotesk and Inter) are loaded from Google Fonts.

## Running locally

No installation is needed. Clone the repo and open `index.html` in your browser, or serve it with any static server:

```bash
git clone https://github.com/axel0806/bitk.git
cd bitk
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Contact form

The contact form sends submissions through [Formspree](https://formspree.io). If you fork this project, replace the form's `action` URL in `index.html` with your own Formspree endpoint, otherwise messages will go to us.

## Deployment

The site is hosted on [Vercel](https://vercel.com). Changes pushed to `main` are deployed automatically.

## Working with AI coding agents

Project conventions for AI assistants are documented in [`AGENTS.md`](AGENTS.md) and [`CLAUDE.md`](CLAUDE.md).

## Contact

- Email: balderitkonsult@protonmail.com
- Phone: 070-221 16 96
- Instagram: [@balderitkonsult](https://www.instagram.com/balderitkonsult)

## Legal

Balder IT Konsult UF is run by students and is not a registered limited company (aktiebolag). © 2026 Balder IT Konsult UF.
