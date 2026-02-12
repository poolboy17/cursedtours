# CursedTours.com

Ghost tour discovery platform built with Astro. Static site, zero runtime dependencies.

## Stack

- **Framework**: Astro 4
- **Styling**: Tailwind CSS
- **Hosting**: Netlify
- **Content**: Static JSON + Astro pages

## Pages (92 total)

- 18 city hub pages (US + international)
- 51 articles (Salem, New Orleans, Dracula, Tour Planning)
- 7 destination pages
- 6 experience pages
- 4 category pages
- 3 utility pages (about, contact, editorial policy)
- Homepage, sitemap, robots.txt

## Development

```bash
npm install
npm run dev      # localhost:4321
npm run build    # static build → dist/
```

## Quality Control

```bash
npm run build && python3 audit.py           # summary
npm run build && python3 audit.py --verbose  # full details
```

## Deployment

Push to `main` → Netlify auto-deploys.

Build settings:
- Build command: `npm run build`
- Publish directory: `dist`
- Node.js: 20

## URL

https://cursedtours.com
