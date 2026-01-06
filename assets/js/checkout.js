/**
 * CHECKOUT PAGE - Perfect Chess Academy
 * Complete checkout flow with Razorpay integration
 * Production-ready with error handling & validation
 */

// ============================================
// CHECKOUT STATE MANAGEMENT
// ============================================
const CheckoutState = {
    currentStep: 1,
    contactInfo: {},
    shippingInfo: {},
    paymentMethod: 'online',
    appliedCoupon: null,
    orderData: {},
    pricing: {
        subtotal: 0,
        shipping: 0,
        discount: 0,
        codCharges: 0,
        tax: 0,
        total: 0
    }
};

// ============================================
// RAZORPAY CONFIGURATION
// ============================================
const RAZORPAY_CONFIG = {
    key: 'rzp_test_YOUR_KEY_HERE', // Replace with your Razorpay Key ID
    currency: 'INR',
    name: 'Perfect Chess Academy',
    description: 'Chess Products Purchase',
    image: 'logo-removebg-preview.png',
    theme: {
        color: '#d4af37'
    }
};

// ============================================
// COUPON DEFINITIONS
// ============================================
const AVAILABLE_COUPONS = {
    'FIRST100': {
        type: 'flat',
        value: 100,
        minOrder: 999,
        description: '₹100 off on first order'
    },
    'CHESS20': {
        type: 'percentage',
        value: 20,
        maxDiscount: 500,
        minOrder: 500,
        description: '20% off up to ₹500'
    },
    'FREESHIP': {
        type: 'shipping',
        description: 'Free shipping on all orders'
    }
};

// ============================================
// INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ Checkout page initialized');
    
    // Check if cart has items
    const cart = JSON.parse(localStorage.getItem('pca_cart') || '[]');
    
    if (cart.length === 0) {
        showEmptyCartMessage();
        return;
    }
    
    // Initialize checkout
    initializeCheckout();
    loadCartFromStorage();
    renderOrderSummary();
    setupEventListeners();
    setupFormValidation();
    autoFillUserData();
    
    // Start at step 1
    goToStep(1);
});

function initializeCheckout() {
    console.log('Initializing checkout flow...');
    
    // Update progress indicator
    updateProgressIndicators(1);
}

function showEmptyCartMessage() {
    const mainContent = document.querySelector('.checkout-main-content');
    if (mainContent) {
        mainContent.innerHTML = `
            <div class="checkout-card">
                <div class="card-body" style="text-align: center; padding: 4rem 2rem;">
                    <i class="fas fa-shopping-cart" style="font-size: 5rem; color: var(--checkout-border); margin-bottom: 2rem;"></i>
                    <h2 style="color: var(--checkout-text); margin-bottom: 1rem;">Your Cart is Empty</h2>
                    <p style="color: var(--checkout-text-secondary); margin-bottom: 2rem;">Add some items to your cart before checkout.</p>
                    <a href="shop.html" class="btn-primary btn-large">
                        <i class="fas fa-arrow-left"></i>
                        <span>Back to Shop</span>
                    </a>
                </div>
            </div>
        `;
    }
}

// ============================================
// LOAD CART DATA
// ============================================
function loadCartFromStorage() {
    const cart = JSON.parse(localStorage.getItem('pca_cart') || '[]');
    
    // Update global cart state if exists
    if (typeof ShopState !== 'undefined') {
        ShopState.cart = cart;
    }
    
    console.log('Cart loaded:', cart.length, 'items');
}

// ============================================
// RENDER ORDER SUMMARY
// ============================================
function renderOrderSummary() {
    const cart = JSON.parse(localStorage.getItem('pca_cart') || '[]');
    const summaryItems = document.getElementById('summaryItems');
    const summaryItemCount = document.getElementById('summaryItemCount');
    
    if (!summaryItems) {
        console.warn('Summary items container not found');
        return;
    }
    
    if (cart.length === 0) {
        summaryItems.innerHTML = '<p style="color: var(--checkout-text-secondary); text-align: center;">No items in cart</p>';
        return;
    }
    
    // Calculate total items
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (summaryItemCount) {
        summaryItemCount.textContent = `${totalItems} item${totalItems !== 1 ? 's' : ''}`;
    }
    
    // Render items
    summaryItems.innerHTML = cart.map(item => `
        <div class="summary-item">
            <div class="item-image">
                <img src="${item.image || 'https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=150'}" 
                     alt="${item.title || 'Product'}"
                     onerror="this.src='https://images.unsplash.com/photo-1528819622765-d6bcf132f793?w=150'">
            </div>
            <div class="item-details">
                <h4 class="item-title">${item.title || 'Product'}</h4>
                <p class="item-meta">Qty: ${item.quantity}</p>
                <p class="item-price">₹${((item.price || 0) * item.quantity).toLocaleString('en-IN')}</p>
            </div>
        </div>
    `).join('');
    
    // Calculate and update pricing
    updatePricingSummary();
}

