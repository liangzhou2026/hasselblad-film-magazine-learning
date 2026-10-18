#!/usr/bin/env node
/**
 * Read-only release audit. Node.js built-ins only; no network or npm install.
 * Usage: node scripts/check-release.mjs [repository-root]
 * This checks files, syntax and selected data/controller decisions. It is NOT
 * a browser/WebGL test, a copyright determination or a complete secret scanner.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const site = path.join(root, 'site');
const manuals = path.join(site, 'manuals');
const MiB = 1024 * 1024;
const errors = [], warnings = [], checks = [];
const files = [], textFiles = new Map();
const auditedManualFiles = new Set();
const expectedModels = ['A12', 'A16', 'A16S', 'A24', 'A32', 'A12TCC', 'A16TCC', 'A24TCC', 'E12', 'E16', 'E24', 'E12CC', 'MAGAZINE70', 'POLAROID100', 'POLAPLUS', 'POLABASIC'];
const preciseModels = ['A12', 'A16', 'A24'];
const relative = file => path.relative(root, file).split(path.sep).join('/');
const issue = (list, type, file, line, detail) => list.push({ type, file: relative(file), ...(line ? { line } : {}), ...(detail ? { detail } : {}) });
const lineAt = (source, offset) => source.slice(0, offset).split('\n').length;
const inside = (base, target) => target === base || target.startsWith(base + path.sep);
function check(name, fn) {
  try { const detail = fn(); checks.push({ name, passed: true, ...(detail ? { detail } : {}) }); }
  catch (error) { checks.push({ name, passed: false }); errors.push({ type: name, detail: String(error.message).slice(0, 300) }); }
}
function walk(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name === '.git') continue;
    const file = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) { issue(errors, 'symlink-not-audited', file); continue; }
    if (entry.isDirectory()) { walk(file); continue; }
    if (!entry.isFile()) continue;
    const bytes = fs.statSync(file).size;
    files.push({ file, bytes });
    if (bytes > 100 * MiB) issue(errors, 'github-100MiB-file-limit', file);
    else if (bytes > 25 * MiB) issue(warnings, 'browser-upload-25MiB-limit', file);
    if (bytes <= 10 * MiB && /\.(?:html?|[cm]?js|css|json|md|txt|ya?ml|toml|xml|svg|sh|ps1|cmd|bat)$|(?:^|\/)(?:LICENSE|NOTICE|\.gitignore|\.gitattributes|\.nojekyll)$/i.test(relative(file))) {
      textFiles.set(file, fs.readFileSync(file, 'utf8'));
    }
    if (/^(?:\.env(?:\..+)?|id_rsa|id_ed25519|credentials(?:\.json)?)$/i.test(entry.name) && !/\.example$/i.test(entry.name)) issue(errors, 'sensitive-filename', file);
    if (/\.(?:blend\d?|glb|zip|7z|msi|exe|pdf|jpe?g)$/i.test(entry.name) && !auditedManualFiles.has(path.resolve(file))) issue(errors, 'excluded-attachment-in-source-package', file);
  }
}
check('audited-manual-bundle', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(manuals, 'manifest.json'), 'utf8'));
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.documents) || !Array.isArray(manifest.images)) throw new Error('Unsupported manual manifest schema.');
  const expected = new Map([
    ['manual', { file: 'service-manual.pdf', pages: 66, imagePrefix: 'service-p', digits: 2 }],
    ['user', { file: 'user-manual.pdf', pages: 23, imagePrefix: 'user-p', digits: 2 }],
    ['bulletins', { file: 'service-bulletins.pdf', pages: 193, imagePrefix: 'bulletin-p', digits: 3 }]
  ]);
  if (manifest.documents.length !== expected.size) throw new Error('The bundle must contain exactly the three declared learning manuals.');
  const documents = new Map(), verified = new Set(), imagePages = new Set();
  function verify(entry, kind) {
    if (!entry || typeof entry.file !== 'string' || !entry.file || entry.file.includes('\\') || entry.file.includes('\0') || path.posix.isAbsolute(entry.file) || /^[a-z]:/i.test(entry.file) || entry.file.split('/').some(segment => !segment || segment === '.' || segment === '..')) throw new Error('Invalid path in manual manifest.');
    const file = path.resolve(manuals, entry.file);
    if (!inside(manuals, file) || !inside(fs.realpathSync(manuals), fs.realpathSync(file))) throw new Error('Manual manifest path escapes site/manuals.');
    if (verified.has(file)) throw new Error('Duplicate file in manual manifest: ' + entry.file);
    const stat = fs.lstatSync(file);
    if (!stat.isFile() || stat.isSymbolicLink()) throw new Error('Manual entries must be regular files: ' + entry.file);
    if (!Number.isSafeInteger(entry.bytes) || entry.bytes <= 0 || stat.size !== entry.bytes) throw new Error('Manual file size mismatch: ' + entry.file);
    if (!/^[a-f0-9]{64}$/.test(entry.sha256 || '')) throw new Error('Invalid SHA256 in manual manifest: ' + entry.file);
    const bytes = fs.readFileSync(file);
    if (createHash('sha256').update(bytes).digest('hex') !== entry.sha256) throw new Error('Manual SHA256 mismatch: ' + entry.file);
    if (kind === 'pdf' && bytes.subarray(0, 5).toString('ascii') !== '%PDF-') throw new Error('Invalid PDF header: ' + entry.file);
    if (kind === 'jpg' && (bytes.length < 4 || bytes[0] !== 0xff || bytes[1] !== 0xd8 || bytes[2] !== 0xff || bytes[bytes.length - 2] !== 0xff || bytes[bytes.length - 1] !== 0xd9)) throw new Error('Invalid JPEG header or end marker: ' + entry.file);
    verified.add(file);
  }
  for (const document of manifest.documents) {
    const spec = expected.get(document.id);
    if (!spec || documents.has(document.id) || document.file !== spec.file || document.pages !== spec.pages) throw new Error('Manual IDs, file names or page counts differ from the approved three-document bundle.');
    if (typeof document.title !== 'string' || !document.title.trim()) throw new Error('Each manual needs a title.');
    if (document.sourceUrl && !/^https?:\/\//.test(document.sourceUrl)) throw new Error('Manual source URLs must be public HTTP(S) links when supplied.');
    verify(document, 'pdf');
    documents.set(document.id, spec);
  }
  for (const image of manifest.images) {
    const spec = documents.get(image.documentId);
    if (!spec || !Number.isInteger(image.page) || image.page < 1 || image.page > spec.pages) throw new Error('Page image does not match a manual and page number.');
    const expectedFile = 'pages/' + spec.imagePrefix + String(image.page).padStart(spec.digits, '0') + '.jpg';
    if (image.file !== expectedFile) throw new Error('Unexpected manual page-image name.');
    const pageKey = image.documentId + ':' + image.page;
    if (imagePages.has(pageKey)) throw new Error('Duplicate manual page image: ' + pageKey);
    verify(image, 'jpg');
    imagePages.add(pageKey);
  }
  const expectedImages = [...expected.values()].reduce((sum, spec) => sum + spec.pages, 0);
  if (imagePages.size !== expectedImages) throw new Error('All 282 declared manual pages must have an audited image.');
  for (const file of verified) auditedManualFiles.add(file);
  return { documents: documents.size, pageImages: imagePages.size, checks: 'Approved paths, byte sizes, SHA256, PDF/JPEG headers and complete page coverage.' };
});
check('repository-and-site-exist', () => {
  if (!fs.existsSync(site) || !fs.existsSync(path.join(site, 'index.html'))) throw new Error('Expected site/index.html in the release repository.');
  walk(root);
});

const siteFiles = files.filter(item => inside(site, item.file));
const exactPaths = new Set(files.map(item => path.resolve(item.file)));
const foldedPaths = new Set([...exactPaths].map(file => file.toLowerCase()));
let checkedReferences = 0, externalReferences = 0, dynamicReferences = 0, syntaxFiles = 0, inlineScripts = 0;
const seenReferences = new Set();
const decodeHTML = value => value.replace(/&amp;/g, '&').replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)));
function reference(from, raw, offset, source) {
  const value = decodeHTML(raw.trim().replace(/^<|>$/g, ''));
  if (!value || /^(?:#|\?)/.test(value)) return;
  if (/^(?:https?:)?\/\//i.test(value) || /^(?:data|blob|mailto|tel):/i.test(value)) { externalReferences++; return; }
  if (/\$\{|\{\{|<%|\\/.test(value)) { dynamicReferences++; return; }
  if (/^[a-z][a-z0-9+.-]*:/i.test(value)) { issue(errors, 'unsupported-or-local-url', from, lineAt(source, offset)); return; }
  if (value.startsWith('/')) { issue(errors, 'root-absolute-link-breaks-project-pages', from, lineAt(source, offset)); return; }
  const key = from + '\0' + value;
  if (seenReferences.has(key)) return;
  seenReferences.add(key);
  let pathname;
  try { pathname = decodeURIComponent(value.split(/[?#]/)[0]); }
  catch { issue(errors, 'invalid-encoded-local-url', from, lineAt(source, offset)); return; }
  if (!pathname) return;
  const target = path.resolve(path.dirname(from), pathname);
  const base = inside(site, from) ? site : root;
  if (!inside(base, target)) { issue(errors, 'local-link-escapes-package', from, lineAt(source, offset)); return; }
  checkedReferences++;
  if (fs.existsSync(target) && fs.statSync(target).isDirectory()) {
    if (!fs.existsSync(path.join(target, 'index.html')) && inside(site, from)) issue(errors, 'directory-has-no-index', from, lineAt(source, offset));
    return;
  }
  if (!exactPaths.has(target)) {
    issue(errors, foldedPaths.has(target.toLowerCase()) ? 'case-sensitive-path-mismatch' : 'missing-local-reference', from, lineAt(source, offset), pathname);
  }
}

// Only locations and categories are reported; never print the matched values.
const sensitivePatterns = [
  ['github-token', /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/g],
  ['openai-key', /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b/g],
  ['aws-access-key-id', /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/g],
  ['private-key-block', /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/g],
  ['credential-assignment', /\b(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][A-Za-z0-9_+/=.-]{24,}["']/gi]
];
for (const [file, source] of textFiles) {
  for (const [kind, pattern] of sensitivePatterns) {
    pattern.lastIndex = 0;
    for (const match of source.matchAll(pattern)) issue(errors, kind, file, lineAt(source, match.index));
  }
  const isSite = inside(site, file);
  if (isSite) {
    for (const match of source.matchAll(/\b[A-Za-z]:[\\/](?:Users|Documents|HASSELBLAD|Windows|Program Files)[^\r\n"'<>]*/g)) issue(errors, 'machine-local-path', file, lineAt(source, match.index));
    for (const match of source.matchAll(/(?:https?:\/\/)?(?:localhost|127\.0\.0\.1|0\.0\.0\.0)(?::\d+)?/g)) issue(errors, 'loopback-reference', file, lineAt(source, match.index));
    for (const match of source.matchAll(/assets\/(?:service(?:-manual|-bulletins|-p)|user-manual|photo-)[^\s"'<>]*/g)) issue(errors, 'excluded-manual-or-photo-reference', file, lineAt(source, match.index));
    for (const match of source.matchAll(/assets\/models\/[^\s"'<>]*/g)) issue(errors, 'large-download-still-local', file, lineAt(source, match.index));
  }
  if (/\.(?:html?|css|js)$/i.test(file) && isSite && !relative(file).includes('/vendor/')) {
    for (const match of source.matchAll(/\b(?:href|src|poster)\s*=\s*(["'])(.*?)\1/g)) reference(file, match[2], match.index, source);
    if (/\.(?:css|html?)$/i.test(file)) {
      for (const match of source.matchAll(/url\(\s*(["']?)(.*?)\1\s*\)/g)) reference(file, match[2], match.index, source);
      for (const match of source.matchAll(/@import\s+(["'])(.*?)\1/g)) reference(file, match[2], match.index, source);
    }
    if (/\.js$/i.test(file)) {
      // Literal resource URLs only. Interpolated values are counted separately;
      // configured release URLs are intentionally not required to exist locally.
      for (const match of source.matchAll(/(["'`])((?:\.\.?\/|assets\/|vendor\/|manuals\/)[^"'`\r\n]*)\1/g)) {
        if (/\.(?:html?|css|m?js|json|pdf|png|jpe?g|webp|svg|glb)(?:[?#]|$)/i.test(match[2])) reference(file, match[2], match.index, source);
      }
      for (const match of source.matchAll(/\b(?:fetch|import)\s*\(\s*(["'`])([^"'`\r\n]+)\1/g)) reference(file, match[2], match.index, source);
    }
  }
  if (/\.md$/i.test(file)) {
    for (const match of source.matchAll(/!?\[[^\]]*\]\((<[^>]+>|[^\s)]+)(?:\s+["'][^)]*)?\)/g)) reference(file, match[1], match.index, source);
  }
  if (/\.[cm]?js$/i.test(file)) {
    syntaxFiles++;
    const result = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8', timeout: 30000, windowsHide: true });
    if (result.status !== 0) issue(errors, 'javascript-syntax-or-check-failure', file);
  }
  if (/\.html?$/i.test(file)) {
    for (const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
      if (/\bsrc\s*=|type\s*=\s*["'](?:application\/ld\+json|application\/json|module)/i.test(match[1]) || !match[2].trim()) continue;
      inlineScripts++;
      try { new vm.Script(match[2], { filename: relative(file) }); }
      catch { issue(errors, 'inline-javascript-syntax', file, lineAt(source, match.index)); }
    }
  }
}

check('showcase-assets-and-share-metadata', () => {
  const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  const metadata = new Map([...html.matchAll(/<meta\b[^>]*(?:property|name)="([^"]+)"[^>]*content="([^"]*)"[^>]*>/g)].map(match => [match[1], decodeHTML(match[2])]));
  const canonical = html.match(/<link\b[^>]*rel="canonical"[^>]*href="([^"]+)"/)?.[1];
  if (!canonical || !/^https:\/\//.test(canonical) || !canonical.endsWith('/')) throw new Error('A complete HTTPS canonical project URL is required.');
  if (metadata.get('og:url') !== canonical || metadata.get('og:type') !== 'website' || metadata.get('twitter:card') !== 'summary_large_image') throw new Error('Canonical, Open Graph and Twitter card settings must agree.');
  for (const field of ['description', 'og:site_name', 'og:title', 'og:description', 'og:image:alt', 'twitter:title', 'twitter:description', 'twitter:image:alt']) {
    if (!metadata.get(field)?.trim()) throw new Error('Missing showcase metadata: ' + field);
  }
  const imagePath = 'assets/social-preview.png';
  const imageURL = new URL(imagePath, canonical).href;
  if (metadata.get('og:image') !== imageURL || metadata.get('twitter:image') !== imageURL || metadata.get('og:image:type') !== 'image/png') throw new Error('Share images must use the deployed absolute PNG URL.');
  function pngSize(file) {
    const bytes = fs.readFileSync(file);
    if (bytes.length < 24 || bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' || bytes.subarray(12, 16).toString('ascii') !== 'IHDR') throw new Error('Invalid showcase PNG: ' + relative(file));
    return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20), bytes: bytes.length };
  }
  const preview = pngSize(path.join(site, imagePath));
  if (preview.width !== 1280 || preview.height !== 640 || preview.bytes >= 1000000) throw new Error('Share image must be 1280 x 640 and smaller than 1 MB.');
  if (metadata.get('og:image:width') !== String(preview.width) || metadata.get('og:image:height') !== String(preview.height)) throw new Error('Open Graph dimensions do not match the image.');
  const screenshot = pngSize(path.join(site, 'assets/a12-mobile.png'));
  if (screenshot.width !== 947 || screenshot.height !== 2048) throw new Error('The original mobile screenshot dimensions must be preserved.');
  for (const name of ['README.md', 'README.en.md']) {
    const file = path.join(root, name), source = fs.readFileSync(file, 'utf8');
    const images = [...source.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/g)];
    if (!images.some(match => match[1] === 'site/assets/a12-mobile.png')) throw new Error(name + ' is missing the real mobile screenshot.');
    for (const match of images) reference(file, match[1], match.index, source);
  }
  return { preview, screenshot, canonical, scope: 'Static metadata and local assets only; publishing and social-platform caches require separate verification.' };
});

check('licenses-present', () => {
  const license = path.join(root, 'LICENSE');
  if (!fs.existsSync(license) || !/MIT License/.test(fs.readFileSync(license, 'utf8'))) throw new Error('Root MIT LICENSE missing.');
  const vendor = files.filter(item => /site\/vendor\/.*(?:license|notice)/i.test(relative(item.file)));
  if (!vendor.some(item => /Copyright.*three\.js|Copyright.*Three\.js|three\.js authors/is.test(fs.readFileSync(item.file, 'utf8')))) throw new Error('Three.js copyright/license must accompany its vendored code.');
});

check('catalog-and-selector-16-models', () => {
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(site, 'manual-magazine-catalog.js'), 'utf8'), context, { timeout: 1000 });
  const ids = [...context.window.MANUAL_MAGAZINES.map(item => item.id)].sort();
  if (JSON.stringify(ids) !== JSON.stringify([...expectedModels].sort())) throw new Error('Catalog must contain the 16 expected unique models.');
  const html = fs.readFileSync(path.join(site, 'index.html'), 'utf8');
  const menu = html.match(/<select\b[^>]*id=["']magazine-model["'][^>]*>([\s\S]*?)<\/select>/i)?.[1] || '';
  const options = [...menu.matchAll(/<option\b[^>]*value=["']([^"']+)["']/g)].map(match => match[1]).sort();
  if (JSON.stringify(ids) !== JSON.stringify(options)) throw new Error('One unified selector must match the catalog exactly.');
  const scripts = [...html.matchAll(/<script\b[^>]*src=["']([^"']+)["']/g)].map(match => match[1].split('?')[0]);
  if (scripts.some(name => /manual-service-(?:player|sequences)\.js$/.test(name))) throw new Error('Retired 13-model procedural animation scripts are loaded.');
  return { catalogModels: ids.length, detailedModels: preciseModels, freeModels: ids.filter(id => !preciseModels.includes(id)) };
});

check('three-detailed-assembly-routes', () => {
  const context = vm.createContext({ window: {} });
  for (const file of ['service-sequences.js', 'magazine-variants.js', 'assembly-variants.js']) vm.runInContext(fs.readFileSync(path.join(site, file), 'utf8'), context, { filename: file, timeout: 1000 });
  const base = JSON.parse(JSON.stringify(context.window.A12_SEQUENCES.assembly));
  const routes = [];
  for (const id of preciseModels) {
    const profile = JSON.parse(JSON.stringify(context.window.A12_VARIANTS.profiles[id]));
    const sequences = { assembly: [] };
    context.window.prepareA12AssemblyVariant(profile, sequences, base);
    if (!profile.assemblyVerified || sequences.assembly.length !== 26 || sequences.assembly.some(step => step.model !== id)) throw new Error(id + ' final assembly route is incomplete.');
    routes.push({ id, assemblyStages: sequences.assembly.length });
  }
  return { disassemblyStages: context.window.A12_SEQUENCES.disassembly.length, routes, scope: 'Executed route builders only; browser initialization is checked separately.' };
});

// Run the real shared-shell decision against a small DOM double, recording
// removals. This catches accidental restoration of 13-model repair controls.
check('other-13-models-remain-free-viewers', () => {
  const shell = fs.readFileSync(path.join(site, 'unified-magazine-shell.js'), 'utf8');
  for (const id of expectedModels.filter(model => !preciseModels.includes(model))) {
    const elements = new Map();
    function element(key) {
      if (!elements.has(key)) {
        const item = { key, removed: false, hidden: false, dataset: {}, style: {}, textContent: '', innerHTML: '', children: [], options: expectedModels.map(value => ({ value, textContent: value })), selectedIndex: expectedModels.indexOf(id), classList: { add() {}, remove() {} }, remove() { this.removed = true; }, append(...nodes) { this.children.push(...nodes); }, after() {}, addEventListener() {}, setAttribute() {}, querySelector(selector) { return element(key + ' ' + selector); }, querySelectorAll() { return []; }, focus() {}, scrollIntoView() {} };
        Object.defineProperty(item, 'parentElement', { get: () => element(key + ':parent') });
        Object.defineProperty(item, 'firstElementChild', { get: () => element(key + ':first') });
        elements.set(key, item);
      }
      return elements.get(key);
    }
    const document = { title: '', body: element('body'), getElementById: element, createElement: tag => element('created:' + tag + ':' + elements.size), querySelector: element, querySelectorAll(selector) { return selector.split(',').map(value => element(value.trim())); } };
    const context = vm.createContext({ document, URL, URLSearchParams, location: { search: '?model=' + id + '&mode=assembly' } });
    context.window = context;
    vm.runInContext(fs.readFileSync(path.join(site, 'manual-magazine-catalog.js'), 'utf8'), context, { timeout: 1000 });
    vm.runInContext(shell, context, { filename: 'unified-magazine-shell.js', timeout: 1000 });
    if (context.MAGAZINE_SHARED_SHELL !== true) throw new Error(id + ' did not enter the free viewer.');
    for (const key of ['workflow-controls', 'lesson-controls', 'learn-panel', 'steps-panel', 'care-panel']) if (!element(key).removed) throw new Error(id + ' still retains ' + key + '.');
    if (/data-sequence=|安装动画|拆卸动画/.test(element('.learning-launch').innerHTML)) throw new Error(id + ' retained procedural launch controls.');
  }
  return { freeModels: 13, scope: 'Executed shared shell with a DOM double; no browser/WebGL rendering claimed.' };
});

const unique = list => [...new Map(list.map(item => [JSON.stringify(item), item])).values()];
const finalErrors = unique(errors), finalWarnings = unique(warnings);
const result = {
  passed: finalErrors.length === 0,
  scope: 'Read-only local release audit; .git excluded. Live browser behavior, external URL availability, rights clearance and Git history are separate checks.',
  files: files.length,
  repositoryMiB: Number((files.reduce((sum, item) => sum + item.bytes, 0) / MiB).toFixed(3)),
  siteMiB: Number((siteFiles.reduce((sum, item) => sum + item.bytes, 0) / MiB).toFixed(3)),
  largestFiles: [...files].sort((a, b) => b.bytes - a.bytes).slice(0, 5).map(item => ({ file: relative(item.file), bytes: item.bytes })),
  references: { checkedLocal: checkedReferences, external: externalReferences, dynamic: dynamicReferences },
  syntax: { files: syntaxFiles, inlineScripts },
  checks,
  errors: finalErrors,
  warnings: finalWarnings
};
console.log(JSON.stringify(result, null, 2));
process.exitCode = result.passed ? 0 : 1;
