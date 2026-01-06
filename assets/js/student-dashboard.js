/**
 * STUDENT DASHBOARD JAVASCRIPT
 * Perfect Chess Academy - 2025
 * Handles animations, chart rendering, and interactive features
 */

// ========================================
// INITIALIZATION
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initializeAnimations();
    initializeCounters();
    initializeProgressBars();
    initializeRatingChart();
    initializeMobileMenu();
});

// ========================================
// STAT COUNTER ANIMATION
// ========================================
function initializeCounters() {
    const counters = document.querySelectorAll('.stat-value[data-target]');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const increment = target / (duration / 16); // 60 FPS
        let current = 0;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // Intersection Observer for triggering animations when visible
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && entry.target.textContent === '0') {
                animateCounter(entry.target);
            }
        });
    }, { threshold: 0.5 });
    
    counters.forEach(counter => observer.observe(counter));
}

// ========================================
// PROGRESS BAR ANIMATIONS
// ========================================
function initializeProgressBars() {
    const progressBars = document.querySelectorAll('.progress-fill[data-width], .performance-fill[data-width]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const targetWidth = bar.getAttribute('data-width');
                
                // Small delay for smoother animation
                setTimeout(() => {
                    bar.style.width = targetWidth + '%';
                }, 100);
                
                observer.unobserve(bar);
            }
        });
    }, { threshold: 0.5 });
    
    progressBars.forEach(bar => {
        bar.style.width = '0%'; // Reset to 0
        observer.observe(bar);
    });
}

// ========================================
// STAT CARD FADE-IN ANIMATIONS
// ========================================
function initializeAnimations() {
    const statCards = document.querySelectorAll('.stat-card[data-animation]');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const card = entry.target;
                const delay = card.getAttribute('data-delay') || 0;
                
                setTimeout(() => {
                    card.classList.add('animate');
                }, parseInt(delay));
                
                observer.unobserve(card);
            }
        });
    }, { threshold: 0.2 });
    
    statCards.forEach(card => observer.observe(card));
}

// ========================================
// RATING PROGRESS CHART (Chart.js)
// ========================================
function initializeRatingChart() {
    const ctx = document.getElementById('ratingChart');
    if (!ctx) return;
    
    // Mock rating data for the last 30 days
    const labels = generateDateLabels(30);
    const ratingData = generateRatingData(1400, 1485, 30);
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Rating',
                data: ratingData,
                borderColor: getComputedStyle(document.documentElement)
                    .getPropertyValue('--accent-primary').trim() || '#f59e0b',
                backgroundColor: 'rgba(245, 158, 11, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointHoverRadius: 6,
                pointBackgroundColor: '#f59e0b',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#fff',
                pointHoverBorderColor: '#f59e0b',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(17, 24, 39, 0.95)',
                    titleColor: '#f9fafb',
                    bodyColor: '#f9fafb',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    padding: 12,
                    displayColors: false,
                    callbacks: {
                        label: function(context) {
                            return 'Rating: ' + context.parsed.y;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    min: 1350,
                    max: 1550,
                    ticks: {
                        stepSize: 25,
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--text-secondary').trim() || '#d1d5db',
                        font: {
                            size: 12,
                            weight: '600'
                        }
                    },
                    grid: {
                        color: 'rgba(249, 250, 251, 0.05)',
                        drawBorder: false
                    }
                },
                x: {
                    ticks: {
                        color: getComputedStyle(document.documentElement)
                            .getPropertyValue('--text-secondary').trim() || '#d1d5db',
                        font: {
                            size: 11,
                            weight: '600'
                        },
                        maxRotation: 0,
                        autoSkip: true,
                        maxTicksLimit: 8
                    },
                    grid: {
                        display: false,
                        drawBorder: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
    
    // Handle timeframe selector
    const timeframeSelect = document.getElementById('rating-timeframe');
    if (timeframeSelect) {
        timeframeSelect.addEventListener('change', function() {
            const days = parseInt(this.value);
            updateChartData(chart, days);
        });
    }
}

// ========================================
// HELPER FUNCTIONS FOR CHART
// ========================================
function generateDateLabels(days) {
    const labels = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        // Format as "Jan 3" or "12/3" depending on preference
        const month = date.toLocaleDateString('en-US', { month: 'short' });
        const day = date.getDate();
        labels.push(`${month} ${day}`);
    }
    
    return labels;
}

function generateRatingData(startRating, endRating, days) {
    const data = [];
    const totalChange = endRating - startRating;
    
    for (let i = 0; i < days; i++) {
        // Simulate realistic rating progression with some variance
        const progress = i / (days - 1);
        const baseRating = startRating + (totalChange * progress);
        const variance = (Math.random() - 0.5) * 20; // Random variance ±10
        const rating = Math.round(baseRating + variance);
        data.push(rating);
    }
    
    // Ensure last data point matches exact target
    data[data.length - 1] = endRating;
    
    return data;
}

function updateChartData(chart, days) {
    const labels = generateDateLabels(days);
    const ratingData = generateRatingData(1400, 1485, days);
    
    chart.data.labels = labels;
    chart.data.datasets[0].data = ratingData;
    chart.update('active');
}

// ========================================
// MOBILE MENU FUNCTIONALITY
// ========================================
function initializeMobileMenu() {
    const hamburgerBtn = document.querySelector('.hamburger-btn');
    const mobileMenu = document.getElementById('nav-links-mobile');
    const mobileMenuClose = document.querySelector('.mobile-menu-close');
    const backdrop = document.querySelector('.mobile-menu-backdrop');
    const body = document.body;
    
    if (!hamburgerBtn || !mobileMenu) return;
    
    function openMobileMenu() {
        mobileMenu.classList.add('active');
        backdrop.classList.add('active');
        body.classList.add('mobile-menu-is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'true');
    }
    
    function closeMobileMenu() {
        mobileMenu.classList.remove('active');
        backdrop.classList.remove('active');
        body.classList.remove('mobile-menu-is-open');
        hamburgerBtn.setAttribute('aria-expanded', 'false');
    }
    
    hamburgerBtn.addEventListener('click', () => {
        const isOpen = body.classList.contains('mobile-menu-is-open');
        if (isOpen) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    });
    
    if (mobileMenuClose) {
        mobileMenuClose.addEventListener('click', closeMobileMenu);
    }
    
    if (backdrop) {
        backdrop.addEventListener('click', closeMobileMenu);
    }
    
    // Close on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && body.classList.contains('mobile-menu-is-open')) {
            closeMobileMenu();
        }
    });
}

// ========================================
// BACK TO TOP BUTTON
// ========================================
const backToTopBtn = document.querySelector('.back-to-top');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    });
    
    backToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// ========================================
// CONSOLE GREETING
// ========================================
console.log('%c👋 Welcome to Perfect Chess Academy Dashboard!', 'color: #f59e0b; font-size: 16px; font-weight: bold;');
console.log('%c♟️ Track your progress, book classes, and improve your game.', 'color: #d1d5db; font-size: 12px;');
