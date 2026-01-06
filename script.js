// Modern Chess Academy Website JavaScript
class ChessAcademyApp {
  constructor() {
    this.mobileMenuOpen = false;
    this.settingsPanelOpen = false;
    this.mouseTrailEnabled = false;
    this.cursorTrail = [];
    this.lastMousePos = { x: -100, y: -100 };
    this.animationFrameId = null;
    // Bound event handler references (used so removeEventListener can match)
    this._boundHandleMove = null;
    this._boundTouchMove = null;
    this._boundTouchStart = null;
    this._boundTouchEnd = null;
    this._boundResizeCanvas = null;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.initScrollAnimations();
    this.initCounters();
    this.initMobileMenu();
    this.initFormHandling();
    this.initParallaxEffects();
    this.initSoundEffects();
    this.initFAQAccordion();
  }

  setupEventListeners() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.onDOMReady());
    } else {
      this.onDOMReady();
    }

    window.addEventListener("scroll", () => this.handleScroll());
    window.addEventListener("resize", () => this.handleResize());
  }

  onDOMReady() {
    const backToTopButton = document.getElementById("back-to-top");
    if (backToTopButton) {
      window.addEventListener("scroll", () => {
        if (window.pageYOffset > 300) {
          backToTopButton.classList.add("show");
        } else {
          backToTopButton.classList.remove("show");
        }
      });

      backToTopButton.addEventListener("click", () => {
        window.scrollTo({
          top: 0,
          behavior: document.documentElement.style.scrollBehavior || "smooth",
        });
      });
    }
  }

  initSoundEffects() {
    // Sound effects logic remains the same
  }

  initMobileMenu() {
    const hamburgerBtn = document.querySelector(".hamburger-btn");
    const mobileNavLinks = document.getElementById("nav-links-mobile");
    const mobileMenuBackdrop = document.querySelector(".mobile-menu-backdrop");
    const mobileMenuCloseBtn = document.querySelector(".mobile-menu-close"); // New
    const body = document.body;

    if (
      hamburgerBtn &&
      mobileNavLinks &&
      mobileMenuBackdrop &&
      mobileMenuCloseBtn
    ) {
      // Updated condition
      const toggleMobileMenu = () => {
        this.mobileMenuOpen = !this.mobileMenuOpen;
        body.classList.toggle("mobile-menu-is-open", this.mobileMenuOpen);
        hamburgerBtn.setAttribute("aria-expanded", this.mobileMenuOpen);

        // Optionally disable scroll when menu is open
        body.style.overflow = this.mobileMenuOpen ? "hidden" : "";

        if (this.mobileMenuOpen && localStorage.getItem("sound") === "true") {
          this.playSound("menu_open"); // Assuming a 'menu_open' sound exists
        } else if (
          !this.mobileMenuOpen &&
          localStorage.getItem("sound") === "true"
        ) {
          this.playSound("menu_close"); // Assuming a 'menu_close' sound exists
        }
      };

      hamburgerBtn.addEventListener("click", toggleMobileMenu);
      mobileMenuBackdrop.addEventListener("click", toggleMobileMenu);
      mobileMenuCloseBtn.addEventListener("click", toggleMobileMenu); // New event listener

      // Close menu when a navigation link is clicked (optional, but good UX)
      mobileNavLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
          if (this.mobileMenuOpen) {
            toggleMobileMenu();
          }
        });
      });

      // Close menu on resize if it's open and switches to desktop view (optional, but good UX)
      window.addEventListener("resize", () => {
        if (this.mobileMenuOpen && window.innerWidth > 1023) {
          // 1023px is the breakpoint from responsive.css
          toggleMobileMenu();
        }
      });
    }
  }

  initScrollAnimations() {
    if (document.body.classList.contains("no-visual-effects")) return;

    const animatedElements = document.querySelectorAll(".about-cta");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
      }
    );

    animatedElements.forEach((el) => {
      observer.observe(el);
    });
  }

  initCounters() {
    const counters = document.querySelectorAll(".stat-number");

    const counterObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.animateCounter(entry.target);
            counterObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );

    counters.forEach((counter) => counterObserver.observe(counter));
  }

  animateCounter(element) {
    if (document.body.classList.contains("no-visual-effects")) {
      element.textContent = parseInt(
        element.getAttribute("data-target")
      ).toLocaleString();
      return;
    }
    const target = parseInt(element.getAttribute("data-target"));
    if (isNaN(target)) {
      element.textContent = element.textContent || "0";
      return;
    }

    const duration = 2000;
    const frameDuration = 1000 / 60;
    const totalFrames = duration / frameDuration;
    const increment = target / totalFrames;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      element.textContent = Math.floor(current).toLocaleString();
    }, frameDuration);
  }

  initFormHandling() {
    // Form handling logic remains the same
  }

  initParallaxEffects() {
    if (document.body.classList.contains("no-visual-effects")) return;
    // Parallax effects logic remains the same
  }

  toggleMouseTrail(enable) {
    this.mouseTrailEnabled = enable;
    if (enable) {
      this.initCanvasTrail();
    } else {
      this.destroyCanvasTrail();
    }
  }

  initCanvasTrail() {
    if (!this.canvas) {
      this.canvas = document.createElement("canvas");
      this.canvas.id = "mouse-trail-canvas";
      document.body.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
    }

    this.canvas.style.position = "fixed";
    this.canvas.style.top = "0";
    this.canvas.style.left = "0";
    this.canvas.style.width = "100%";
    this.canvas.style.height = "100%";
    this.canvas.style.pointerEvents = "none";
    this.canvas.style.zIndex = "9999";

    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;

    this.trailPoints = [];
    this.mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    this.lastMouse = { x: this.mouse.x, y: this.mouse.y };
    this.mouseVelocity = { x: 0, y: 0 };
    this.isTouching = false;

    // Bind handlers once and store references so they can be removed later
    this._boundHandleMove = this.handleMove.bind(this);
    this._boundTouchMove = this.handleMove.bind(this);
    this._boundTouchStart = this.handleTouchStart.bind(this);
    this._boundTouchEnd = this.handleTouchEnd.bind(this);
    this._boundResizeCanvas = this.handleCanvasResize.bind(this);

    window.addEventListener("mousemove", this._boundHandleMove);
    window.addEventListener("touchmove", this._boundTouchMove);
    window.addEventListener("touchstart", this._boundTouchStart);
    window.addEventListener("touchend", this._boundTouchEnd);
    window.addEventListener("resize", this._boundResizeCanvas);

    if (!this.animationFrameId) {
      this.animateCanvasTrail();
    }
  }

  destroyCanvasTrail() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
      this.canvas = null;
      this.ctx = null;
    }
    // Remove the stored bound handlers
    if (this._boundHandleMove) {
      window.removeEventListener("mousemove", this._boundHandleMove);
      this._boundHandleMove = null;
    }
    if (this._boundTouchMove) {
      window.removeEventListener("touchmove", this._boundTouchMove);
      this._boundTouchMove = null;
    }
    if (this._boundTouchStart) {
      window.removeEventListener("touchstart", this._boundTouchStart);
      this._boundTouchStart = null;
    }
    if (this._boundTouchEnd) {
      window.removeEventListener("touchend", this._boundTouchEnd);
      this._boundTouchEnd = null;
    }
    if (this._boundResizeCanvas) {
      window.removeEventListener("resize", this._boundResizeCanvas);
      this._boundResizeCanvas = null;
    }
  }

  handleMove(e) {
    if (e.touches) {
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
    } else {
      this.mouse.x = e.clientX;
      this.mouse.y = e.clientY;
    }
  }

  handleTouchStart(e) {
    this.isTouching = true;
    if (e.touches && e.touches.length > 0) {
      this.mouse.x = e.touches[0].clientX;
      this.mouse.y = e.touches[0].clientY;
    }
  }

  handleTouchEnd() {
    this.isTouching = false;
  }

  handleCanvasResize() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  animateCanvasTrail() {
    if (!this.ctx) return;

    this.mouseVelocity.x = this.mouse.x - this.lastMouse.x;
    this.mouseVelocity.y = this.mouse.y - this.lastMouse.y;
    this.lastMouse.x = this.mouse.x;
    this.lastMouse.y = this.mouse.y;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.trailPoints.length - 1; i >= 0; i--) {
      const p = this.trailPoints[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vx *= 0.95;
      p.vy *= 0.95;
      p.life -= 0.02;

      if (p.life <= 0) {
        this.trailPoints.splice(i, 1);
      }
    }

    const isMoving =
      Math.abs(this.mouseVelocity.x) > 1 || Math.abs(this.mouseVelocity.y) > 1;

    if (isMoving || this.isTouching) {
      for (let i = 0; i < 2; i++) {
        this.trailPoints.push({
          x: this.mouse.x,
          y: this.mouse.y,
          vx: this.mouseVelocity.x * 0.1 * (Math.random() - 0.5),
          vy: this.mouseVelocity.y * 0.1 * (Math.random() - 0.5),
          life: 1,
        });
      }
    }

    this.trailPoints.forEach((p) => {
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      this.ctx.fillStyle = getComputedStyle(
        document.documentElement
      ).getPropertyValue("--accent-primary");
      this.ctx.globalAlpha = p.life * 0.5;
      this.ctx.fill();
    });

    this.animationFrameId = requestAnimationFrame(
      this.animateCanvasTrail.bind(this)
    );
  }

  handleScroll() {
    // Scroll handling logic remains the same
  }

  handleResize() {
    // Resize handling logic remains the same
  }

  initFAQAccordion() {
    const faqContainer = document.querySelector(".faq-container");
    if (!faqContainer) return;

    const faqItems = faqContainer.querySelectorAll(".faq-item");
    const expandAllBtn = document.querySelector(".faq-expand-all");

    faqItems.forEach((item) => {
      const questionButton = item.querySelector(".faq-question");
      questionButton.addEventListener("click", () => {
        const isActive = item.classList.contains("active");
        // This can be modified to allow multiple items open at once
        // faqItems.forEach(i => i.classList.remove('active'));
        if (isActive) {
          item.classList.remove("active");
          questionButton.setAttribute("aria-expanded", "false");
        } else {
          item.classList.add("active");
          questionButton.setAttribute("aria-expanded", "true");
        }
        this.updateExpandAllButtonState();
      });
    });

    if (expandAllBtn) {
      expandAllBtn.addEventListener("click", () => {
        const isAllExpanded = expandAllBtn.dataset.expanded === "true";
        faqItems.forEach((item) => {
          const questionButton = item.querySelector(".faq-question");
          if (isAllExpanded) {
            item.classList.remove("active");
            questionButton.setAttribute("aria-expanded", "false");
          } else {
            item.classList.add("active");
            questionButton.setAttribute("aria-expanded", "true");
          }
        });
        this.updateExpandAllButtonState();
      });
      this.updateExpandAllButtonState(); // Initial state
    }
  }

  updateExpandAllButtonState() {
    const expandAllBtn = document.querySelector(".faq-expand-all");
    if (!expandAllBtn) return;
    const faqItems = document.querySelectorAll(".faq-item");
    const activeItems = document.querySelectorAll(".faq-item.active");

    if (activeItems.length === faqItems.length) {
      expandAllBtn.textContent = "Collapse All";
      expandAllBtn.dataset.expanded = "true";
    } else {
      expandAllBtn.textContent = "Expand All";
      expandAllBtn.dataset.expanded = "false";
    }
  }
}

