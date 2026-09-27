// Fails when media files are too heavy for a fast homepage. Run with: npm run check:media
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

const ROOTS = ['public/media', 'src/assets', 'public/cv.pdf'];
const MAX_FILE = 2 * 1024 * 1024; // per file
const MAX_TOTAL = 40 * 1024 * 1024; // everything together; git keeps every version forever

const walk = (path) =>
  statSync(path).isDirectory()
    ? readdirSync(path).flatMap((name) => walk(join(path, name)))
    : [path];

const files = ROOTS.filter((root) => existsSync(root)).flatMap(walk);
const mb = (bytes) => `${(bytes / 1024 / 1024).toFixed(2)} MB`;
let total = 0;
const tooBig = [];
for (const file of files) {
  const size = statSync(file).size;
  total += size;
  if (size > MAX_FILE) tooBig.push(`${file} is ${mb(size)} (limit ${mb(MAX_FILE)})`);
}

for (const line of tooBig) console.error(`Too big: ${line}`);
if (total > MAX_TOTAL) console.error(`All media together is ${mb(total)} (limit ${mb(MAX_TOTAL)})`);
if (tooBig.length > 0 || total > MAX_TOTAL) process.exit(1);
console.log(`Media OK: ${files.length} files, ${mb(total)} in total.`);
