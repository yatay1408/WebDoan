const express = require('express');
const path = require('path');
const fs = require('fs/promises');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIRECTORY = path.join(__dirname, 'data');
const FEEDBACK_FILE = path.join(DATA_DIRECTORY, 'feedbacks.json');

const ensureDataFile = async () => {
  await fs.mkdir(DATA_DIRECTORY, { recursive: true });
  try {
    await fs.access(FEEDBACK_FILE);
  } catch (error) {
    await fs.writeFile(FEEDBACK_FILE, '[]', 'utf8');
  }
};

const readFeedbacks = async () => {
  try {
    const raw = await fs.readFile(FEEDBACK_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (error) {
    console.error('Không thể đọc file feedbacks:', error);
    return [];
  }
};

const writeFeedbacks = async (feedbacks) => {
  await fs.writeFile(FEEDBACK_FILE, JSON.stringify(feedbacks, null, 2), 'utf8');
};

const buildFeedbackRecord = ({ name, unit, message }) => ({
  id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  name,
  unit,
  message,
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
    const feedbacks = await readFeedbacks();
    const record = buildFeedbackRecord({ name: trimmedName, unit: trimmedUnit, message: trimmedMessage });
    const updated = [record, ...feedbacks];
    await writeFeedbacks(updated);
    res.status(201).json(record);
  } catch (error) {
    console.error('Không thể ghi ý kiến mới:', error);
    res.status(500).json({ message: 'Hệ thống đang gặp sự cố. Vui lòng thử lại sau.' });
  }
});

ensureDataFile()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Máy chủ đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Không thể khởi tạo dữ liệu ban đầu:', error);
    process.exit(1);
  });
