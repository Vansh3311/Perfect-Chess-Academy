/**
 * ============================================
 * PREMIUM CONTACT PAGE - JAVASCRIPT
 * Perfect Chess Academy - 2025
 * ============================================
 */

(function() {
    'use strict';

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================

    /**
     * Smooth scroll to element
     */
    function smoothScrollTo(element, offset = 100) {
        if (!element) return;
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;

        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    /**
     * Validate email format
     */
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Validate phone number (Indian format)
     */
    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[(]?[0-9]{1,4}[)]?[-\s\.]?[(]?[0-9]{1,4}[)]?[-\s\.]?[0-9]{4,10}$/;
        return phoneRegex.test(phone);
    }

    // ============================================
    // SECTION 1: ANIMATED STATS COUNTER
    // ============================================

    function initStatsCounter() {
        const statNumbers = document.querySelectorAll('.stat-number[data-target]');
        let hasAnimated = false;

        function animateCounter(element) {
            const target = parseInt(element.getAttribute('data-target'));
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // 60fps
            let current = 0;

            const updateCounter = () => {
                current += increment;
                if (current < target) {
                    element.textContent = Math.floor(current);
                    requestAnimationFrame(updateCounter);
                } else {
                    element.textContent = target + (target === 98 ? '%' : '+');
                }
            };

            updateCounter();
        }

        function checkScroll() {
            if (hasAnimated) return;

            statNumbers.forEach(stat => {
                if (isInViewport(stat)) {
                    hasAnimated = true;
                    statNumbers.forEach(animateCounter);
                }
            });
        }

        window.addEventListener('scroll', checkScroll);
        checkScroll(); // Check on load
    }

    // ============================================
    // SECTION 2: COUNTDOWN TIMER
    // ============================================

    function initCountdownTimer() {
        const hoursEl = document.getElementById('hours');
        const minutesEl = document.getElementById('minutes');
        const secondsEl = document.getElementById('seconds');
        const spotsLeftEl = document.getElementById('spotsLeft');

        if (!hoursEl || !minutesEl || !secondsEl) return;

        // Set countdown to 24 hours from now
        const endTime = new Date().getTime() + (24 * 60 * 60 * 1000);

        function updateCountdown() {
            const now = new Date().getTime();
            const distance = endTime - now;

            if (distance < 0) {
                // Reset timer when it reaches 0
                clearInterval(countdownInterval);
                hoursEl.textContent = '00';
                minutesEl.textContent = '00';
                secondsEl.textContent = '00';
                return;
            }

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            hoursEl.textContent = String(hours).padStart(2, '0');
            minutesEl.textContent = String(minutes).padStart(2, '0');
            secondsEl.textContent = String(seconds).padStart(2, '0');
        }

        const countdownInterval = setInterval(updateCountdown, 1000);
        updateCountdown(); // Run immediately

        // Simulate decreasing spots (optional - remove if you have real backend)
        if (spotsLeftEl) {
            let spots = parseInt(spotsLeftEl.textContent);
            setInterval(() => {
                if (spots > 3) {
                    spots--;
                    spotsLeftEl.textContent = spots;
                }
            }, 300000); // Decrease every 5 minutes
        }
    }

    // ============================================
    // SECTION 3: COACH MATCHER QUIZ
    // ============================================

    function initCoachQuiz() {
        const quizContainer = document.getElementById('coachQuiz');
        if (!quizContainer) return;

        const quizSteps = quizContainer.querySelectorAll('.quiz-step');
        const quizOptions = quizContainer.querySelectorAll('.quiz-option');
        const progressBar = document.getElementById('quizProgressBar');
        const quizResult = document.getElementById('quizResult');

        let currentStep = 1;
        const totalSteps = 3;
        const answers = {};

        // Coach database
        const coaches = {
            beginner: {
                learn: {
                    online: { name: 'IM Priya Sharma', title: 'International Master • Beginner Specialist', message: 'IM Priya specializes in making chess fun and engaging for new learners with interactive online methods.' },
                    offline: { name: 'FM Vikram Singh', title: 'FIDE Master • Patient Teacher', message: 'FM Vikram creates a welcoming environment for beginners learning chess in person.' },
                    hybrid: { name: 'IM Priya Sharma', title: 'International Master • Flexible Learning', message: 'IM Priya offers both online and in-person sessions tailored to your convenience.' }
                },
                rating: {
                    online: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Rating Specialist', message: 'GM Rajesh has helped 200+ beginners achieve their first FIDE rating through structured online training.' },
                    offline: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Tournament Prep', message: 'GM Rajesh provides intensive in-person training to prepare you for rated tournaments.' },
                    hybrid: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Comprehensive Training', message: 'GM Rajesh combines online theory with in-person practice sessions for optimal results.' }
                },
                compete: {
                    online: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Competition Coach', message: 'GM Rajesh has trained multiple national champions and specializes in competitive chess online.' },
                    offline: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Tournament Expert', message: 'GM Rajesh provides hands-on tournament preparation and competitive strategy.' },
                    hybrid: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Elite Training', message: 'GM Rajesh offers comprehensive training combining online tactics with in-person tournament simulation.' }
                }
            },
            intermediate: {
                learn: {
                    online: { name: 'IM Priya Sharma', title: 'International Master • Strategy Expert', message: 'IM Priya helps intermediate players develop advanced strategic thinking through online sessions.' },
                    offline: { name: 'FM Vikram Singh', title: 'FIDE Master • Tactical Genius', message: 'FM Vikram specializes in teaching complex tactical patterns in engaging in-person sessions.' },
                    hybrid: { name: 'IM Priya Sharma', title: 'International Master • Comprehensive Approach', message: 'IM Priya combines online learning with practical in-person application.' }
                },
                rating: {
                    online: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Rating Booster', message: 'GM Rajesh has helped 100+ intermediate players break through rating plateaus online.' },
                    offline: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Performance Coach', message: 'GM Rajesh provides personalized in-person coaching to elevate your rating.' },
                    hybrid: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Holistic Development', message: 'GM Rajesh uses a hybrid approach to maximize rating improvement.' }
                },
                compete: {
                    online: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Competition Specialist', message: 'GM Rajesh has trained state and national champions through intensive online programs.' },
                    offline: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Tournament Master', message: 'GM Rajesh provides elite in-person training for serious competitors.' },
                    hybrid: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Championship Training', message: 'GM Rajesh combines online prep with in-person tournament coaching for maximum success.' }
                }
            },
            advanced: {
                learn: {
                    online: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Advanced Theory', message: 'GM Rajesh teaches grandmaster-level theory and concepts through comprehensive online courses.' },
                    offline: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Master Class', message: 'GM Rajesh offers exclusive in-person masterclasses for advanced players.' },
                    hybrid: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Elite Development', message: 'GM Rajesh provides personalized hybrid training for ambitious advanced players.' }
                },
                rating: {
                    online: { name: 'GM Rajesh Kumar', title: 'Grandmaster • High-Level Coach', message: 'GM Rajesh specializes in pushing advanced players to master-level ratings online.' },
                    offline: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Performance Optimization', message: 'GM Rajesh provides intensive in-person sessions for serious rating improvement.' },
                    hybrid: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Championship Coaching', message: 'GM Rajesh uses hybrid methods to help you achieve master-level ratings.' }
                },
                compete: {
                    online: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Elite Competition Coach', message: 'GM Rajesh has trained multiple titled players and specializes in championship preparation online.' },
                    offline: { name: 'GM Rajesh Kumar', title: 'Grandmaster • Tournament Champion', message: 'GM Rajesh provides world-class in-person training for elite competitions.' },
                    hybrid: { name: 'GM Rajesh Kumar', title: 'Grandmaster • World-Class Training', message: 'GM Rajesh offers comprehensive championship training combining online and in-person methods.' }
                }
            }
        };

        // Handle quiz option clicks
        quizOptions.forEach(option => {
            option.addEventListener('click', function() {
                const step = this.closest('.quiz-step').getAttribute('data-step');
                const value = this.getAttribute('data-value');

                // Store answer
                answers[`question${step}`] = value;

                // Move to next step
                if (currentStep < totalSteps) {
                    // Hide current step
                    quizSteps[currentStep - 1].classList.remove('active');
                    
                    // Show next step
                    currentStep++;
                    quizSteps[currentStep - 1].classList.add('active');

                    // Update progress
                    updateProgress();
                } else {
                    // Show results
                    showQuizResult();
                }
            });
        });

        function updateProgress() {
            const progress = (currentStep / totalSteps) * 100;
            if (progressBar) {
                progressBar.style.width = progress + '%';
            }
        }

        function showQuizResult() {
            // Hide all steps
            quizSteps.forEach(step => step.classList.remove('active'));

            // Get matched coach
            const level = answers.question1;
            const goal = answers.question2;
            const style = answers.question3;

            const matchedCoach = coaches[level][goal][style];

            // Update result UI
            document.getElementById('coachName').textContent = matchedCoach.name;
            document.querySelector('.coach-title').textContent = matchedCoach.title;
            document.getElementById('resultMessage').textContent = matchedCoach.message;

            // Show result
            quizResult.classList.add('active');

            // Update progress to 100%
            if (progressBar) {
                progressBar.style.width = '100%';
            }

            // Scroll to result
            setTimeout(() => {
                smoothScrollTo(quizResult, 50);
            }, 300);
        }

        // Reset quiz function (global)
        window.resetQuiz = function() {
            currentStep = 1;
            Object.keys(answers).forEach(key => delete answers[key]);
            
            quizResult.classList.remove('active');
            quizSteps.forEach((step, index) => {
                step.classList.toggle('active', index === 0);
            });

            if (progressBar) {
                progressBar.style.width = '0%';
            }

            smoothScrollTo(quizContainer, 50);
        };

        // Initialize progress
        updateProgress();
    }

    // ============================================
    // SECTION 4: FORM VALIDATION & SUBMISSION
    // ============================================

    function initContactForm() {
        const form = document.getElementById('premiumContactForm');
        if (!form) return;

        const submitBtn = form.querySelector('.btn-submit-premium');
        const successMessage = document.getElementById('successMessage');

        // Set timestamp (anti-spam)
        const timestampInput = document.getElementById('timestamp');
        if (timestampInput) {
            timestampInput.value = Date.now();
        }

        // Form submission
        form.addEventListener('submit', async function(e) {
            e.preventDefault();

            // Clear previous errors
            document.querySelectorAll('.field-error').forEach(el => el.textContent = '');

            // Validate form
            if (!validateForm()) {
                return;
            }

            // Disable button and show loading
            submitBtn.disabled = true;
            submitBtn.classList.add('loading');

            // Prepare form data
            const formData = new FormData(form);

            try {
                // Try to submit to server
                const response = await fetch(form.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    handleSuccess();
                } else {
                    throw new Error('Form submission failed');
                }
            } catch (error) {
                console.error('Form submission error:', error);
                // Fallback to mailto
                handleMailtoFallback(formData);
            }
        });

        function validateForm() {
            let isValid = true;

            // Name validation
            const nameInput = document.getElementById('name');
            if (!nameInput.value.trim() || nameInput.value.trim().length < 2) {
                showError('name', 'Please enter your full name (at least 2 characters)');
                isValid = false;
            }

            // Phone validation
            const phoneInput = document.getElementById('phone');
            if (!phoneInput.value.trim() || !isValidPhone(phoneInput.value.trim())) {
                showError('phone', 'Please enter a valid phone number');
                isValid = false;
            }

            // Email validation
            const emailInput = document.getElementById('email');
            if (!emailInput.value.trim() || !isValidEmail(emailInput.value.trim())) {
                showError('email', 'Please enter a valid email address');
                isValid = false;
            }

            // Interest validation (radio buttons)
            const interestInputs = document.querySelectorAll('input[name="interest"]');
            const isInterestSelected = Array.from(interestInputs).some(input => input.checked);
            if (!isInterestSelected) {
                showError('interest', 'Please select what you\'re interested in');
                isValid = false;
            }

            return isValid;
        }

        function showError(fieldId, message) {
            const errorElement = document.getElementById(fieldId + '-error');
            if (errorElement) {
                errorElement.textContent = message;
            }

            const inputElement = document.getElementById(fieldId);
            if (inputElement) {
                inputElement.focus();
            }
        }

        function handleSuccess() {
            // Hide form
            form.style.display = 'none';

            // Show success message
            successMessage.classList.add('show');

            // Scroll to success message
            smoothScrollTo(successMessage);

            // Track conversion (Google Analytics example)
            if (typeof gtag !== 'undefined') {
                gtag('event', 'form_submission', {
                    'event_category': 'Contact',
                    'event_label': 'Premium Contact Form'
                });
            }

            // Reset form after 8 seconds
            setTimeout(() => {
                form.reset();
                form.style.display = 'block';
                successMessage.classList.remove('show');
                submitBtn.disabled = false;
                submitBtn.classList.remove('loading');

                // Reset timestamp
                if (timestampInput) {
                    timestampInput.value = Date.now();
                }
            }, 8000);
        }

        function handleMailtoFallback(formData) {
            const name = formData.get('name');
            const email = formData.get('email');
            const phone = formData.get('phone');
            const interest = formData.get('interest');
            const message = formData.get('message') || 'No additional message';
            const contactMethod = formData.get('contact_method');

            const subject = `Contact Form: ${interest}`;
            const body = `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nInterest: ${interest}\nPreferred Contact: ${contactMethod}\n\nMessage:\n${message}`;

            const mailtoLink = `mailto:info@perfectchessacademy.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
            
            window.location.href = mailtoLink;

            // Show success anyway
            handleSuccess();
        }
    }

    // ============================================
    // SECTION 5: FAQ ACCORDION
    // ============================================

    function initFAQ() {
        const faqQuestions = document.querySelectorAll('.faq-question-premium');

        faqQuestions.forEach(question => {
            question.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';

                // Close all FAQs
                faqQuestions.forEach(q => {
                    q.setAttribute('aria-expanded', 'false');
                });

                // Toggle current FAQ
                if (!isExpanded) {
                    this.setAttribute('aria-expanded', 'true');
                }
            });
        });
    }

    // ============================================
    // SECTION 6: VIDEO MODAL
    // ============================================

    function initVideoModal() {
        const videoModal = document.getElementById('videoModal');
        if (!videoModal) return;

        const videoIframe = document.getElementById('testimonialVideo');
        const videoClose = videoModal.querySelector('.video-close');

        // Open video modal (global function)
        window.openVideoModal = function() {
            // Replace with actual video URL
            const videoUrl = 'https://youtu.be/Ap297S_dI2M?si=Ntb9g9pCqs4Tl9Kz?autoplay=1';
            videoIframe.src = videoUrl;
            videoModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        };

        // Close video modal (global function)
        window.closeVideoModal = function() {
            videoIframe.src = '';
            videoModal.classList.remove('active');
            document.body.style.overflow = '';
        };

        // Close on backdrop click
        videoModal.addEventListener('click', function(e) {
            if (e.target === videoModal) {
                window.closeVideoModal();
            }
        });

        // Close on button click
        if (videoClose) {
            videoClose.addEventListener('click', window.closeVideoModal);
        }

        // Close on ESC key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && videoModal.classList.contains('active')) {
                window.closeVideoModal();
            }
        });
    }

    // ============================================
    // SECTION 7: BACK TO TOP BUTTON
    // ============================================

    function initBackToTop() {
        const backToTopBtn = document.getElementById('backToTop');
        if (!backToTopBtn) return;

        // Show/hide button based on scroll position
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                backToTopBtn.classList.add('visible');
            } else {
                backToTopBtn.classList.remove('visible');
            }
        });

        // Scroll to top on click
        backToTopBtn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // ============================================
    // SECTION 8: SMOOTH SCROLL FOR ANCHOR LINKS
    // ============================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#" or empty
                if (!href || href === '#') return;

                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();
                smoothScrollTo(target, 100);
            });
        });
    }

    // ============================================
    // SECTION 9: LIVE COACH AVAILABILITY (SIMULATION)
    // ============================================

    function initLiveAvailability() {
        const availabilityCards = document.querySelectorAll('.coach-availability-card');
        
        // Simulate real-time availability changes
        setInterval(() => {
            availabilityCards.forEach(card => {
                // Random chance to change status (10%)
                if (Math.random() < 0.1) {
                    const isOnline = card.classList.contains('online');
                    card.classList.toggle('online', !isOnline);
                    card.classList.toggle('busy', isOnline);

                    const statusDot = card.querySelector('.status-dot');
                    const statusText = card.querySelector('.availability-status span');
                    const nextAvailable = card.querySelector('.next-available');
                    const bookBtn = card.querySelector('.btn-book-now');

                    if (card.classList.contains('online')) {
                        statusDot.classList.add('online');
                        statusDot.classList.remove('busy');
                        statusText.textContent = 'Available Now';
                        nextAvailable.innerHTML = '<i class="fas fa-clock"></i> Next slot: Today, 6:00 PM';
                        bookBtn.textContent = 'Book Now';
                        bookBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Now';
                    } else {
                        statusDot.classList.remove('online');
                        statusDot.classList.add('busy');
                        statusText.textContent = 'In Session';
                        nextAvailable.innerHTML = '<i class="fas fa-clock"></i> Next slot: Tomorrow, 5:00 PM';
                        bookBtn.innerHTML = '<i class="fas fa-calendar-check"></i> Book Ahead';
                    }
                }
            });
        }, 60000); // Check every minute
    }

    // ============================================
    // SECTION 10: INTERSECTION OBSERVER FOR ANIMATIONS
    // ============================================

    function initScrollAnimations() {
        // Elements to animate on scroll
        const animateElements = document.querySelectorAll(
            '.class-card, .milestone-card, .testimonial-card, .coach-availability-card, .info-card-premium'
        );

        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.style.opacity = '1';
                        entry.target.style.transform = 'translateY(0)';
                    }
                });
            }, {
                threshold: 0.1,
                rootMargin: '0px 0px -100px 0px'
            });

            animateElements.forEach(element => {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                observer.observe(element);
            });
        }
    }

    // ============================================
    // SECTION 11: FLOATING WHATSAPP TOOLTIP
    // ============================================

    function initFloatingWhatsApp() {
        const whatsappBtn = document.querySelector('.floating-whatsapp');
        if (!whatsappBtn) return;

        // Show tooltip on hover (already handled by CSS)
        // Add click tracking
        whatsappBtn.addEventListener('click', function() {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'click', {
                    'event_category': 'WhatsApp',
                    'event_label': 'Floating Button'
                });
            }
        });
    }

    // ============================================
    // SECTION 12: FORM FIELD ENHANCEMENTS
    // ============================================

    function initFormEnhancements() {
        // Auto-format phone number
        const phoneInput = document.getElementById('phone');
        if (phoneInput) {
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                
                // Auto-add +91 prefix for Indian numbers
                if (value.length > 0 && !value.startsWith('91')) {
                    if (value.length === 10) {
                        value = '91' + value;
                    }
                }

                // Format as +91 XXXXX XXXXX
                if (value.length > 2) {
                    value = '+' + value.slice(0, 2) + ' ' + value.slice(2, 7) + ' ' + value.slice(7, 12);
                }

                e.target.value = value.trim();
            });
        }

        // Clear error on input
        const formInputs = document.querySelectorAll('.form-input, .form-textarea, .form-select');
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                const errorElement = document.getElementById(this.id + '-error');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            });
        });

        // Clear error on radio selection
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(input => {
            input.addEventListener('change', function() {
                const errorElement = document.getElementById(this.name + '-error');
                if (errorElement) {
                    errorElement.textContent = '';
                }
            });
        });
    }

    // ============================================
    // SECTION 13: KEYBOARD NAVIGATION
    // ============================================

    function initKeyboardNavigation() {
        // ESC key to close modals
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close video modal
                const videoModal = document.getElementById('videoModal');
                if (videoModal && videoModal.classList.contains('active')) {
                    window.closeVideoModal();
                }
            }
        });

        // Tab trap for modals
        const videoModal = document.getElementById('videoModal');
        if (videoModal) {
            videoModal.addEventListener('keydown', function(e) {
                if (e.key === 'Tab' && this.classList.contains('active')) {
                    const focusableElements = this.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    const firstElement = focusableElements[0];
                    const lastElement = focusableElements[focusableElements.length - 1];

                    if (e.shiftKey && document.activeElement === firstElement) {
                        e.preventDefault();
                        lastElement.focus();
                    } else if (!e.shiftKey && document.activeElement === lastElement) {
                        e.preventDefault();
                        firstElement.focus();
                    }
                }
            });
        }
    }

    // ============================================
    // SECTION 14: PERFORMANCE MONITORING
    // ============================================

    function monitorPerformance() {
        if ('PerformanceObserver' in window) {
            // Monitor Largest Contentful Paint
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                console.log('LCP:', lastEntry.renderTime || lastEntry.loadTime);
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // Browser doesn't support this
            }

            // Monitor First Input Delay
            const fidObserver = new PerformanceObserver((list) => {
                list.getEntries().forEach(entry => {
                    console.log('FID:', entry.processingStart - entry.startTime);
                });
            });

            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
            } catch (e) {
                // Browser doesn't support this
            }
        }

        // Log page load time
        window.addEventListener('load', function() {
            if (window.performance && window.performance.timing) {
                const loadTime = window.performance.timing.loadEventEnd - window.performance.timing.navigationStart;
                console.log('Page Load Time:', loadTime + 'ms');
            }
        });
    }

    // ============================================
    // SECTION 15: LOCAL STORAGE FOR USER PREFERENCES
    // ============================================

    function initLocalStorage() {
        // Save form data to localStorage (auto-save)
        const form = document.getElementById('premiumContactForm');
        if (!form) return;

        const formInputs = form.querySelectorAll('input, textarea, select');

        // Load saved data on page load
        formInputs.forEach(input => {
            const savedValue = localStorage.getItem('contact_' + input.name);
            if (savedValue && input.type !== 'radio' && input.type !== 'hidden') {
                input.value = savedValue;
            }
        });

        // Save data on input
        formInputs.forEach(input => {
            input.addEventListener('input', function() {
                if (this.type !== 'hidden') {
                    localStorage.setItem('contact_' + this.name, this.value);
                }
            });
        });

        // Clear localStorage on successful submission
        form.addEventListener('submit', function() {
            setTimeout(() => {
                formInputs.forEach(input => {
                    localStorage.removeItem('contact_' + input.name);
                });
            }, 5000); // Clear after 5 seconds
        });
    }

    // ============================================
    // INITIALIZATION - CALL ALL FUNCTIONS
    // ============================================

    function init() {
        console.log('🎯 Perfect Chess Academy - Premium Contact Page Loaded');

        // Initialize all features
        initStatsCounter();
        initCountdownTimer();
        initCoachQuiz();
        initContactForm();
        initFAQ();
        initVideoModal();
        initBackToTop();
        initSmoothScroll();
        initLiveAvailability();
        initScrollAnimations();
        initFloatingWhatsApp();
        initFormEnhancements();
        initKeyboardNavigation();
        initLocalStorage();

        // Monitor performance in development
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            monitorPerformance();
        }

        console.log('✅ All features initialized successfully');
    }

    // Run on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // EXPOSE GLOBAL FUNCTIONS FOR INLINE HANDLERS
    // ============================================

    window.PCA_Contact = {
        resetQuiz: function() {
            if (typeof window.resetQuiz === 'function') {
                window.resetQuiz();
            }
        },
        openVideo: function() {
            if (typeof window.openVideoModal === 'function') {
                window.openVideoModal();
            }
        },
        closeVideo: function() {
            if (typeof window.closeVideoModal === 'function') {
                window.closeVideoModal();
            }
        }
    };

})();

/**
 * ============================================
 * END OF PREMIUM CONTACT PAGE JAVASCRIPT
 * ============================================
 */
