/**
 * SHOP PAGE - Perfect Chess Academy E-Commerce
 * Complete shopping cart, filters, wishlist, and checkout functionality
 */

// ============================================
// GLOBAL STATE MANAGEMENT
// ============================================
const ShopState = {
  cart: [],
  wishlist: [],
  products: [],
  filters: {
    category: "all",
    priceRange: 10000,
    productTypes: ["physical", "digital"],
    skillLevels: ["beginner", "intermediate", "advanced"],
    rating: 4,
    discounts: [],
    availability: ["in-stock"],
  },
  sortBy: "featured",
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener("DOMContentLoaded", function () {
  initializeShop();
  loadStoredData();
  setupEventListeners();
  updateCartCount();
  updateWishlistCount();
});

function initializeShop() {
  // Initialize price range slider
  const priceRange = document.getElementById("priceRange");
  if (priceRange) initializePriceSlider();

  // Initialize category filters
  const categoryCards = document.querySelectorAll(".category-card");
  if (categoryCards.length > 0) initializeCategoryFilters();

  // Initialize filter checkboxes
  const filterCheckboxes = document.querySelectorAll(
    ".filter-checkboxes input"
  );
  if (filterCheckboxes.length > 0) initializeFilterCheckboxes();

  // Initialize sort dropdown
  const sortSelect = document.getElementById("sortBy");
  if (sortSelect) initializeSortDropdown();

  // Load products
  loadProducts();
}

// ============================================
// LOCAL STORAGE MANAGEMENT
// ============================================
function loadStoredData() {
  // Load cart from localStorage
  const storedCart = localStorage.getItem("pca_cart");
  if (storedCart) {
    ShopState.cart = JSON.parse(storedCart);
    renderCartItems();
  }

  // Load wishlist from localStorage
  const storedWishlist = localStorage.getItem("pca_wishlist");
  if (storedWishlist) {
    ShopState.wishlist = JSON.parse(storedWishlist);
    renderWishlistItems();
    updateWishlistUI();
  }
}

function saveCart() {
  localStorage.setItem("pca_cart", JSON.stringify(ShopState.cart));
}

function saveWishlist() {
  localStorage.setItem("pca_wishlist", JSON.stringify(ShopState.wishlist));
}

// ============================================
// PRICE RANGE SLIDER
// ============================================
function initializePriceSlider() {
  const priceRange = document.getElementById("priceRange");
  const priceValue = document.getElementById("priceValue");

  if (priceRange && priceValue) {
    priceRange.addEventListener("input", function () {
      const value = this.value;
      priceValue.textContent = `₹${parseInt(value).toLocaleString()}`;
      ShopState.filters.priceRange = parseInt(value);

      // Debounce filter application
      clearTimeout(this.filterTimeout);
      this.filterTimeout = setTimeout(() => {
        applyAllFilters();
      }, 300);
    });
  }
}

// ============================================
// CATEGORY FILTERS
// ============================================
function initializeCategoryFilters() {
  const categoryCards = document.querySelectorAll(".category-card");

  categoryCards.forEach((card) => {
    card.addEventListener("click", function () {
      // Remove active class from all
      categoryCards.forEach((c) => c.classList.remove("active"));

      // Add active to clicked
      this.classList.add("active");

      // Update filter state
      const category = this.getAttribute("data-category");
      ShopState.filters.category = category;

      // Apply filters
      applyAllFilters();

      // Scroll to products
      document.querySelector(".products-grid")?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  });
}

function filterByCategory(category) {
  const categoryCards = document.querySelectorAll(".category-card");
  categoryCards.forEach((card) => {
    if (card.getAttribute("data-category") === category) {
      card.click();
    }
  });
}

// ============================================
// FILTER CHECKBOXES
// ============================================
function initializeFilterCheckboxes() {
  // Product Type filters
  const productTypeCheckboxes = document.querySelectorAll(
    'input[name="productType"]'
  );
  productTypeCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      updateArrayFilter(
        ShopState.filters.productTypes,
        this.value,
        this.checked
      );
      applyAllFilters();
    });
  });

  // Skill Level filters
  const skillLevelCheckboxes = document.querySelectorAll(
    'input[name="skillLevel"]'
  );
  skillLevelCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      updateArrayFilter(
        ShopState.filters.skillLevels,
        this.value,
        this.checked
      );
      applyAllFilters();
    });
  });

  // Discount filters
  const discountCheckboxes = document.querySelectorAll(
    'input[name="discount"]'
  );
  discountCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      updateArrayFilter(
        ShopState.filters.discounts,
        parseInt(this.value),
        this.checked
      );
      applyAllFilters();
    });
  });

  // Availability filters
  const availabilityCheckboxes = document.querySelectorAll(
    'input[name="availability"]'
  );
  availabilityCheckboxes.forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      updateArrayFilter(
        ShopState.filters.availability,
        this.value,
        this.checked
      );
      applyAllFilters();
    });
  });

  // Rating filters
  const ratingRadios = document.querySelectorAll('input[name="rating"]');
  ratingRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      ShopState.filters.rating = parseInt(this.value);
      applyAllFilters();
    });
  });
}

