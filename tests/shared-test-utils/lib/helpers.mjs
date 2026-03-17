/**
 * HTML parsing helpers — regex-based, zero dependencies.
 * Works on minified single-line Astro build output.
 */

export function allMatches(html, regex) {
  const matches = [];
  let m;
  const flags = regex.flags.includes('g') ? regex.flags : regex.flags + 'g';
  const r = new RegExp(regex.source, flags);
  while ((m = r.exec(html)) !== null) {
    matches.push(m);
  }
  return matches;
}

export function countMatches(html, pattern) {
  if (typeof pattern === 'string') {
    let count = 0;
    let idx = -1;
    while ((idx = html.indexOf(pattern, idx + 1)) !== -1) {
      count++;
    }
    return count;
  }
  return (html.match(pattern) || []).length;
}

export function extractIds(html) {
  return allMatches(html, /\bid="([^"]+)"/g).map((m) => m[1]);
}

export function extractSectionIds(html) {
  return allMatches(html, /<section[^>]+id="([^"]+)"/g).map((m) => m[1]);
}

export function extractAnchors(html, pillClasses = ['rounded-full']) {
  const results = [];
  for (const cls of pillClasses) {
    const pattern = new RegExp(
      `<a[^>]+href="#([^"]+)"[^>]*class="[^"]*${cls.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`,
      'g'
    );
    const matches = allMatches(html, pattern);
    for (const m of matches) {
      results.push(m[1]);
    }
  }
  return results;
}

export function findHeadings(html) {
  return allMatches(html, /<(h[1-6])[^>]*>([^<]*)</g).map((m) => ({
    level: parseInt(m[1][1]),
    text: m[2].trim(),
  }));
}

export function getHeadContent(html) {
  const m = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
  return m ? m[1] : '';
}