// ============================================
// UPDATE PRICING SUMMARY
// ============================================
function updatePricingSummary() {
    const cart = JSON.parse(localStorage.getItem('pca_cart') || '[]');
    
    // Calculate subtotal
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    
    // Calculate shipping (free above ₹999)
    let shipping = subtotal >= 999 ? 0 : 99;
    
    // Calculate discount
    let discount = 0;
    if (CheckoutState.appliedCoupon) {
        discount = calculateDiscount(subtotal, CheckoutState.appliedCoupon);
        
        // If FREESHIP coupon, make shipping free
        if (CheckoutState.appliedCoupon.type === 'shipping') {
            shipping = 0;
        }
    }
    
    // Calculate COD charges
    const codCharges = CheckoutState.paymentMethod === 'cod' ? 50 : 0;
    
    // Calculate tax (18% GST on taxable amount)
    const taxableAmount = subtotal - discount + shipping;
    const tax = Math.round(taxableAmount * 0.18);
    
    // Calculate total
    const total = subtotal + shipping - discount + codCharges + tax;
    
    // Update UI elements
    const summarySubtotal = document.getElementById('summarySubtotal');
    const summaryShipping = document.getElementById('summaryShipping');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryTax = document.getElementById('summaryTax');
    const summaryCOD = document.getElementById('summaryCOD');
    const summaryTotal = document.getElementById('summaryTotal');
    
    if (summarySubtotal) summarySubtotal.textContent = `₹${subtotal.toLocaleString('en-IN')}`;
    if (summaryShipping) summaryShipping.textContent = shipping === 0 ? 'FREE' : `₹${shipping}`;
    if (summaryTax) summaryTax.textContent = `₹${tax.toLocaleString('en-IN')}`;
    if (summaryTotal) summaryTotal.textContent = `₹${total.toLocaleString('en-IN')}`;
    
    // Show/hide discount row
    const discountRow = document.getElementById('discountRow');
    if (discountRow) {
        if (discount > 0) {
            discountRow.style.display = 'flex';
            if (summaryDiscount) summaryDiscount.textContent = `-₹${discount.toLocaleString('en-IN')}`;
            
            const appliedCouponCode = document.getElementById('appliedCouponCode');
            if (appliedCouponCode) {
                appliedCouponCode.textContent = CheckoutState.appliedCoupon.code;
            }
        } else {
            discountRow.style.display = 'none';
        }
    }
    
    // Show/hide COD row
    const codRow = document.getElementById('codRow');
    if (codRow) {
        if (codCharges > 0) {
            codRow.style.display = 'flex';
            if (summaryCOD) summaryCOD.textContent = `₹${codCharges}`;
        } else {
            codRow.style.display = 'none';
        }
    }
    
    // Store pricing in state
    CheckoutState.pricing = {
        subtotal,
        shipping,
        discount,
        codCharges,
        tax,
        total
    };
    
    console.log('Pricing updated:', CheckoutState.pricing);
}

// ============================================
// CALCULATE DISCOUNT
// ============================================
function calculateDiscount(subtotal, coupon) {
    if (!coupon) return 0;
    
    switch (coupon.type) {
        case 'flat':
            return coupon.value;
        
        case 'percentage':
            const percentDiscount = Math.round(subtotal * (coupon.value / 100));
            return coupon.maxDiscount ? Math.min(percentDiscount, coupon.maxDiscount) : percentDiscount;
        
        case 'shipping':
            return 0; // Shipping handled separately
        
        default:
            return 0;
    }
}

