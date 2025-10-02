#!/usr/bin/env node
const { spawn } = require('child_process');
const os = require('os');

const port = process.env.VITE_PORT || 8080;
const host = process.env.VITE_HOST || '127.0.0.1';
const url = `http://${host}:${port}`;

function openBrowser(u) {
  const plat = os.platform();
  let cmd;
  if (plat === 'win32') cmd = 'start';
  else if (plat === 'darwin') cmd = 'open';
  else cmd = 'xdg-open';

  try {
    spawn(cmd, [u], { stdio: 'ignore', detached: true }).unref();
  } catch (e) {
    // fallback: do nothing
    // console.error('Failed to open browser', e);
  }
}

// Open browser first, then run vite
openBrowser(url);

const args = ['--host', host, '--port', String(port)];
const vite = spawn('npx', ['vite', ...args], { stdio: 'inherit' });

vite.on('close', (code) => process.exit(code));
