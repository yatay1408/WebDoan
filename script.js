(() => {
  'use strict';

  document.documentElement.classList.add('js-enabled');

  const modal = document.getElementById('documentModal');
  const modalViewer = document.getElementById('modalViewer');
  const modalCloseTargets = modal ? modal.querySelectorAll('[data-close="true"]') : [];
  const documentTriggers = document.querySelectorAll('[data-pdf]');
  const mobileQuery = window.matchMedia('(max-width: 767px)');
  const body = document.body;

  const isDesktopViewport = () => !mobileQuery.matches;

  const forceDownload = (pdfUrl) => {
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.setAttribute('download', pdfUrl.split('/').pop() || 'document.pdf');
    link.rel = 'noopener';
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const updateTriggerDownloadAttribute = () => {
    const useModal = isDesktopViewport();
    documentTriggers.forEach((trigger) => {
      if (useModal) {
        trigger.removeAttribute('download');
      } else {
        trigger.setAttribute('download', '');
      }
    });
  };

  const openModal = (pdfUrl) => {
    if (!modal || !modalViewer) {
      window.open(pdfUrl, '_blank');
      return;
    }

    modalViewer.src = pdfUrl;
    modal.removeAttribute('hidden');
    body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    if (!modal || !modalViewer) {
      return;
    }
    modalViewer.src = '';
    modal.setAttribute('hidden', '');
    body.style.overflow = '';
  };

  documentTriggers.forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      const pdfUrl = trigger.getAttribute('data-pdf') || trigger.getAttribute('href');
      if (!pdfUrl) {
        return;
      }

      if (isDesktopViewport()) {
        if (event) {
          event.preventDefault();
        }
        openModal(pdfUrl);
        return;
      }

      if (event) {
        event.preventDefault();
      }
      forceDownload(pdfUrl);
    });
  });

  modalCloseTargets.forEach((element) => {
    element.addEventListener('click', (event) => {
      event.preventDefault();
      closeModal();
    });
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });

  if (modal) {
    modal.addEventListener('click', (event) => {
      if (event.target instanceof HTMLElement && event.target.dataset.close === 'true') {
        closeModal();
      }
    });
  }

  // Feedback handling
  const feedbackForm = document.getElementById('feedbackForm');
  const feedbackName = document.getElementById('feedbackName');
  const feedbackUnit = document.getElementById('feedbackUnit');
  const feedbackContent = document.getElementById('feedbackContent');
  const feedbackMessage = document.querySelector('.feedback__message');
  const feedbackList = document.getElementById('feedbackList');
  const FEEDBACK_ENDPOINT = '/api/feedbacks';

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

  const disableFeedbackForm = (message) => {
    setFeedbackMessage(message, 'error');
    showFeedbackListMessage(message);
    if (!feedbackForm) return;
    feedbackForm.querySelectorAll('input, textarea, button').forEach((element) => {
      element.disabled = true;
    });
  };

  const fetchFeedbacks = async () => {
    if (!feedbackForm) return;

    showFeedbackListMessage('Đang tải ý kiến đã gửi...');

    try {
      const response = await fetch(FEEDBACK_ENDPOINT, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`Failed to load feedbacks: ${response.status}`);
      }

      const data = await response.json();
      if (Array.isArray(data)) {
        feedbackItems = data;
      } else {
        feedbackItems = [];
      }
      renderFeedbackList();
      setFeedbackMessage('Hãy chia sẻ ý kiến của bạn để Ban Tổ chức kịp thời ghi nhận.');
    } catch (error) {
      console.error(error);
      disableFeedbackForm('Không thể kết nối tới hệ thống góp ý. Vui lòng chạy máy chủ backend.');
    }
  };

  const submitFeedback = async (payload) => {
    const response = await fetch(FEEDBACK_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const message = errorData.message || 'Không thể gửi ý kiến. Vui lòng thử lại.';
      throw new Error(message);
    }

    return response.json();
  };

  const initFeedbackFeature = () => {
    if (!feedbackForm) {
      return;
    }

    fetchFeedbacks();

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
        const savedFeedback = await submitFeedback({ name, unit, message });
        feedbackItems = [savedFeedback, ...feedbackItems];
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
  };

  updateTriggerDownloadAttribute();
  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', updateTriggerDownloadAttribute);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(updateTriggerDownloadAttribute);
  }

  initFeedbackFeature();
})();