// ============================================
// STEP NAVIGATION
// ============================================
function goToStep(stepNumber) {
    // Validate current step before moving forward
    if (stepNumber > CheckoutState.currentStep) {
        if (!validateStep(CheckoutState.currentStep)) {
            return;
        }
    }
    
    // Hide all steps
    document.querySelectorAll('.checkout-card[data-step]').forEach(section => {
        section.style.display = 'none';
    });
    
    // Show target step
    const targetStep = document.querySelector(`.checkout-card[data-step="${stepNumber}"]`);
    if (targetStep) {
        targetStep.style.display = 'block';
        targetStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    
    // Update progress indicators
    updateProgressIndicators(stepNumber);
    
    // Update state
    CheckoutState.currentStep = stepNumber;
    
    console.log('Moved to step:', stepNumber);
}

function updateProgressIndicators(currentStep) {
    const progressSteps = document.querySelectorAll('.progress-step');
    
    progressSteps.forEach((step, index) => {
        const stepNumber = index + 1;
        
        step.classList.remove('active', 'completed');
        
        if (stepNumber < currentStep) {
            step.classList.add('completed');
        } else if (stepNumber === currentStep) {
            step.classList.add('active');
        }
    });
}

// ============================================
// FORM VALIDATION
// ============================================
function setupFormValidation() {
    // Real-time validation for all inputs
    const inputs = document.querySelectorAll('input, select');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            // Remove error on input
            this.classList.remove('error');
            const errorSpan = document.getElementById(`${this.id}-error`);
            if (errorSpan) {
                errorSpan.style.display = 'none';
            }
        });
    });
}

function validateField(field) {
    let isValid = true;
    let errorMessage = '';
    
    const value = field.value.trim();
    
    // Check required fields
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'This field is required';
    } 
    // Email validation
    else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid email address';
        }
    } 
    // Phone validation
    else if (field.type === 'tel' && value) {
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid 10-digit phone number';
        }
    } 
    // Pincode validation
    else if (field.id === 'pincode' && value) {
        const pincodeRegex = /^[0-9]{6}$/;
        if (!pincodeRegex.test(value)) {
            isValid = false;
            errorMessage = 'Please enter a valid 6-digit pincode';
        }
    }
    
    // Update UI
    if (!isValid) {
        field.classList.add('error');
        const errorSpan = document.getElementById(`${field.id}-error`);
        if (errorSpan) {
            errorSpan.textContent = errorMessage;
            errorSpan.style.display = 'block';
        }
    } else {
        field.classList.remove('error');
        const errorSpan = document.getElementById(`${field.id}-error`);
        if (errorSpan) {
            errorSpan.style.display = 'none';
        }
    }
    
    return isValid;
}

function validateStep(stepNumber) {
    let isValid = true;
    
    if (stepNumber === 1) {
        // Validate contact form
        const email = document.getElementById('email');
        const phone = document.getElementById('phone');
        
        if (email && !validateField(email)) isValid = false;
        if (phone && !validateField(phone)) isValid = false;
        
        if (isValid) {
            const countryCode = document.getElementById('countryCode');
            const whatsappUpdates = document.querySelector('input[name="whatsappUpdates"]');
            
            CheckoutState.contactInfo = {
                email: email.value.trim(),
                phone: (countryCode ? countryCode.value : '+91') + phone.value.trim(),
                whatsappUpdates: whatsappUpdates ? whatsappUpdates.checked : false
            };
            
            console.log('Contact info saved:', CheckoutState.contactInfo);
        }
    } 
    else if (stepNumber === 2) {
        // Validate shipping form
        const requiredFields = ['fullName', 'address', 'city', 'state', 'pincode'];
        
        requiredFields.forEach(fieldId => {
            const field = document.getElementById(fieldId);
            if (field && !validateField(field)) {
                isValid = false;
            }
        });
        
        if (isValid) {
            const addressType = document.querySelector('input[name="addressType"]:checked');
            
            CheckoutState.shippingInfo = {
                fullName: document.getElementById('fullName').value.trim(),
                address: document.getElementById('address').value.trim(),
                address2: document.getElementById('address2') ? document.getElementById('address2').value.trim() : '',
                city: document.getElementById('city').value.trim(),
                state: document.getElementById('state').value,
                pincode: document.getElementById('pincode').value.trim(),
                addressType: addressType ? addressType.value : 'home'
            };
            
            console.log('Shipping info saved:', CheckoutState.shippingInfo);
        }
    }
    
    if (!isValid) {
        showToast('error', 'Please fill all required fields correctly');
    }
    
    return isValid;
}

