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

const FEEDBACK_API = '/api/feedback';
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

const renderFeedbackList = () => {
  if (!feedbackList) return;
  feedbackList.innerHTML = '';

  if (!feedbackItems.length) {
    const emptyMessage = document.createElement('li');
    emptyMessage.textContent = 'Chưa có ý kiến nào. Hãy là người đầu tiên đóng góp!';
    emptyMessage.className = 'feedback__item feedback__item--empty';
    feedbackList.appendChild(emptyMessage);
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

const parseFeedback = (row) => ({
  id: row.id,
  name: row.name,
  unit: row.unit,
  message: row.message,
  recordedAt: new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(row.createdAt))
});

const loadFeedbacks = async () => {
  if (!feedbackList) return;
  feedbackList.innerHTML = '';
  const loading = document.createElement('li');
  loading.textContent = 'Đang tải ý kiến đã gửi...';
  loading.className = 'feedback__item feedback__item--empty';
  feedbackList.appendChild(loading);

  try {
    const response = await fetch(FEEDBACK_API, { headers: { Accept: 'application/json' } });
    if (!response.ok) {
      throw new Error('Không thể tải danh sách');
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Dữ liệu không hợp lệ');
    }
    feedbackItems = data.map(parseFeedback);
    renderFeedbackList();
    setFeedbackMessage('Hãy chia sẻ ý kiến của bạn để Ban Tổ chức kịp thời ghi nhận.');
  } catch (error) {
    console.error(error);
    setFeedbackMessage('Không thể tải danh sách ý kiến. Vui lòng thử lại sau.', 'error');
    feedbackList.innerHTML = '';
    const fail = document.createElement('li');
    fail.className = 'feedback__item feedback__item--empty';
    fail.textContent = 'Không thể tải danh sách ý kiến.';
    feedbackList.appendChild(fail);
  }
};

if (feedbackForm) {
  loadFeedbacks();

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
      const response = await fetch(FEEDBACK_API, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json'
        },
        body: JSON.stringify({ name, unit, message })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        const message = errorBody.error || 'Không thể gửi ý kiến. Vui lòng thử lại.';
        throw new Error(message);
      }

      const saved = await response.json();
      feedbackItems = [parseFeedback(saved), ...feedbackItems];
      renderFeedbackList();
      feedbackForm.reset();
      setFeedbackMessage('Cảm ơn bạn! Ý kiến đã được ghi nhận vào hệ thống.', 'success');
    } catch (error) {
      console.error(error);
      setFeedbackMessage(error.message || 'Không thể gửi ý kiến. Vui lòng thử lại.', 'error');
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Gửi ý kiến';
      }
    }
  });
}
