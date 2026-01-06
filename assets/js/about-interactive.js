/* ==========================================
   ABOUT PAGE - ENHANCED INTERACTIVE JS
   Perfect Chess Academy
   ========================================== */

(function() {
    'use strict';

    // ==========================================
    // UTILITY FUNCTIONS
    // ==========================================

    /**
     * Debounce function to limit function execution rate
     */
    function debounce(func, wait = 20, immediate = true) {
        let timeout;
        return function() {
            const context = this, args = arguments;
            const later = function() {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    }

    /**
     * Check if element is in viewport
     */
    function isInViewport(element, offset = 0) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 - offset &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }

    // ==========================================
    // ANIMATED COUNTER FOR STATS
    // ==========================================

    class AnimatedCounter {
        constructor(element, options = {}) {
            this.element = element;
            this.target = parseInt(element.getAttribute('data-target')) || 0;
            this.duration = options.duration || 2000;
            this.hasRun = false;
            this.isPlus = element.textContent.includes('+');
        }

        animate() {
            if (this.hasRun) return;
            this.hasRun = true;

            const startTime = performance.now();
            const startValue = 0;

            const updateCounter = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / this.duration, 1);
                
                // Easing function for smooth animation
                const easeOutQuart = 1 - Math.pow(1 - progress, 4);
                const currentValue = Math.floor(startValue + (this.target - startValue) * easeOutQuart);
                
                this.element.textContent = currentValue.toLocaleString();
                
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    this.element.textContent = this.target.toLocaleString() + (this.isPlus ? '+' : '');
                }
            };

            requestAnimationFrame(updateCounter);
        }
    }

    // Initialize counters with Intersection Observer
    function initCounters() {
        const counterElements = document.querySelectorAll('.stat-value, .stat-number, .hero-stat-item .stat-value');
        
        if (counterElements.length === 0) return;

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const counter = new AnimatedCounter(entry.target, { duration: 2000 });
                    counter.animate();
                    counterObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.5,
            rootMargin: '0px 0px -100px 0px'
        });

        counterElements.forEach(element => {
            // Store original value
            const target = element.getAttribute('data-target');
            if (target) {
                element.textContent = '0';
                counterObserver.observe(element);
            }
        });
    }

    // ==========================================
    // SCROLL REVEAL ANIMATIONS
    // ==========================================

    function initScrollReveal() {
        const revealElements = document.querySelectorAll(`
            .feature-card,
            .timeline-item,
            .team-card,
            .testimonial-card,
            .value-item,
            .location-branch-card,
            .contact-info-item
        `);

        if (revealElements.length === 0) return;

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('revealed');
                    // Optional: unobserve after reveal for performance
                    // revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -80px 0px'
        });

        revealElements.forEach((element, index) => {
            element.style.transitionDelay = `${index * 0.1}s`;
            revealObserver.observe(element);
        });
    }

    // ==========================================
    // TIMELINE ANIMATIONS
    // ==========================================

    function initTimelineAnimations() {
        const timelineItems = document.querySelectorAll('.timeline-item');
        
        if (timelineItems.length === 0) return;

        const timelineObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('timeline-visible');
                    
                    // Animate the marker
                    const marker = entry.target.querySelector('.timeline-marker');
                    if (marker) {
                        setTimeout(() => {
                            marker.classList.add('marker-animate');
                        }, 200);
                    }
                }
            });
        }, {
            threshold: 0.3,
            rootMargin: '0px 0px -100px 0px'
        });

        timelineItems.forEach(item => {
            timelineObserver.observe(item);
        });
    }

    // ==========================================
    // SMOOTH SCROLL FOR ANCHOR LINKS
    // ==========================================

    function initSmoothScroll() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                
                // Skip if it's just "#"
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (!target) return;

                e.preventDefault();

                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });

                // Update URL without jumping
                if (history.pushState) {
                    history.pushState(null, null, href);
                }
            });
        });
    }

    // ==========================================
    // PARALLAX EFFECT FOR HERO BACKGROUND
    // ==========================================

    function initParallaxEffect() {
        const heroPattern = document.querySelector('.hero-background-pattern');
        
        if (!heroPattern) return;

        const handleParallax = debounce(() => {
            const scrolled = window.pageYOffset;
            const parallaxSpeed = 0.5;
            heroPattern.style.transform = `translateY(${scrolled * parallaxSpeed}px)`;
        }, 10);

        window.addEventListener('scroll', handleParallax, { passive: true });
    }

    // ==========================================
    // TEAM CARD 3D TILT EFFECT
    // ==========================================

    function initTeamCardTilt() {
        const teamCards = document.querySelectorAll('.team-card');
        
        if (teamCards.length === 0) return;

        teamCards.forEach(card => {
            card.addEventListener('mousemove', function(e) {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const rotateX = (y - centerY) / 15;
                const rotateY = (centerX - x) / 15;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-12px)`;
            });
            
            card.addEventListener('mouseleave', function() {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
            });
        });
    }

    // ==========================================
    // FEATURE CARDS STAGGER HOVER EFFECT
    // ==========================================

    function initFeatureCardEffects() {
        const featureCards = document.querySelectorAll('.feature-card');
        
        if (featureCards.length === 0) return;

        featureCards.forEach(card => {
            const icon = card.querySelector('.feature-icon');
            
            card.addEventListener('mouseenter', function() {
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.className = 'card-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 0;
                    height: 0;
                    border-radius: 50%;
                    background: rgba(245, 158, 11, 0.1);
                    transform: translate(-50%, -50%);
                    animation: rippleEffect 0.6s ease-out;
                    pointer-events: none;
                `;
                
                card.style.position = 'relative';
                card.appendChild(ripple);
                
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add ripple animation to document if not exists
        if (!document.getElementById('ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'ripple-animation';
            style.textContent = `
                @keyframes rippleEffect {
                    to {
                        width: 500px;
                        height: 500px;
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==========================================
    // LAZY LOAD IMAGES
    // ==========================================

    function initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        if (images.length === 0) return;

        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.getAttribute('data-src');
                    img.removeAttribute('data-src');
                    img.classList.add('loaded');
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: '200px'
        });

        images.forEach(img => imageObserver.observe(img));
    }

    // ==========================================
    // LAZY LOAD GOOGLE MAPS IFRAME
    // ==========================================

    function initMapLazyLoad() {
        const mapWrapper = document.querySelector('.map-wrapper');
        const mapIframe = mapWrapper?.querySelector('iframe');
        
        if (!mapIframe) return;

        // Store the src and remove it initially
        const mapSrc = mapIframe.getAttribute('src');
        mapIframe.removeAttribute('src');
        mapIframe.style.background = 'var(--bg-tertiary)';

        const mapObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    mapIframe.setAttribute('src', mapSrc);
                    
                    // Add loading animation
                    mapWrapper.classList.add('map-loading');
                    
                    mapIframe.addEventListener('load', () => {
                        mapWrapper.classList.remove('map-loading');
                        mapWrapper.classList.add('map-loaded');
                    });
                    
                    mapObserver.unobserve(mapWrapper);
                }
            });
        }, {
            rootMargin: '300px'
        });

        mapObserver.observe(mapWrapper);
    }

    // ==========================================
    // TIMELINE PROGRESS INDICATOR
    // ==========================================

    function initTimelineProgress() {
        const timelineLine = document.querySelector('.timeline-line');
        
        if (!timelineLine) return;

        const updateProgress = debounce(() => {
            const timelineSection = document.querySelector('.timeline-section');
            if (!timelineSection) return;

            const sectionTop = timelineSection.offsetTop;
            const sectionHeight = timelineSection.offsetHeight;
            const scrolled = window.pageYOffset;
            const windowHeight = window.innerHeight;

            const progress = Math.min(
                Math.max(
                    (scrolled + windowHeight - sectionTop) / sectionHeight,
                    0
                ),
                1
            );

            timelineLine.style.transform = `scaleY(${progress})`;
            timelineLine.style.transformOrigin = 'top';
        }, 10);

        window.addEventListener('scroll', updateProgress, { passive: true });
        updateProgress(); // Initial call
    }

    // ==========================================
    // BUTTON RIPPLE EFFECT
    // ==========================================

    function initButtonRipple() {
        const buttons = document.querySelectorAll('.btn');
        
        buttons.forEach(button => {
            button.addEventListener('click', function(e) {
                const ripple = document.createElement('span');
                const rect = button.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;
                
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    border-radius: 50%;
                    background: rgba(255, 255, 255, 0.3);
                    left: ${x}px;
                    top: ${y}px;
                    transform: scale(0);
                    animation: buttonRipple 0.6s ease-out;
                    pointer-events: none;
                `;
                
                button.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            });
        });

        // Add animation if not exists
        if (!document.getElementById('button-ripple-animation')) {
            const style = document.createElement('style');
            style.id = 'button-ripple-animation';
            style.textContent = `
                @keyframes buttonRipple {
                    to {
                        transform: scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // ==========================================
    // TESTIMONIAL SLIDER (Optional Enhancement)
    // ==========================================

    function initTestimonialRotation() {
        const testimonialCards = document.querySelectorAll('.testimonial-card');
        
        if (testimonialCards.length <= 3) return; // No need if 3 or fewer

        let currentIndex = 0;
        const rotationInterval = 5000; // 5 seconds

        function rotateTestimonials() {
            testimonialCards.forEach((card, index) => {
                if (index >= currentIndex && index < currentIndex + 3) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });

            currentIndex = (currentIndex + 1) % (testimonialCards.length - 2);
        }

        // Auto-rotation (commented out by default)
        // setInterval(rotateTestimonials, rotationInterval);
    }

    // ==========================================
    // SCROLL TO TOP BUTTON
    // ==========================================

    function initScrollToTop() {
        // Create scroll to top button
        const scrollBtn = document.createElement('button');
        scrollBtn.className = 'scroll-to-top';
        scrollBtn.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollBtn.setAttribute('aria-label', 'Scroll to top');
        scrollBtn.style.cssText = `
            position: fixed;
            bottom: 30px;
            right: 30px;
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: var(--gradient-accent);
            color: var(--bg-primary);
            border: none;
            cursor: pointer;
            opacity: 0;
            visibility: hidden;
            transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
            z-index: 999;
            box-shadow: 0 5px 20px rgba(245, 158, 11, 0.3);
            font-size: 1.2rem;
        `;
        
        document.body.appendChild(scrollBtn);

        // Show/hide based on scroll position
        const toggleScrollBtn = debounce(() => {
            if (window.pageYOffset > 500) {
                scrollBtn.style.opacity = '1';
                scrollBtn.style.visibility = 'visible';
            } else {
                scrollBtn.style.opacity = '0';
                scrollBtn.style.visibility = 'hidden';
            }
        }, 100);

        window.addEventListener('scroll', toggleScrollBtn, { passive: true });

        // Scroll to top on click
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Hover effect
        scrollBtn.addEventListener('mouseenter', () => {
            scrollBtn.style.transform = 'translateY(-5px) scale(1.1)';
        });

        scrollBtn.addEventListener('mouseleave', () => {
            scrollBtn.style.transform = 'translateY(0) scale(1)';
        });
    }

    // ==========================================
    // ACTIVE NAVIGATION HIGHLIGHT
    // ==========================================

    function initActiveNavigation() {
        const sections = document.querySelectorAll('section[id], section[class*="section"]');
        const navLinks = document.querySelectorAll('.nav-links a');

        if (sections.length === 0 || navLinks.length === 0) return;

        const highlightNav = debounce(() => {
            let current = '';
            const scrollPos = window.pageYOffset + 150;

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.offsetHeight;
                const sectionId = section.getAttribute('id');

                if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                    current = sectionId;
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}` || 
                    (current === '' && link.getAttribute('href') === '#')) {
                    link.classList.add('active');
                }
            });
        }, 100);

        window.addEventListener('scroll', highlightNav, { passive: true });
    }

    // ==========================================
    // FLOATING CARDS ANIMATION
    // ==========================================

    function initFloatingCards() {
        const floatingCards = document.querySelectorAll('.hero-floating-card');
        
        floatingCards.forEach((card, index) => {
            // Add slight random movement
            setInterval(() => {
                const randomX = (Math.random() - 0.5) * 10;
                const randomY = (Math.random() - 0.5) * 10;
                card.style.transform = `translate(${randomX}px, ${randomY}px)`;
            }, 3000 + (index * 1000));
        });
    }

    // ==========================================
    // PERFORMANCE OPTIMIZATION
    // ==========================================

    function optimizePerformance() {
        // Disable animations on low-end devices
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        if (mediaQuery.matches) {
            document.documentElement.style.setProperty('--transition-speed', '0s');
            console.log('Reduced motion preference detected. Animations disabled.');
        }

        // Add loading class to body
        document.body.classList.add('page-loaded');
    }

    // ==========================================
    // ERROR HANDLING & LOGGING
    // ==========================================

    function setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('Page error:', e.message);
        });

        console.log('%c✨ Perfect Chess Academy - About Page Loaded Successfully!', 
            'color: #f59e0b; font-size: 16px; font-weight: bold;');
    }

    // ==========================================
    // INITIALIZE ALL FEATURES
    // ==========================================

    function init() {
        // Wait for DOM to be fully loaded
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        console.log('Initializing About Page Interactive Features...');

        try {
            // Core animations
            initScrollReveal();
            initCounters();
            initTimelineAnimations();
            
            // User interactions
            initSmoothScroll();
            initTeamCardTilt();
            initFeatureCardEffects();
            initButtonRipple();
            
            // Performance optimizations
            initLazyLoading();
            initMapLazyLoad();
            initParallaxEffect();
            
            // Additional features
            initTimelineProgress();
            initScrollToTop();
            initActiveNavigation();
            initFloatingCards();
            
            // Final setup
            optimizePerformance();
            setupErrorHandling();

            console.log('✓ All interactive features initialized successfully!');
        } catch (error) {
            console.error('Error initializing page features:', error);
        }
    }

    // Start initialization
    init();

    // Expose utility functions globally if needed
    window.PCAUtils = {
        debounce,
        isInViewport
    };

})();

/* ==========================================
   END OF ABOUT PAGE INTERACTIVE JS
   ========================================== */
