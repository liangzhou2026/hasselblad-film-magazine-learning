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
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const root = path.resolve(process.argv[2] || path.join(path.dirname(fileURLToPath(import.meta.url)), '..'));
const site = path.join(root, 'site');
const MiB = 1024 * 1024;
const errors = [], warnings = [], checks = [];
const files = [], textFiles = new Map();
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
    if (/\.(?:blend\d?|glb|zip|7z|msi|exe|pdf|jpe?g)$/i.test(entry.name)) issue(errors, 'excluded-attachment-in-source-package', file);
  }
}
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
      for (const match of source.matchAll(/(["'`])((?:\.\.?\/|assets\/|vendor\/)[^"'`\r\n]*)\1/g)) {
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
