const modal = document.getElementById('documentModal');
const modalViewer = document.getElementById('modalViewer');
const modalCloseTargets = modal.querySelectorAll('[data-close="true"]');
const documentButtons = document.querySelectorAll('[data-pdf]');
const body = document.body;

const openModal = (pdfUrl) => {
  modalViewer.src = pdfUrl;
  modal.removeAttribute('hidden');
  body.style.overflow = 'hidden';
};

const closeModal = () => {
  modalViewer.src = '';
  modal.setAttribute('hidden', '');
  body.style.overflow = '';
};

documentButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const pdfUrl = button.getAttribute('data-pdf');
    openModal(pdfUrl);
  });
});

modalCloseTargets.forEach((element) => {
  element.addEventListener('click', (event) => {
    event.preventDefault();
    closeModal();
  });
});

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !modal.hasAttribute('hidden')) {
    closeModal();
  }
});

modal.addEventListener('click', (event) => {
  if (event.target.dataset.close === 'true') {
    closeModal();
  }
});

// Feedback handling
const feedbackForm = document.getElementById('feedbackForm');
const feedbackContent = document.getElementById('feedbackContent');
const feedbackMessage = document.querySelector('.feedback__message');
const feedbackList = document.getElementById('feedbackList');

const STORAGE_KEY = 'dai-hoi-doan-386-feedbacks';

const loadFeedbacks = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const data = JSON.parse(stored);
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.warn('Không thể tải ý kiến đã lưu:', error);
    return [];
  }
};

const saveFeedbacks = (items) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const feedbacks = loadFeedbacks();

const renderFeedbackList = () => {
  feedbackList.innerHTML = '';

  if (feedbacks.length === 0) {
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'Chưa có ý kiến nào. Hãy là người đầu tiên đóng góp!';
    emptyMessage.className = 'feedback__item feedback__item--empty';
    feedbackList.appendChild(emptyMessage);
    return;
  }

  feedbacks.slice().reverse().forEach((item) => {
    const li = document.createElement('li');
    li.className = 'feedback__item';

    const content = document.createElement('p');
    content.textContent = item.message;
    content.style.margin = '0';

    const time = document.createElement('span');
    time.textContent = item.time;
    time.className = 'feedback__time';

    li.appendChild(content);
    li.appendChild(time);
    feedbackList.appendChild(li);
  });
};

renderFeedbackList();

const formatTimestamp = (date) => {
  return new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
};

feedbackForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const message = feedbackContent.value.trim();

  if (message.length < 10) {
    feedbackMessage.textContent = 'Vui lòng nhập ý kiến chi tiết hơn (tối thiểu 10 ký tự).';
    feedbackMessage.style.color = '#ffd166';
    feedbackContent.focus();
    return;
  }

  const newFeedback = {
    message,
    time: formatTimestamp(new Date())
  };

  feedbacks.push(newFeedback);
  saveFeedbacks(feedbacks);
  renderFeedbackList();

  feedbackForm.reset();
  feedbackMessage.textContent = 'Cảm ơn bạn! Ý kiến đã được ghi nhận ẩn danh.';
  feedbackMessage.style.color = '#ffffff';
});
