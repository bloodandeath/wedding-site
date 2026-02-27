/**
 * Post-build prerender script.
 * Serves dist/, loads the page in headless Chrome via Puppeteer,
 * and injects the rendered HTML back into dist/index.html so
 * crawlers get full content without executing JavaScript.
 */

import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { execSync } from 'node:child_process';
import { createServer } from 'node:http';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const distDir = join(__dirname, '..', 'dist');
const indexPath = join(distDir, 'index.html');

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.webp': 'image/webp',
};

// Minimal static file server for dist/
function serve() {
  return new Promise((resolve) => {
    const server = createServer(async (req, res) => {
      const url = req.url === '/' ? '/index.html' : req.url.split('?')[0];
      try {
        const data = await readFile(join(distDir, url));
        res.writeHead(200, { 'Content-Type': MIME[extname(url)] || 'application/octet-stream' });
        res.end(data);
      } catch {
        res.writeHead(404);
        res.end();
      }
    });
    server.listen(0, '127.0.0.1', () => resolve(server));
  });
}

/**
 * Returns a path to a working system Chromium, or null.
 * Puppeteer's bundled Chrome is glibc-linked and won't run on Alpine Linux (musl libc).
 * @sparticuz/chromium has the same problem — it's also a glibc binary.
 * Alpine's own `apk add chromium` installs a musl-native Chromium that actually works.
 */
function findOrInstallChromium() {
  const systemPaths = [
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
  ];
  const found = systemPaths.find(p => existsSync(p));
  if (found) return found;

  // Alpine Linux
  try {
    console.log('Prerender: installing Chromium via apk...');
    execSync('apk add --no-cache chromium nss freetype harfbuzz ca-certificates ttf-freefont', { stdio: 'pipe' });
    if (existsSync('/usr/bin/chromium')) return '/usr/bin/chromium';
  } catch {}

  // Debian/Ubuntu
  try {
    console.log('Prerender: installing Chromium via apt-get...');
    execSync('apt-get install -y chromium', { stdio: 'pipe' });
    if (existsSync('/usr/bin/chromium')) return '/usr/bin/chromium';
    if (existsSync('/usr/bin/chromium-browser')) return '/usr/bin/chromium-browser';
  } catch {}

  return null;
}

async function prerender() {
  const server = await serve();
  const { port } = server.address();
  console.log(`Prerender: serving dist/ on http://127.0.0.1:${port}`);

  const systemChrome = findOrInstallChromium();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: true,
      executablePath: systemChrome ?? undefined,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    });
  } catch (err) {
    server.close();
    if (err.code === 'ENOENT' || err.message?.includes('ENOENT')) {
      console.warn('Prerender skipped: no working Chromium found in this environment.');
      return;
    }
    throw err;
  }

  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle0' });

  // Grab the rendered inner HTML of #app
  const appHtml = await page.$eval('#app', (el) => el.innerHTML);
  await browser.close();
  server.close();

  // Read the original index.html and inject rendered content
  const original = await readFile(indexPath, 'utf-8');
  const prerendered = original.replace(
    '<div id="app"></div>',
    `<div id="app">${appHtml}</div>`
  );

  await writeFile(indexPath, prerendered, 'utf-8');
  console.log('Prerender: dist/index.html updated with rendered content.');
}

prerender().catch((err) => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
