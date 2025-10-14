const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const FEEDBACK_FILE = path.join(__dirname, 'ykien.txt');
const ENTRY_START = '===YK_START===';
const ENTRY_END = '===YK_END===';

const ensureFeedbackFile = async () => {
  try {
    await fs.access(FEEDBACK_FILE);
  } catch (error) {
    await fs.writeFile(FEEDBACK_FILE, '', 'utf8');
  }
};

const parseFeedbackBlocks = (raw) => {
  const segments = raw.split(ENTRY_START);
  const records = [];

  segments.forEach((segment) => {
    const trimmed = segment.trim();
    if (!trimmed) {
      return;
    }

    const [content] = trimmed.split(ENTRY_END);
    if (!content) {
      return;
    }

    const lines = content
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const record = {};
    lines.forEach((line) => {
      const [key, ...rest] = line.split(':');
      if (!key || rest.length === 0) {
        return;
      }

      const value = rest.join(':').trim();

      switch (key) {
        case 'name':
          record.name = value;
          break;
        case 'unit':
          record.unit = value;
          break;
        case 'message':
          record.message = value;
          break;
        case 'recordedAt':
          record.recordedAt = value;
          break;
        case 'id':
          record.id = value;
          break;
        default:
          break;
      }
    });

    if (record.name && record.unit && record.message && record.recordedAt) {
      if (!record.id) {
        record.id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
      }
      records.push(record);
    }
  });

  return records.reverse();
};

const parseJsonLines = (raw) =>
  raw
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      try {
        return JSON.parse(line);
      } catch (error) {
        console.warn('Bỏ qua dòng ý kiến không hợp lệ:', line);
        return null;
      }
    })
    .filter(Boolean)
    .reverse();

const readFeedbacks = async () => {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf8');
    if (!raw.trim()) {
      return [];
    }

    if (raw.includes(ENTRY_START)) {
      return parseFeedbackBlocks(raw);
    }

    return parseJsonLines(raw);
  } catch (error) {
    console.error('Không thể đọc file ykien.txt:', error);
    return [];
  }
};

const formatFeedbackEntry = (feedback) =>
  [
    ENTRY_START,
    `id: ${feedback.id}`,
    `name: ${feedback.name}`,
    `unit: ${feedback.unit}`,
    `message: ${feedback.message}`,
    `recordedAt: ${feedback.recordedAt}`,
    ENTRY_END,
    ''
  ].join('\n');

const appendFeedback = async (feedback) => {
  await fs.appendFile(FEEDBACK_FILE, formatFeedbackEntry(feedback), 'utf8');
};

const normalizeWhitespace = (value) =>
  value
    .replace(/\s+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

const buildFeedbackRecord = ({ name, unit, message }) => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  name: normalizeWhitespace(name),
  unit: normalizeWhitespace(unit),
  message: normalizeWhitespace(message),
  recordedAt: new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date())
});

app.use(express.json());
app.use(express.static(__dirname));

app.get('/api/feedbacks', async (req, res) => {
  const feedbacks = await readFeedbacks();
  res.json(feedbacks);
});

app.post('/api/feedbacks', async (req, res) => {
  const { name = '', unit = '', message = '' } = req.body || {};
  const trimmedName = String(name).trim();
  const trimmedUnit = String(unit).trim();
  const trimmedMessage = String(message).trim();

  if (trimmedName.length < 3 || trimmedUnit.length < 3 || trimmedMessage.length < 10) {
    return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ thông tin hợp lệ.' });
  }

  try {
    const record = buildFeedbackRecord({ name: trimmedName, unit: trimmedUnit, message: trimmedMessage });
    await appendFeedback(record);
    res.status(201).json(record);
  } catch (error) {
    console.error('Không thể ghi ý kiến mới:', error);
    res.status(500).json({ message: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.' });
  }
});

ensureFeedbackFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Máy chủ đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Không thể khởi tạo dữ liệu ban đầu:', error);
    process.exit(1);
  });