function updateArrayFilter(array, value, add) {
  if (add && !array.includes(value)) {
    array.push(value);
  } else if (!add && array.includes(value)) {
    const index = array.indexOf(value);
    array.splice(index, 1);
  }
}

// ============================================
// SORT DROPDOWN
// ============================================
function initializeSortDropdown() {
  const sortSelect = document.getElementById("sortBy");

  if (sortSelect) {
    sortSelect.addEventListener("change", function () {
      ShopState.sortBy = this.value;
      applyAllFilters();
    });
  }
}

// ============================================
// APPLY FILTERS
// ============================================
function applyAllFilters() {
  const productCards = document.querySelectorAll(".product-card");
  let visibleCount = 0;
  const productsArray = Array.from(productCards);

  // Filter products
  productsArray.forEach((card) => {
    let showCard = true;

    // Category filter
    const cardCategory = card.getAttribute("data-category");
    if (
      ShopState.filters.category !== "all" &&
      cardCategory !== ShopState.filters.category
    ) {
      showCard = false;
    }

    // Price filter
    const cardPrice = parseInt(card.getAttribute("data-price"));
    if (cardPrice > ShopState.filters.priceRange) {
      showCard = false;
    }

    // Skill level filter
    const cardSkill = card.getAttribute("data-skill");
    if (
      !ShopState.filters.skillLevels.includes(cardSkill) &&
      cardSkill !== "all"
    ) {
      showCard = false;
    }

    // Rating filter
    const cardRating = parseInt(card.getAttribute("data-rating"));
    if (cardRating < ShopState.filters.rating) {
      showCard = false;
    }

    // Show/hide card
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

  // Sort products
  sortProducts(productsArray.filter((card) => card.style.display !== "none"));

  // Update results count
  updateResultsCount(visibleCount);
}

// ============================================
// SORT PRODUCTS
// ============================================
function sortProducts(visibleProducts) {
  const productsGrid = document.getElementById("productsGrid");
  if (!productsGrid) return;

  const sortedProducts = [...visibleProducts].sort((a, b) => {
    const priceA = parseInt(a.getAttribute("data-price"));
    const priceB = parseInt(b.getAttribute("data-price"));
    const ratingA = parseInt(a.getAttribute("data-rating"));
    const ratingB = parseInt(b.getAttribute("data-rating"));

    switch (ShopState.sortBy) {
      case "price-low":
        return priceA - priceB;
      case "price-high":
        return priceB - priceA;
      case "rating":
        return ratingB - ratingA;
      case "newest":
        // Assume products are already in newest order in HTML
        return 0;
      case "popularity":
        // Could be based on sales, reviews, etc.
        return ratingB - ratingA;
      default:
        return 0;
    }
  });

  // Re-append sorted products
  sortedProducts.forEach((product) => {
    productsGrid.appendChild(product);
  });
}

// ============================================
// RESET FILTERS
// ============================================
function resetFilters() {
  // Reset state
  ShopState.filters = {
    category: "all",
    priceRange: 10000,
    productTypes: ["physical", "digital"],
    skillLevels: ["beginner", "intermediate", "advanced"],
    rating: 4,
    discounts: [],
    availability: ["in-stock"],
  };

  // Reset UI
  document.getElementById("priceRange").value = 10000;
  document.getElementById("priceValue").textContent = "₹10,000";

  document
    .querySelectorAll('.filter-checkboxes input[type="checkbox"]')
    .forEach((cb) => {
      if (
        cb.name === "productType" ||
        cb.name === "skillLevel" ||
        cb.name === "availability"
      ) {
        cb.checked = true;
      } else {
        cb.checked = false;
      }
    });

  document.querySelector('input[name="rating"][value="4"]').checked = true;

  // Reset category
  document.querySelectorAll(".category-card").forEach((card) => {
    card.classList.remove("active");
    if (card.getAttribute("data-category") === "all") {
      card.classList.add("active");
    }
  });

  // Apply filters
  applyAllFilters();

  // Show notification
  showToast("success", "Filters reset successfully");
}

// ============================================
// UPDATE RESULTS COUNT
// ============================================
function updateResultsCount(count) {
  const resultCount = document.getElementById("resultCount");
  if (resultCount) {
    resultCount.textContent = count;
  }
}

// ============================================
// TOGGLE FILTERS (MOBILE)
// ============================================
function toggleFilters() {
  const sidebar = document.getElementById("filtersSidebar");
  const body = document.body;

  if (sidebar) {
    sidebar.classList.toggle("active");

    if (sidebar.classList.contains("active")) {
      body.style.overflow = "hidden";

      // Create overlay
      const overlay = document.createElement("div");
      overlay.className = "filters-overlay";
      overlay.onclick = toggleFilters;
      document.body.appendChild(overlay);

      setTimeout(() => overlay.classList.add("active"), 10);
    } else {
      body.style.overflow = "";
      const overlay = document.querySelector(".filters-overlay");
      if (overlay) {
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
      }
    }
  }
}

// ============================================
// SHOPPING CART FUNCTIONS
// ============================================
function addToCart(productId) {
  // Get product details (in real implementation, fetch from database)
  const productCard =
    document.querySelector(`[data-product-id="${productId}"]`) ||
    document.querySelector(".product-card"); // Fallback for demo

  const product = {
    id: productId,
    title:
      productCard.querySelector(".product-title a")?.textContent || "Product",
    price: parseInt(
      productCard
        .querySelector(".price-current")
        ?.textContent.replace(/[₹,]/g, "") || 0
    ),
    image: productCard.querySelector(".product-image img")?.src || "",
    quantity: 1,
  };

  // Check if product already in cart
  const existingItem = ShopState.cart.find((item) => item.id === productId);

  if (existingItem) {
    existingItem.quantity++;
  } else {
    ShopState.cart.push(product);
  }

  // Save and update UI
  saveCart();
  updateCartCount();
  renderCartItems();

  // Show notification
  showToast("success", `${product.title} added to cart!`);

  // Animate cart icon
  animateCartIcon();
}

function removeFromCart(productId) {
  ShopState.cart = ShopState.cart.filter((item) => item.id !== productId);
  saveCart();
  updateCartCount();
  renderCartItems();
  showToast("info", "Item removed from cart");
}

function updateCartQuantity(productId, change) {
  const item = ShopState.cart.find((item) => item.id === productId);

  if (item) {
    item.quantity += change;

    if (item.quantity <= 0) {
      removeFromCart(productId);
    } else {
      saveCart();
      renderCartItems();
    }
  }
}

function renderCartItems() {
  const cartBody = document.getElementById("cartBody");
  const cartFooter = document.getElementById("cartFooter");

  if (!cartBody) return; // Exit if element doesn't exist

  if (ShopState.cart.length === 0) {
    cartBody.innerHTML = `
            <div class="empty-cart">
                <i class="fas fa-shopping-cart"></i>
                <p>Your cart is empty</p>
                <button class="btn btn-primary" onclick="toggleCart()">Continue Shopping</button>
            </div>
        `;
    if (cartFooter) cartFooter.style.display = "none";
    return;
  }

  // Show footer
  if (cartFooter) cartFooter.style.display = "block";

  // Render cart items
  cartBody.innerHTML = ShopState.cart
    .map(
      (item) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">₹${item.price.toLocaleString()}</p>
                <div class="cart-item-actions">
                    <div class="quantity-controls">
                        <button onclick="updateCartQuantity('${item.id}', -1)">
                            <i class="fas fa-minus"></i>
                        </button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartQuantity('${item.id}', 1)">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <button class="btn-remove-item" onclick="removeFromCart('${
                      item.id
                    }')" aria-label="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");

  // Update cart summary
  updateCartSummary();
}

function updateCartSummary() {
  const subtotal = ShopState.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const shipping = subtotal >= 999 ? 0 : 99;
  const total = subtotal + shipping;

  const cartSubtotal = document.getElementById("cartSubtotal");
  const cartShipping = document.getElementById("cartShipping");
  const cartTotal = document.getElementById("cartTotal");

  if (cartSubtotal) cartSubtotal.textContent = `₹${subtotal.toLocaleString()}`;
  if (cartShipping)
    cartShipping.textContent = shipping === 0 ? "FREE" : `₹${shipping}`;
  if (cartTotal) cartTotal.textContent = `₹${total.toLocaleString()}`;
}

function updateCartCount() {
  const count = ShopState.cart.reduce((sum, item) => sum + item.quantity, 0);

  const cartCount = document.getElementById("cartCount");
  const cartItemCount = document.getElementById("cartItemCount");
  const stickyCartCount = document.getElementById("stickyCartCount");

  if (cartCount) cartCount.textContent = count;
  if (cartItemCount) cartItemCount.textContent = count;
  if (stickyCartCount) stickyCartCount.textContent = count;
}

function toggleCart() {
  const cartSidebar = document.getElementById("cartSidebar");
  const cartOverlay = document.getElementById("cartOverlay");

  if (cartSidebar && cartOverlay) {
    cartSidebar.classList.toggle("active");
    cartOverlay.classList.toggle("active");

    if (cartSidebar.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
}

function animateCartIcon() {
  const cartIcon = document.querySelector(
    ".header-shop-icons .icon-btn:nth-child(3)"
  );
  if (cartIcon) {
    cartIcon.style.animation = "cartBounce 0.5s ease";
    setTimeout(() => {
      cartIcon.style.animation = "";
    }, 500);
  }
}

// ============================================
// WISHLIST FUNCTIONS
// ============================================
function toggleWishlistItem(button) {
  const productCard = button.closest(".product-card");
  const productId =
    productCard.getAttribute("data-product-id") ||
    `product-${Math.random().toString(36).substr(2, 9)}`; // Fallback ID

  const product = {
    id: productId,
    title:
      productCard.querySelector(".product-title a")?.textContent || "Product",
    price: parseInt(
      productCard
        .querySelector(".price-current")
        ?.textContent.replace(/[₹,]/g, "") || 0
    ),
    image: productCard.querySelector(".product-image img")?.src || "",
    rating: parseInt(productCard.getAttribute("data-rating") || 5),
  };

  const existingIndex = ShopState.wishlist.findIndex(
    (item) => item.id === productId
  );

  if (existingIndex > -1) {
    // Remove from wishlist
    ShopState.wishlist.splice(existingIndex, 1);
    button.classList.remove("active");
    button.querySelector("i").classList.remove("fas");
    button.querySelector("i").classList.add("far");
    showToast("info", "Removed from wishlist");
  } else {
    // Add to wishlist
    ShopState.wishlist.push(product);
    button.classList.add("active");
    button.querySelector("i").classList.remove("far");
    button.querySelector("i").classList.add("fas");
    showToast("success", "Added to wishlist!");
  }

  saveWishlist();
  updateWishlistCount();
  renderWishlistItems();
}

function updateWishlistUI() {
  // Update all wishlist buttons to show active state
  ShopState.wishlist.forEach((item) => {
    const button = document.querySelector(
      `[data-product-id="${item.id}"] .btn-wishlist`
    );
    if (button) {
      button.classList.add("active");
      button.querySelector("i").classList.remove("far");
      button.querySelector("i").classList.add("fas");
    }
  });
}

function renderWishlistItems() {
  const wishlistBody = document.getElementById("wishlistBody");

  if (!wishlistBody) return;

  if (ShopState.wishlist.length === 0) {
    wishlistBody.innerHTML = `
            <div class="empty-wishlist">
                <i class="fas fa-heart"></i>
                <p>Your wishlist is empty</p>
                <button class="btn btn-primary" onclick="toggleWishlist()">Browse Products</button>
            </div>
        `;
    return;
  }

  wishlistBody.innerHTML = ShopState.wishlist
    .map(
      (item) => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="cart-item-details">
                <h4 class="cart-item-title">${item.title}</h4>
                <p class="cart-item-price">₹${item.price.toLocaleString()}</p>
                <div class="cart-item-actions">
                    <button class="btn btn-sm btn-primary" onclick="moveToCart('${
                      item.id
                    }')">
                        <i class="fas fa-shopping-cart"></i> Add to Cart
                    </button>
                    <button class="btn-remove-item" onclick="removeFromWishlist('${
                      item.id
                    }')" aria-label="Remove item">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `
    )
    .join("");
}

function removeFromWishlist(productId) {
  ShopState.wishlist = ShopState.wishlist.filter(
    (item) => item.id !== productId
  );
  saveWishlist();
  updateWishlistCount();
  renderWishlistItems();

  // Update button UI
  const button = document.querySelector(
    `[data-product-id="${productId}"] .btn-wishlist`
  );
  if (button) {
    button.classList.remove("active");
    button.querySelector("i").classList.remove("fas");
    button.querySelector("i").classList.add("far");
  }

  showToast("info", "Removed from wishlist");
}

function moveToCart(productId) {
  const item = ShopState.wishlist.find((item) => item.id === productId);
  if (item) {
    addToCart(productId);
    removeFromWishlist(productId);
    toggleWishlist();
    setTimeout(() => toggleCart(), 300);
  }
}

function updateWishlistCount() {
  const count = ShopState.wishlist.length;

  const wishlistCount = document.getElementById("wishlistCount");
  const wishlistItemCount = document.getElementById("wishlistItemCount");

  if (wishlistCount) wishlistCount.textContent = count;
  if (wishlistItemCount) wishlistItemCount.textContent = count;
}

function toggleWishlist() {
  const wishlistSidebar = document.getElementById("wishlistSidebar");
  const wishlistOverlay = document.getElementById("wishlistOverlay");

  if (wishlistSidebar && wishlistOverlay) {
    wishlistSidebar.classList.toggle("active");
    wishlistOverlay.classList.toggle("active");

    if (wishlistSidebar.classList.contains("active")) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
  }
}

// ============================================
// QUICK VIEW MODAL
// ============================================
function quickView(productId) {
  const modal = document.getElementById("quickViewModal");
  const content = document.getElementById("quickViewContent");

  if (!modal || !content) return;

  // In real implementation, fetch product details from API
  // For now, use dummy data
  content.innerHTML = `
        <div class="quick-view-images">
            <div class="main-image">
                <img src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=500" alt="Product">
            </div>
            <div class="thumbnail-images">
                <div class="thumbnail active">
                    <img src="https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=500" alt="Thumbnail">
                </div>
                <div class="thumbnail">
                    <img src="https://images.unsplash.com/photo-1560174038-da43ac74f01b?w=500" alt="Thumbnail">
                </div>
                <div class="thumbnail">
                    <img src="https://images.unsplash.com/photo-1611195974226-ef4c990c905e?w=500" alt="Thumbnail">
                </div>
            </div>
        </div>
        
        <div class="quick-view-details">
            <div class="product-category">Chess Sets • Beginner</div>
            <h2>Premium Wooden Chess Set with Board</h2>
            
            <div class="product-rating">
                <div class="stars">
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                    <i class="fas fa-star"></i>
                </div>
                <span class="rating-text">(124 reviews)</span>
            </div>
            
            <div class="product-price" style="margin: 1.5rem 0;">
                <span class="price-current">₹2,499</span>
                <span class="price-original">₹2,999</span>
                <span class="savings">Save ₹500!</span>
            </div>
            
            <p style="color: var(--text-secondary); line-height: 1.7; margin-bottom: 1.5rem;">
                High-quality wooden chess pieces with a beautifully crafted 19" folding board. 
                Perfect for beginners and casual players. Made from premium sheesham wood with 
                smooth finish. Includes felt bottom pieces for smooth movement and board protection.
            </p>
            
            <div class="product-features" style="margin-bottom: 1.5rem;">
                <span><i class="fas fa-check"></i> Premium Wood</span>
                <span><i class="fas fa-check"></i> 19" Board</span>
                <span><i class="fas fa-check"></i> Felt Bottom</span>
                <span><i class="fas fa-check"></i> Gift Box</span>
            </div>
            
            <div style="display: flex; gap: 1rem;">
                <button class="btn btn-primary btn-large" onclick="addToCart('${productId}'); closeQuickView();">
                    <i class="fas fa-shopping-cart"></i> Add to Cart
                </button>
                <button class="btn btn-secondary-outline btn-large" onclick="window.location.href='product-detail.html?id=${productId}'">
                    View Full Details
                </button>
            </div>
            
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border-primary);">
                <p style="font-size: 0.9rem; color: var(--text-secondary); margin: 0;">
                    <i class="fas fa-truck" style="color: var(--accent-primary);"></i> 
                    Free delivery on orders above ₹999
                </p>
            </div>
        </div>
    `;

  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeQuickView() {
  const modal = document.getElementById("quickViewModal");
  if (modal) {
    modal.classList.remove("active");
    document.body.style.overflow = "";
  }
}

// ============================================
// CHECKOUT
// ============================================
function goToCheckout() {
  if (ShopState.cart.length === 0) {
    showToast("error", "Your cart is empty!");
    return;
  }

  // Save cart state
  saveCart();

  // Redirect to checkout page
  window.location.href = "checkout.html";
}

// ============================================
// SEARCH
// ============================================
function openSearch() {
  showToast("info", "Search functionality coming soon!");
  // In real implementation, show search modal
}

// ============================================
// PRODUCT DATA (Demo)
// ============================================
function loadProducts() {
  // In real implementation, fetch from API
  // This is just for demonstration
  ShopState.products = [
    {
      id: "product-1",
      title: "Premium Wooden Chess Set",
      category: "chess-sets",
      price: 2499,
      rating: 5,
      skill: "beginner",
    },
    // Add more products...
  ];
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(type, message) {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <i class="fas fa-${
          type === "success"
            ? "check-circle"
            : type === "error"
            ? "exclamation-circle"
            : "info-circle"
        }"></i>
        <span>${message}</span>
    `;

  toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${
          type === "success"
            ? "#10b981"
            : type === "error"
            ? "#ef4444"
            : "#3b82f6"
        };
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10001;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s ease;
        font-weight: 500;
    `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = "1";
    toast.style.transform = "translateX(0)";
  }, 100);

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateX(100%)";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ============================================
// UTILITY FUNCTIONS
// ============================================
function scrollToTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

function openWhatsApp() {
  const phone = "919252358993";
  const message = "Hi! I have a question about your products.";
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
  // Close modals on Escape key
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      const quickViewModal = document.getElementById("quickViewModal");
      if (quickViewModal && quickViewModal.classList.contains("active")) {
        closeQuickView();
      }

      const cartSidebar = document.getElementById("cartSidebar");
      if (cartSidebar && cartSidebar.classList.contains("active")) {
        toggleCart();
      }

      const wishlistSidebar = document.getElementById("wishlistSidebar");
      if (wishlistSidebar && wishlistSidebar.classList.contains("active")) {
        toggleWishlist();
      }

      const filtersSidebar = document.getElementById("filtersSidebar");
      if (filtersSidebar && filtersSidebar.classList.contains("active")) {
        toggleFilters();
      }
    }
  });

  // Handle browser back button for sidebars
  window.addEventListener("popstate", function () {
    const cartSidebar = document.getElementById("cartSidebar");
    const wishlistSidebar = document.getElementById("wishlistSidebar");

    if (cartSidebar && cartSidebar.classList.contains("active")) {
      toggleCart();
    }
    if (wishlistSidebar && wishlistSidebar.classList.contains("active")) {
      toggleWishlist();
    }
  });

  // Payment method radio buttons (only if they exist)
  const paymentRadios = document.querySelectorAll(
    'input[name="paymentMethod"]'
  );
  if (paymentRadios.length > 0) {
    paymentRadios.forEach((radio) => {
      radio.addEventListener("change", function () {
        document.querySelectorAll(".payment-method-card").forEach((card) => {
          card.classList.remove("active");
        });
        this.closest(".payment-method-card").classList.add("active");
      });
    });
  }
}