class TestimonialsSlider {
  constructor(container) {
    this.container = container;
    this.testimonials = container.querySelectorAll(".testimonial");
    this.dots = container.querySelectorAll(".dot");
    this.currentSlide = 0;
    this.intervalId = null;

    this.init();
  }

  init() {
    if (this.testimonials.length > 0) {
      this.showSlide(0);
      this.bindEvents();
      this.startAutoSlide();
    }
  }

  showSlide(index) {
    const wrapper = this.container.querySelector(".testimonial-wrapper");
    if (wrapper) {
      wrapper.style.transform = `translateX(-${index * 100}%)`;
    }

    this.dots.forEach((dot) => dot.classList.remove("active"));

    if (this.dots[index]) {
      this.dots[index].classList.add("active");
    }

    this.currentSlide = index;
  }

  nextSlide() {
    const next = (this.currentSlide + 1) % this.testimonials.length;
    this.showSlide(next);
  }

  bindEvents() {
    this.dots.forEach((dot, index) => {
      dot.addEventListener("click", () => {
        this.showSlide(index);
        this.restartAutoSlide();
      });
    });

    this.container.addEventListener("mouseenter", () => this.stopAutoSlide());
    this.container.addEventListener("mouseleave", () => this.startAutoSlide());
  }

  startAutoSlide() {
    if (document.body.classList.contains("no-visual-effects")) return;
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.nextSlide(), 4000);
  }

  stopAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  restartAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.chessApp = new ChessAcademyApp();

  const testimonialsContainer = document.querySelector(
    ".testimonials-container"
  );
  if (testimonialsContainer) {
    new TestimonialsSlider(testimonialsContainer);
  }

  document.querySelectorAll(".btn, .card, .nav-links a").forEach((element) => {
    element.addEventListener("click", (e) => {
      if (localStorage.getItem("sound") === "true" && window.chessApp) {
        window.chessApp.playSound("click");
      }
    });
  });
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = { ChessAcademyApp, TestimonialsSlider };
}

