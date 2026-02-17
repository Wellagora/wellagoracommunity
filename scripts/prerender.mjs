/**
 * Prerender static routes after Vite build.
 * Uses Puppeteer to visit each route and save the rendered HTML.
 * 
 * Usage: node scripts/prerender.mjs
 * Runs automatically via: npm run build:prerender
 */

import { createServer } from 'http';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST_DIR = join(__dirname, '..', 'dist');
const PORT = 4173;

// Routes to prerender (matching sitemap.xml)
const ROUTES = [
  '/',
  '/programs',
  '/events',
  '/community',
  '/sponsor',
  '/ai-assistant',
  '/partners',
  '/contact',
  '/help',
  '/impressum',
  '/terms',
  '/privacy-policy',
];

// Simple static file server for the dist folder
function startServer() {
  return new Promise((resolve) => {
    const server = createServer((req, res) => {
      let filePath = join(DIST_DIR, req.url === '/' ? 'index.html' : req.url);
      
      // SPA fallback: if file doesn't exist, serve index.html
      if (!existsSync(filePath)) {
        filePath = join(DIST_DIR, 'index.html');
      }
      
      try {
        const content = readFileSync(filePath);
        const ext = filePath.split('.').pop();
        const mimeTypes = {
          html: 'text/html',
          js: 'application/javascript',
          css: 'text/css',
          png: 'image/png',
          jpg: 'image/jpeg',
          svg: 'image/svg+xml',
          ico: 'image/x-icon',
          json: 'application/json',
          woff2: 'font/woff2',
          woff: 'font/woff',
        };
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        res.end(content);
      } catch {
        res.writeHead(404);
        res.end('Not found');
      }
    });

    server.listen(PORT, () => {
      console.log(`  Static server running on http://localhost:${PORT}`);
      resolve(server);
    });
  });
}

async function prerender() {
  console.log('\n🔍 Prerendering static routes...\n');

  // Check dist exists
  if (!existsSync(DIST_DIR)) {
    console.error('❌ dist/ directory not found. Run "npm run build" first.');
    process.exit(1);
  }

  // Dynamic import puppeteer (may not be installed in all environments)
  let puppeteer;
  try {
    puppeteer = (await import('puppeteer')).default;
  } catch {
    console.warn('⚠️  Puppeteer not available — skipping prerender. Install with: npm i -D puppeteer');
    process.exit(0);
  }

  const server = await startServer();
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
      ],
    });
  } catch (err) {
    console.warn(`⚠️  Could not launch Chrome: ${err.message}`);
    console.warn('   Skipping prerender — site will work as SPA.');
    server.close();
    process.exit(0);
  }

  let successCount = 0;

  for (const route of ROUTES) {
    try {
      const page = await browser.newPage();
      
      // Wait for the page to fully render
      await page.goto(`http://localhost:${PORT}${route}`, {
        waitUntil: 'networkidle0',
        timeout: 30000,
      });

      // Wait a bit more for React to hydrate and helmet to inject meta tags
      await page.waitForSelector('#root', { timeout: 10000 });
      await new Promise(r => setTimeout(r, 1500));

      // Get the full HTML
      const html = await page.content();

      // Determine output path
      const outputDir = route === '/'
        ? DIST_DIR
        : join(DIST_DIR, route);
      
      if (!existsSync(outputDir)) {
        mkdirSync(outputDir, { recursive: true });
      }

      const outputFile = join(outputDir, 'index.html');
      writeFileSync(outputFile, html, 'utf-8');

      const contentLength = html.length;
      const hasH1 = html.includes('<h1');
      const hasMeta = html.includes('meta name="description"');
      
      console.log(`  ✅ ${route.padEnd(20)} → ${(contentLength / 1024).toFixed(1)}KB ${hasH1 ? '(h1✓)' : '(h1✗)'} ${hasMeta ? '(meta✓)' : '(meta✗)'}`);
      successCount++;

      await page.close();
    } catch (err) {
      console.error(`  ❌ ${route} — ${err.message}`);
    }
  }

  await browser.close();
  server.close();

  console.log(`\n✨ Prerendered ${successCount}/${ROUTES.length} routes successfully.\n`);
}

prerender().catch(console.error);
