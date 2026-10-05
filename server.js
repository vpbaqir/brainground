const http = require('http');
const fs = require('fs');
const path = require('path');

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 3001;
const HOST = '127.0.0.1';

const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'app_config.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Default initial config matching the admin design
const DEFAULT_CONFIG = {
  rev: 4,
  lastPublished: '3 Oct 2026, 10:00',
  announcement: 'Welcome to Brain Playground! New challenges updated.',
  ads: {
    enabled: true,
    list: [
      {
        id: 'sp1',
        name: 'Sample Bookshop',
        text: 'Books for curious minds',
        slots: ['home', 'result'],
        start: '2026-10-01',
        end: '2026-10-08',
        enabled: true,
        logoLetter: 'S'
      },
      {
        id: 'sp2',
        name: 'Old Tuition',
        text: 'Ended',
        slots: ['home'],
        start: '2026-08-01',
        end: '2026-09-01',
        enabled: false,
        logoLetter: 'O'
      }
    ]
  },
  games: {
    p: { name: 'Pattern detective', enabled: true, questions: [{ q: 'What comes next?' }] },
    e: { name: 'Echo', enabled: true, questions: [] },
    m: { name: 'Number chef', enabled: true, questions: [] },
    o: { name: 'Sharp eye', enabled: true, questions: [] },
    k: { name: 'Memory match', enabled: true, questions: [] },
    l: { name: 'Logic clues', enabled: false, questions: [] }
  },
  rewards: { per: 1, bonus: 2, daily: 2, ms: [{ d: 3, s: 5 }, { d: 7, s: 15 }] },
  maintenance: { on: false, msg: '' }
};

function getConfig() {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error reading config file:', e);
  }
  return DEFAULT_CONFIG;
}

function saveConfig(cfg) {
  try {
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2), 'utf8');
    return true;
  } catch (e) {
    console.error('Error saving config file:', e);
    return false;
  }
}

// Active SSE client connections for real-time live sync
const sseClients = new Set();

function broadcastConfig(cfg) {
  const payload = `data: ${JSON.stringify(cfg)}\n\n`;
  console.log(`[SSE] Broadcasting config rev ${cfg.rev} to ${sseClients.size} connected client(s)`);
  for (const client of sseClients) {
    try {
      client.write(payload);
    } catch (e) {
      sseClients.delete(client);
    }
  }
}

// Keep-alive heartbeat every 15s to keep SSE open
setInterval(() => {
  for (const client of sseClients) {
    try {
      client.write(':keepalive\n\n');
    } catch (e) {
      sseClients.delete(client);
    }
  }
}, 15000);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf'
};

function startServer(port) {
  const server = http.createServer((req, res) => {
    // Enable CORS for local cross-origin development
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const safeUrlPath = req.url.split('?')[0];

    // API: GET /api/config
    if (safeUrlPath === '/api/config' && req.method === 'GET') {
      const cfg = getConfig();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(cfg));
      return;
    }

    // API: POST /api/config
    if (safeUrlPath === '/api/config' && req.method === 'POST') {
      let body = '';
      req.on('data', chunk => { body += chunk; });
      req.on('end', () => {
        try {
          const newCfg = JSON.parse(body);
          newCfg.rev = (newCfg.rev || 0) + 1;
          const now = new Date();
          newCfg.lastPublished = now.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) + ', ' +
            now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          saveConfig(newCfg);
          broadcastConfig(newCfg);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, config: newCfg }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: err.message }));
        }
      });
      return;
    }

    // API: GET /api/events (SSE)
    if (safeUrlPath === '/api/events') {
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*'
      });
      if (res.flushHeaders) res.flushHeaders();
      res.write(':connected\n\n');
      res.write(`data: ${JSON.stringify(getConfig())}\n\n`);
      sseClients.add(res);
      console.log(`[SSE] Client connected. Total active clients: ${sseClients.size}`);

      req.on('close', () => {
        sseClients.delete(res);
        console.log(`[SSE] Client disconnected. Total active clients: ${sseClients.size}`);
      });
      return;
    }

    // Cache-Control headers for static web responses to prevent browser caching
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');

    // Static Web Routing
    let targetFile = null;
    if (safeUrlPath === '/' || safeUrlPath === '/game') {
      targetFile = path.join(__dirname, 'app', 'src', 'main', 'assets', 'index.html');
    } else if (safeUrlPath === '/admin' || safeUrlPath === '/docs' || safeUrlPath === '/docs/') {
      targetFile = path.join(__dirname, 'docs', 'index.html');
    } else if (safeUrlPath === '/privacy') {
      targetFile = path.join(__dirname, 'docs', 'privacy.html');
    } else {
      const candidatePath = path.join(__dirname, path.normalize(safeUrlPath));
      if (candidatePath.startsWith(__dirname) && fs.existsSync(candidatePath) && fs.statSync(candidatePath).isFile()) {
        targetFile = candidatePath;
      } else {
        targetFile = path.join(__dirname, 'app', 'src', 'main', 'assets', 'index.html');
      }
    }

    fs.readFile(targetFile, (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
        return;
      }

      const ext = path.extname(targetFile).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(data);
    });
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });

  server.listen(port, () => {
    console.log(`\n==================================================`);
    console.log(`  kids-repo is running locally with Real-Time Sync!`);
    console.log(`  Kids Game:   http://localhost:${port}/`);
    console.log(`  Admin Panel: http://localhost:${port}/admin`);
    console.log(`  API Config:  http://localhost:${port}/api/config`);
    console.log(`  Live Events: http://localhost:${port}/api/events`);
    console.log(`==================================================\n`);
  });
}

startServer(DEFAULT_PORT);
