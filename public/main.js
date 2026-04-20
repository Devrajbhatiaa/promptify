// ========== TOAST SYSTEM ==========
function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  const icons = {
    success: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    error: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
    info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`
  };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${message}</span>`;
  container.appendChild(toast);
  requestAnimationFrame(() => { requestAnimationFrame(() => { toast.classList.add('show'); }); });
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

// ========== MODAL SYSTEM ==========
function openModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.add('open'); document.body.style.overflow = 'hidden'; }
}
function closeModal(id) {
  const el = document.getElementById(id);
  if (el) { el.classList.remove('open'); document.body.style.overflow = ''; }
}
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    e.target.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (e.target.closest('[data-modal-close]')) {
    const id = e.target.closest('[data-modal-close]').dataset.modalClose;
    closeModal(id);
  }
  if (e.target.closest('[data-modal-open]')) {
    const id = e.target.closest('[data-modal-open]').dataset.modalOpen;
    openModal(id);
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      m.classList.remove('open');
      document.body.style.overflow = '';
    });
  }
});

// ========== COPY TO CLIPBOARD ==========
function copyToClipboard(text, btn) {
  navigator.clipboard.writeText(text).then(() => {
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg> Copied!`;
      btn.classList.add('copied');
      setTimeout(() => { btn.innerHTML = orig; btn.classList.remove('copied'); }, 1800);
    }
    showToast('Copied to clipboard!', 'success');
  });
}

// ========== DROPDOWN TOGGLE ==========
document.addEventListener('click', (e) => {
  const trigger = e.target.closest('[data-dropdown]');
  const menu = e.target.closest('.dropdown-menu');
  if (!trigger && !menu) {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    return;
  }
  if (trigger) {
    const targetId = trigger.dataset.dropdown;
    const targetMenu = document.getElementById(targetId);
    if (targetMenu) {
      const isOpen = targetMenu.classList.contains('open');
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
      if (!isOpen) targetMenu.classList.add('open');
    }
  }
});

// ========== NAV ACTIVE STATE ==========
document.addEventListener('DOMContentLoaded', () => {
  // theme toggle
  const root = document.documentElement;
  const themeToggles = document.querySelectorAll('#theme-toggle, #theme-toggle-mobile');
  const getTheme = () => (root.getAttribute('data-theme') === 'light' ? 'light' : 'dark');
  const applyThemeUI = () => {
    const theme = getTheme();
    themeToggles.forEach((btn) => {
      const icon = btn.querySelector('.theme-icon');
      const label = btn.querySelector('.theme-label');
      if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
      if (label) label.textContent = theme === 'light' ? 'Light' : 'Dark';
      btn.setAttribute('aria-pressed', String(theme === 'light'));
      btn.setAttribute('title', theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode');
    });
  };
  const setTheme = (theme) => {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem('theme', theme); } catch (e) {}
    applyThemeUI();
  };
  applyThemeUI();
  themeToggles.forEach((btn) => {
    btn.addEventListener('click', () => {
      setTheme(getTheme() === 'light' ? 'dark' : 'light');
    });
  });

  const path = window.location.pathname;
  document.querySelectorAll('.nav-links a, .mobile-menu a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && (path === href || path.startsWith(href + '/'))) {
      link.classList.add('active');
    }
  });

  // hamburger
  const ham = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');
  if (ham && mobileMenu) {
    ham.addEventListener('click', () => mobileMenu.classList.toggle('open'));
  }

  // stagger animations
  document.querySelectorAll('[data-stagger]').forEach((el, i) => {
    el.style.opacity = '0';
    el.style.animationDelay = `${i * 60}ms`;
    el.classList.add('slide-up');
    requestAnimationFrame(() => { el.style.opacity = ''; });
  });
});

// ========== CHAR COUNT ==========
function initCharCount(textareaId, countId) {
  const ta = document.getElementById(textareaId);
  const counter = document.getElementById(countId);
  if (!ta || !counter) return;
  const update = () => { counter.textContent = ta.value.length + ' chars'; };
  ta.addEventListener('input', update);
  update();
}

// ========== AUTO RESIZE TEXTAREA ==========
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = el.scrollHeight + 'px';
}
document.addEventListener('input', (e) => {
  if (e.target.dataset.autoresize) autoResize(e.target);
});
