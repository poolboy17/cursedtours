import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Hub page filenames (19 total)
const hubFiles = [
  'austin-ghost-tours.astro',
  'boston-ghost-tours.astro',
  'charleston-ghost-tours.astro',
  'chicago-ghost-tours.astro',
  'denver-ghost-tours.astro',
  'dublin-ghost-tours.astro',
  'edinburgh-ghost-tours.astro',
  'key-west-ghost-tours.astro',
  'london-ghost-tours.astro',
  'nashville-ghost-tours.astro',
  'new-orleans-ghost-tours.astro',
  'new-york-ghost-tours.astro',
  'paris-ghost-tours.astro',
  'rome-ghost-tours.astro',
  'salem-ghost-tours.astro',
  'san-antonio-ghost-tours.astro',
  'savannah-ghost-tours.astro',
  'st-augustine-ghost-tours.astro',
  'washington-dc-ghost-tours.astro'
];

// Map to match slug names
const slugMap = {};
hubFiles.forEach(file => {
  const slug = file.replace('-ghost-tours.astro', '');
  slugMap[slug] = slug;
});

// Extract all internal links from content
function extractInternalLinks(content) {
  const linkPattern = /href=["']\/([^"']+)\/["']/g;
  const links = [];
  let match;
  
  while ((match = linkPattern.exec(content)) !== null) {
    const path = match[1];
    links.push(path);
  }
  
  return links;
}

// Check if a link targets a hub page
function isHubLink(linkPath) {
  return linkPath.includes('-ghost-tours') && !linkPath.includes('/articles/');
}

// Normalize link path to hub slug
function linkToSlug(linkPath) {
  // Extract the ghost tour city slug from paths like "new-orleans-ghost-tours"
  const match = linkPath.match(/([a-z-]+)-ghost-tours/);
  return match ? match[1] : null;
}

// Read all hub pages and extract links
function analyzeHubPages() {
  const hubLinkMatrix = {};
  const inboundLinkCounts = {};
  
  // Initialize tracking
  Object.keys(slugMap).forEach(slug => {
    hubLinkMatrix[slug] = [];
    inboundLinkCounts[slug] = 0;
  });
  
  // Read and analyze each hub page
  hubFiles.forEach(file => {
    const filePath = path.join(projectRoot, 'src', 'pages', file);
    const slug = file.replace('-ghost-tours.astro', '');
    
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const allLinks = extractInternalLinks(content);
      
      // Filter to only hub pages
      const hubLinks = allLinks.filter(link => isHubLink(link));
      
      // Convert to slugs and deduplicate
      const hubSlugs = [...new Set(hubLinks.map(link => linkToSlug(link)).filter(s => s))];
      
      hubLinkMatrix[slug] = hubSlugs;
      
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });
  
  // Count inbound links from other hubs
  Object.entries(hubLinkMatrix).forEach(([source, targets]) => {
    targets.forEach(target => {
      if (inboundLinkCounts.hasOwnProperty(target)) {
        inboundLinkCounts[target]++;
      }
    });
  });
  
  return { hubLinkMatrix, inboundLinkCounts };
}

// Check homepage for hub links
function checkHomepageLinks() {
  const homePath = path.join(projectRoot, 'src', 'pages', 'index.astro');
  const content = fs.readFileSync(homePath, 'utf-8');
  const allLinks = extractInternalLinks(content);
  const hubLinks = allLinks.filter(link => isHubLink(link));
  const hubSlugs = [...new Set(hubLinks.map(link => linkToSlug(link)).filter(s => s))];
  return hubSlugs;
}

// Analyze article internal links (sample of 10)
function analyzeArticles() {
  const articlesDir = path.join(projectRoot, 'src', 'data', 'articles');
  const files = fs.readdirSync(articlesDir).filter(f => f.endsWith('.json'));
  
  // Take first 10 files
  const sampleFiles = files.slice(0, 10);
  
  let totalInternalLinks = 0;
  const articleStats = [];
  
  sampleFiles.forEach(file => {
    const filePath = path.join(articlesDir, file);
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const json = JSON.parse(content);
      
      // Count internal links in content
      const contentText = json.content || '';
      // Match both href and plain links
      const internalLinkPattern = /href=["']\/([^"']+)\/["']/g;
      const matches = contentText.match(internalLinkPattern) || [];
      
      // Filter to actual internal links (no external)
      const internalLinks = matches.filter(m => !m.includes('http'));
      
      totalInternalLinks += internalLinks.length;
      articleStats.push({
        slug: json.slug || file.replace('.json', ''),
        internalLinks: internalLinks.length,
        wordCount: json.wordCount || 0
      });
      
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  });
  
  const avgLinksPerArticle = sampleFiles.length > 0 ? totalInternalLinks / sampleFiles.length : 0;
  
  return {
    sampleSize: sampleFiles.length,
    totalInternalLinks,
    averageLinksPerArticle: avgLinksPerArticle.toFixed(2),
    articleStats
  };
}

