/**
 * Test result tracking and colored terminal reporting.
 */

export function createResults() {
  let totalPass = 0;
  let totalWarn = 0;
  let totalFail = 0;
  const entries = [];

  return {
    pass(page, check, detail = '') {
      totalPass++;
      entries.push({ status: 'PASS', page, check, detail });
    },
    warn(page, check, detail = '') {
      totalWarn++;
      entries.push({ status: 'WARN', page, check, detail });
    },
    fail(page, check, detail = '') {
      totalFail++;
      entries.push({ status: 'FAIL', page, check, detail });
    },
    get entries() {
      return entries;
    },
    get totals() {
      return { pass: totalPass, warn: totalWarn, fail: totalFail };
    },
  };
}

export function printReport(siteName, results) {
  const { entries } = results;
  const { pass, warn, fail } = results.totals;

  console.log('\n\x1b[1m══════════════════════════════════════════════════════════════\x1b[0m');
  console.log(`\x1b[1m           ${siteName.toUpperCase()} AUDIT REPORT\x1b[0m`);
  console.log('\x1b[1m══════════════════════════════════════════════════════════════\x1b[0m\n');

  const pages = {};
  for (const r of entries) {
    if (!pages[r.page]) {
      pages[r.page] = [];
    }
    pages[r.page].push(r);
  }

  for (const [page, checks] of Object.entries(pages)) {
    const fails = checks.filter((c) => c.status === 'FAIL');
    const warns = checks.filter((c) => c.status === 'WARN');
    const passes = checks.filter((c) => c.status === 'PASS');

    const icon = fails.length > 0
      ? '\x1b[31m✗\x1b[0m'
      : warns.length > 0
        ? '\x1b[33m!\x1b[0m'
        : '\x1b[32m✓\x1b[0m';

    console.log(`${icon} \x1b[1m${page}\x1b[0m  (${passes.length}P ${warns.length}W ${fails.length}F)`);

    for (const r of fails) {
      console.log(`    \x1b[31mFAIL ${r.check}\x1b[0m: ${r.detail}`);
    }
    for (const r of warns) {
      console.log(`    \x1b[33mWARN ${r.check}\x1b[0m: ${r.detail}`);
    }
  }

  console.log('\n\x1b[1m──────────────────────────────────────────────────────────────\x1b[0m');
  console.log(`  \x1b[32m${pass} passed\x1b[0m  \x1b[33m${warn} warnings\x1b[0m  \x1b[31m${fail} failures\x1b[0m`);
  console.log('\x1b[1m══════════════════════════════════════════════════════════════\x1b[0m\n');
}

export function getExitCode(results) {
  return results.totals.fail > 0 ? 1 : 0;
}
