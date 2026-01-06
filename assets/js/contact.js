/* ============================================
   CONTACT PAGE - COMPLETE JAVASCRIPT
   Perfect Chess Academy - Production Ready
   ============================================ */

(function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    formSubmitURL: 'process-contact.php', // Update with your backend endpoint
    phoneRegex: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
    emailRegex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    validationDelay: 500, // ms
    successRedirectDelay: 3000 // ms
  };

  // ============================================
  // DOM ELEMENTS CACHE
  // ============================================
  const DOM = {
    contactForm: null,
    formInputs: null,
    submitButton: null,
    formSuccess: null,
    faqQuestions: null,
    backToTop: null,
    quickContactButtons: null
  };

  // ============================================
  // STATE MANAGEMENT
  // ============================================
  const State = {
    isSubmitting: false,
    validationTimeouts: {},
    formData: {}
  };

  // ============================================
  // UTILITY FUNCTIONS
  // ============================================
  const Utils = {
    // Debounce function
    debounce: (func, wait) => {
      let timeout;
      return function executedFunction(...args) {
        const later = () => {
          clearTimeout(timeout);
          func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
      };
    },

    // Throttle function
    throttle: (func, limit) => {
      let inThrottle;
      return function(...args) {
        if (!inThrottle) {
          func.apply(this, args);
          inThrottle = true;
          setTimeout(() => inThrottle = false, limit);
        }
      };
    },

    // Format phone number
    formatPhoneNumber: (phone) => {
      const cleaned = phone.replace(/\D/g, '');
      if (cleaned.length === 10) {
        return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
      } else if (cleaned.length === 12) {
        return cleaned.replace(/(\d{2})(\d{5})(\d{5})/, '+$1 $2 $3');
      }
      return phone;
    },

    // Validate email
    validateEmail: (email) => {
      return CONFIG.emailRegex.test(email);
    },

    // Validate phone
    validatePhone: (phone) => {
      const cleaned = phone.replace(/\D/g, '');
      return cleaned.length >= 10 && cleaned.length <= 12;
    },

    // Sanitize input
    sanitizeInput: (input) => {
      const div = document.createElement('div');
      div.textContent = input;
      return div.innerHTML;
    },

    // Show error message
    showError: (fieldId, message) => {
      const errorElement = document.getElementById(`${fieldId}Error`);
      const inputElement = document.getElementById(fieldId);
      
      if (errorElement && inputElement) {
        errorElement.textContent = message;
        errorElement.style.display = 'block';
        inputElement.classList.add('error');
        inputElement.setAttribute('aria-invalid', 'true');
      }
    },

    // Clear error message
    clearError: (fieldId) => {
      const errorElement = document.getElementById(`${fieldId}Error`);
      const inputElement = document.getElementById(fieldId);
      
      if (errorElement && inputElement) {
        errorElement.textContent = '';
        errorElement.style.display = 'none';
        inputElement.classList.remove('error');
        inputElement.removeAttribute('aria-invalid');
      }
    },

    // Show success message
    showSuccess: (fieldId) => {
      const inputElement = document.getElementById(fieldId);
      if (inputElement) {
        inputElement.classList.add('success');
      }
    },

    // Smooth scroll to element
    smoothScrollTo: (element, offset = 0) => {
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // ============================================
  // FORM VALIDATION MODULE
  // ============================================
  const FormValidation = {
    validators: {
      name: (value) => {
        if (!value || value.trim().length < 2) {
          return 'Please enter your full name (at least 2 characters)';
        }
        if (value.trim().length > 100) {
          return 'Name is too long (maximum 100 characters)';
        }
        if (!/^[a-zA-Z\s\-']+$/.test(value)) {
          return 'Name can only contain letters, spaces, hyphens, and apostrophes';
        }
        return null;
      },

      email: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please enter your email address';
        }
        if (!Utils.validateEmail(value)) {
          return 'Please enter a valid email address (e.g., name@example.com)';
        }
        return null;
      },

      phone: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Please enter your phone number';
        }
        if (!Utils.validatePhone(value)) {
          return 'Please enter a valid phone number (10-12 digits)';
        }
        return null;
      },

      subject: (value) => {
        if (!value || value === '') {
          return 'Please select a subject';
        }
        return null;
      },

      message: (value) => {
        if (!value || value.trim().length < 10) {
          return 'Please enter your message (at least 10 characters)';
        }
        if (value.trim().length > 1000) {
          return 'Message is too long (maximum 1000 characters)';
        }
        return null;
      }
    },

    validateField: function(fieldId, value) {
      const validator = this.validators[fieldId];
      if (!validator) return true;

      const error = validator(value);
      
      if (error) {
        Utils.showError(fieldId, error);
        return false;
      } else {
        Utils.clearError(fieldId);
        Utils.showSuccess(fieldId);
        return true;
      }
    },

    validateAllFields: function() {
      let isValid = true;
      const fields = ['name', 'email', 'phone', 'subject', 'message'];
      
      fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (input) {
          const fieldValid = this.validateField(fieldId, input.value);
          if (!fieldValid) isValid = false;
        }
      });

      return isValid;
    }
  };

  // ============================================
  // FORM SUBMISSION MODULE
  // ============================================
  const FormSubmission = {
    init: function() {
      DOM.contactForm = document.getElementById('contactForm');
      
      if (!DOM.contactForm) return;

      DOM.contactForm.addEventListener('submit', this.handleSubmit.bind(this));
    },

    handleSubmit: async function(e) {
      e.preventDefault();

      // Prevent double submission
      if (State.isSubmitting) return;

      // Validate all fields
      if (!FormValidation.validateAllFields()) {
        this.showValidationError();
        return;
      }

      State.isSubmitting = true;
      this.showLoadingState();

      // Collect form data
      const formData = new FormData(DOM.contactForm);
      const data = {
        name: Utils.sanitizeInput(formData.get('name')),
        email: Utils.sanitizeInput(formData.get('email')),
        phone: Utils.sanitizeInput(formData.get('phone')),
        subject: Utils.sanitizeInput(formData.get('subject')),
        message: Utils.sanitizeInput(formData.get('message')),
        timestamp: new Date().toISOString(),
        source: 'contact_page'
      };

      try {
        // Send to backend
        const response = await this.submitToBackend(data);

        if (response.success) {
          this.showSuccessState();
          this.trackConversion(data);
          
          // Reset form after delay
          setTimeout(() => {
            DOM.contactForm.reset();
            this.clearAllValidation();
          }, 1000);
        } else {
          throw new Error(response.message || 'Submission failed');
        }
      } catch (error) {
        console.error('Form submission error:', error);
        this.showErrorState(error.message);
      } finally {
        State.isSubmitting = false;
      }
    },

    submitToBackend: async function(data) {
      // Simulate API call - Replace with actual backend endpoint
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('Form data submitted:', data);
          resolve({ success: true, message: 'Message sent successfully' });
        }, 1500);
      });

      /* Uncomment for real backend integration:
      const response = await fetch(CONFIG.formSubmitURL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      return await response.json();
      */
    },

    showLoadingState: function() {
      const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `
          <svg class="loading-spinner" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="12" cy="12" r="10" stroke-width="2" opacity="0.25"/>
            <path d="M12 2 A10 10 0 0 1 22 12" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span>Sending...</span>
        `;

        // Add spinner animation
        const style = document.createElement('style');
        style.textContent = `
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .loading-spinner {
            animation: spin 1s linear infinite;
          }
        `;
        document.head.appendChild(style);
      }
    },

    showSuccessState: function() {
      DOM.contactForm.style.display = 'none';
      DOM.formSuccess = document.getElementById('formSuccess');
      
      if (DOM.formSuccess) {
        DOM.formSuccess.style.display = 'block';
        DOM.formSuccess.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Add success animation
        DOM.formSuccess.style.opacity = '0';
        DOM.formSuccess.style.transform = 'scale(0.9)';
        
        requestAnimationFrame(() => {
          DOM.formSuccess.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
          DOM.formSuccess.style.opacity = '1';
          DOM.formSuccess.style.transform = 'scale(1)';
        });
      }

      // Show notification
      this.showNotification('Message sent successfully!', 'success');
    },

    showErrorState: function(message) {
      const submitBtn = DOM.contactForm.querySelector('button[type="submit"]');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = `
          <span>Send Message</span>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <line x1="22" y1="2" x2="11" y2="13" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        `;
      }

      this.showNotification(message || 'Failed to send message. Please try again.', 'error');
    },

    showValidationError: function() {
      const firstError = DOM.contactForm.querySelector('.form-input.error, .form-select.error, .form-textarea.error');
      if (firstError) {
        firstError.focus();
        Utils.smoothScrollTo(firstError, 100);
      }
      this.showNotification('Please correct the errors in the form', 'warning');
    },

    showNotification: function(message, type = 'info') {
      // Create notification element
      const notification = document.createElement('div');
      notification.className = `notification notification-${type}`;
      notification.innerHTML = `
        <div class="notification-content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            ${type === 'success' ? '<polyline points="20 6 9 17 4 12" stroke-width="2"/>' : 
              type === 'error' ? '<circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="15" y1="9" x2="9" y2="15" stroke-width="2"/><line x1="9" y1="9" x2="15" y2="15" stroke-width="2"/>' :
              '<circle cx="12" cy="12" r="10" stroke-width="2"/><line x1="12" y1="8" x2="12" y2="12" stroke-width="2"/><line x1="12" y1="16" x2="12.01" y2="16" stroke-width="2"/>'}
          </svg>
          <span>${message}</span>
        </div>
        <button class="notification-close" aria-label="Close notification">×</button>
      `;

      // Add styles
      notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        min-width: 300px;
        max-width: 400px;
        padding: 1rem 1.5rem;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#f59e0b'};
        color: white;
        border-radius: 0.75rem;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        opacity: 0;
        transform: translateX(400px);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      `;

      document.body.appendChild(notification);

      // Animate in
      requestAnimationFrame(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateX(0)';
      });

      // Close button handler
      notification.querySelector('.notification-close').addEventListener('click', () => {
        this.closeNotification(notification);
      });

      // Auto close after 5 seconds
      setTimeout(() => {
        this.closeNotification(notification);
      }, 5000);
    },

    closeNotification: function(notification) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(400px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    },

    clearAllValidation: function() {
      const fields = ['name', 'email', 'phone', 'subject', 'message'];
      fields.forEach(fieldId => {
        Utils.clearError(fieldId);
        const input = document.getElementById(fieldId);
        if (input) {
          input.classList.remove('success', 'error');
        }
      });
    },

    trackConversion: function(data) {
      // Google Analytics tracking
      if (typeof gtag !== 'undefined') {
        gtag('event', 'form_submission', {
          'event_category': 'Contact',
          'event_label': data.subject,
          'value': 1
        });
      }

      // Facebook Pixel tracking
      if (typeof fbq !== 'undefined') {
        fbq('track', 'Contact', {
          content_name: data.subject
        });
      }

      console.log('Conversion tracked:', data);
    }
  };

  // ============================================
  // REAL-TIME VALIDATION MODULE
  // ============================================
  const RealTimeValidation = {
    init: function() {
      const fields = ['name', 'email', 'phone', 'subject', 'message'];
      
      fields.forEach(fieldId => {
        const input = document.getElementById(fieldId);
        if (!input) return;

        // Validate on blur
        input.addEventListener('blur', () => {
          if (input.value.trim().length > 0) {
            FormValidation.validateField(fieldId, input.value);
          }
        });

        // Real-time validation with debounce
        input.addEventListener('input', Utils.debounce(() => {
          if (input.value.trim().length > 0) {
            FormValidation.validateField(fieldId, input.value);
          } else {
            Utils.clearError(fieldId);
            input.classList.remove('success');
          }
        }, CONFIG.validationDelay));

        // Clear error on focus
        input.addEventListener('focus', () => {
          Utils.clearError(fieldId);
        });
      });

      // Phone number formatting
      const phoneInput = document.getElementById('phone');
      if (phoneInput) {
        phoneInput.addEventListener('input', (e) => {
          const cursorPosition = e.target.selectionStart;
          const formatted = Utils.formatPhoneNumber(e.target.value);
          e.target.value = formatted;
          // Maintain cursor position
          e.target.setSelectionRange(cursorPosition, cursorPosition);
        });
      }
    }
  };

  // ============================================
  // FAQ ACCORDION MODULE
  // ============================================
  const FAQAccordion = {
    init: function() {
      DOM.faqQuestions = document.querySelectorAll('.faq-question');
      
      if (!DOM.faqQuestions.length) return;

      DOM.faqQuestions.forEach(question => {
        question.addEventListener('click', this.handleToggle.bind(this));
        
        // Keyboard accessibility
        question.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            this.handleToggle.call(this, e);
          }
        });
      });
    },

    handleToggle: function(event) {
      const question = event.currentTarget;
      const isExpanded = question.getAttribute('aria-expanded') === 'true';
      
      // Close all FAQs
      this.closeAllFAQs();
      
      // Toggle current FAQ
      if (!isExpanded) {
        this.openFAQ(question);
      }
    },

    openFAQ: function(question) {
      question.setAttribute('aria-expanded', 'true');
      const answer = question.nextElementSibling;
      if (answer) {
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    },

    closeFAQ: function(question) {
      question.setAttribute('aria-expanded', 'false');
      const answer = question.nextElementSibling;
      if (answer) {
        answer.style.maxHeight = '0';
      }
    },

    closeAllFAQs: function() {
      DOM.faqQuestions.forEach(q => this.closeFAQ(q));
    }
  };

  // ============================================
  // SMOOTH SCROLL MODULE
  // ============================================
  const SmoothScroll = {
    init: function() {
      const anchorLinks = document.querySelectorAll('a[href^="#"]');
      
      anchorLinks.forEach(anchor => {
        anchor.addEventListener('click', (e) => {
          const href = anchor.getAttribute('href');
          
          if (!href || href === '#') return;
          
          const target = document.querySelector(href);
          
          if (target) {
            e.preventDefault();
            const headerOffset = 80;
            Utils.smoothScrollTo(target, headerOffset);
            
            // Update URL
            if (history.pushState) {
              history.pushState(null, null, href);
            }
            
            // Set focus for accessibility
            target.setAttribute('tabindex', '-1');
            target.focus();
          }
        });
      });
    }
  };

  // ============================================
  // BACK TO TOP BUTTON MODULE
  // ============================================
  const BackToTop = {
    init: function() {
      DOM.backToTop = document.getElementById('back-to-top');
      
      if (!DOM.backToTop) return;

      // Show/hide on scroll
      window.addEventListener('scroll', Utils.throttle(() => {
        if (window.pageYOffset > 400) {
          DOM.backToTop.classList.add('visible');
        } else {
          DOM.backToTop.classList.remove('visible');
        }
      }, 200));

      // Scroll to top on click
      DOM.backToTop.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      });
    }
  };

  // ============================================
  // QUICK CONTACT TRACKING
  // ============================================
  const QuickContact = {
    init: function() {
      // Track quick contact button clicks
      const quickButtons = document.querySelectorAll('.quick-contact-btn, .method-link, .social-link');
      
      quickButtons.forEach(button => {
        button.addEventListener('click', (e) => {
          const contactType = this.getContactType(button);
          this.trackContactMethod(contactType);
        });
      });
    },

    getContactType: function(element) {
      if (element.href && element.href.includes('tel:')) return 'Phone';
      if (element.href && element.href.includes('wa.me')) return 'WhatsApp';
      if (element.href && element.href.includes('mailto:')) return 'Email';
      if (element.href && element.href.includes('maps')) return 'Directions';
      return 'Unknown';
    },

    trackContactMethod: function(method) {
      // Google Analytics
      if (typeof gtag !== 'undefined') {
        gtag('event', 'contact_method_click', {
          'event_category': 'Contact',
          'event_label': method
        });
      }

      console.log('Contact method clicked:', method);
    }
  };

  // ============================================
  // CHARACTER COUNTER MODULE
  // ============================================
  const CharacterCounter = {
    init: function() {
      const messageField = document.getElementById('message');
      if (!messageField) return;

      const counter = document.createElement('div');
      counter.className = 'character-counter';
      counter.style.cssText = `
        text-align: right;
        font-size: 0.875rem;
        color: var(--text-secondary);
        margin-top: 0.5rem;
      `;

      messageField.parentNode.appendChild(counter);

      const updateCounter = () => {
        const length = messageField.value.length;
        const max = 1000;
        counter.textContent = `${length} / ${max} characters`;
        
        if (length > max * 0.9) {
          counter.style.color = '#ef4444';
        } else {
          counter.style.color = 'var(--text-secondary)';
        }
      };

      messageField.addEventListener('input', updateCounter);
      updateCounter();
    }
  };

  // ============================================
  // ACCESSIBILITY ENHANCEMENTS
  // ============================================
  const Accessibility = {
    init: function() {
      // Skip to form link
      this.addSkipToFormLink();
      
      // Keyboard navigation
      this.enhanceKeyboardNav();
      
      // ARIA live regions
      this.setupLiveRegions();
    },

    addSkipToFormLink: function() {
      const skipLink = document.createElement('a');
      skipLink.href = '#contactForm';
      skipLink.className = 'skip-link';
      skipLink.textContent = 'Skip to contact form';
      skipLink.style.cssText = `
        position: absolute;
        top: -40px;
        left: 0;
        background: var(--accent-primary);
        color: var(--bg-primary);
        padding: 0.75rem 1.5rem;
        text-decoration: none;
        font-weight: 600;
        z-index: 10000;
        transition: top 0.2s ease;
      `;

      skipLink.addEventListener('focus', () => {
        skipLink.style.top = '0';
      });

      skipLink.addEventListener('blur', () => {
        skipLink.style.top = '-40px';
      });

      document.body.insertBefore(skipLink, document.body.firstChild);
    },

    enhanceKeyboardNav: function() {
      document.addEventListener('keydown', (e) => {
        // Escape key to close FAQs
        if (e.key === 'Escape') {
          FAQAccordion.closeAllFAQs();
        }
      });
    },

    setupLiveRegions: function() {
      const liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText = `
        position: absolute;
        left: -10000px;
        width: 1px;
        height: 1px;
        overflow: hidden;
      `;
      document.body.appendChild(liveRegion);
    }
  };

  // ============================================
  // AUTO-SAVE DRAFT MODULE (Optional)
  // ============================================
  const AutoSaveDraft = {
    storageKey: 'pca_contact_form_draft',

    init: function() {
      // Load saved draft
      this.loadDraft();

      // Auto-save on input
      const form = document.getElementById('contactForm');
      if (!form) return;

      form.addEventListener('input', Utils.debounce(() => {
        this.saveDraft();
      }, 1000));

      // Clear draft on successful submission
      form.addEventListener('submit', () => {
        setTimeout(() => {
          this.clearDraft();
        }, 2000);
      });
    },

    saveDraft: function() {
      const formData = {
        name: document.getElementById('name')?.value || '',
        email: document.getElementById('email')?.value || '',
        phone: document.getElementById('phone')?.value || '',
        subject: document.getElementById('subject')?.value || '',
        message: document.getElementById('message')?.value || '',
        timestamp: Date.now()
      };

      try {
        localStorage.setItem(this.storageKey, JSON.stringify(formData));
      } catch (e) {
        console.warn('Could not save draft:', e);
      }
    },

    loadDraft: function() {
      try {
        const draft = localStorage.getItem(this.storageKey);
        if (!draft) return;

        const formData = JSON.parse(draft);
        
        // Only load if less than 24 hours old
        if (Date.now() - formData.timestamp > 24 * 60 * 60 * 1000) {
          this.clearDraft();
          return;
        }

        // Populate fields
        if (formData.name) document.getElementById('name').value = formData.name;
        if (formData.email) document.getElementById('email').value = formData.email;
        if (formData.phone) document.getElementById('phone').value = formData.phone;
        if (formData.subject) document.getElementById('subject').value = formData.subject;
        if (formData.message) document.getElementById('message').value = formData.message;

        console.log('Draft loaded from local storage');
      } catch (e) {
        console.warn('Could not load draft:', e);
      }
    },

    clearDraft: function() {
      try {
        localStorage.removeItem(this.storageKey);
      } catch (e) {
        console.warn('Could not clear draft:', e);
      }
    }
  };

  // ============================================
  // INITIALIZE ALL MODULES
  // ============================================
  const App = {
    init: function() {
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => this.initModules());
      } else {
        this.initModules();
      }
    },

    initModules: function() {
      try {
        console.log('Initializing Contact Page...');

        // Initialize all modules
        FormSubmission.init();
        RealTimeValidation.init();
        FAQAccordion.init();
        SmoothScroll.init();
        BackToTop.init();
        QuickContact.init();
        CharacterCounter.init();
        Accessibility.init();
        AutoSaveDraft.init();

        console.log('Contact Page Initialized Successfully!');
      } catch (error) {
        console.error('Error initializing contact page:', error);
      }
    }
  };

  // ============================================
  // START APPLICATION
  // ============================================
  App.init();

})();

// ============================================
// EXTERNAL API
// ============================================
window.ContactPage = {
  scrollToForm: function() {
    const form = document.getElementById('contactForm');
    if (form) {
      form.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setTimeout(() => {
        document.getElementById('name')?.focus();
      }, 500);
    }
  },

  openFAQ: function(index) {
    const faqQuestions = document.querySelectorAll('.faq-question');
    if (faqQuestions[index]) {
      faqQuestions[index].click();
      setTimeout(() => {
        faqQuestions[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  },

  fillForm: function(data) {
    if (data.name) document.getElementById('name').value = data.name;
    if (data.email) document.getElementById('email').value = data.email;
    if (data.phone) document.getElementById('phone').value = data.phone;
    if (data.subject) document.getElementById('subject').value = data.subject;
    if (data.message) document.getElementById('message').value = data.message;
    this.scrollToForm();
  }
};

// ============================================
// ANALYTICS TRACKING
// ============================================
function trackEvent(category, action, label) {
  // Google Analytics
  if (typeof gtag !== 'undefined') {
    gtag('event', action, {
      'event_category': category,
      'event_label': label
    });
  }
  
  // Facebook Pixel
  if (typeof fbq !== 'undefined') {
    fbq('track', action, { category, label });
  }
}

// Track page interactions
document.addEventListener('click', (e) => {
  // Track contact method clicks
  if (e.target.closest('.contact-method-card')) {
    const method = e.target.closest('.contact-method-card').querySelector('h3')?.textContent;
    trackEvent('Contact', 'Method Card Click', method);
  }

  // Track branch clicks
  if (e.target.closest('.branch-card')) {
    const branch = e.target.closest('.branch-card').querySelector('h3')?.textContent;
    trackEvent('Contact', 'Branch Card Click', branch);
  }

  // Track CTA button clicks
  if (e.target.matches('.btn-primary, .btn-secondary')) {
    const buttonText = e.target.textContent.trim();
    trackEvent('Contact', 'CTA Click', buttonText);
  }
});
