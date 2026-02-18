@echo off
cd /d D:\headless\cursedtours-astro
node scripts\internal-linking-audit.mjs --dry-run >> scripts\linking-audit.log 2>&1
echo Audit completed at %date% %time% >> scripts\linking-audit.log