// ============================================
// EVENT LISTENERS
// ============================================
function setupEventListeners() {
    // Payment method change
    const paymentRadios = document.querySelectorAll('input[name="paymentMethod"]');
    paymentRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            // Update UI
            document.querySelectorAll('.payment-card').forEach(card => {
                card.classList.remove('active');
            });
            
            const parentCard = this.closest('.payment-card');
            if (parentCard) {
                parentCard.classList.add('active');
            }
            
            // Update state
            CheckoutState.paymentMethod = this.value;
            
            // Recalculate pricing (COD charges)
            updatePricingSummary();
            
            console.log('Payment method changed to:', this.value);
        });
    });
    
    // Auth mode toggle
    const authButtons = document.querySelectorAll('.auth-btn');
    authButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            authButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const mode = this.dataset.mode;
            if (mode === 'login') {
                // Show login modal or redirect
                showToast('info', 'Login functionality coming soon!');
            }
        });
    });
}

// ============================================
// COUPON MANAGEMENT
// ============================================
function toggleCouponForm() {
    const couponContent = document.getElementById('couponContent');
    const couponToggle = document.getElementById('couponToggle');
    
    if (couponContent && couponToggle) {
        const isVisible = couponContent.style.display === 'block';
        couponContent.style.display = isVisible ? 'none' : 'block';
        couponToggle.classList.toggle('active');
    }
}

function applyCouponCode(code) {
    const couponInput = document.getElementById('couponCode');
    if (couponInput) {
        couponInput.value = code;
        applyCoupon();
    }
}

function applyCoupon() {
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    
    if (!couponInput || !couponMessage) return;
    
    const code = couponInput.value.trim().toUpperCase();
    
    if (!code) {
        couponMessage.className = 'coupon-message error';
        couponMessage.textContent = 'Please enter a coupon code';
        return;
    }
    
    const coupon = AVAILABLE_COUPONS[code];
    
    if (!coupon) {
        couponMessage.className = 'coupon-message error';
        couponMessage.textContent = 'Invalid coupon code';
        return;
    }
    
    // Check minimum order value
    const cart = JSON.parse(localStorage.getItem('pca_cart') || '[]');
    const subtotal = cart.reduce((sum, item) => sum + ((item.price || 0) * item.quantity), 0);
    
    if (coupon.minOrder && subtotal < coupon.minOrder) {
        couponMessage.className = 'coupon-message error';
        couponMessage.textContent = `Minimum order value ₹${coupon.minOrder} required`;
        return;
    }
    
    // Apply coupon
    CheckoutState.appliedCoupon = { code, ...coupon };
    
    // Update UI
    couponMessage.className = 'coupon-message success';
    couponMessage.textContent = `✓ Coupon "${code}" applied successfully!`;
    
    // Recalculate pricing
    updatePricingSummary();
    
    showToast('success', `Coupon ${code} applied!`);
    
    console.log('Coupon applied:', CheckoutState.appliedCoupon);
}

function removeCoupon() {
    CheckoutState.appliedCoupon = null;
    
    const couponInput = document.getElementById('couponCode');
    const couponMessage = document.getElementById('couponMessage');
    
    if (couponInput) couponInput.value = '';
    if (couponMessage) {
        couponMessage.className = 'coupon-message';
        couponMessage.style.display = 'none';
    }
    
    updatePricingSummary();
    showToast('info', 'Coupon removed');
}

// ============================================
// PROCESS PAYMENT
// ============================================
function processPayment() {
    console.log('Processing payment...');
    
    // Validate all steps
    if (!validateStep(1) || !validateStep(2)) {
        showToast('error', 'Please complete all required fields');
        goToStep(1);
        return;
    }
    
    // Check payment method
    if (CheckoutState.paymentMethod === 'online') {
        initiateRazorpayPayment();
    } else if (CheckoutState.paymentMethod === 'cod') {
        processCODOrder();
    }
}

// ============================================
// RAZORPAY PAYMENT
// ============================================
function initiateRazorpayPayment() {
    const pricing = CheckoutState.pricing;
    const orderAmount = pricing.total * 100; // Convert to paise
    
    console.log('Initiating Razorpay payment:', orderAmount / 100);
    
    // Show loading
    showLoading();
    
    // Create order on server
    createRazorpayOrder(orderAmount)
        .then(orderData => {
            hideLoading();
            openRazorpayCheckout(orderData);
        })
        .catch(error => {
            hideLoading();
            console.error('Error creating order:', error);
            showToast('error', 'Failed to initiate payment. Please try again.');
        });
}

