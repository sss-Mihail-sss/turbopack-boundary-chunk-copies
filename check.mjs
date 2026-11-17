// Reads the prerendered HTML of `/` and lists every JS chunk it makes the browser load (script
// tags and the client-reference chunk lists in the inlined RSC payload), flagging the chunks
// that contain lib/payload.js (its string starts with SHARED_MODULE_MARKER).
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import zlib from 'node:zlib';

const next = '.next';
const version = JSON.parse(fs.readFileSync('node_modules/next/package.json', 'utf8')).version;
const html = fs.readFileSync(path.join(next, 'server/app/index.html'), 'utf8');
const chunks = [...new Set([...html.matchAll(/\/_next\/static\/chunks\/([\w.~-]+\.js)/g)].map((m) => m[1]))];

// Which segments list each chunk (entryJSFiles of the client-reference manifest).
const ctx = { self: {} };
vm.runInNewContext(
  fs.readFileSync(path.join(next, 'server/app/page_client-reference-manifest.js'), 'utf8').replaceAll('globalThis', 'self'),
  ctx,
);
const entries = Object.values(ctx.self.__RSC_MANIFEST)[0].entryJSFiles;
const segmentsOf = (file) =>
  Object.entries(entries)
    .filter(([, files]) => files.some((f) => f.endsWith(file)))
    .map(([segment]) => segment.replace(/^\[project\]\//, ''));

let copies = 0;
let total = 0;
console.log(`next ${version}: / loads ${chunks.length} JS chunks`);
for (const file of chunks) {
  const code = fs.readFileSync(path.join(next, 'static/chunks', file));
  const gzip = zlib.gzipSync(code).length;
  total += gzip;
  if (!code.includes('SHARED_MODULE_MARKER')) continue;
  copies++;
  console.log(`  ${file} (gzip ${gzip} B) contains lib/payload.js; listed by: ${segmentsOf(file).join(', ') || '—'}`);
}

// Boundaries whose chunks are in the manifest but not loaded by `/`.
const loaded = new Set(chunks);
for (const [segment, files] of Object.entries(entries)) {
  const skipped = files.filter((f) => !loaded.has(path.basename(f)));
  if (skipped.length) console.log(`  not loaded: ${skipped.map((f) => path.basename(f)).join(', ')} (${segment.replace(/^\[project\]\//, '')})`);
}

console.log(`/ first-load JS: gzip ${total} B`);
console.log(
  copies > 1
    ? `BUG: / downloads lib/payload.js ${copies} times (one copy per chunk group that loads with the page).`
    : 'OK: / downloads lib/payload.js once.',
);
