import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  getDocs,
  getDoc
} from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

let firebaseConfig = null;
let feedbackCollectionName = 'feedbacks';

try {
  const configModule = await import('./feedback-config.js');
  firebaseConfig = configModule.firebaseConfig || null;
  if (configModule.feedbackCollection) {
    feedbackCollectionName = configModule.feedbackCollection;
  }
} catch (error) {
  console.warn('Không tìm thấy file cấu hình Firebase (feedback-config.js).', error);
}

document.documentElement.classList.add('js-enabled');

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

// Document carousel handling
const carousel = document.querySelector('.documents__list');
const slides = carousel ? Array.from(carousel.querySelectorAll('.documents__item')) : [];
const prevControl = document.querySelector('.documents__nav--prev');
const nextControl = document.querySelector('.documents__nav--next');
const statusLabel = document.querySelector('.documents__status');
const dotButtons = Array.from(document.querySelectorAll('.documents__dot'));

if (carousel && slides.length > 0) {
  let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
  if (activeIndex === -1) {
    activeIndex = 0;
  }

  const totalSlides = slides.length;

  const updateSlides = (index) => {
    activeIndex = (index + totalSlides) % totalSlides;
    const offset = -(activeIndex * 100);
    carousel.style.transform = `translateX(${offset}%)`;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === activeIndex;
      slide.classList.toggle('is-active', isActive);
      slide.setAttribute('aria-hidden', String(!isActive));
      const article = slide.querySelector('[aria-roledescription="slide"]');
      if (article) {
        const title = article.dataset.title ? `${article.dataset.title.trim()} ` : '';
        article.setAttribute('aria-label', `${title}(${slideIndex + 1} / ${totalSlides})`);
      }
    });

    if (statusLabel) {
      statusLabel.textContent = `${activeIndex + 1} / ${totalSlides}`;
    }

    dotButtons.forEach((dot, dotIndex) => {
      const isActive = dotIndex === activeIndex;
      dot.classList.toggle('is-active', isActive);
      dot.setAttribute('aria-selected', String(isActive));
      dot.setAttribute('tabindex', isActive ? '0' : '-1');
    });
  };

  updateSlides(activeIndex);

  if (prevControl) {
    prevControl.addEventListener('click', () => {
      updateSlides(activeIndex - 1);
    });
  }

  if (nextControl) {
    nextControl.addEventListener('click', () => {
      updateSlides(activeIndex + 1);
    });
  }

  dotButtons.forEach((dot, dotIndex) => {
    dot.addEventListener('click', () => {
      updateSlides(dotIndex);
    });
  });

  const documentsSection = document.getElementById('documents');
  if (documentsSection) {
    documentsSection.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        updateSlides(activeIndex + 1);
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        updateSlides(activeIndex - 1);
      }
    });
  }
}

// Feedback handling
const feedbackForm = document.getElementById('feedbackForm');
const feedbackName = document.getElementById('feedbackName');
const feedbackUnit = document.getElementById('feedbackUnit');
const feedbackContent = document.getElementById('feedbackContent');
const feedbackMessage = document.querySelector('.feedback__message');
const feedbackList = document.getElementById('feedbackList');

let feedbackItems = [];

const setFeedbackMessage = (text, tone = 'info') => {
  if (!feedbackMessage) return;
  feedbackMessage.textContent = text;
  if (tone === 'error') {
    feedbackMessage.style.color = '#ffd166';
  } else if (tone === 'success') {
    feedbackMessage.style.color = '#b7f8c8';
  } else {
    feedbackMessage.style.color = '#ffffff';
  }
};

const showFeedbackListMessage = (text) => {
  if (!feedbackList) return;
  feedbackList.innerHTML = '';
  const messageItem = document.createElement('li');
  messageItem.textContent = text;
  messageItem.className = 'feedback__item feedback__item--empty';
  feedbackList.appendChild(messageItem);
};

const renderFeedbackList = () => {
  if (!feedbackList) return;
  feedbackList.innerHTML = '';

  if (!feedbackItems.length) {
    showFeedbackListMessage('Chưa có ý kiến nào. Hãy là người đầu tiên đóng góp!');
    return;
  }

  feedbackItems.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'feedback__item';

    const identity = document.createElement('div');
    identity.className = 'feedback__meta';

    const nameEl = document.createElement('p');
    nameEl.className = 'feedback__identity';
    nameEl.textContent = `${item.name} · ${item.unit}`;

    const time = document.createElement('span');
    time.textContent = item.recordedAt;
    time.className = 'feedback__time';

    identity.appendChild(nameEl);
    identity.appendChild(time);

    const content = document.createElement('p');
    content.textContent = item.message;
    content.style.margin = '0';

    li.appendChild(identity);
    li.appendChild(content);
    feedbackList.appendChild(li);
  });
};