// ============================================
// AI Chatbot - Main Controller
// ============================================

class AIChatbot {
  constructor() {
    // DOM Elements
    this.chatButton = document.getElementById("aiChatButton");
    this.chatWindow = document.getElementById("aiChatWindow");
    this.closeBtn = document.getElementById("aiCloseBtn");
    this.minimizeBtn = document.getElementById("aiMinimizeBtn");
    this.sendBtn = document.getElementById("aiSendBtn");
    this.inputField = document.getElementById("aiInputField");
    this.messagesContainer = document.getElementById("aiChatMessages");
    this.typingIndicator = document.getElementById("aiTypingIndicator");
    this.notificationBadge = document.getElementById("aiNotificationBadge");
    this.charCount = document.getElementById("aiCharCount");
    this.quickActionBtns = document.querySelectorAll(".quick-action-btn");

    // State
    this.isOpen = false;
    this.messageHistory = [];

    // Initialize
    this.init();
  }

  init() {
    // Event Listeners
    this.chatButton.addEventListener("click", () => this.toggleChat());
    this.closeBtn.addEventListener("click", () => this.closeChat());
    this.minimizeBtn.addEventListener("click", () => this.closeChat());
    this.sendBtn.addEventListener("click", () => this.sendMessage());

    // Input handling
    this.inputField.addEventListener("input", (e) => this.handleInput(e));
    this.inputField.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });

    // Quick actions
    this.quickActionBtns.forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const action = e.target.dataset.action;
        this.handleQuickAction(action);
      });
    });

    // Load chat history from localStorage
    this.loadChatHistory();

    // Show notification after 3 seconds
    setTimeout(() => this.showNotification(), 3000);
  }

  toggleChat() {
    this.isOpen = !this.isOpen;

    if (this.isOpen) {
      this.openChat();
    } else {
      this.closeChat();
    }
  }

  openChat() {
    this.chatWindow.classList.add("active");
    this.isOpen = true;
    this.hideNotification();
    this.inputField.focus();

    // Analytics (optional)
    if (typeof gtag !== "undefined") {
      gtag("event", "chatbot_opened", {
        event_category: "engagement",
        event_label: "AI Chatbot",
      });
    }
  }

  closeChat() {
    this.chatWindow.classList.remove("active");
    this.isOpen = false;
  }

  handleInput(e) {
    const value = e.target.value;
    const length = value.length;

    // Update character count
    this.charCount.textContent = `${length}/500`;

    // Auto-resize textarea
    e.target.style.height = "auto";
    e.target.style.height = e.target.scrollHeight + "px";

    // Enable/disable send button
    this.sendBtn.disabled = length === 0;
  }

  async sendMessage() {
    const message = this.inputField.value.trim();

    if (!message) return;

    // Display user message
    this.displayMessage(message, "user");

    // Clear input
    this.inputField.value = "";
    this.inputField.style.height = "auto";
    this.charCount.textContent = "0/500";
    this.sendBtn.disabled = true;

    // Show typing indicator
    this.showTyping();

    // Simulate API call (replace with your Gemini API)
    try {
      const response = await this.callAI(message);
      this.hideTyping();
      this.displayMessage(response, "bot");
    } catch (error) {
      this.hideTyping();
      this.displayMessage(
        "Sorry, I encountered an error. Please try again.",
        "bot"
      );
      console.error("AI Error:", error);
    }

    // Save to history
    this.saveChatHistory();
  }

  async callAI(message) {
    // TODO: Replace with your actual Gemini API call
    // This is a placeholder that returns mock responses

    return new Promise((resolve) => {
      setTimeout(() => {
        const responses = {
          courses:
            "We offer 3 courses: Beginner (₹2,500/mo), Intermediate (₹4,000/mo), and Advanced (₹6,500/mo). Which interests you?",
          pricing:
            "Our pricing ranges from ₹2,500 to ₹6,500 per month depending on the course level. We also offer a free trial class!",
          contact:
            "You can reach us at talktokp23@gmail.com or call +91 92523 58993. Would you like to book a free trial?",
          tournament:
            "Our next tournament is the Bikaner District Championship on Dec 25-26, 2025. Registration is open!",
          default: `Thank you for your message! I'm currently being upgraded with Gemini 2.0 Flash. For immediate assistance, please contact us at +91 92523 58993.`,
        };

        // Simple keyword matching
        const lowerMessage = message.toLowerCase();
        let response = responses.default;

        for (const [key, value] of Object.entries(responses)) {
          if (lowerMessage.includes(key)) {
            response = value;
            break;
          }
        }

        resolve(response);
      }, 1500); // Simulate network delay
    });
  }

  displayMessage(text, sender) {
    const messageDiv = document.createElement("div");
    messageDiv.className = `ai-message ${sender}-message`;

    if (sender === "bot") {
      messageDiv.innerHTML = `
        <div class="message-avatar">
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
            <path d="M2 17L12 22L22 17"/>
            <path d="M2 12L12 17L22 12"/>
          </svg>
        </div>
        <div class="message-bubble">
          <p>${this.formatMessage(text)}</p>
        </div>
      `;
    } else {
      messageDiv.innerHTML = `
        <div class="message-bubble">
          <p>${this.escapeHtml(text)}</p>
        </div>
      `;
    }

    this.messagesContainer.appendChild(messageDiv);
    this.scrollToBottom();

    // Add to history
    this.messageHistory.push({ text, sender, timestamp: Date.now() });
  }

  formatMessage(text) {
    // Convert markdown-like syntax to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/\n/g, "<br>");
  }

  escapeHtml(text) {
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  handleQuickAction(action) {
    const messages = {
      courses: "Tell me about your courses",
      puzzle: "Give me a chess puzzle",
      pricing: "What is your pricing?",
      contact: "How can I contact you?",
    };

    const message = messages[action] || action;
    this.inputField.value = message;
    this.sendMessage();
  }

  showTyping() {
    this.typingIndicator.style.display = "flex";
    this.scrollToBottom();
  }

  hideTyping() {
    this.typingIndicator.style.display = "none";
  }

  scrollToBottom() {
    setTimeout(() => {
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }, 100);
  }

  showNotification() {
    if (!this.isOpen && this.notificationBadge) {
      this.notificationBadge.classList.remove("hidden");
    }
  }

  hideNotification() {
    if (this.notificationBadge) {
      this.notificationBadge.classList.add("hidden");
    }
  }

  saveChatHistory() {
    try {
      localStorage.setItem(
        "aiChatHistory",
        JSON.stringify(this.messageHistory)
      );
    } catch (e) {
      console.error("Failed to save chat history:", e);
    }
  }

  loadChatHistory() {
    try {
      const history = localStorage.getItem("aiChatHistory");
      if (history) {
        this.messageHistory = JSON.parse(history);
        // Optionally restore last few messages
        // this.messageHistory.slice(-5).forEach(msg => {
        //   this.displayMessage(msg.text, msg.sender);
        // });
      }
    } catch (e) {
      console.error("Failed to load chat history:", e);
    }
  }
}

