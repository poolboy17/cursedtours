@echo off
cd /d D:\headless\cursedtours-astro
git add src/pages/*-ghost-tours.astro
git commit -m "Redesign 19 hub pages to match homepage editorial style - FAQ sections: static divs to details accordion with animated chevrons - CTA sections: block buttons to pill-style links with editorial headers - Articles sections: plain h2 to labeled Cinzel serif headers - Removed accent dividers in favor of clean section spacing"
git push origin main
echo Done!
pause
