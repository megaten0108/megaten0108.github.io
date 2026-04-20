const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, 'data');
const COUNT_FILE = path.join(DATA_DIR, 'count.json');

const app = express();
const PORT = process.env.PORT || 8080;

async function ensureData() {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    try {
      await fs.access(COUNT_FILE);
    } catch (e) {
      await fs.writeFile(COUNT_FILE, JSON.stringify({ count: 0 }, null, 2), 'utf8');
    }
  } catch (e) {
    console.error('Failed to ensure data dir:', e);
  }
}

async function readCount() {
  const raw = await fs.readFile(COUNT_FILE, 'utf8');
  const data = JSON.parse(raw || '{}');
  return Number(data.count || 0);
}

async function writeCount(n) {
  const tmp = COUNT_FILE + '.tmp';
  await fs.writeFile(tmp, JSON.stringify({ count: n }, null, 2), 'utf8');
  await fs.rename(tmp, COUNT_FILE);
}

app.get('/count', async (req, res) => {
  try {
    const n = await readCount();
    res.json({ count: n });
  } catch (e) {
    res.status(500).json({ error: 'read error' });
  }
});

// Serve an SVG and increment the counter on each request
app.get('/counter.svg', async (req, res) => {
  try {
    let n = await readCount();
    n = Number(n) + 1;
    await writeCount(n);

    // respond with no-cache to ensure browser requests every time
    res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.set('Content-Type', 'image/svg+xml');

    const padded = String(n).padStart(4, '0');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>\n<svg xmlns="http://www.w3.org/2000/svg" width="140" height="34" viewBox="0 0 140 34">\n  <rect width="100%" height="100%" fill="#ffffff" rx="4"/>\n  <text x="12" y="22" font-family="monospace" font-size="16" fill="#111">${padded}</text>\n</svg>`;
    res.send(svg);
  } catch (e) {
    res.status(500).send('error');
  }
});

// Simple HTML view for /referer/show so existing links work
app.get('/referer/show', async (req, res) => {
  try {
    const n = await readCount();
    res.set('Content-Type', 'text/html; charset=utf-8');
    res.send(`<html><head><meta charset="utf-8"><title>Counter</title></head><body><h1>Visits: ${n}</h1></body></html>`);
  } catch (e) {
    res.status(500).send('error');
  }
});

// Root
app.get('/', (req, res) => {
  res.send('Counter server is running. Use /counter.svg or /count');
});

ensureData().then(() => {
  app.listen(PORT, () => console.log(`Counter server listening on ${PORT}`));
});
