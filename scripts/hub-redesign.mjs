/**
 * Hub Page Redesign Migration Script
 * Transforms all 19 city hub pages to match the redesigned homepage style.
 * 
 * Changes:
 * 1. FAQ Section → <details> accordion with animated chevrons
 * 2. CTA Section → Pill-style city links with editorial header
 * 3. Articles Section → Section header upgrade with label + Cinzel heading
 * 4. Remove accent dividers
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const PAGES_DIR = join(process.cwd(), 'src', 'pages');

// Find all hub page files
const hubFiles = readdirSync(PAGES_DIR)
  .filter(f => f.endsWith('-ghost-tours.astro'))
  .map(f => join(PAGES_DIR, f));

console.log(`Found ${hubFiles.length} hub pages to transform.\n`);

let successCount = 0;
let errorCount = 0;

for (const filePath of hubFiles) {
  const filename = filePath.split(/[/\\]/).pop();
  let content = readFileSync(filePath, 'utf-8');
  const originalContent = content;
  let changes = [];

  try {

    // ========================================
    // 1. FAQ Section → <details> accordion
    // ========================================
    // Match the FAQ section wrapper - various bg colors used across pages
    const faqSectionRegex = /(<section\s+class="py-12 md:py-16 bg-\[#(?:0f0a1a|0a0510)\]">\s*\n\s*<div class="container px-4 mx-auto max-w-4xl">\s*\n\s*<h2 class="text-3xl md:text-4xl font-bold text-white mb-8">Frequently Asked Questions<\/h2>\s*\n\s*<div class="space-y-6">\s*\n\s*\{faqs\.map\(\(faq\) => \(\s*\n\s*<div class="bg-\[#(?:1a1025|0f0a1a)\] border border-\[#(?:4a3560|3d2a4d)\] rounded-lg p-6">\s*\n\s*<h3 class="text-lg font-semibold text-white mb-2">\{faq\.question\}<\/h3>\s*\n\s*<p class="text-\[#a89bb8\]">\{faq\.answer\}<\/p>\s*\n?\s*<\/div>\s*\n\s*\)\)\}\s*\n\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>)/;

    const faqReplacement = `<section class="py-16 md:py-24" style="background: linear-gradient(180deg, rgba(15,10,26,0) 0%, rgba(15,10,26,0.6) 50%, rgba(15,10,26,0) 100%);">
    <div class="container px-4 mx-auto max-w-3xl">
      <div class="text-center mb-10">
        <p class="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style="color: #a855f7;">Common Questions</p>
        <h2 class="text-2xl sm:text-3xl font-bold text-white" style="font-family: 'Cinzel', serif;">Frequently Asked Questions</h2>
      </div>
      <div class="space-y-3">
        {faqs.map((faq) => (
          <details class="group rounded-xl" style="border: 1px solid #3d2a4d; background: rgba(26,16,37,0.3);">
            <summary class="flex cursor-pointer items-center justify-between p-5 text-white font-medium text-sm sm:text-base select-none">
              {faq.question}
              <svg class="h-5 w-5 flex-shrink-0 ml-4 transition-transform duration-200 group-open:rotate-180" style="color: #7a6b8a;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
              </svg>
            </summary>
            <div class="px-5 pb-5 text-sm leading-relaxed" style="color: #c8bdd8;">{faq.answer}</div>
          </details>
        ))}
      </div>
    </div>
  </section>`;

    if (faqSectionRegex.test(content)) {
      content = content.replace(faqSectionRegex, faqReplacement);
      changes.push('FAQ → details accordion');
    } else {
      console.log(`  ⚠ FAQ regex didn't match in ${filename}`);
    }


    // ========================================
    // 2. CTA Section → Pill-style city links
    // ========================================
    // Extract existing city links from the CTA section, then rebuild with pill style
    const ctaRegex = /<section\s+class="py-12 md:py-16 bg-\[#(?:0a0510|0f0a1a)\] border-t border-\[#3d2a4d\]">\s*\n\s*<div class="container px-4 mx-auto max-w-4xl text-center">\s*\n\s*<h2 class="text-2xl md:text-3xl font-bold text-white mb-4">Explore More Haunted Cities<\/h2>\s*\n\s*<p class="text-\[#a89bb8\] mb-6">([^<]*)<\/p>\s*\n\s*<div class="flex flex-wrap justify-center gap-4">\s*\n([\s\S]*?)\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<\/section>/;

    const ctaMatch = content.match(ctaRegex);
    if (ctaMatch) {
      // Extract all <a> tags from the CTA
      const linksHtml = ctaMatch[2];
      const linkRegex = /<a\s+href="([^"]+)"[^>]*>([^<]+)<\/a>/g;
      const links = [];
      let linkMatch;
      while ((linkMatch = linkRegex.exec(linksHtml)) !== null) {
        links.push({ href: linkMatch[1], text: linkMatch[2] });
      }

      // Build pill-style links
      const pillLinks = links.map(l =>
        `        <a href="${l.href}" class="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105" style="border: 1px solid #3d2a4d; background: rgba(26,16,37,0.3); color: #c8bdd8;" onmouseenter="this.style.borderColor='#a855f7';this.style.color='#fff'" onmouseleave="this.style.borderColor='#3d2a4d';this.style.color='#c8bdd8'">${l.text}<svg class="w-3.5 h-3.5" style="color:#7a6b8a;" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg></a>`
      ).join('\n');

      const ctaReplacement = `<section class="py-16 md:py-24">
    <div class="container px-4 mx-auto max-w-4xl text-center">
      <p class="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style="color: #a855f7;">Keep Exploring</p>
      <h2 class="text-2xl sm:text-3xl font-bold text-white mb-4" style="font-family: 'Cinzel', serif;">More Haunted Cities</h2>
      <p class="text-base mb-8" style="color: #7a6b8a;">Discover ghost tours in other historic cities.</p>
      <div class="flex flex-wrap justify-center gap-2">
${pillLinks}
      </div>
    </div>
  </section>`;

      content = content.replace(ctaRegex, ctaReplacement);
      changes.push('CTA → pill-style links');
    } else {
      console.log(`  ⚠ CTA regex didn't match in ${filename}`);
    }


    // ========================================
    // 3. Articles Section → Header upgrade
    // ========================================
    // Match: <h2 class="text-3xl md:text-4xl font-bold text-white mb-3">Explore CITY Articles</h2>
    //        <p class="text-[#a89bb8] mb-8">DESCRIPTION</p>
    const articlesHeaderRegex = /(<section\s+class="py-16 md:py-20 bg-\[#0a0510\]">\s*\n\s*<div class="container px-4 mx-auto max-w-6xl">\s*\n)\s*<h2 class="text-3xl md:text-4xl font-bold text-white mb-3">([^<]+)<\/h2>\s*\n\s*<p class="text-\[#a89bb8\] mb-8">([^<]+)<\/p>/;

    const articlesMatch = content.match(articlesHeaderRegex);
    if (articlesMatch) {
      const sectionOpen = articlesMatch[1];
      const heading = articlesMatch[2];
      const desc = articlesMatch[3];

      const newArticlesHeader = `${sectionOpen}      <div class="text-center mb-10">
        <p class="text-xs font-semibold tracking-[0.2em] uppercase mb-3" style="color: #a855f7;">Related Reading</p>
        <h2 class="text-2xl sm:text-3xl font-bold text-white mb-3" style="font-family: 'Cinzel', serif;">${heading}</h2>
        <p class="text-base" style="color: #7a6b8a;">${desc}</p>
      </div>`;

      content = content.replace(articlesHeaderRegex, newArticlesHeader);
      changes.push('Articles → editorial header');
    } else {
      console.log(`  ⚠ Articles header regex didn't match in ${filename}`);
    }


    // ========================================
    // 4. Remove accent dividers
    // ========================================
    const dividerRegex = /\s*<!--\s*Accent Divider\s*-->\s*\n\s*<div class="bg-\[#(?:0f0a1a|0a0510)\]"><div class="max-w-4xl mx-auto px-4"><div class="h-px bg-gradient-to-r from-transparent via-purple-500\/40 to-transparent"><\/div><\/div><\/div>\s*\n?/g;

    const dividerCount = (content.match(dividerRegex) || []).length;
    if (dividerCount > 0) {
      content = content.replace(dividerRegex, '\n');
      changes.push(`Removed ${dividerCount} accent divider(s)`);
    }

    // Also catch dividers without the comment
    const dividerRegex2 = /\s*<div class="bg-\[#(?:0f0a1a|0a0510)\]"><div class="max-w-4xl mx-auto px-4"><div class="h-px bg-gradient-to-r from-transparent via-purple-500\/40 to-transparent"><\/div><\/div><\/div>\s*\n?/g;

    const dividerCount2 = (content.match(dividerRegex2) || []).length;
    if (dividerCount2 > 0) {
      content = content.replace(dividerRegex2, '\n');
      changes.push(`Removed ${dividerCount2} additional divider(s)`);
    }

    // ========================================
    // Write back if changed
    // ========================================
    if (content !== originalContent) {
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ ${filename}: ${changes.join(', ')}`);
      successCount++;
    } else {
      console.log(`- ${filename}: No changes needed`);
    }

  } catch (err) {
    console.log(`✗ ${filename}: ERROR - ${err.message}`);
    errorCount++;
  }
}

console.log(`\n========================================`);
console.log(`Done! ${successCount} files transformed, ${errorCount} errors.`);
console.log(`========================================`);
