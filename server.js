const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const FEEDBACK_FILE = path.join(__dirname, 'ykien.txt');

const ensureFeedbackFile = async () => {
  try {
    await fs.access(FEEDBACK_FILE);
  } catch (error) {
    await fs.writeFile(FEEDBACK_FILE, '', 'utf8');
  }
};

const readFeedbacks = async () => {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf8');
    const lines = raw
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const parsed = lines
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

    return parsed;
  } catch (error) {
    console.error('Không thể đọc file ykien.txt:', error);
    return [];
  }
};

const appendFeedback = async (feedback) => {
  await fs.appendFile(FEEDBACK_FILE, `${JSON.stringify(feedback)}\n`, 'utf8');
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
