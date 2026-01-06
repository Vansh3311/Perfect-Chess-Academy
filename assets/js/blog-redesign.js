/* ================================================================
   BLOG REDESIGN JAVASCRIPT - FIXED & DEBUGGED
   Full error handling and null checks
   ================================================================ */

(function() {
    'use strict';
    
    // Configuration
    const CONFIG = {
        STORAGE_KEYS: {
            BOOKMARKS: 'blog_bookmarks',
            LIKES: 'blog_likes',
            COMMENTS: 'blog_comments',
            SETTINGS: 'blog_settings'
        },
        TOAST_DURATION: 3000
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    function init() {
        console.log('🚀 Blog JS Initialized');
        
        initReadingProgress();
        initStickyNav();
        initCategoryFilters();
        initSearch();
        initViewToggle();
        initBookmarks();
        initLikes();
        initComments();
        initShare();
        initCards();
        initNewsletter();
        initLoadMore();
        initBackToTop();
        initModals();
        initToasts();
        loadUserData();
    }
    
    // ===== READING PROGRESS =====
    function initReadingProgress() {
        const bar = document.getElementById('reading-progress');
        if (!bar) return;
        
        window.addEventListener('scroll', () => {
            const winHeight = window.innerHeight;
            const docHeight = document.documentElement.scrollHeight - winHeight;
            const scrolled = window.scrollY;
            const progress = (scrolled / docHeight) * 100;
            bar.style.width = Math.min(progress, 100) + '%';
        });
    }
    
    // ===== STICKY NAV =====
    function initStickyNav() {
        const nav = document.getElementById('stickyNav');
        if (!nav) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }
    
    // ===== CATEGORY FILTERS =====
    function initCategoryFilters() {
        const chips = document.querySelectorAll('.category-chip');
        const cards = document.querySelectorAll('.blog-card-enhanced');
        
        if (!chips.length || !cards.length) return;
        
        chips.forEach(chip => {
            chip.addEventListener('click', function() {
                const category = this.dataset.category;
                
                // Update active state
                chips.forEach(c => {
                    c.classList.remove('active');
                    c.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                
                // Filter cards
                cards.forEach(card => {
                    const cardCat = card.dataset.category;
                    if (category === 'all' || cardCat === category) {
                        card.style.display = 'flex';
                    } else {
                        card.style.display = 'none';
                    }
                });
                
                updateCounts();
            });
        });
    }
    
    // ===== SEARCH =====
    function initSearch() {
        const input = document.getElementById('heroSearchInput');
        const cards = document.querySelectorAll('.blog-card-enhanced');
        
        if (!input || !cards.length) return;
        
        let timeout;
        input.addEventListener('input', function() {
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                const term = this.value.toLowerCase().trim();
                
                cards.forEach(card => {
                    const title = card.querySelector('.card-title')?.textContent.toLowerCase() || '';
                    const excerpt = card.querySelector('.card-excerpt')?.textContent.toLowerCase() || '';
                    const cat = card.dataset.category?.toLowerCase() || '';
                    
                    const matches = !term || title.includes(term) || excerpt.includes(term) || cat.includes(term);
                    card.style.display = matches ? 'flex' : 'none';
                });
                
                updateCounts();
            }, 300);
        });
    }
    
    // ===== VIEW TOGGLE =====
    function initViewToggle() {
        const toggles = document.querySelectorAll('.view-toggle');
        const grid = document.querySelector('.blog-cards-grid');
        const cards = document.querySelectorAll('.blog-card-enhanced');
        
        if (!toggles.length || !grid) return;
        
        toggles.forEach(toggle => {
            toggle.addEventListener('click', function() {
                const view = this.dataset.view;
                
                toggles.forEach(t => {
                    t.classList.remove('active');
                    t.setAttribute('aria-pressed', 'false');
                });
                this.classList.add('active');
                this.setAttribute('aria-pressed', 'true');
                
                if (view === 'list') {
                    grid.style.gridTemplateColumns = '1fr';
                    cards.forEach(card => {
                        card.style.flexDirection = 'row';
                        const img = card.querySelector('.card-image-wrapper');
                        if (img) {
                            img.style.width = '35%';
                            img.style.height = 'auto';
                        }
                    });
                } else {
                    grid.style.gridTemplateColumns = '';
                    cards.forEach(card => {
                        card.style.flexDirection = 'column';
                        const img = card.querySelector('.card-image-wrapper');
                        if (img) {
                            img.style.width = '100%';
                            img.style.height = '240px';
                        }
                    });
                }
            });
        });
    }
    
    // ===== BOOKMARKS =====
    function initBookmarks() {
        const btns = document.querySelectorAll('.bookmark-btn');
        
        btns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                const id = this.dataset.articleId;
                const active = this.classList.toggle('active');
                
                const icon = this.querySelector('i');
                if (icon) {
                    if (active) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        addBookmark(id);
                        showToast('Article bookmarked!', 'success');
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        removeBookmark(id);
                        showToast('Bookmark removed', 'success');
                    }
                }
            });
        });
    }
    
    function addBookmark(id) {
        const bookmarks = getStorage(CONFIG.STORAGE_KEYS.BOOKMARKS) || [];
        if (!bookmarks.includes(id)) {
            bookmarks.push(id);
            setStorage(CONFIG.STORAGE_KEYS.BOOKMARKS, bookmarks);
        }
    }
    
    function removeBookmark(id) {
        let bookmarks = getStorage(CONFIG.STORAGE_KEYS.BOOKMARKS) || [];
        bookmarks = bookmarks.filter(b => b !== id);
        setStorage(CONFIG.STORAGE_KEYS.BOOKMARKS, bookmarks);
    }
    
    // ===== LIKES =====
    function initLikes() {
        const btns = document.querySelectorAll('.like-btn');
        
        btns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                const id = this.dataset.articleId;
                const active = this.classList.toggle('active');
                const countEl = this.querySelector('.like-count');
                
                const icon = this.querySelector('i');
                if (icon) {
                    if (active) {
                        icon.classList.remove('far');
                        icon.classList.add('fas');
                        addLike(id);
                        if (countEl) countEl.textContent = parseInt(countEl.textContent) + 1;
                    } else {
                        icon.classList.remove('fas');
                        icon.classList.add('far');
                        removeLike(id);
                        if (countEl) countEl.textContent = parseInt(countEl.textContent) - 1;
                    }
                }
            });
        });
    }
    
    function addLike(id) {
        const likes = getStorage(CONFIG.STORAGE_KEYS.LIKES) || [];
        if (!likes.includes(id)) {
            likes.push(id);
            setStorage(CONFIG.STORAGE_KEYS.LIKES, likes);
        }
    }
    
    function removeLike(id) {
        let likes = getStorage(CONFIG.STORAGE_KEYS.LIKES) || [];
        likes = likes.filter(l => l !== id);
        setStorage(CONFIG.STORAGE_KEYS.LIKES, likes);
    }
    
    // ===== COMMENTS =====
    function initComments() {
        const btns = document.querySelectorAll('.comment-btn');
        
        btns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                const id = this.dataset.articleId;
                openCommentsModal(id);
            });
        });
        
        const form = document.getElementById('commentForm');
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                const textarea = this.querySelector('textarea');
                const text = textarea?.value.trim();
                
                if (text) {
                    const modal = document.getElementById('commentsModal');
                    const id = modal?.dataset.articleId;
                    
                    if (id) {
                        saveComment({ id: Date.now(), articleId: id, text: text, date: Date.now() });
                        textarea.value = '';
                        showToast('Comment posted!', 'success');
                        loadComments(id);
                    }
                }
            });
        }
    }
    
    function openCommentsModal(id) {
        const modal = document.getElementById('commentsModal');
        if (!modal) return;
        
        modal.dataset.articleId = id;
        modal.hidden = false;
        document.body.style.overflow = 'hidden';
        
        loadComments(id);
    }
    
    function loadComments(id) {
        const list = document.getElementById('commentsList');
        if (!list) return;
        
        const comments = getComments(id);
        const count = document.getElementById('modalCommentCount');
        if (count) count.textContent = comments.length;
        
        if (comments.length === 0) {
            list.innerHTML = '<p style="text-align:center;padding:2rem;color:var(--text-secondary);">No comments yet</p>';
        } else {
            list.innerHTML = comments.map(c => `
                <div class="comment-item">
                    <strong>${escapeHtml(c.text)}</strong>
                    <div style="font-size:0.875rem;color:var(--text-secondary);margin-top:0.5rem;">
                        ${formatDate(c.date)}
                    </div>
                </div>
            `).join('');
        }
    }
    
    function saveComment(comment) {
        const comments = getStorage(CONFIG.STORAGE_KEYS.COMMENTS) || [];
        comments.push(comment);
        setStorage(CONFIG.STORAGE_KEYS.COMMENTS, comments);
    }
    
    function getComments(id) {
        const all = getStorage(CONFIG.STORAGE_KEYS.COMMENTS) || [];
        return all.filter(c => c.articleId === id);
    }
    
    // ===== SHARE =====
    function initShare() {
        const btns = document.querySelectorAll('.share-btn');
        
        btns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                openShareModal();
            });
        });
        
        const options = document.querySelectorAll('.share-option');
        options.forEach(opt => {
            opt.addEventListener('click', function() {
                const platform = this.dataset.platform;
                shareOn(platform);
            });
        });
    }
    
    function openShareModal() {
        const modal = document.getElementById('shareModal');
        if (modal) {
            modal.hidden = false;
            document.body.style.overflow = 'hidden';
        }
    }
    
    function shareOn(platform) {
        const url = window.location.href;
        const title = document.title;
        
        let shareUrl = '';
        
        switch(platform) {
            case 'facebook':
                shareUrl = `https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
                break;
            case 'twitter':
                shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`;
                break;
            case 'whatsapp':
                shareUrl = `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`;
                break;
            case 'linkedin':
                shareUrl = `https://linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
                break;
            case 'copy':
                navigator.clipboard?.writeText(url);
                showToast('Link copied!', 'success');
                closeModal('shareModal');
                return;
        }
        
        if (shareUrl) {
            window.open(shareUrl, '_blank', 'width=600,height=400');
            closeModal('shareModal');
        }
    }
    
    // ===== CARDS =====
    function initCards() {
        const cards = document.querySelectorAll('.blog-card-enhanced');
        
        cards.forEach(card => {
            card.addEventListener('click', function(e) {
                if (e.target.closest('button')) return;
                
                const link = this.dataset.link;
                if (link && link !== '#') {
                    window.location.href = link;
                }
            });
        });
        
        const featured = document.querySelector('.featured-article');
        if (featured) {
            featured.addEventListener('click', function(e) {
                if (e.target.closest('a')) return;
                
                const link = this.dataset.link;
                if (link) window.location.href = link;
            });
        }
    }
    
    // ===== NEWSLETTER =====
    function initNewsletter() {
        const form = document.getElementById('newsletterForm');
        if (!form) return;
        
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const input = this.querySelector('input[type="email"]');
            const email = input?.value.trim();
            
            if (email && validateEmail(email)) {
                showToast('Successfully subscribed!', 'success');
                this.reset();
            } else {
                showToast('Please enter a valid email', 'error');
            }
        });
    }
    
    function validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    // ===== LOAD MORE =====
    function initLoadMore() {
        const btn = document.getElementById('loadMoreBtn');
        if (!btn) return;
        
        let page = 1;
        
        btn.addEventListener('click', function() {
            this.disabled = true;
            this.textContent = 'Loading...';
            
            setTimeout(() => {
                page++;
                updateCounts();
                
                this.disabled = false;
                this.innerHTML = '<span>Load More</span><i class="fas fa-chevron-down"></i>';
                
                if (page >= 2) {
                    this.style.display = 'none';
                }
            }, 1000);
        });
    }
    
    // ===== BACK TO TOP =====
    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 300) {
                btn.style.opacity = '1';
                btn.style.pointerEvents = 'auto';
            } else {
                btn.style.opacity = '0';
                btn.style.pointerEvents = 'none';
            }
        });
        
        btn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    // ===== MODALS =====
    function initModals() {
        const closes = document.querySelectorAll('.modal-close');
        closes.forEach(btn => {
            btn.addEventListener('click', function() {
                const modal = this.closest('.modal-overlay');
                if (modal) closeModal(modal.id);
            });
        });
        
        const overlays = document.querySelectorAll('.modal-overlay');
        overlays.forEach(overlay => {
            overlay.addEventListener('click', function(e) {
                if (e.target === this) closeModal(this.id);
            });
        });
        
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                const open = document.querySelector('.modal-overlay:not([hidden])');
                if (open) closeModal(open.id);
            }
        });
    }
    
    function closeModal(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.hidden = true;
            document.body.style.overflow = '';
        }
    }
    
    // ===== TOASTS =====
    function initToasts() {
        if (!document.getElementById('toastContainer')) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }
    }
    
    function showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
        toast.innerHTML = `
            <div class="toast-icon"><i class="fas ${icon}"></i></div>
            <div class="toast-message">${message}</div>
        `;
        
        container.appendChild(toast);
        
        setTimeout(() => toast.remove(), CONFIG.TOAST_DURATION);
    }
    
    // ===== LOAD USER DATA =====
    function loadUserData() {
        const bookmarks = getStorage(CONFIG.STORAGE_KEYS.BOOKMARKS) || [];
        bookmarks.forEach(id => {
            const btn = document.querySelector(`[data-article-id="${id}"].bookmark-btn`);
            if (btn) {
                btn.classList.add('active');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            }
        });
        
        const likes = getStorage(CONFIG.STORAGE_KEYS.LIKES) || [];
        likes.forEach(id => {
            const btn = document.querySelector(`[data-article-id="${id}"].like-btn`);
            if (btn) {
                btn.classList.add('active');
                const icon = btn.querySelector('i');
                if (icon) {
                    icon.classList.remove('far');
                    icon.classList.add('fas');
                }
            }
        });
    }
    
    // ===== UTILITIES =====
    function setStorage(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error('Storage error:', e);
        }
    }
    
    function getStorage(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (e) {
            console.error('Storage error:', e);
            return null;
        }
    }
    
    function updateCounts() {
        const visible = document.querySelectorAll('.blog-card-enhanced:not([style*="display: none"])').length;
        const total = document.querySelectorAll('.blog-card-enhanced').length;
        
        const current = document.getElementById('currentCount');
        const totalEl = document.getElementById('totalCount');
        
        if (current) current.textContent = visible;
        if (totalEl) totalEl.textContent = total;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    function formatDate(timestamp) {
        const date = new Date(timestamp);
        return date.toLocaleDateString();
    }
    
    console.log('✅ All features initialized');
})();