// Initialize chatbot when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.aiChatbot = new AIChatbot();
});

/**
 * PROFESSIONAL MEGA MENU JAVASCRIPT
 * Perfect Chess Academy - 2025
 *
 * Features:
 * - WCAG 2.1 AA Compliant
 * - Keyboard Navigation (Tab, Escape, Arrow Keys)
 * - Touch & Click Support
 * - Mobile Accordion
 * - Performance Optimized for GoDaddy Shared Hosting
 * - No External Dependencies
 */

(function () {
  "use strict";

  // ======================
  // STATE MANAGEMENT
  // ======================
  const state = {
    currentOpenMenu: null,
    isMobileMenuOpen: false,
    touchStartX: 0,
    touchStartY: 0,
  };

  // ======================
  // DOM ELEMENTS
  // ======================
  const elements = {
    hamburger: document.querySelector(".hamburger-btn"),
    mobileMenu: document.querySelector(".mobile-menu"),
    mobileBackdrop: document.querySelector(".mobile-menu-backdrop"),
    mobileClose: document.querySelector(".mobile-menu-close"),
    body: document.body,

    // Desktop Mega Menus
    megaTriggers: document.querySelectorAll(".mega-trigger"),
    megaMenus: document.querySelectorAll(".mega-menu"),

    // Mobile Accordions
    mobileAccordions: document.querySelectorAll(".mobile-accordion-trigger"),
  };

  // ======================
  // DESKTOP MEGA MENU
  // ======================

  /**
   * Open mega menu with accessibility
   */
  function openMegaMenu(trigger, menu) {
    // Close any currently open menu
    if (state.currentOpenMenu && state.currentOpenMenu !== menu) {
      closeMegaMenu(state.currentOpenMenu);
    }

    // Open the menu
    menu.hidden = false;
    trigger.setAttribute("aria-expanded", "true");
    state.currentOpenMenu = menu;

    // Focus first link for keyboard users
    setTimeout(() => {
      const firstLink = menu.querySelector("a");
      if (firstLink && document.activeElement === trigger) {
        firstLink.focus();
      }
    }, 100);
  }

  /**
   * Close mega menu
   */
  function closeMegaMenu(menu) {
    if (!menu) return;

    const trigger = document.querySelector(`[aria-controls="${menu.id}"]`);
    menu.hidden = true;
    if (trigger) {
      trigger.setAttribute("aria-expanded", "false");
    }

    if (state.currentOpenMenu === menu) {
      state.currentOpenMenu = null;
    }
  }

  /**
   * Close all mega menus
   */
  function closeAllMegaMenus() {
    elements.megaMenus.forEach((menu) => {
      closeMegaMenu(menu);
    });
  }

  /**
   * Initialize desktop mega menu triggers
   */
  function initDesktopMegaMenu() {
    elements.megaTriggers.forEach((trigger) => {
      const menuId = trigger.getAttribute("aria-controls");
      const menu = document.getElementById(menuId);

      if (!menu) return;

      // Click/Touch to toggle
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();

        const isExpanded = trigger.getAttribute("aria-expanded") === "true";

        if (isExpanded) {
          closeMegaMenu(menu);
        } else {
          openMegaMenu(trigger, menu);
        }
      });

      // Keyboard support
      trigger.addEventListener("keydown", (e) => {
        switch (e.key) {
          case "Escape":
            closeMegaMenu(menu);
            trigger.focus();
            break;
          case "ArrowDown":
            e.preventDefault();
            if (trigger.getAttribute("aria-expanded") !== "true") {
              openMegaMenu(trigger, menu);
            }
            break;
        }
      });

      // Hover support for desktop (enhancement)
      if (window.matchMedia("(min-width: 1024px)").matches) {
        const parent = trigger.closest(".nav-item");

        parent.addEventListener("mouseenter", () => {
          openMegaMenu(trigger, menu);
        });

        parent.addEventListener("mouseleave", () => {
          closeMegaMenu(menu);
        });
      }
    });

    // Close menus when clicking outside
    document.addEventListener("click", (e) => {
      if (!e.target.closest(".has-mega-menu")) {
        closeAllMegaMenus();
      }
    });

    // Close on Escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllMegaMenus();
      }
    });
  }

  // ======================
  // MOBILE MENU
  // ======================

  /**
   * Open mobile menu
   */
  function openMobileMenu() {
    state.isMobileMenuOpen = true;
    elements.mobileMenu.classList.add("active");
    elements.mobileBackdrop.classList.add("active");
    elements.body.classList.add("mobile-menu-open");
    elements.hamburger.setAttribute("aria-expanded", "true");

    // Focus close button
    setTimeout(() => {
      elements.mobileClose.focus();
    }, 100);
  }

  /**
   * Close mobile menu
   */
  function closeMobileMenu() {
    state.isMobileMenuOpen = false;
    elements.mobileMenu.classList.remove("active");
    elements.mobileBackdrop.classList.remove("active");
    elements.body.classList.remove("mobile-menu-open");
    elements.hamburger.setAttribute("aria-expanded", "false");

    // Return focus to hamburger
    elements.hamburger.focus();
  }

  /**
   * Initialize mobile menu
   */
  function initMobileMenu() {
    // Hamburger toggle
    elements.hamburger?.addEventListener("click", () => {
      if (state.isMobileMenuOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    // Close button
    elements.mobileClose?.addEventListener("click", closeMobileMenu);

    // Backdrop click
    elements.mobileBackdrop?.addEventListener("click", closeMobileMenu);

    // Keyboard support
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && state.isMobileMenuOpen) {
        closeMobileMenu();
      }
    });

    // Swipe to close support
    elements.mobileMenu?.addEventListener("touchstart", handleTouchStart, {
      passive: true,
    });
    elements.mobileMenu?.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    elements.mobileMenu?.addEventListener("touchend", handleTouchEnd, {
      passive: true,
    });
  }

  /**
   * Touch handlers for swipe-to-close
   */
  function handleTouchStart(e) {
    state.touchStartX = e.touches[0].clientX;
    state.touchStartY = e.touches[0].clientY;
  }

  function handleTouchMove(e) {
    if (!state.touchStartX) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    const diffX = touchEndX - state.touchStartX;
    const diffY = Math.abs(touchEndY - state.touchStartY);

    // If swiping right more than 100px and vertical movement is less than horizontal
    if (diffX > 100 && diffY < 50) {
      e.preventDefault();
    }
  }

  function handleTouchEnd(e) {
    if (!state.touchStartX) return;

    const touchEndX = e.changedTouches[0].clientX;
    const diffX = touchEndX - state.touchStartX;

    // Swipe right to close
    if (diffX > 150) {
      closeMobileMenu();
    }

    state.touchStartX = 0;
    state.touchStartY = 0;
  }

  // ======================
  // MOBILE ACCORDION
  // ======================

  /**
   * Toggle mobile accordion
   */
  function toggleAccordion(trigger) {
    const content = trigger.nextElementSibling;
    const isExpanded = trigger.getAttribute("aria-expanded") === "true";

    if (isExpanded) {
      // Close
      trigger.setAttribute("aria-expanded", "false");
      content.hidden = true;
    } else {
      // Open
      trigger.setAttribute("aria-expanded", "true");
      content.hidden = false;
    }
  }

  /**
   * Initialize mobile accordions
   */
  function initMobileAccordions() {
    elements.mobileAccordions.forEach((trigger) => {
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        toggleAccordion(trigger);
      });

      // Keyboard support
      trigger.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          toggleAccordion(trigger);
        }
      });
    });
  }

  // ======================
  // RESPONSIVE BEHAVIOR
  // ======================

  /**
   * Handle resize events
   */
  function handleResize() {
    // Close mobile menu if resizing to desktop
    if (window.innerWidth >= 1024 && state.isMobileMenuOpen) {
      closeMobileMenu();
    }

    // Close mega menus if resizing to mobile
    if (window.innerWidth < 1024) {
      closeAllMegaMenus();
    }
  }

  // Debounce resize handler
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(handleResize, 150);
  });

  // ======================
  // PERFORMANCE OPTIMIZATION
  // ======================

  /**
   * Use Intersection Observer to lazy-load mega menu content if needed
   */
  function optimizeMegaMenus() {
    // Prevent mega menus from rendering until first interaction
    // This improves initial page load performance

    const observerOptions = {
      root: null,
      rootMargin: "50px",
      threshold: 0,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("loaded");
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    // Observe mega menu containers for performance
    elements.megaMenus.forEach((menu) => {
      observer.observe(menu);
    });
  }

  // ======================
  // INITIALIZATION
  // ======================

  /**
   * Initialize all mega menu functionality
   */
  function init() {
    // Check if elements exist
    if (!elements.hamburger) {
      console.warn("Mega Menu: Required elements not found");
      return;
    }

    // Initialize components
    initDesktopMegaMenu();
    initMobileMenu();
    initMobileAccordions();
    optimizeMegaMenus();

    console.log("✓ Mega Menu initialized successfully");
  }

  // ======================
  // AUTO-INITIALIZE
  // ======================

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  // ======================
  // PUBLIC API (Optional)
  // ======================

  // Expose public methods if needed
  window.MegaMenu = {
    open: openMobileMenu,
    close: closeMobileMenu,
    closeAllMega: closeAllMegaMenus,
  };
})();

