/**
 * COURSES PAGE REDESIGN - JavaScript
 * Perfect Chess Academy
 * Handles filtering, modals, forms, and interactivity
 */

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  initializeFilters();
  initializeModals();
  initializeFAQ();
  initializeDatePicker();
  initializeSmoothScroll();
  initializeStickyFilterBar();
});

// ============================================
// FILTER FUNCTIONALITY
// ============================================
function initializeFilters() {
  const filterButtons = document.querySelectorAll(".filter-btn");
  const ageFilter = document.getElementById("ageFilter");
  const courseCards = document.querySelectorAll(".course-card");

  let activeFilters = {
    level: "all",
    format: "all",
    age: "all",
  };

  // Level Filter
  filterButtons.forEach((btn) => {
    btn.addEventListener("click", function () {
      const filterType =
        this.getAttribute("data-filter") || this.getAttribute("data-format");
      const parentGroup = this.closest(".filter-group");

      // Remove active class from siblings
      parentGroup.querySelectorAll(".filter-btn").forEach((sibling) => {
        sibling.classList.remove("active");
      });

      // Add active class to clicked button
      this.classList.add("active");

      // Update active filters
      if (this.hasAttribute("data-filter")) {
        activeFilters.level = filterType;
      } else if (this.hasAttribute("data-format")) {
        activeFilters.format = filterType;
      }

      // Apply filters
      applyFilters(courseCards, activeFilters);
    });
  });

  // Age Filter
  if (ageFilter) {
    ageFilter.addEventListener("change", function () {
      activeFilters.age = this.value;
      applyFilters(courseCards, activeFilters);
    });
  }
}

function applyFilters(cards, filters) {
  let visibleCount = 0;

  cards.forEach((card) => {
    const cardLevel = card.getAttribute("data-level");
    const cardFormat = card.getAttribute("data-format");
    const cardAge = card.getAttribute("data-age");

    let showCard = true;

    // Check level filter
    if (filters.level !== "all" && cardLevel !== filters.level) {
      showCard = false;
    }

    // Check format filter
    if (
      filters.format !== "all" &&
      cardFormat !== "both" &&
      cardFormat !== filters.format
    ) {
      showCard = false;
    }

    // Check age filter
    if (filters.age !== "all") {
      if (!isAgeInRange(cardAge, filters.age)) {
        showCard = false;
      }
    }

    // Show/hide card with animation
    if (showCard) {
      card.style.display = "block";
      setTimeout(() => {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }, 10);
      visibleCount++;
    } else {
      card.style.opacity = "0";
      card.style.transform = "translateY(20px)";
      setTimeout(() => {
        card.style.display = "none";
      }, 300);
    }
  });

  // Show message if no courses match
  showFilterMessage(visibleCount);
}

function isAgeInRange(cardAge, filterAge) {
  // Parse card age (e.g., "6-12" or "10-18")
  const ageRanges = cardAge.split(",").map((range) => range.trim());

  for (let range of ageRanges) {
    if (range.includes("-")) {
      const [min, max] = range.split("-").map(Number);

      switch (filterAge) {
        case "6-9":
          if (min <= 9 && max >= 6) return true;
          break;
        case "10-14":
          if (min <= 14 && max >= 10) return true;
          break;
        case "15-18":
          if (min <= 18 && max >= 15) return true;
          break;
        case "adult":
          if (max >= 18) return true;
          break;
      }
    }
  }
  return false;
}

