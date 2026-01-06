/* ==========================================
   AUTH PAGE JAVASCRIPT
   Perfect Chess Academy - 2026
   Login/Register Forms with Validation
   ========================================== */

(function () {
  "use strict";

  // ==================== STATE MANAGEMENT ====================
  const state = {
    currentTab: "login",
    isSubmitting: false,
  };

  // ==================== DOM ELEMENTS ====================
  const elements = {
    // Tab buttons
    tabButtons: document.querySelectorAll(".tab-btn"),

    // Form cards
    loginCard: document.getElementById("loginForm"),
    registerCard: document.getElementById("registerForm"),

    // Forms
    loginFormSubmit: document.getElementById("loginFormSubmit"),
    registerFormSubmit: document.getElementById("registerFormSubmit"),

    // Login form elements
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    rememberMe: document.getElementById("rememberMe"),

    // Register form elements
    registerName: document.getElementById("registerName"),
    registerEmail: document.getElementById("registerEmail"),
    registerPhone: document.getElementById("registerPhone"),
    registerPassword: document.getElementById("registerPassword"),
    agreeTerms: document.getElementById("agreeTerms"),

    // Password toggle buttons
    togglePasswordBtns: document.querySelectorAll(".toggle-password"),

    // Password strength elements
    strengthBar: document.querySelector(".strength-fill"),
    strengthText: document.querySelector(".strength-text"),

    // Alerts
    loginSuccess: document.getElementById("loginSuccess"),
    loginError: document.getElementById("loginError"),
    loginErrorText: document.getElementById("loginErrorText"),
    registerSuccess: document.getElementById("registerSuccess"),
    registerError: document.getElementById("registerError"),
    registerErrorText: document.getElementById("registerErrorText"),

    // Link buttons for switching
    linkButtons: document.querySelectorAll(".link-btn"),
  };

  // ==================== TAB SWITCHING ====================
  function switchTab(tabName) {
    state.currentTab = tabName;

    // Update tab buttons
    elements.tabButtons.forEach((btn) => {
      if (btn.dataset.tab === tabName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    // Update form cards
    if (tabName === "login") {
      elements.loginCard.classList.add("active");
      elements.registerCard.classList.remove("active");
    } else {
      elements.loginCard.classList.remove("active");
      elements.registerCard.classList.add("active");
    }

    // Hide all alerts
    hideAllAlerts();

    // Scroll to forms section smoothly
    const formsSection = document.querySelector(".auth-forms-section");
    if (formsSection) {
      formsSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // ==================== PASSWORD VISIBILITY TOGGLE ====================
  function togglePasswordVisibility(button) {
    const wrapper = button.closest(".input-with-icon");
    const input = wrapper.querySelector("input");
    const icon = button.querySelector("i");

    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("fa-eye");
      icon.classList.add("fa-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("fa-eye-slash");
      icon.classList.add("fa-eye");
    }
  }

  // ==================== PASSWORD STRENGTH CHECKER ====================
  function checkPasswordStrength(password) {
    let strength = 0;

    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return strength;
  }

  function updatePasswordStrength(password) {
    if (!elements.strengthBar || !elements.strengthText) return;

    const strength = checkPasswordStrength(password);

    // Remove all classes
    elements.strengthBar.classList.remove("weak", "medium", "strong");

    if (password.length === 0) {
      elements.strengthBar.style.width = "0%";
      elements.strengthText.textContent = "";
      return;
    }

    if (strength <= 2) {
      elements.strengthBar.classList.add("weak");
      elements.strengthText.textContent = "Weak";
      elements.strengthText.style.color = "#ef4444";
    } else if (strength <= 4) {
      elements.strengthBar.classList.add("medium");
      elements.strengthText.textContent = "Medium";
      elements.strengthText.style.color = "#f59e0b";
    } else {
      elements.strengthBar.classList.add("strong");
      elements.strengthText.textContent = "Strong";
      elements.strengthText.style.color = "#10b981";
    }
  }

  // ==================== VALIDATION FUNCTIONS ====================
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(String(email).toLowerCase());
  }

  function validatePhone(phone) {
    const cleaned = phone.replace(/\D/g, "");
    return cleaned.length >= 10;
  }

  function validatePassword(password) {
    return password.length >= 8;
  }

  function showFieldError(input, message) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    formGroup.classList.add("error");
    formGroup.classList.remove("success");

    if (errorElement) {
      errorElement.textContent = message;
    }
  }

  function showFieldSuccess(input) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    formGroup.classList.remove("error");
    formGroup.classList.add("success");

    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  function clearFieldError(input) {
    const formGroup = input.closest(".form-group");
    const errorElement = formGroup.querySelector(".error-message");

    formGroup.classList.remove("error", "success");

    if (errorElement) {
      errorElement.textContent = "";
    }
  }

  // ==================== ALERT FUNCTIONS ====================
  function showAlert(alertElement, message = null) {
    if (!alertElement) return;

    if (message) {
      const textElement = alertElement.querySelector("span");
      if (textElement) {
        textElement.textContent = message;
      }
    }

    alertElement.classList.add("show");
    alertElement.style.display = "flex";
  }

  function hideAlert(alertElement) {
    if (!alertElement) return;

    alertElement.classList.remove("show");
    setTimeout(() => {
      alertElement.style.display = "none";
    }, 300);
  }

  function hideAllAlerts() {
    [
      elements.loginSuccess,
      elements.loginError,
      elements.registerSuccess,
      elements.registerError,
    ].forEach((alert) => {
      if (alert) hideAlert(alert);
    });
  }

  // ==================== LOGIN FORM VALIDATION ====================
  function validateLoginForm() {
    let isValid = true;

    // Validate email
    if (!elements.loginEmail.value.trim()) {
      showFieldError(elements.loginEmail, "Email is required");
      isValid = false;
    } else if (!validateEmail(elements.loginEmail.value)) {
      showFieldError(elements.loginEmail, "Please enter a valid email");
      isValid = false;
    } else {
      showFieldSuccess(elements.loginEmail);
    }

    // Validate password
    if (!elements.loginPassword.value) {
      showFieldError(elements.loginPassword, "Password is required");
      isValid = false;
    } else if (elements.loginPassword.value.length < 6) {
      showFieldError(elements.loginPassword, "Password is too short");
      isValid = false;
    } else {
      showFieldSuccess(elements.loginPassword);
    }

    return isValid;
  }

  // ==================== REGISTER FORM VALIDATION ====================
  function validateRegisterForm() {
    let isValid = true;

    // Validate name
    if (!elements.registerName.value.trim()) {
      showFieldError(elements.registerName, "Full name is required");
      isValid = false;
    } else if (elements.registerName.value.trim().length < 3) {
      showFieldError(
        elements.registerName,
        "Name must be at least 3 characters"
      );
      isValid = false;
    } else {
      showFieldSuccess(elements.registerName);
    }

    // Validate email
    if (!elements.registerEmail.value.trim()) {
      showFieldError(elements.registerEmail, "Email is required");
      isValid = false;
    } else if (!validateEmail(elements.registerEmail.value)) {
      showFieldError(elements.registerEmail, "Please enter a valid email");
      isValid = false;
    } else {
      showFieldSuccess(elements.registerEmail);
    }

    // Validate phone
    if (!elements.registerPhone.value.trim()) {
      showFieldError(elements.registerPhone, "Phone number is required");
      isValid = false;
    } else if (!validatePhone(elements.registerPhone.value)) {
      showFieldError(
        elements.registerPhone,
        "Please enter a valid phone number"
      );
      isValid = false;
    } else {
      showFieldSuccess(elements.registerPhone);
    }

    // Validate password
    if (!elements.registerPassword.value) {
      showFieldError(elements.registerPassword, "Password is required");
      isValid = false;
    } else if (!validatePassword(elements.registerPassword.value)) {
      showFieldError(
        elements.registerPassword,
        "Password must be at least 8 characters"
      );
      isValid = false;
    } else if (checkPasswordStrength(elements.registerPassword.value) <= 2) {
      showFieldError(
        elements.registerPassword,
        "Please choose a stronger password"
      );
      isValid = false;
    } else {
      showFieldSuccess(elements.registerPassword);
    }

    // Validate terms
    if (!elements.agreeTerms.checked) {
      showFieldError(
        elements.agreeTerms,
        "You must agree to the terms and conditions"
      );
      isValid = false;
    } else {
      clearFieldError(elements.agreeTerms);
    }

    return isValid;
  }

  // ==================== FORM SUBMISSION ====================
  function handleLoginSubmit(e) {
    e.preventDefault();

    if (state.isSubmitting) return;

    hideAllAlerts();

    if (!validateLoginForm()) {
      return;
    }

    state.isSubmitting = true;
    const submitBtn = elements.loginFormSubmit.querySelector(
      'button[type="submit"]'
    );
    submitBtn.classList.add("loading");

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success scenario (simulate)
      const email = elements.loginEmail.value;

      // For demo purposes - accept any valid email/password
      showAlert(elements.loginSuccess, "Login successful! Redirecting...");

      // Save remember me preference
      if (elements.rememberMe.checked) {
        localStorage.setItem("pca_remember_email", email);
      }

      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        window.location.href = "student-dashboard.html";
      }, 2000);

      state.isSubmitting = false;
      submitBtn.classList.remove("loading");

      /* Error scenario example:
            showAlert(elements.loginError, 'Invalid email or password');
            state.isSubmitting = false;
            submitBtn.classList.remove('loading');
            */
    }, 1500);
  }

  function handleRegisterSubmit(e) {
    e.preventDefault();

    if (state.isSubmitting) return;

    hideAllAlerts();

    if (!validateRegisterForm()) {
      return;
    }

    state.isSubmitting = true;
    const submitBtn = elements.registerFormSubmit.querySelector(
      'button[type="submit"]'
    );
    submitBtn.classList.add("loading");

    // Simulate API call (replace with actual backend call)
    setTimeout(() => {
      // Success scenario
      showAlert(
        elements.registerSuccess,
        "Account created successfully! Please check your email to verify your account."
      );

      // Clear form
      elements.registerFormSubmit.reset();

      // Reset password strength indicator
      if (elements.strengthBar) {
        elements.strengthBar.style.width = "0%";
        elements.strengthBar.classList.remove("weak", "medium", "strong");
      }
      if (elements.strengthText) {
        elements.strengthText.textContent = "";
      }

      // Switch to login after 3 seconds
      setTimeout(() => {
        switchTab("login");
      }, 3000);

      state.isSubmitting = false;
      submitBtn.classList.remove("loading");

      /* Error scenario example:
            showAlert(elements.registerError, 'Email already exists. Please use a different email.');
            state.isSubmitting = false;
            submitBtn.classList.remove('loading');
            */
    }, 1500);
  }

  // ==================== REAL-TIME VALIDATION ====================
  function setupRealTimeValidation() {
    // Login form
    if (elements.loginEmail) {
      elements.loginEmail.addEventListener("blur", function () {
        if (this.value.trim()) {
          if (validateEmail(this.value)) {
            showFieldSuccess(this);
          } else {
            showFieldError(this, "Please enter a valid email");
          }
        }
      });

      elements.loginEmail.addEventListener("input", function () {
        clearFieldError(this);
      });
    }

    if (elements.loginPassword) {
      elements.loginPassword.addEventListener("input", function () {
        clearFieldError(this);
      });
    }

    // Register form
    if (elements.registerName) {
      elements.registerName.addEventListener("blur", function () {
        if (this.value.trim()) {
          if (this.value.trim().length >= 3) {
            showFieldSuccess(this);
          } else {
            showFieldError(this, "Name must be at least 3 characters");
          }
        }
      });

      elements.registerName.addEventListener("input", function () {
        clearFieldError(this);
      });
    }

    if (elements.registerEmail) {
      elements.registerEmail.addEventListener("blur", function () {
        if (this.value.trim()) {
          if (validateEmail(this.value)) {
            showFieldSuccess(this);
          } else {
            showFieldError(this, "Please enter a valid email");
          }
        }
      });

      elements.registerEmail.addEventListener("input", function () {
        clearFieldError(this);
      });
    }

    if (elements.registerPhone) {
      elements.registerPhone.addEventListener("blur", function () {
        if (this.value.trim()) {
          if (validatePhone(this.value)) {
            showFieldSuccess(this);
          } else {
            showFieldError(this, "Please enter a valid phone number");
          }
        }
      });

      elements.registerPhone.addEventListener("input", function () {
        clearFieldError(this);
        // Auto-format phone number (optional)
        let value = this.value.replace(/\D/g, "");
        if (value.length > 10) {
          value = value.slice(0, 10);
        }
        if (value.length > 5) {
          this.value = value.slice(0, 5) + " " + value.slice(5);
        } else {
          this.value = value;
        }
      });
    }

    if (elements.registerPassword) {
      elements.registerPassword.addEventListener("input", function () {
        clearFieldError(this);
        updatePasswordStrength(this.value);
      });

      elements.registerPassword.addEventListener("blur", function () {
        if (this.value && this.value.length < 8) {
          showFieldError(this, "Password must be at least 8 characters");
        }
      });
    }
  }

  // ==================== INITIALIZE ====================
  function init() {
    // Tab switching
    elements.tabButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        switchTab(this.dataset.tab);
      });
    });

    // Link buttons for switching
    elements.linkButtons.forEach((btn) => {
      btn.addEventListener("click", function () {
        switchTab(this.dataset.switch);
      });
    });

    // Password toggle
    elements.togglePasswordBtns.forEach((btn) => {
      btn.addEventListener("click", function () {
        togglePasswordVisibility(this);
      });
    });

    // Form submissions
    if (elements.loginFormSubmit) {
      elements.loginFormSubmit.addEventListener("submit", handleLoginSubmit);
    }

    if (elements.registerFormSubmit) {
      elements.registerFormSubmit.addEventListener(
        "submit",
        handleRegisterSubmit
      );
    }

    // Real-time validation
    setupRealTimeValidation();

    // Load remembered email
    const rememberedEmail = localStorage.getItem("pca_remember_email");
    if (rememberedEmail && elements.loginEmail) {
      elements.loginEmail.value = rememberedEmail;
      elements.rememberMe.checked = true;
    }

    // Initialize default tab
    switchTab("login");

    console.log("Auth page initialized successfully");
  }

  // ==================== RUN ON DOM READY ====================
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
