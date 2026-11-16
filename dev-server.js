/**
 * Tiny static server for local preview — no dependencies.
 *
 * Why it exists: the site uses clean URLs (/menu, not /menu.html), the same
 * way Vercel serves it in production. Opening index.html from the file system
 * breaks every link, because file:// has no server to resolve /menu.
 *
 *   npm run dev     →  http://localhost:4173
 *
 * If the port is busy it tries 4174, 4175 … and prints the URL it landed on.
 */
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
const START_PORT = Number(process.env.PORT) || 4173;
const MAX_TRIES = 10;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8'
};

/** Resolve a URL path to a file inside ROOT, or null when it escapes/misses. */
function resolveFile(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const target = path.normalize(path.join(ROOT, clean));

  // never serve anything outside the project folder
  if (!target.startsWith(ROOT)) return null;

  const candidates = [target, `${target}.html`, path.join(target, 'index.html')];
  return candidates.find((candidate) => {
    try {
      return fs.statSync(candidate).isFile();
    } catch {
      return false;
    }
  }) || null;
}

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  const file = resolveFile(urlPath);

  if (!file) {
    const notFound = path.join(ROOT, '404.html');
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    fs.createReadStream(notFound).pipe(res); // branded 404, same as production
    return;
  }

  res.writeHead(200, {
    'Content-Type': TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store' // always see your edits on refresh
  });
  fs.createReadStream(file).pipe(res);
});

/** Try the next port when the preferred one is already taken. */
function listen(port, attempt = 1) {
  server.once('error', (error) => {
    if (error.code === 'EADDRINUSE' && attempt < MAX_TRIES) {
      listen(port + 1, attempt + 1);
    } else {
      console.error(error.message);
      process.exit(1);
    }
  });

  server.listen(port, () => {
    console.log(`\n  Château Rouge — http://localhost:${port}\n`);
    console.log('  Clean URLs work here. Ctrl+C to stop.\n');
  });
}

listen(START_PORT);
