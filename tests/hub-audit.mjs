/**
 * CursedTours Hub Page Audit
 * Uses shared-test-utils for all checks.
 * Run: npm run test:hubs (requires dist/ to exist)
 */

import { readFileSync } from 'fs';
import { dirname, resolve } from 'path';
import { fileURLToPath } from 'url';
import { discoverPages, createRunner, createResults, printReport, getExitCode } from 'shared-test-utils';
import config from './site.config.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', config.distDir);
const pages = discoverPages(distDir, config.pagePattern);
const run = createRunner(config);
const results = createResults();

console.log(`\n  ${config.siteName} Hub Audit — scanning dist/ ...\n`);
console.log(`  Found ${pages.length} hub pages\n`);

if (pages.length === 0) {
  console.error('\x1b[31mNo hub pages found in dist/.\x1b[0m');
  process.exit(1);
}

for (const { name, path } of pages) {
  const html = readFileSync(path, 'utf-8');
  run(html, name, results);
}

printReport(config.siteName, results);
process.exit(getExitCode(results));
