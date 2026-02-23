@echo off
cd /d D:\headless\cursedtours-astro
git add src/data/articles/ scripts/inject-crosslinks.mjs
git commit -m "Add 36 contextual cross-links between related articles"
git push origin main