// ============================================
// ANIMATIONS
// ============================================
const cartBounceStyle = document.createElement("style");
cartBounceStyle.textContent = `
    @keyframes cartBounce {
        0%, 100% { transform: scale(1); }
        25% { transform: scale(1.2) rotate(-5deg); }
        50% { transform: scale(1.1) rotate(5deg); }
        75% { transform: scale(1.15) rotate(-3deg); }
    }
`;
document.head.appendChild(cartBounceStyle);

// ============================================
// ANALYTICS TRACKING
// ============================================
function trackEvent(category, action, label, value) {
  // Google Analytics 4
  if (typeof gtag !== "undefined") {
    gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }

  // Console log for debugging
  console.log("Event:", category, action, label, value);
}

// Track add to cart
const originalAddToCart = addToCart;
addToCart = function (productId) {
  originalAddToCart(productId);
  trackEvent("Ecommerce", "Add to Cart", productId);
};

// Track checkout
const originalGoToCheckout = goToCheckout;
goToCheckout = function () {
  const total = ShopState.cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  trackEvent("Ecommerce", "Initiate Checkout", "Cart Value", total);
  originalGoToCheckout();
};

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener("error", function (e) {
  // Only log actual errors, not null reference errors from missing elements
  if (e.message && !e.message.includes("null")) {
    console.error("Shop Error:", e.message);
  }
});

// ============================================
// PERFORMANCE OPTIMIZATION
// ============================================
// Lazy load product images
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
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
// EXPORTS (if using modules)
// ============================================
console.log("✅ Shop JS loaded successfully");
console.log("Cart items:", ShopState.cart.length);
console.log("Wishlist items:", ShopState.wishlist.length);
