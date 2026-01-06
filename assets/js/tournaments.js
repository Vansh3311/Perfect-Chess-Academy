// assets/js/tournaments.js

document.addEventListener('DOMContentLoaded', () => {
  /* ============================================
     ELEMENT REFERENCES
     ============================================ */
  const cards = Array.from(document.querySelectorAll('.tournament-card'));
  const statusButtons = Array.from(document.querySelectorAll('.filter-btn[data-filter]'));
  const levelButtons = Array.from(document.querySelectorAll('.filter-btn[data-level]'));
  const searchInput = document.getElementById('tournamentSearch');
  const searchClear = document.getElementById('searchClear');
  const resultsCount = document.getElementById('resultsCount');
  const tournamentsGrid = document.getElementById('tournamentsGrid');
  const emptyState = document.getElementById('emptyState');

  const backToTopBtn = document.getElementById('back-to-top');
  const settingsToggle = document.querySelector('.settings-toggle');
  const settingsPanel = document.querySelector('.settings-panel');
  const settingsClose = document.querySelector('.settings-close');
  const resetSettingsBtn = document.getElementById('reset-settings');
  const themeToggle = document.getElementById('theme-toggle');
  const animationsToggle = document.getElementById('animations-toggle');
  const fontSmaller = document.getElementById('font-smaller');
  const fontLarger = document.getElementById('font-larger');
  const fontDisplay = document.getElementById('font-display');

  /* ============================================
     STATE
     ============================================ */
  let activeStatus = 'all';
  let activeLevel = 'all';
  let searchQuery = '';
  let fontScale = 1; // 1 = 100%

  /* ============================================
     FILTERING LOGIC
     ============================================ */
  function normalize(text) {
    return text.toLowerCase().trim();
  }

  function cardMatchesFilters(card) {
    const status = card.getAttribute('data-status') || 'all';
    const level = card.getAttribute('data-level') || 'all';

    // Status filter
    if (activeStatus !== 'all' && status !== activeStatus) {
      return false;
    }

    // Level filter
    if (activeLevel !== 'all' && level !== activeLevel) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const text = card.textContent || '';
      return normalize(text).includes(searchQuery);
    }

    return true;
  }

  function applyFilters() {
    let visibleCount = 0;

    cards.forEach(card => {
      if (cardMatchesFilters(card)) {
        card.style.display = '';
        visibleCount += 1;
      } else {
        card.style.display = 'none';
      }
    });

    if (visibleCount === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (tournamentsGrid) tournamentsGrid.style.display = 'none';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      if (tournamentsGrid) tournamentsGrid.style.display = 'grid';
    }

    if (resultsCount) {
      resultsCount.textContent = `Showing ${visibleCount} tournament${visibleCount === 1 ? '' : 's'}`;
    }
  }

  /* Status filter buttons */
  statusButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      statusButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeStatus = btn.getAttribute('data-filter') || 'all';
      applyFilters();
    });
  });

  /* Level filter buttons */
  levelButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      levelButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeLevel = btn.getAttribute('data-level') || 'all';
      applyFilters();
    });
  });

  /* Search input */
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchQuery = normalize(searchInput.value);
      if (searchClear) {
        searchClear.style.display = searchQuery ? 'flex' : 'none';
      }
      applyFilters();
    });
  }

  /* Clear search */
  if (searchClear) {
    searchClear.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      searchClear.style.display = 'none';
      applyFilters();
    });
  }

  /* ============================================
     FAQ ACCORDION
     ============================================ */
  const faqItems = Array.from(document.querySelectorAll('.faq-item'));

  faqItems.forEach(item => {
    const button = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    if (!button || !answer) return;

    button.setAttribute('aria-expanded', 'false');
    answer.setAttribute('hidden', 'true');

    button.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Close all
      faqItems.forEach(i => {
        i.classList.remove('active');
        const btn = i.querySelector('.faq-question');
        const ans = i.querySelector('.faq-answer');
        if (btn && ans) {
          btn.setAttribute('aria-expanded', 'false');
          ans.setAttribute('hidden', 'true');
        }
      });

      // Open current if it was closed
      if (!isActive) {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
        answer.removeAttribute('hidden');
      }
    });

    // Keyboard accessibility
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        button.click();
      }
    });
  });

  /* ============================================
     BACK TO TOP BUTTON
     ============================================ */
  function handleScroll() {
    const y = window.scrollY || window.pageYOffset;
    if (backToTopBtn) {
      if (y > 400) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  /* ============================================
     SMOOTH SCROLL FOR INTERNAL LINKS
     ============================================ */
  const internalLinks = Array.from(
    document.querySelectorAll('a[href^="#"]:not([href="#"])')
  );

  internalLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href').slice(1);
      const target = document.getElementById(targetId);
      if (!target) return;

      e.preventDefault();
      const offsetTop = target.getBoundingClientRect().top + window.scrollY - 80;

      window.scrollTo({
        top: offsetTop,
        behavior: 'smooth'
      });
    });
  });

  /* ============================================
     SETTINGS PANEL (THEME, ANIMATIONS, FONT)
     ============================================ */
  const STORAGE_KEYS = {
    THEME: 'pca-theme',
    ANIMATIONS: 'pca-animations',
    FONT: 'pca-font-scale'
  };

  function loadSettings() {
    const storedTheme = localStorage.getItem(STORAGE_KEYS.THEME);
    const storedAnimations = localStorage.getItem(STORAGE_KEYS.ANIMATIONS);
    const storedFont = localStorage.getItem(STORAGE_KEYS.FONT);

    if (storedTheme === 'light') {
      document.documentElement.classList.add('theme-light');
    }

    if (storedAnimations === 'off') {
      document.documentElement.classList.add('reduce-motion');
    }

    if (storedFont) {
      fontScale = parseFloat(storedFont) || 1;
      applyFontScale();
    }

    updateSettingsUI();
  }

  function updateSettingsUI() {
    if (themeToggle) {
      const isLight = document.documentElement.classList.contains('theme-light');
      themeToggle.dataset.mode = isLight ? 'light' : 'dark';
    }

    if (animationsToggle) {
      const isReduced = document.documentElement.classList.contains('reduce-motion');
      animationsToggle.dataset.animations = isReduced ? 'off' : 'on';
    }

    if (fontDisplay) {
      fontDisplay.textContent = `${Math.round(fontScale * 100)}%`;
    }
  }

  function applyFontScale() {
    document.documentElement.style.setProperty('--font-scale', fontScale);
    document.documentElement.style.fontSize = `${fontScale * 100}%`;
    if (fontDisplay) {
      fontDisplay.textContent = `${Math.round(fontScale * 100)}%`;
    }
  }

  // Open / close settings panel
  if (settingsToggle && settingsPanel && settingsClose) {
    settingsToggle.addEventListener('click', () => {
      settingsPanel.classList.add('open');
    });

    settingsClose.addEventListener('click', () => {
      settingsPanel.classList.remove('open');
    });

    document.addEventListener('click', (e) => {
      if (!settingsPanel.classList.contains('open')) return;
      if (settingsPanel.contains(e.target) || settingsToggle.contains(e.target)) return;
      settingsPanel.classList.remove('open');
    });
  }

  // Theme toggle
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isLight = document.documentElement.classList.toggle('theme-light');
      localStorage.setItem(STORAGE_KEYS.THEME, isLight ? 'light' : 'dark');
      updateSettingsUI();
    });
  }

  // Animations toggle
  if (animationsToggle) {
    animationsToggle.addEventListener('click', () => {
      const reduced = document.documentElement.classList.toggle('reduce-motion');
      localStorage.setItem(STORAGE_KEYS.ANIMATIONS, reduced ? 'off' : 'on');
      updateSettingsUI();
    });
  }

  // Font size controls
  if (fontSmaller) {
    fontSmaller.addEventListener('click', () => {
      fontScale = Math.max(0.85, fontScale - 0.05);
      applyFontScale();
      localStorage.setItem(STORAGE_KEYS.FONT, String(fontScale));
    });
  }

  if (fontLarger) {
    fontLarger.addEventListener('click', () => {
      fontScale = Math.min(1.25, fontScale + 0.05);
      applyFontScale();
      localStorage.setItem(STORAGE_KEYS.FONT, String(fontScale));
    });
  }

  // Reset settings
  if (resetSettingsBtn) {
    resetSettingsBtn.addEventListener('click', () => {
      document.documentElement.classList.remove('theme-light', 'reduce-motion');
      fontScale = 1;
      applyFontScale();
      localStorage.removeItem(STORAGE_KEYS.THEME);
      localStorage.removeItem(STORAGE_KEYS.ANIMATIONS);
      localStorage.removeItem(STORAGE_KEYS.FONT);
      updateSettingsUI();
    });
  }

  /* ============================================
     INITIALIZE
     ============================================ */
  loadSettings();
  applyFilters();
  handleScroll();
});
