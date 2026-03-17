/**
 * Page discovery — find built HTML pages in dist/ by pattern.
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

export function discoverPages(distDir, pattern, excludeDirs = [], opts = {}) {
  if (!existsSync(distDir)) {
    console.error('\x1b[31m✗ dist/ not found. Run `npm run build` first.\x1b[0m');
    process.exit(1);
  }

  const excludeSet = new Set(excludeDirs);

  if (!opts.recursive) {
    return readdirSync(distDir, { withFileTypes: true })
      .filter((d) => d.isDirectory() && pattern.test(d.name) && !excludeSet.has(d.name))
      .map((d) => ({ name: d.name, path: join(distDir, d.name, 'index.html') }))
      .filter((p) => existsSync(p.path))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  const results = [];
  function walk(dir, prefix) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory() || excludeSet.has(entry.name)) {
        continue;
      }
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      const full = join(dir, entry.name);
      const indexPath = join(full, 'index.html');
      if (existsSync(indexPath) && pattern.test(rel)) {
        results.push({ name: rel, path: indexPath });
      }
      walk(full, rel);
    }
  }

  walk(distDir, '');
  return results.sort((a, b) => a.name.localeCompare(b.name));
}