function createRazorpayOrder(amount) {
    // This should call your backend API to create a Razorpay order
    return new Promise((resolve, reject) => {
        // In production, make actual API call:
        /*
        fetch('api/create-razorpay-order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ amount })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resolve(data);
            } else {
                reject(new Error(data.message));
            }
        })
        .catch(error => reject(error));
        */
        
        // Mock response for demo
        setTimeout(() => {
            resolve({
                id: 'order_' + Date.now(),
                amount: amount
            });
        }, 1000);
    });
}

function openRazorpayCheckout(orderData) {
    const options = {
        ...RAZORPAY_CONFIG,
        order_id: orderData.id,
        amount: orderData.amount,
        prefill: {
            name: CheckoutState.shippingInfo.fullName,
            email: CheckoutState.contactInfo.email,
            contact: CheckoutState.contactInfo.phone
        },
        notes: {
            address: `${CheckoutState.shippingInfo.address}, ${CheckoutState.shippingInfo.city}, ${CheckoutState.shippingInfo.state} - ${CheckoutState.shippingInfo.pincode}`
        },
        handler: function(response) {
            handlePaymentSuccess(response);
        },
        modal: {
            ondismiss: function() {
                showToast('info', 'Payment cancelled');
            }
        }
    };
    
    const rzp = new Razorpay(options);
    
    rzp.on('payment.failed', function(response) {
        handlePaymentFailure(response);
    });
    
    rzp.open();
}

function handlePaymentSuccess(response) {
    console.log('Payment successful:', response);
    
    showLoading();
    
    // Verify payment on server (IMPORTANT: Always verify on backend)
    verifyPayment(response)
        .then(result => {
            if (result.success) {
                // Create order in database
                createOrder(response.razorpay_payment_id)
                    .then(orderData => {
                        hideLoading();
                        showSuccessModal(orderData);
                        clearCart();
                    })
                    .catch(error => {
                        hideLoading();
                        console.error('Order creation error:', error);
                        showToast('error', 'Order creation failed. Please contact support with payment ID: ' + response.razorpay_payment_id);
                    });
            } else {
                hideLoading();
                showToast('error', 'Payment verification failed. Please contact support.');
            }
        })
        .catch(error => {
            hideLoading();
            console.error('Verification error:', error);
            showToast('error', 'Payment verification failed. Please contact support.');
        });
}

function handlePaymentFailure(response) {
    console.error('Payment failed:', response);
    showToast('error', `Payment failed: ${response.error.description}`);
}

function verifyPayment(paymentData) {
    // Call your backend to verify the payment signature
    return new Promise((resolve) => {
        /*
        fetch('api/verify-payment.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(paymentData)
        })
        .then(response => response.json())
        .then(data => resolve(data));
        */
        
        // Mock success for demo
        setTimeout(() => {
            resolve({ success: true });
        }, 1000);
    });
}

// ============================================
// COD ORDER
// ============================================
function processCODOrder() {
    console.log('Processing COD order...');
    
    showLoading();
    
    createOrder('COD')
        .then(orderData => {
            hideLoading();
            showSuccessModal(orderData);
            clearCart();
        })
        .catch(error => {
            hideLoading();
            console.error('Order creation error:', error);
            showToast('error', 'Failed to place order. Please try again.');
        });
}

// ============================================
// CREATE ORDER
// ============================================
function createOrder(paymentId) {
    const cart = JSON.parse(localStorage.getItem('pca_cart') || '[]');
    
    const orderData = {
        orderNumber: 'PCA' + Date.now(),
        paymentId: paymentId,
        paymentMethod: CheckoutState.paymentMethod,
        contactInfo: CheckoutState.contactInfo,
        shippingInfo: CheckoutState.shippingInfo,
        items: cart,
        pricing: CheckoutState.pricing,
        coupon: CheckoutState.appliedCoupon,
        orderDate: new Date().toISOString(),
        status: 'pending'
    };
    
    console.log('Creating order:', orderData);
    
    // Save to backend
    return new Promise((resolve, reject) => {
        /*
        fetch('api/create-order.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                resolve(data.order);
            } else {
                reject(new Error(data.message));
            }
        })
        .catch(error => reject(error));
        */
        
        // Mock success for demo - Save to localStorage
        setTimeout(() => {
            const orders = JSON.parse(localStorage.getItem('pca_orders') || '[]');
            orders.push(orderData);
            localStorage.setItem('pca_orders', JSON.stringify(orders));
            
            resolve(orderData);
        }, 1500);
    });
}

