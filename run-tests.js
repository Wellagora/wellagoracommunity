#!/usr/bin/env node

// Simple wrapper to run Playwright tests without ESM preflight issues
const { spawn } = require('child_process');
const path = require('path');

const playwrightBin = path.join(__dirname, 'node_modules', '.bin', 'playwright');
const args = process.argv.slice(2);

const child = spawn(playwrightBin, ['test', ...args], {
  stdio: 'inherit',
  env: { ...process.env, NODE_OPTIONS: '--no-warnings' }
});

child.on('exit', (code) => {
  process.exit(code);
});
