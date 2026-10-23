import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';

const routes = new Map([
  ['/', ['mobile.html', 'text/html; charset=utf-8']],
  ['/tests/mobile.html', ['mobile.html', 'text/html; charset=utf-8']],
  ['/red-web.user.js', ['../red-web.user.js', 'text/javascript; charset=utf-8']]
]);
createServer(async (request, response) => {
  const route = routes.get(new URL(request.url, 'http://localhost').pathname);
  if (!route) { response.writeHead(404).end(); return; }
  try {
    const content = await readFile(new URL(route[0], import.meta.url));
    response.writeHead(200, { 'Content-Type': route[1], 'Cache-Control': 'no-store' }).end(content);
  } catch {
    response.writeHead(500).end('Test fixture unavailable');
  }
}).listen(8766, '127.0.0.1', () => console.log('Mobile fixture: http://127.0.0.1:8766/'));
