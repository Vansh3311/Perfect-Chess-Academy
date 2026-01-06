/* ============================================
   MODERN BLOG JAVASCRIPT 2025
   Perfect Chess Academy
   Features: Search, Filter, Sort, Animations
   ============================================ */

(function() {
    'use strict';

    // ============================================
    // STATE MANAGEMENT
    // ============================================
    const blogState = {
        currentCategory: 'all',
        currentSort: 'recent',
        searchQuery: '',
        articlesPerPage: 12,
        currentPage: 1,
        totalArticles: 250
    };

    // ============================================
    // DOM ELEMENTS
    // ============================================
    const elements = {
        // Progress bar
        readingProgress: document.getElementById('readingProgress'),
        
        // Search and filters
        searchInput: document.getElementById('searchInput'),
        categoryPills: document.querySelectorAll('.category-pill'),
        sortSelect: document.getElementById('sortSelect'),
        activeFilters: document.getElementById('activeFilters'),
        resultCount: document.getElementById('resultCount'),
        
        // Articles grid
        articlesGrid: document.getElementById('articlesGrid'),
        loadMoreBtn: document.getElementById('loadMoreBtn'),
        
        // Trending scroll
        trendingScroll: document.getElementById('trendingScroll'),
        scrollLeftBtn: document.querySelector('.scroll-left'),
        scrollRightBtn: document.querySelector('.scroll-right'),
        
        // Newsletter
        newsletterForm: document.getElementById('newsletterForm'),
        
        // Back to top
        backToTop: document.getElementById('backToTop'),
        
        // Filter section
        filterSection: document.getElementById('filterSection')
    };

    // ============================================
    // READING PROGRESS BAR
    // ============================================
    function updateReadingProgress() {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = (winScroll / height) * 100;
        
        if (elements.readingProgress) {
            elements.readingProgress.style.width = scrolled + '%';
        }
    }

    // ============================================
    // SEARCH FUNCTIONALITY
    // ============================================
    function handleSearch(query) {
        blogState.searchQuery = query.toLowerCase().trim();
        blogState.currentPage = 1;
        
        filterAndDisplayArticles();
        updateActiveFilters();
        
        // Log search for analytics (optional)
        console.log('Search:', blogState.searchQuery);
    }

    // Debounce search input
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

    const debouncedSearch = debounce(handleSearch, 300);

    // ============================================
    // CATEGORY FILTERING
    // ============================================
    function handleCategoryFilter(category) {
        blogState.currentCategory = category;
        blogState.currentPage = 1;
        
        // Update active pill
        elements.categoryPills.forEach(pill => {
            pill.classList.remove('active');
            if (pill.dataset.category === category) {
                pill.classList.add('active');
            }
        });
        
        filterAndDisplayArticles();
        updateActiveFilters();
        
        // Smooth scroll to articles
        scrollToArticles();
    }

    // ============================================
    // SORT FUNCTIONALITY
    // ============================================
    function handleSort(sortType) {
        blogState.currentSort = sortType;
        filterAndDisplayArticles();
    }

    // ============================================
    // FILTER AND DISPLAY ARTICLES
    // ============================================
    function filterAndDisplayArticles() {
        if (!elements.articlesGrid) return;
        
        const allArticles = elements.articlesGrid.querySelectorAll('.bento-card');
        let visibleCount = 0;
        
        allArticles.forEach(article => {
            const articleCategory = article.dataset.category;
            const articleTitle = article.querySelector('.bento-title')?.textContent.toLowerCase() || '';
            const articleExcerpt = article.querySelector('.bento-excerpt')?.textContent.toLowerCase() || '';
            
            // Check category match
            const categoryMatch = blogState.currentCategory === 'all' || articleCategory === blogState.currentCategory;
            
            // Check search match
            const searchMatch = !blogState.searchQuery || 
                               articleTitle.includes(blogState.searchQuery) || 
                               articleExcerpt.includes(blogState.searchQuery);
            
            // Show or hide article
            if (categoryMatch && searchMatch) {
                article.style.display = '';
                article.style.animation = 'fadeInUp 0.6s ease-out backwards';
                article.style.animationDelay = `${visibleCount * 0.05}s`;
                visibleCount++;
            } else {
                article.style.display = 'none';
            }
        });
        
        // Update result count
        if (elements.resultCount) {
            elements.resultCount.textContent = visibleCount;
        }
        
        // Show empty state if no results
        handleEmptyState(visibleCount);
        
        // Update load more button
        updateLoadMoreButton(visibleCount);
    }

    // ============================================
    // ACTIVE FILTERS DISPLAY
    // ============================================
    function updateActiveFilters() {
        if (!elements.activeFilters) return;
        
        elements.activeFilters.innerHTML = '';
        
        // Add search filter tag
        if (blogState.searchQuery) {
            const filterTag = createFilterTag('Search', blogState.searchQuery, () => {
                elements.searchInput.value = '';
                blogState.searchQuery = '';
                filterAndDisplayArticles();
                updateActiveFilters();
            });
            elements.activeFilters.appendChild(filterTag);
        }
        
        // Add category filter tag
        if (blogState.currentCategory !== 'all') {
            const categoryName = blogState.currentCategory.charAt(0).toUpperCase() + blogState.currentCategory.slice(1);
            const filterTag = createFilterTag('Category', categoryName, () => {
                blogState.currentCategory = 'all';
                elements.categoryPills.forEach(pill => {
                    pill.classList.toggle('active', pill.dataset.category === 'all');
                });
                filterAndDisplayArticles();
                updateActiveFilters();
            });
            elements.activeFilters.appendChild(filterTag);
        }
    }

    function createFilterTag(label, value, removeCallback) {
        const tag = document.createElement('div');
        tag.className = 'filter-tag';
        tag.innerHTML = `
            <span>${label}: ${value}</span>
            <button type="button" aria-label="Remove ${label} filter">&times;</button>
        `;
        tag.querySelector('button').addEventListener('click', removeCallback);
        return tag;
    }

    // ============================================
    // EMPTY STATE
    // ============================================
    function handleEmptyState(visibleCount) {
        // Remove existing empty state
        const existingEmptyState = document.querySelector('.empty-state-modern');
        if (existingEmptyState) {
            existingEmptyState.remove();
        }
        
        // Show empty state if no results
        if (visibleCount === 0 && elements.articlesGrid) {
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-state-modern';
            emptyState.innerHTML = `
                <div style="text-align: center; padding: 4rem 2rem;">
                    <div style="font-size: 4rem; color: var(--text-muted); margin-bottom: 1rem;">
                        <i class="fas fa-search"></i>
                    </div>
                    <h3 style="font-size: 1.5rem; color: var(--text-primary); margin-bottom: 0.5rem;">
                        No Articles Found
                    </h3>
                    <p style="color: var(--text-secondary); margin-bottom: 2rem;">
                        Try adjusting your filters or search query
                    </p>
                    <button class="btn-reset-filters" style="padding: 0.75rem 2rem; background: var(--gradient-strategy); color: var(--bg-primary); border: none; border-radius: 12px; font-weight: 700; cursor: pointer;">
                        <i class="fas fa-redo"></i> Reset Filters
                    </button>
                </div>
            `;
            elements.articlesGrid.appendChild(emptyState);
            
            // Add reset functionality
            emptyState.querySelector('.btn-reset-filters').addEventListener('click', resetAllFilters);
        }
    }

    function resetAllFilters() {
        blogState.currentCategory = 'all';
        blogState.searchQuery = '';
        blogState.currentSort = 'recent';
        
        elements.searchInput.value = '';
        elements.sortSelect.value = 'recent';
        
        elements.categoryPills.forEach(pill => {
            pill.classList.toggle('active', pill.dataset.category === 'all');
        });
        
        filterAndDisplayArticles();
        updateActiveFilters();
    }

    // ============================================
    // HORIZONTAL SCROLL - TRENDING SECTION
    // ============================================
    function setupTrendingScroll() {
        if (!elements.trendingScroll) return;
        
        const scrollAmount = 340; // Card width + gap
        
        if (elements.scrollLeftBtn) {
            elements.scrollLeftBtn.addEventListener('click', () => {
                elements.trendingScroll.scrollBy({
                    left: -scrollAmount,
                    behavior: 'smooth'
                });
            });
        }
        
        if (elements.scrollRightBtn) {
            elements.scrollRightBtn.addEventListener('click', () => {
                elements.trendingScroll.scrollBy({
                    left: scrollAmount,
                    behavior: 'smooth'
                });
            });
        }
        
        // Update button states based on scroll position
        elements.trendingScroll.addEventListener('scroll', updateScrollButtons);
        updateScrollButtons(); // Initial state
    }

    function updateScrollButtons() {
        if (!elements.trendingScroll) return;
        
        const scrollLeft = elements.trendingScroll.scrollLeft;
        const maxScroll = elements.trendingScroll.scrollWidth - elements.trendingScroll.clientWidth;
        
        if (elements.scrollLeftBtn) {
            elements.scrollLeftBtn.style.opacity = scrollLeft > 0 ? '1' : '0.5';
            elements.scrollLeftBtn.style.pointerEvents = scrollLeft > 0 ? 'all' : 'none';
        }
        
        if (elements.scrollRightBtn) {
            elements.scrollRightBtn.style.opacity = scrollLeft < maxScroll - 10 ? '1' : '0.5';
            elements.scrollRightBtn.style.pointerEvents = scrollLeft < maxScroll - 10 ? 'all' : 'none';
        }
    }

    // ============================================
    // LOAD MORE FUNCTIONALITY
    // ============================================
    function updateLoadMoreButton(visibleCount) {
        if (!elements.loadMoreBtn) return;
        
        const loadMoreSection = elements.loadMoreBtn.closest('.load-more-section');
        const loadMoreText = loadMoreSection?.querySelector('.load-more-text');
        
        // Hide load more if all articles are visible
        if (visibleCount <= blogState.articlesPerPage) {
            if (loadMoreSection) {
                loadMoreSection.style.display = 'none';
            }
        } else {
            if (loadMoreSection) {
                loadMoreSection.style.display = 'block';
            }
            if (loadMoreText) {
                loadMoreText.textContent = `Showing ${Math.min(blogState.articlesPerPage, visibleCount)} of ${visibleCount} articles`;
            }
        }
    }

    function handleLoadMore() {
        // In a real application, this would load more articles via AJAX
        // For now, we'll simulate by showing more existing articles
        
        const button = elements.loadMoreBtn;
        const originalText = button.innerHTML;
        
        // Show loading state
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            blogState.currentPage++;
            blogState.articlesPerPage += 12;
            
            filterAndDisplayArticles();
            
            // Reset button
            button.innerHTML = originalText;
            button.disabled = false;
            
            // Smooth scroll to newly loaded content
            setTimeout(() => {
                const visibleArticles = Array.from(elements.articlesGrid.querySelectorAll('.bento-card'))
                    .filter(article => article.style.display !== 'none');
                const scrollTarget = visibleArticles[visibleArticles.length - 12];
                if (scrollTarget) {
                    scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        }, 1000);
    }

    // ============================================
    // NEWSLETTER FORM
    // ============================================
    function handleNewsletterSubmit(e) {
        e.preventDefault();
        
        const form = e.target;
        const emailInput = form.querySelector('.newsletter-input');
        const submitBtn = form.querySelector('.newsletter-submit');
        const email = emailInput.value.trim();
        
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address', 'error');
            return;
        }
        
        // Show loading state
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
        submitBtn.disabled = true;
        
        // Simulate API call (replace with actual backend endpoint)
        setTimeout(() => {
            // Success
            showNotification('Successfully subscribed! Check your email for the free guide.', 'success');
            form.reset();
            
            // Reset button
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
            
            // Track conversion (optional - for analytics)
            console.log('Newsletter subscription:', email);
        }, 1500);
    }

    function showNotification(message, type = 'info') {
        // Remove existing notification
        const existing = document.querySelector('.notification-toast');
        if (existing) existing.remove();
        
        // Create notification
        const notification = document.createElement('div');
        notification.className = `notification-toast notification-${type}`;
        notification.innerHTML = `
            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem 1.5rem; background: var(--bg-secondary); border: 2px solid ${type === 'success' ? 'var(--students-color)' : type === 'error' ? '#ef4444' : 'var(--strategy-color)'}; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.2); position: fixed; bottom: 2rem; right: 2rem; z-index: 10000; max-width: 400px; animation: slideInRight 0.3s ease;">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}" style="color: ${type === 'success' ? 'var(--students-color)' : type === 'error' ? '#ef4444' : 'var(--strategy-color)'}; font-size: 1.5rem;"></i>
                <span style="color: var(--text-primary); font-weight: 600; flex: 1;">${message}</span>
                <button onclick="this.parentElement.parentElement.remove()" style="background: none; border: none; color: var(--text-secondary); cursor: pointer; font-size: 1.5rem; padding: 0;">&times;</button>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    }

    // ============================================
    // BACK TO TOP BUTTON
    // ============================================
    function updateBackToTop() {
        if (!elements.backToTop) return;
        
        if (window.pageYOffset > 500) {
            elements.backToTop.classList.add('visible');
        } else {
            elements.backToTop.classList.remove('visible');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    function scrollToArticles() {
        const articlesSection = document.querySelector('.articles-main-section');
        if (articlesSection) {
            const offset = 100; // Account for sticky header
            const elementPosition = articlesSection.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    }

    // ============================================
    // INTERSECTION OBSERVER - ANIMATIONS
    // ============================================
    function setupIntersectionObserver() {
        const observerOptions = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe all bento cards
        document.querySelectorAll('.bento-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
        
        // Observe category cards
        document.querySelectorAll('.category-card-modern').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(30px)';
            card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(card);
        });
    }

    // ============================================
    // STICKY FILTER BEHAVIOR
    // ============================================
    function handleStickyFilter() {
        if (!elements.filterSection) return;
        
        const scrollPosition = window.pageYOffset;
        const headerHeight = 70; // Your header height
        
        if (scrollPosition > headerHeight) {
            elements.filterSection.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        } else {
            elements.filterSection.style.boxShadow = 'none';
        }
    }

    // ============================================
    // KEYBOARD SHORTCUTS
    // ============================================
    function setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + K to focus search
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                elements.searchInput?.focus();
            }
            
            // Escape to clear filters
            if (e.key === 'Escape') {
                if (document.activeElement === elements.searchInput) {
                    elements.searchInput.blur();
                } else if (blogState.currentCategory !== 'all' || blogState.searchQuery) {
                    resetAllFilters();
                }
            }
        });
    }

    // ============================================
    // LOCAL STORAGE - SAVE PREFERENCES
    // ============================================
    function savePreferences() {
        const preferences = {
            lastCategory: blogState.currentCategory,
            lastSort: blogState.currentSort
        };
        try {
            localStorage.setItem('pca-blog-prefs', JSON.stringify(preferences));
        } catch (e) {
            console.log('Could not save preferences');
        }
    }

    function loadPreferences() {
        try {
            const saved = localStorage.getItem('pca-blog-prefs');
            if (saved) {
                const preferences = JSON.parse(saved);
                
                // Apply saved category
                if (preferences.lastCategory && preferences.lastCategory !== 'all') {
                    blogState.currentCategory = preferences.lastCategory;
                    elements.categoryPills.forEach(pill => {
                        pill.classList.toggle('active', pill.dataset.category === preferences.lastCategory);
                    });
                }
                
                // Apply saved sort
                if (preferences.lastSort && elements.sortSelect) {
                    blogState.currentSort = preferences.lastSort;
                    elements.sortSelect.value = preferences.lastSort;
                }
                
                filterAndDisplayArticles();
            }
        } catch (e) {
            console.log('Could not load preferences');
        }
    }

    // ============================================
    // EVENT LISTENERS
    // ============================================
    function setupEventListeners() {
        // Scroll events
        window.addEventListener('scroll', () => {
            updateReadingProgress();
            updateBackToTop();
            handleStickyFilter();
        });
        
        // Search input
        if (elements.searchInput) {
            elements.searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
        }
        
        // Category pills
        elements.categoryPills.forEach(pill => {
            pill.addEventListener('click', () => {
                handleCategoryFilter(pill.dataset.category);
                savePreferences();
            });
        });
        
        // Sort select
        if (elements.sortSelect) {
            elements.sortSelect.addEventListener('change', (e) => {
                handleSort(e.target.value);
                savePreferences();
            });
        }
        
        // Load more button
        if (elements.loadMoreBtn) {
            elements.loadMoreBtn.addEventListener('click', handleLoadMore);
        }
        
        // Newsletter form
        if (elements.newsletterForm) {
            elements.newsletterForm.addEventListener('submit', handleNewsletterSubmit);
        }
        
        // Back to top button
        if (elements.backToTop) {
            elements.backToTop.addEventListener('click', scrollToTop);
        }
        
        // Trending scroll
        setupTrendingScroll();
        
        // Keyboard shortcuts
        setupKeyboardShortcuts();
        
        // Resize events (debounced)
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                updateScrollButtons();
            }, 250);
        });
    }

    // ============================================
    // INITIALIZATION
    // ============================================
    function init() {
        console.log('🎯 Perfect Chess Academy Blog - Initialized');
        
        // Load saved preferences
        loadPreferences();
        
        // Setup event listeners
        setupEventListeners();
        
        // Initial filter display
        filterAndDisplayArticles();
        
        // Setup animations
        setupIntersectionObserver();
        
        // Initial scroll button state
        updateScrollButtons();
        
        // Initial back to top state
        updateBackToTop();
        
        // Initial reading progress
        updateReadingProgress();
        
        // Log analytics (optional)
        console.log('Blog State:', blogState);
    }

    // ============================================
    // START APPLICATION
    // ============================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // ============================================
    // ADDITIONAL ANIMATIONS FOR NOTIFICATIONS
    // ============================================
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100px);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100px);
            }
        }
    `;
    document.head.appendChild(style);

})();

/* ============================================
   END OF BLOG MODERN JAVASCRIPT
   ============================================ */
