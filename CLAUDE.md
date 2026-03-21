# cursedtours.com

Ghost tours affiliate site (Viator/GetYourGuide + AdSense). Astro static, Netlify deploy. GSC: `sc-domain:cursedtours.com`

## Quick Reference

- **Build:** `npm run build` (outputs to `dist/`)
- **Deploy:** `node D:\dev\dc-run.cjs deploy D:\dev\projects\cursedtours d6fd8307-58ec-433f-9580-48f580b1feb8`
- **Status doc:** @SITE-STATUS.md — load this first for full site context
- **Article config:** @docs/ARTICLE-WRITER-CONFIG.md

## Architecture

- City hub pages: `src/pages/{city}-ghost-tours.astro` (19 cities)
- Articles: `src/data/articles/{slug}.json` → `src/pages/articles/[slug].astro`
- Tour data: `src/data/cityTours.ts`
- Key components: TourSidebar.astro, MobileTourCards.astro, CdnImage.astro

## Gotchas

- `trailingSlash: 'always'` in astro.config.mjs — do not remove
- `site` config must point to `https://cursedtours.com` not the .netlify.app URL
- Pre-commit eslint hook may fail — use `--no-verify` (handled by dc-run.cjs git-commit)
- Edge functions: do NOT put .d.ts files in `netlify/edge-functions/`
