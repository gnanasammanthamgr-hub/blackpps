import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, 'dist');
const port = Number(process.env.PORT) || 10000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function safeFilePath(urlPath) {
  const clean = decodeURIComponent(urlPath.split('?')[0]);
  const relative = clean.replace(/^\/+/, '');
  const resolved = path.resolve(distPath, relative);
  return resolved.startsWith(path.resolve(distPath)) ? resolved : null;
}

async function sendFile(res, filePath) {
  const data = await readFile(filePath);
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, {
    'Content-Type': mimeTypes[ext] || 'application/octet-stream',
    'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000, immutable',
  });
  res.end(data);
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.url === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    const requested = safeFilePath(req.url || '/');
    if (requested) {
      try {
        const info = await stat(requested);
        if (info.isFile()) {
          await sendFile(res, requested);
          return;
        }
      } catch {
        // React Router route or missing asset: fall through to index.html.
      }
    }

    await sendFile(res, path.join(distPath, 'index.html'));
  } catch (error) {
    console.error(error);
    res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Server error. Make sure `npm run build` completed successfully.');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Unified Message Tracker running on http://0.0.0.0:${port}`);
});
