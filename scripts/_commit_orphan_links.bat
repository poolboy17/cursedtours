@echo off
cd /d D:\headless\cursedtours-astro
git add src/data/articles/ scripts/fix-orphan-links.mjs
git commit -m "Add 48 reciprocal links for orphaned articles via Continue Reading sections"
git push origin main