//=============================================
//COURSES CARD - HOMEPAGE =====================
//=============================================

// Billing Toggle Functionality
document.addEventListener("DOMContentLoaded", () => {
  const toggle = document.getElementById("billing-toggle");
  const amounts = document.querySelectorAll(".amount");
  const annualNotes = document.querySelectorAll(".annual-note");

  toggle.addEventListener("change", (e) => {
    const isAnnual = e.target.checked;

    amounts.forEach((amount) => {
      const monthly = amount.dataset.monthly;
      const annual = amount.dataset.annual;

      // Animate number change
      animateValue(
        amount,
        parseInt(amount.textContent.replace(/,/g, "")),
        parseInt(isAnnual ? annual : monthly),
        300
      );
    });

    // Show/hide annual notes
    annualNotes.forEach((note) => {
      note.style.display = isAnnual ? "block" : "none";
    });
  });
});

// Smooth number animation
function animateValue(element, start, end, duration) {
  const range = end - start;
  const increment = range / (duration / 16);
  let current = start;

  const timer = setInterval(() => {
    current += increment;
    if (
      (increment > 0 && current >= end) ||
      (increment < 0 && current <= end)
    ) {
      element.textContent = end.toLocaleString();
      clearInterval(timer);
    } else {
      element.textContent = Math.round(current).toLocaleString();
    }
  }, 16);
}