const toDate = (value) => {
  if (!value) {
    return new Date();
  }

  if (value instanceof Date) {
    return value;
  }

  if (typeof value.toDate === 'function') {
    return value.toDate();
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return new Date();
  }
  return parsed;
};

const formatRecordedAt = (date) =>
  new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);

const mapFeedbackDoc = (id, data = {}) => ({
  id,
  name: data.name || 'Ẩn danh',
  unit: data.unit || 'Chưa rõ đơn vị',
  message: data.message || '',
  recordedAt: formatRecordedAt(toDate(data.createdAt))
});

const loadFeedbacksFromFirestore = async (database) => {
  const feedbackQuery = query(collection(database, feedbackCollectionName), orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(feedbackQuery);
  return snapshot.docs.map((doc) => mapFeedbackDoc(doc.id, doc.data()));
};

const submitFeedbackToFirestore = async (database, payload) => {
  const docRef = await addDoc(collection(database, feedbackCollectionName), {
    ...payload,
    createdAt: serverTimestamp()
  });
  const savedSnapshot = await getDoc(docRef);

  if (savedSnapshot.exists()) {
    return mapFeedbackDoc(savedSnapshot.id, savedSnapshot.data());
  }

  return mapFeedbackDoc(docRef.id, {
    ...payload,
    createdAt: new Date()
  });
};

const isFirebaseConfigReady = (config) => {
  if (!config || typeof config !== 'object') {
    return false;
  }
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'appId'];
  return requiredKeys.every((key) => {
    const value = config[key];
    return typeof value === 'string' && value.trim() && !value.includes('YOUR_FIREBASE_');
  });
};

const disableFeedbackForm = (message) => {
  setFeedbackMessage(message, 'error');
  showFeedbackListMessage(message);
  if (feedbackForm) {
    feedbackForm.querySelectorAll('input, textarea, button').forEach((element) => {
      element.disabled = true;
    });
  }
};

const initFeedbackFeature = async () => {
  if (!feedbackForm) {
    return;
  }

  if (!isFirebaseConfigReady(firebaseConfig)) {
    disableFeedbackForm('Hệ thống góp ý chưa được cấu hình. Vui lòng cập nhật thông tin Firebase.');
    return;
  }

  let firebaseApp;
  try {
    firebaseApp = initializeApp(firebaseConfig);
  } catch (error) {
    console.error(error);
    disableFeedbackForm('Không thể khởi tạo kết nối tới dịch vụ lưu trữ ý kiến.');
    return;
  }

  const database = getFirestore(firebaseApp);
  showFeedbackListMessage('Đang tải ý kiến đã gửi...');

  try {
    feedbackItems = await loadFeedbacksFromFirestore(database);
    renderFeedbackList();
    setFeedbackMessage('Hãy chia sẻ ý kiến của bạn để Ban Tổ chức kịp thời ghi nhận.');
  } catch (error) {
    console.error(error);
    setFeedbackMessage('Không thể tải danh sách ý kiến. Vui lòng thử lại sau.', 'error');
    showFeedbackListMessage('Không thể tải danh sách ý kiến.');
  }

  feedbackForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const name = feedbackName.value.trim();
    const unit = feedbackUnit.value.trim();
    const message = feedbackContent.value.trim();

    if (name.length < 3) {
      setFeedbackMessage('Vui lòng nhập họ và tên (tối thiểu 3 ký tự).', 'error');
      feedbackName.focus();
      return;
    }

    if (unit.length < 3) {
      setFeedbackMessage('Vui lòng nhập tên đơn vị đầy đủ.', 'error');
      feedbackUnit.focus();
      return;
    }

    if (message.length < 10) {
      setFeedbackMessage('Vui lòng nhập ý kiến chi tiết hơn (tối thiểu 10 ký tự).', 'error');
      feedbackContent.focus();
      return;
    }

    const submitButton = feedbackForm.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Đang gửi...';
    }

    try {
      const savedFeedback = await submitFeedbackToFirestore(database, {
        name,
        unit,
        message
      });
      feedbackItems = [savedFeedback, ...feedbackItems];
      renderFeedbackList();
      feedbackForm.reset();
      setFeedbackMessage('Cảm ơn bạn! Ý kiến đã được ghi nhận vào hệ thống.', 'success');
    } catch (error) {
      console.error(error);
      setFeedbackMessage('Không thể gửi ý kiến. Vui lòng thử lại.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Gửi ý kiến';
      }
    }
  });
};

initFeedbackFeature();