// ============================================
// SUCCESS MODAL
// ============================================
function showSuccessModal(orderData) {
    const modal = document.getElementById('successModal');
    const orderNumber = document.getElementById('orderNumberDisplay');
    const confirmEmail = document.getElementById('confirmEmail');
    
    if (!modal) return;
    
    if (orderNumber) orderNumber.textContent = orderData.orderNumber;
    if (confirmEmail) confirmEmail.textContent = CheckoutState.contactInfo.email;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Send confirmation via WhatsApp if opted in
    if (CheckoutState.contactInfo.whatsappUpdates) {
        setTimeout(() => {
            sendWhatsAppConfirmation(orderData);
        }, 2000);
    }
    
    console.log('Order completed successfully:', orderData);
}

function closeSuccessModal() {
    const modal = document.getElementById('successModal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function sendWhatsAppConfirmation(orderData) {
    const phone = CheckoutState.contactInfo.phone.replace('+', '');
    const message = `✅ Order Confirmed!\n\nOrder #${orderData.orderNumber}\nTotal: ₹${orderData.pricing.total.toLocaleString('en-IN')}\n\nThank you for shopping with Perfect Chess Academy!`;
    
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
}

// ============================================
// CLEAR CART
// ============================================
function clearCart() {
    localStorage.removeItem('pca_cart');
    
    if (typeof ShopState !== 'undefined') {
        ShopState.cart = [];
        
        // Update cart count if function exists
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }
    
    console.log('Cart cleared');
}

// ============================================
// SUCCESS ACTIONS
// ============================================
function viewOrderDetails() {
    // Redirect to orders page
    window.location.href = 'my-orders.html';
}

function continueShopping() {
    window.location.href = 'shop.html';
}

// ============================================
// ORDER SUMMARY TOGGLE (Mobile)
// ============================================
function toggleOrderSummary() {
    const summaryBody = document.getElementById('orderSummaryBody');
    const toggleIcon = document.querySelector('.summary-toggle i:last-child');
    
    if (summaryBody) {
        summaryBody.classList.toggle('active');
        
        if (toggleIcon) {
            const isActive = summaryBody.classList.contains('active');
            toggleIcon.style.transform = isActive ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }
}

// ============================================
// AUTO-FILL USER DATA
// ============================================
function autoFillUserData() {
    // Check if user is logged in
    const savedUserData = localStorage.getItem('pca_user_data');
    
    if (savedUserData) {
        try {
            const userData = JSON.parse(savedUserData);
            
            const emailField = document.getElementById('email');
            const phoneField = document.getElementById('phone');
            const fullNameField = document.getElementById('fullName');
            
            if (emailField && userData.email) {
                emailField.value = userData.email;
            }
            if (phoneField && userData.phone) {
                phoneField.value = userData.phone;
            }
            if (fullNameField && userData.name) {
                fullNameField.value = userData.name;
            }
            
            console.log('User data auto-filled');
        } catch (error) {
            console.error('Error parsing user data:', error);
        }
    }
}

// ============================================
// LOADING OVERLAY
// ============================================
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================
function showToast(type, message) {
    // Remove existing toasts
    document.querySelectorAll('.toast').forEach(t => t.remove());
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    const iconMap = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    const colorMap = {
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${colorMap[type] || '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        gap: 0.75rem;
        z-index: 10002;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-weight: 600;
        font-size: 0.95rem;
        max-width: 400px;
    `;
    
    document.body.appendChild(toast);
    
    // Animate in
    setTimeout(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ============================================
// WINDOW LOAD EVENT
// ============================================
window.addEventListener('load', function() {
    console.log('✅ Checkout page fully loaded');
});

// ============================================
// ERROR HANDLING
// ============================================
window.addEventListener('error', function(e) {
    console.error('Checkout Error:', e.message);
    // Don't show error toast for missing elements
    if (!e.message.includes('null')) {
        showToast('error', 'An error occurred. Please refresh the page.');
    }
});

// ============================================
// PREVENT FORM SUBMISSION
// ============================================
document.addEventListener('submit', function(e) {
    e.preventDefault();
    console.log('Form submission prevented');
});

console.log('✅ Checkout JavaScript loaded successfully');