function showFilterMessage(visibleCount) {
  const existingMessage = document.querySelector(".filter-no-results");

  if (visibleCount === 0) {
    if (!existingMessage) {
      const message = document.createElement("div");
      message.className = "filter-no-results";
      message.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem; color: var(--text-secondary);">
                    <i class="fas fa-search" style="font-size: 3rem; color: var(--accent-primary); margin-bottom: 1rem;"></i>
                    <h3 style="color: var(--text-primary); margin-bottom: 1rem;">No Courses Match Your Filters</h3>
                    <p>Try adjusting your filters or <a href="#" onclick="resetAllFilters(); return false;" style="color: var(--accent-primary); text-decoration: underline;">reset all filters</a></p>
                </div>
            `;
      document
        .querySelector(".courses-grid-section .container")
        .appendChild(message);
    }
  } else {
    if (existingMessage) {
      existingMessage.remove();
    }
  }
}

function resetAllFilters() {
  // Reset all filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.classList.remove("active");
    if (
      btn.getAttribute("data-filter") === "all" ||
      btn.getAttribute("data-format") === "all"
    ) {
      btn.classList.add("active");
    }
  });

  // Reset age select
  const ageFilter = document.getElementById("ageFilter");
  if (ageFilter) {
    ageFilter.value = "all";
  }

  // Show all cards
  document.querySelectorAll(".course-card").forEach((card) => {
    card.style.display = "block";
    card.style.opacity = "1";
    card.style.transform = "translateY(0)";
  });

  // Remove no results message
  const message = document.querySelector(".filter-no-results");
  if (message) message.remove();
}

// ============================================
// MODAL FUNCTIONALITY
// ============================================
function initializeModals() {
  // Close modal when clicking overlay
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", function () {
      this.closest(".modal").classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close modal when clicking close button
  document.querySelectorAll(".modal-close").forEach((closeBtn) => {
    closeBtn.addEventListener("click", function () {
      this.closest(".modal").classList.remove("active");
      document.body.style.overflow = "";
    });
  });

  // Close modal with Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.querySelectorAll(".modal.active").forEach((modal) => {
        modal.classList.remove("active");
        document.body.style.overflow = "";
      });
    }
  });

  // Initialize trial form submission
  const trialForm = document.getElementById("trialForm");
  if (trialForm) {
    trialForm.addEventListener("submit", submitTrialForm);
  }
}

function openTrialModal(courseId = null) {
  const modal = document.getElementById("trialModal");
  const courseSelect = document.getElementById("trialCourse");

  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Pre-select course if provided
    if (courseId && courseSelect) {
      courseSelect.value = courseId;
    }

    // Focus first input
    setTimeout(() => {
      const firstInput = modal.querySelector("input, select");
      if (firstInput) firstInput.focus();
    }, 100);
  }
}

function closeTrialModal() {
  const modal = document.getElementById("trialModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";

    // Reset form
    const form = document.getElementById("trialForm");
    if (form) form.reset();
  }
}

function openEnrollModal(courseId) {
  const modal = document.getElementById("enrollModal");
  if (modal) {
    modal.classList.add("active");
    document.body.style.overflow = "hidden";

    // Store course ID for enrollment
    modal.setAttribute("data-course-id", courseId);
  }
}

function closeEnrollModal() {
  const modal = document.getElementById("enrollModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

function goToEnrollmentPage() {
  const modal = document.getElementById("enrollModal");
  const courseId = modal ? modal.getAttribute("data-course-id") : "";

  // Redirect to enrollment page (you'll need to create this)
  window.location.href = `enrollment.html?course=${courseId}`;
}

// ============================================
// FORM SUBMISSION
// ============================================
function submitTrialForm(event) {
  event.preventDefault();

  const form = event.target;
  const formData = new FormData(form);
  const submitBtn = form.querySelector('button[type="submit"]');

  // Validate form
  if (!form.checkValidity()) {
    form.reportValidity();
    return false;
  }

  // Disable submit button
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Submitting...';

  // Convert FormData to object
  const data = {};
  formData.forEach((value, key) => {
    data[key] = value;
  });

  // AJAX submission (replace with your actual endpoint)
  fetch("api/trial-booking.php", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.success) {
        // Show success message
        showSuccessMessage(
          "Trial class booked successfully! We'll contact you within 2 hours."
        );

        // Close modal after delay
        setTimeout(() => {
          closeTrialModal();
        }, 2000);

        // Redirect to WhatsApp
        setTimeout(() => {
          const phone = data.phone;
          const studentName = data.studentName;
          const course = data.course;
          const message = `Hi! I just booked a trial class for ${studentName} in the ${course} course. Looking forward to it!`;
          openWhatsAppWithMessage(message);
        }, 2500);
      } else {
        showErrorMessage(
          result.message || "Something went wrong. Please try again."
        );
        submitBtn.disabled = false;
        submitBtn.innerHTML =
          '<i class="fas fa-calendar-check"></i> Book My Free Trial Class';
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      showErrorMessage(
        "Network error. Please check your connection and try again."
      );
      submitBtn.disabled = false;
      submitBtn.innerHTML =
        '<i class="fas fa-calendar-check"></i> Book My Free Trial Class';
    });

  return false;
}

function showSuccessMessage(message) {
  const toast = createToast("success", message);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

function showErrorMessage(message) {
  const toast = createToast("error", message);
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.add("show");
  }, 100);

  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 5000);
}

function createToast(type, message) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <i class="fas fa-${
          type === "success" ? "check-circle" : "exclamation-circle"
        }"></i>
        <span>${message}</span>
    `;

  // Add toast styles if not already in CSS
  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === "success" ? "#10b981" : "#ef4444"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
    `;

  return toast;
}

// ============================================
// FAQ ACCORDION
// ============================================
function initializeFAQ() {
  const faqQuestions = document.querySelectorAll(".faq-question");

  faqQuestions.forEach((question) => {
    question.addEventListener("click", function () {
      const isExpanded = this.getAttribute("aria-expanded") === "true";

      // Close all other FAQs (optional - remove if you want multiple open)
      faqQuestions.forEach((q) => {
        q.setAttribute("aria-expanded", "false");
      });

      // Toggle current FAQ
      this.setAttribute("aria-expanded", !isExpanded);
    });
  });
}

// ============================================
// DATE PICKER INITIALIZATION
// ============================================
function initializeDatePicker() {
  const dateInput = document.getElementById("preferredDate");
  if (dateInput) {
    // Set minimum date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const minDate = tomorrow.toISOString().split("T")[0];
    dateInput.setAttribute("min", minDate);

    // Set maximum date to 30 days from now
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    dateInput.setAttribute("max", maxDate.toISOString().split("T")[0]);
  }
}

// ============================================
// SMOOTH SCROLLING
// ============================================
function initializeSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", function (e) {
      const href = this.getAttribute("href");
      if (href !== "#" && href.length > 1) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const headerOffset = 100;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition =
            elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: "smooth",
          });
        }
      }
    });
  });
}

function scrollToComparison() {
  const comparisonSection = document.getElementById("comparisonSection");
  if (comparisonSection) {
    const headerOffset = 100;
    const elementPosition = comparisonSection.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

function scrollToCourse(courseId) {
  const courseCard = document.getElementById(courseId);
  if (courseCard) {
    const headerOffset = 120;
    const elementPosition = courseCard.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
  }
}

// ============================================
// STICKY FILTER BAR
// ============================================
function initializeStickyFilterBar() {
  const filterBar = document.getElementById("filterBar");
  if (!filterBar) return;

  const observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry.isIntersecting) {
        filterBar.classList.add("is-sticky");
      } else {
        filterBar.classList.remove("is-sticky");
      }
    },
    { threshold: 0, rootMargin: "-70px 0px 0px 0px" }
  );

  observer.observe(filterBar);
}

// ============================================
// WHATSAPP INTEGRATION
// ============================================
function openWhatsApp() {
  const phone = "919252358993"; // Your WhatsApp number
  const message =
    "Hi! I have questions about your chess courses. Can you help me?";
  openWhatsAppWithMessage(message);
}

function openWhatsAppWithMessage(message) {
  const phone = "919252358993";
  const encodedMessage = encodeURIComponent(message);
  const whatsappURL = `https://wa.me/${phone}?text=${encodedMessage}`;
  window.open(whatsappURL, "_blank");
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Debounce function for performance
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Add loading animation to cards
document.querySelectorAll(".course-card").forEach((card) => {
  card.style.transition = "opacity 0.3s ease, transform 0.3s ease";
});

// Add CSS for toast notifications dynamically
const toastStyles = document.createElement("style");
toastStyles.textContent = `
    .toast.show {
        opacity: 1 !important;
        transform: translateX(0) !important;
    }
`;
document.head.appendChild(toastStyles);

// Add CSS for sticky filter bar
const stickyStyles = document.createElement("style");
stickyStyles.textContent = `
    .filter-sticky-bar.is-sticky {
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }
`;
document.head.appendChild(stickyStyles);

// ============================================
// ANALYTICS TRACKING (Optional)
// ============================================
function trackEvent(category, action, label) {
  // Google Analytics 4
  if (typeof gtag !== "undefined") {
    gtag("event", action, {
      event_category: category,
      event_label: label,
    });
  }

  // Facebook Pixel
  if (typeof fbq !== "undefined") {
    fbq("trackCustom", action, {
      category: category,
      label: label,
    });
  }

  // Console log for debugging
  console.log("Event tracked:", category, action, label);
}

// Track filter usage
document.querySelectorAll(".filter-btn").forEach((btn) => {
  btn.addEventListener("click", function () {
    const filterType = this.textContent.trim();
    trackEvent("Course Filters", "Filter Applied", filterType);
  });
});

// Track modal opens
function trackModalOpen(modalName) {
  trackEvent("Modals", "Modal Opened", modalName);
}

// Track CTA clicks
document.querySelectorAll(".btn-enroll").forEach((btn) => {
  btn.addEventListener("click", function () {
    const courseName =
      this.closest(".course-card").querySelector(".course-title").textContent;
    trackEvent("CTAs", "Enroll Button Clicked", courseName);
  });
});

// ============================================
// MOBILE OPTIMIZATION
// ============================================
if (window.innerWidth <= 768) {
  // Simplify animations on mobile for performance
  document.querySelectorAll(".course-card").forEach((card) => {
    card.style.transition = "opacity 0.2s ease";
  });

  // Hide WhatsApp button text on very small screens
  const whatsappBtn = document.querySelector(".whatsapp-btn");
  if (whatsappBtn && window.innerWidth <= 480) {
    const textSpan = whatsappBtn.querySelector(".whatsapp-text");
    if (textSpan) textSpan.style.display = "none";
  }
}

// ============================================
// FORM VALIDATION ENHANCEMENTS
// ============================================
function enhanceFormValidation() {
  const forms = document.querySelectorAll("form");

  forms.forEach((form) => {
    const inputs = form.querySelectorAll("input, select, textarea");

    inputs.forEach((input) => {
      // Real-time validation
      input.addEventListener("blur", function () {
        if (this.hasAttribute("required") && !this.value) {
          this.classList.add("error");
        } else {
          this.classList.remove("error");
        }
      });

      input.addEventListener("input", function () {
        this.classList.remove("error");
      });
    });
  });
}

enhanceFormValidation();

// ============================================
// LAZY LOADING FOR IMAGES (Optional)
// ============================================
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.classList.add("loaded");
          observer.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}

// ============================================
// PRINT FRIENDLY
// ============================================
window.addEventListener("beforeprint", function () {
  // Expand all FAQs for printing
  document.querySelectorAll(".faq-question").forEach((q) => {
    q.setAttribute("aria-expanded", "true");
  });
});

// ============================================
// PERFORMANCE MONITORING
// ============================================
if ("performance" in window) {
  window.addEventListener("load", function () {
    const perfData = window.performance.timing;
    const pageLoadTime = perfData.loadEventEnd - perfData.navigationStart;
    console.log("Page Load Time:", pageLoadTime + "ms");
  });
}

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener("error", function (e) {
  console.error(
    "JavaScript Error:",
    e.message,
    "at",
    e.filename,
    "line",
    e.lineno
  );
  // Optionally send to error tracking service
});

// ============================================
// EXPORTS (if using modules)
// ============================================
// Uncomment if using ES6 modules
/*
export {
    openTrialModal,
    closeTrialModal,
    openEnrollModal,
    closeEnrollModal,
    scrollToComparison,
    scrollToCourse,
    openWhatsApp
};
*/

console.log("✅ Courses Redesign JS loaded successfully");
