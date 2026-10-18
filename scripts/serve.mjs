#!/usr/bin/env node
// Local preview only. Run from any directory: node scripts/serve.mjs [port]
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', 'site');
const port = Number(process.argv[2] || 8933);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json; charset=utf-8', '.txt': 'text/plain; charset=utf-8', '.pdf': 'application/pdf', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png' };
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch { res.writeHead(400); return res.end(); }
  // The project prefix exercises the same relative paths as GitHub Pages.
  if (pathname === '/') { res.writeHead(302, { Location: '/learning/' }); return res.end(); }
  if (!pathname.startsWith('/learning/')) { res.writeHead(404); return res.end(); }
  const relative = pathname.slice('/learning/'.length) || 'index.html';
  const target = path.resolve(root, relative);
  if (!target.startsWith(root + path.sep) || relative.includes('\\') || relative.split('/').some(p => p.startsWith('.'))) { res.writeHead(403); return res.end(); }
  try {
    const stat = fs.statSync(target);
    if (!stat.isFile()) throw new Error('Not a file');
    const real = fs.realpathSync(target);
    if (!real.startsWith(fs.realpathSync(root) + path.sep)) { res.writeHead(403); return res.end(); }
    res.writeHead(200, { 'Content-Type': types[path.extname(target)] || 'application/octet-stream', 'Content-Length': stat.size, 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' });
    if (req.method === 'HEAD') return res.end();
    fs.createReadStream(target).pipe(res);
  } catch { res.writeHead(404); res.end('Not found'); }
});
server.on('error', error => { console.error(error.message); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`Open http://127.0.0.1:${port}/learning/`));
