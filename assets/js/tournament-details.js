/* ============================================
   TOURNAMENT DETAILS PAGE JAVASCRIPT
   Tabs, countdown, search, share functionality
   ============================================ */

document.addEventListener('DOMContentLoaded', function() {
  
  // ============================================
  // TABS FUNCTIONALITY
  // ============================================
  
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      const targetPanel = this.getAttribute('aria-controls');
      
      // Remove active class from all buttons and panels
      tabButtons.forEach(btn => {
        btn.classList.remove('active');
        btn.setAttribute('aria-selected', 'false');
      });
      
      tabPanels.forEach(panel => {
        panel.classList.remove('active');
        panel.setAttribute('hidden', '');
      });
      
      // Add active class to clicked button and corresponding panel
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      
      const activePanel = document.getElementById(targetPanel);
      if (activePanel) {
        activePanel.classList.add('active');
        activePanel.removeAttribute('hidden');
      }
      
      // Scroll to tabs section on mobile
      if (window.innerWidth < 768) {
        const tabsSection = document.querySelector('.tournament-tabs-section');
        if (tabsSection) {
          tabsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }
    });
  });
  
  // ============================================
  // COUNTDOWN TIMER
  // ============================================
  
  function initCountdown() {
    const countdownEl = document.querySelector('.hero-countdown');
    if (!countdownEl) return;
    
    const targetDate = new Date(countdownEl.dataset.date).getTime();
    
    function updateCountdown() {
      const now = new Date().getTime();
      const distance = targetDate - now;
      
      if (distance < 0) {
        countdownEl.innerHTML = '<div class="countdown-expired" style="text-align: center; font-size: 1.25rem; font-weight: 600; color: var(--text-secondary);">Registration Closed</div>';
        return;
      }
      
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      const daysEl = countdownEl.querySelector('[data-days]');
      const hoursEl = countdownEl.querySelector('[data-hours]');
      const minutesEl = countdownEl.querySelector('[data-minutes]');
      const secondsEl = countdownEl.querySelector('[data-seconds]');
      
      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minutesEl) minutesEl.textContent = String(minutes).padStart(2, '0');
      if (secondsEl) secondsEl.textContent = String(seconds).padStart(2, '0');
    }
    
    updateCountdown();
    setInterval(updateCountdown, 1000);
  }
  
  initCountdown();
  
  // ============================================
  // PARTICIPANT SEARCH
  // ============================================
  
  const participantSearch = document.getElementById('participantSearch');
  const participantsTableBody = document.getElementById('participantsTableBody');
  
  if (participantSearch && participantsTableBody) {
    participantSearch.addEventListener('input', function() {
      const searchTerm = this.value.toLowerCase().trim();
      const rows = participantsTableBody.querySelectorAll('tr');
      
      rows.forEach(row => {
        const playerName = row.querySelector('.player-name');
        const city = row.cells[3];
        
        if (playerName && city) {
          const nameText = playerName.textContent.toLowerCase();
          const cityText = city.textContent.toLowerCase();
          
          if (nameText.includes(searchTerm) || cityText.includes(searchTerm)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        }
      });
    });
  }
  
  // ============================================
  // SHARE FUNCTIONALITY
  // ============================================
  
  const shareButton = document.getElementById('shareButton');
  
  if (shareButton) {
    shareButton.addEventListener('click', async function() {
      const shareData = {
        title: document.title,
        text: 'Check out this chess tournament!',
        url: window.location.href
      };
      
      // Check if Web Share API is supported
      if (navigator.share) {
        try {
          await navigator.share(shareData);
          console.log('Shared successfully');
        } catch (err) {
          console.log('Error sharing:', err);
          fallbackShare();
        }
      } else {
        fallbackShare();
      }
    });
  }
  
  function fallbackShare() {
    // Fallback: Copy URL to clipboard
    const url = window.location.href;
    
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        showShareNotification('Link copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    } else {
      // Older browsers fallback
      const textarea = document.createElement('textarea');
      textarea.value = url;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        showShareNotification('Link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy:', err);
      }
      document.body.removeChild(textarea);
    }
  }
  
  function showShareNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 2rem;
      right: 2rem;
      padding: 1rem 1.5rem;
      background: var(--accent-primary);
      color: #1f2937;
      font-weight: 600;
      border-radius: 10px;
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }
  
  // Add animation styles
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(400px);
        opacity: 0;
      }
    }
  `;
  document.head.appendChild(style);
  
  // ============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        targetElement.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL without page jump
        if (history.pushState) {
          history.pushState(null, null, targetId);
        }
      }
    });
  });
  
  // ============================================
  // LAZY LOAD PARTICIPANTS (Simulate)
  // ============================================
  
  // This is a placeholder for loading more participants
  // In production, you would fetch data from an API
  function loadMoreParticipants() {
    // Simulated participant data
    const mockParticipants = [
      { rank: 6, name: 'Vikram Singh', initials: 'VS', rating: 1450, city: 'Bikaner', category: 'Open' },
      { rank: 7, name: 'Anjali Patel', initials: 'AP', rating: 1420, city: 'Jaipur', category: 'Women' },
      { rank: 8, name: 'Rahul Mehta', initials: 'RM', rating: 1390, city: 'Jodhpur', category: 'U-14' },
      // Add more as needed
    ];
    
    // This would be called on scroll or button click in production
    console.log('Load more participants:', mockParticipants);
  }
  
  // ============================================
  // KEYBOARD NAVIGATION FOR TABS
  // ============================================
  
  const tabsNav = document.querySelector('.tabs-navigation');
  
  if (tabsNav) {
    tabsNav.addEventListener('keydown', function(e) {
      const currentTab = document.activeElement;
      
      if (!currentTab.classList.contains('tab-button')) return;
      
      let nextTab = null;
      
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        nextTab = currentTab.nextElementSibling || tabButtons[0];
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        nextTab = currentTab.previousElementSibling || tabButtons[tabButtons.length - 1];
      } else if (e.key === 'Home') {
        e.preventDefault();
        nextTab = tabButtons[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        nextTab = tabButtons[tabButtons.length - 1];
      }
      
      if (nextTab) {
        nextTab.focus();
        nextTab.click();
      }
    });
  }
  
  // ============================================
  // AUTO-SWITCH TO HASH TAB ON PAGE LOAD
  // ============================================
  
  function switchToHashTab() {
    const hash = window.location.hash;
    if (!hash) return;
    
    const targetTabId = hash.replace('#', '') + '-tab';
    const targetTab = document.getElementById(targetTabId);
    
    if (targetTab) {
      targetTab.click();
    }
  }
  
  switchToHashTab();
  
  // Listen for hash changes
  window.addEventListener('hashchange', switchToHashTab);
  
  // ============================================
  // PRINT PAGE FUNCTIONALITY (Optional)
  // ============================================
  
  // Add a print button if needed
  const printButton = document.getElementById('printButton');
  if (printButton) {
    printButton.addEventListener('click', function() {
      window.print();
    });
  }
  
  // ============================================
  // REGISTRATION TRACKING (Analytics placeholder)
  // ============================================
  
  const registerButtons = document.querySelectorAll('.btn-hero-register, .btn-register-now');
  
  registerButtons.forEach(button => {
    button.addEventListener('click', function(e) {
      // Track registration click
      console.log('Registration button clicked');
      
      // In production, send to analytics:
      // gtag('event', 'tournament_registration_click', {
      //   'tournament_name': 'Bikaner District Championship 2025'
      // });
    });
  });
  
});