// Track user interactions (Analytics)
document.querySelectorAll(".btn-cta").forEach((btn) => {
  btn.addEventListener("click", (e) => {
    const plan =
      e.currentTarget.closest(".pricing-card").dataset.plan || "unknown";

    // Google Analytics 4 event
    if (typeof gtag !== "undefined") {
      gtag("event", "pricing_cta_click", {
        plan_name: plan,
        button_text: e.currentTarget.textContent.trim(),
      });
    }
  });
});

// Scroll animations (optional)
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1";
        entry.target.style.transform = "translateY(0)";
      }
    });
  },
  { threshold: 0.1 }
);

document.querySelectorAll(".pricing-card").forEach((card) => {
  card.style.opacity = "0";
  card.style.transform = "translateY(30px)";
  card.style.transition = "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)";
  observer.observe(card);
});

// =============================================
// TOURNAMENT AND UPCOMING EVENTS PAGE =========
// =============================================

// Add ripple click effect (optional enhancement)
document.querySelectorAll(".event-actions .btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    // Ripple effect is handled by CSS :active pseudo-class
    // This is just for analytics if needed
    const eventTitle =
      this.closest(".event-card").querySelector(".event-title").textContent;
    console.log("Button clicked for:", eventTitle);
  });
});

// Smooth scroll to tournaments page
document
  .querySelector(".section-footer .btn")
  ?.addEventListener("click", (e) => {
    if (e.target.getAttribute("href") === "tournaments.html") {
      // Optional: Add loading state
      e.target.textContent = "Loading...";
    }
  });
