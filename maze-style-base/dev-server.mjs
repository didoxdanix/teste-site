import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';

const PORT = Number(process.env.PORT || 5173);
const ROOT = process.cwd();

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.htm': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
};

function safePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const target = clean === '/' ? '/index.html' : clean;
  const full = normalize(join(ROOT, target));
  if (!full.startsWith(ROOT)) return null;
  return full;
}

createServer((req, res) => {
  const filePath = safePath(req.url || '/');
  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  let pathToServe = filePath;
  if (!existsSync(pathToServe)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const stat = statSync(pathToServe);
  if (stat.isDirectory()) {
    pathToServe = join(pathToServe, 'index.html');
    if (!existsSync(pathToServe)) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
  }

  const ext = extname(pathToServe).toLowerCase();
  const mime = MIME[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': mime, 'Cache-Control': 'no-cache' });
  createReadStream(pathToServe).pipe(res);
}).listen(PORT, () => {
  console.log(`Dev server running at http://localhost:${PORT}`);
});