// Generate the report
function generateReport() {
  console.log('\n════════════════════════════════════════════════════════════════════');
  console.log('          GHOST TOURS INTERNAL LINKING STRUCTURE ANALYSIS');
  console.log('════════════════════════════════════════════════════════════════════\n');
  
  // Analyze hub pages
  const { hubLinkMatrix, inboundLinkCounts } = analyzeHubPages();
  
  console.log('1. HUB-TO-HUB LINK MATRIX');
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  let totalOutbound = 0;
  Object.entries(hubLinkMatrix).forEach(([source, targets]) => {
    console.log(`${source.padEnd(25)} → ${targets.length} outbound`);
    totalOutbound += targets.length;
    if (targets.length > 0) {
      targets.forEach(target => {
        console.log(`  ├─ ${target}`);
      });
    }
  });
  
  console.log('\n2. INBOUND LINK COUNT (Hub-to-Hub Relationships)');
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  const sortedInbound = Object.entries(inboundLinkCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([hub, count]) => ({ hub, count }));
  
  sortedInbound.forEach(({ hub, count }) => {
    const barLength = count * 2;
    const bar = '█'.repeat(barLength);
    console.log(`${hub.padEnd(25)} ${bar.padEnd(20)} ${count} inbound`);
  });
  
  // Find unlinked hubs
  const unlinkedHubs = sortedInbound.filter(h => h.count === 0);
  
  if (unlinkedHubs.length > 0) {
    console.log('\n3. HUB PAGES WITH ZERO INBOUND LINKS (from other hubs)');
    console.log('─────────────────────────────────────────────────────────────────\n');
    console.log(`${unlinkedHubs.length} hub(s) receive NO inbound links from other hub pages:\n`);
    
    unlinkedHubs.forEach(({ hub }) => {
      console.log(`  ⚠ ${hub}`);
    });
  } else {
    console.log('\n3. HUB PAGES WITH ZERO INBOUND LINKS');
    console.log('─────────────────────────────────────────────────────────────────\n');
    console.log('  All hub pages receive at least one inbound link from other hubs.');
  }
  
  // Most and least linked
  console.log('\n4. HUB PAGES WITH MOST/LEAST CROSS-LINKS');
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  const mostLinked = sortedInbound[0];
  const leastLinkedLinked = sortedInbound.filter(h => h.count > 0);
  const leastLinked = leastLinkedLinked.length > 0 ? leastLinkedLinked[leastLinkedLinked.length - 1] : sortedInbound[sortedInbound.length - 1];
  
  console.log(`Most linked (inbound):`);
  console.log(`  ${mostLinked.hub}: ${mostLinked.count} inbound links\n`);
  
  console.log(`Least linked (inbound):`);
  if (leastLinked.count === 0) {
    console.log(`  All unlinked hubs tied with 0 inbound links\n`);
  } else {
    console.log(`  ${leastLinked.hub}: ${leastLinked.count} inbound link(s)\n`);
  }
  
  // Outbound analysis
  const outboundCounts = Object.entries(hubLinkMatrix).map(([hub, targets]) => ({
    hub,
    count: targets.length
  })).sort((a, b) => b.count - a.count);
  
  console.log(`Most outbound links:`);
  console.log(`  ${outboundCounts[0].hub}: ${outboundCounts[0].count} links → ${hubLinkMatrix[outboundCounts[0].hub].join(', ')}\n`);
  
  console.log(`Least outbound links:`);
  const leastOut = outboundCounts[outboundCounts.length - 1];
  console.log(`  ${leastOut.hub}: ${leastOut.count} links → ${hubLinkMatrix[leastOut.hub].join(', ')}\n`);
  
  // Check homepage
  const homeLinks = checkHomepageLinks();
  console.log('5. HUB PAGES LINKED FROM HOMEPAGE');
  console.log('─────────────────────────────────────────────────────────────────\n');
  console.log(`Total hubs linked from homepage: ${homeLinks.length}\n`);
  homeLinks.forEach(link => {
    console.log(`  ✓ ${link}`);
  });
  
  // Identify hubs NOT on homepage
  const homeSet = new Set(homeLinks);
  const missingFromHome = Object.keys(slugMap).filter(slug => !homeSet.has(slug));
  if (missingFromHome.length > 0) {
    console.log(`\nHubs NOT featured on homepage (${missingFromHome.length}):`);
    missingFromHome.forEach(hub => {
      console.log(`  ✗ ${hub}`);
    });
  }
  
  // Article analysis
  const articleStats = analyzeArticles();
  console.log('\n6. ARTICLE INTERNAL LINKING ANALYSIS (10-article sample)');
  console.log('─────────────────────────────────────────────────────────────────\n');
  console.log(`Sample size: ${articleStats.sampleSize} articles`);
  console.log(`Total internal links in sample: ${articleStats.totalInternalLinks}`);
  console.log(`Average links per article: ${articleStats.averageLinksPerArticle}\n`);
  
  console.log('Individual article stats:');
  articleStats.articleStats.forEach(stat => {
    console.log(`  ${stat.slug.substring(0, 48).padEnd(50)} ${stat.internalLinks} links`);
  });
  
  // Summary statistics
  console.log('\n7. SUMMARY STATISTICS');
  console.log('─────────────────────────────────────────────────────────────────\n');
  
  const avgOutboundPerHub = (totalOutbound / hubFiles.length).toFixed(2);
  const avgInboundPerHub = (totalOutbound / hubFiles.length).toFixed(2);
  
  console.log(`Total hub pages: ${hubFiles.length}`);
  console.log(`Total hub-to-hub links: ${totalOutbound}`);
  console.log(`Average outbound links per hub: ${avgOutboundPerHub}`);
  console.log(`Average inbound links per hub: ${avgInboundPerHub}`);
  console.log(`Hubs linked from homepage: ${homeLinks.length}`);
  console.log(`Hubs NOT on homepage: ${missingFromHome.length}`);
  console.log(`Average article internal links (10-sample): ${articleStats.averageLinksPerArticle}`);
  
  console.log('\n════════════════════════════════════════════════════════════════════\n');
}

// Run analysis
try {
  generateReport();
} catch (error) {
  console.error('Fatal error:', error.message);
  process.exit(1);
}
