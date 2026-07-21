// Bundle-size budget: fails the build when the eager first-load JS or the
// service-worker precache grows past the checked-in limits, so size
// regressions surface in CI instead of in production. Run after
// `npm run build`; adjust the budgets deliberately when a growth is
// intentional.
import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const ROOT = resolve(fileURLToPath(import.meta.url), '..', '..');
const DIST = resolve(ROOT, 'dist');

// Current values (2026-07): eager ~332KB gzip, precache ~1950KB raw.
// Budgets leave ~10% headroom for organic growth.
const EAGER_JS_GZIP_BUDGET_KB = 370;
const PRECACHE_BUDGET_KB = 2200;

const html = readFileSync(resolve(DIST, 'index.html'), 'utf8');
const eagerFiles = [
  ...new Set(
    [...html.matchAll(/assets\/[\w-]+\.js/g)].map((match) => match[0]),
  ),
];
let eagerGzipBytes = 0;
for (const file of eagerFiles) {
  eagerGzipBytes += gzipSync(readFileSync(resolve(DIST, file))).length;
}

const sw = readFileSync(resolve(DIST, 'sw.js'), 'utf8');
const precacheFiles = [
  ...new Set([...sw.matchAll(/url:"([^"]+)"/g)].map((match) => match[1])),
];
let precacheBytes = 0;
for (const file of precacheFiles) {
  precacheBytes += statSync(resolve(DIST, file)).size;
}

const eagerKb = eagerGzipBytes / 1024;
const precacheKb = precacheBytes / 1024;
console.log(
  `eager first-load JS: ${eagerKb.toFixed(0)} KB gzip (budget ${EAGER_JS_GZIP_BUDGET_KB} KB, ${eagerFiles.length} files)`,
);
console.log(
  `SW precache: ${precacheKb.toFixed(0)} KB raw (budget ${PRECACHE_BUDGET_KB} KB, ${precacheFiles.length} entries)`,
);

let failed = false;
if (eagerKb > EAGER_JS_GZIP_BUDGET_KB) {
  console.error(
    `FAIL: eager JS exceeds budget by ${(eagerKb - EAGER_JS_GZIP_BUDGET_KB).toFixed(0)} KB — did a lazy-only library end up in the entry graph?`,
  );
  failed = true;
}
if (precacheKb > PRECACHE_BUDGET_KB) {
  console.error(
    `FAIL: precache exceeds budget by ${(precacheKb - PRECACHE_BUDGET_KB).toFixed(0)} KB — did a heavy asset slip past the globIgnores?`,
  );
  failed = true;
}
process.exit(failed ? 1 : 0);
