const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');

const HOST = '0.0.0.0';
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'feedbacks.json');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

const ensureDataStore = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, '[]', { encoding: 'utf8' });
  }
};

const loadFeedbacks = () => {
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Không thể đọc dữ liệu góp ý:', error);
    return [];
  }
};

const saveFeedbacks = (items) => {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(items, null, 2), 'utf8');
  } catch (error) {
    console.error('Không thể lưu dữ liệu góp ý:', error);
    throw error;
  }
};

ensureDataStore();
let feedbacks = loadFeedbacks();

const sendJson = (res, statusCode, payload) => {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store'
  });
  res.end(body);
};

const parseRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => {
      chunks.push(chunk);
      if (Buffer.concat(chunks).length > 1e6) {
        req.destroy();
        reject(new Error('Payload quá lớn'));
      }
    });
    req.on('end', () => {
      try {
        const body = Buffer.concat(chunks).toString('utf8');
        const data = body ? JSON.parse(body) : {};
        resolve(data);
      } catch (error) {
        reject(new Error('Dữ liệu gửi lên không hợp lệ'));
      }
    });
    req.on('error', reject);
  });
};

const handleGetFeedback = (res) => {
  const sorted = [...feedbacks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  sendJson(res, 200, sorted);
};

const handlePostFeedback = async (req, res) => {
  try {
    const data = await parseRequestBody(req);
    const name = typeof data.name === 'string' ? data.name.trim() : '';
    const unit = typeof data.unit === 'string' ? data.unit.trim() : '';
    const message = typeof data.message === 'string' ? data.message.trim() : '';

    if (name.length < 3 || name.length > 120) {
      return sendJson(res, 400, { error: 'Họ tên cần từ 3-120 ký tự.' });
    }

    if (unit.length < 3 || unit.length > 120) {
      return sendJson(res, 400, { error: 'Đơn vị cần từ 3-120 ký tự.' });
    }

    if (message.length < 10 || message.length > 2000) {
      return sendJson(res, 400, { error: 'Ý kiến cần từ 10-2000 ký tự.' });
    }

    const entry = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      name,
      unit,
      message,
      createdAt: new Date().toISOString()
    };

    feedbacks = [...feedbacks, entry];
    saveFeedbacks(feedbacks);

    sendJson(res, 201, entry);
  } catch (error) {
    console.error('Lỗi khi ghi nhận ý kiến:', error);
    sendJson(res, 500, { error: error.message || 'Không thể ghi nhận ý kiến.' });
  }
};

const serveStatic = (res, filePath) => {
  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Không tìm thấy tài nguyên.');
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const type = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': ext === '.html' ? 'no-store' : 'public, max-age=600'
    });
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
    stream.on('error', () => {
      res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('Lỗi khi đọc tập tin.');
    });
  });
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const { pathname } = url;

  if (pathname === '/api/feedback') {
    if (req.method === 'GET') {
      return handleGetFeedback(res);
    }

    if (req.method === 'POST') {
      return handlePostFeedback(req, res);
    }

    res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ error: 'Phương thức không được hỗ trợ.' }));
    return;
  }

  let safePath = decodeURIComponent(pathname);
  if (safePath.endsWith('/')) {
    safePath += 'index.html';
  }

  if (safePath.startsWith('/')) {
    safePath = safePath.slice(1);
  }

  if (!safePath) {
    safePath = 'index.html';
  }

  const filePath = path.join(__dirname, safePath);
  const normalizedPath = path.normalize(filePath);
  if (!normalizedPath.startsWith(__dirname)) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Truy cập bị từ chối.');
    return;
  }

  serveStatic(res, normalizedPath);
});

server.listen(PORT, HOST, () => {
  console.log(`Máy chủ chạy tại http://${HOST}:${PORT}`);
});
