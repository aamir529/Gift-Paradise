// Global Cart State
let cart = JSON.parse(localStorage.getItem('gp_cart')) || [];

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
    initModals();
    initSearch();
    initFilters();
    initMobileNav();
    initWishlist();
    injectCartDrawer();
});

// Toast notification
function showToast(message, icon = 'fas fa-check-circle') {
    let toast = document.querySelector('.toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast';
        document.body.appendChild(toast);
    }
    toast.innerHTML = `<i class="${icon}"></i> ${message}`;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
}

// Cart Drawer Injection
function injectCartDrawer() {
    if (document.querySelector('.cart-drawer')) return;

    const drawerHTML = `
        <div class="cart-drawer-overlay" id="cartOverlay"></div>
        <div class="cart-drawer" id="cartDrawer">
            <div class="cart-drawer-header">
                <h3>Your Shopping Cart</h3>
                <i class="fas fa-times close-btn" id="closeCart"></i>
            </div>
            <div class="cart-drawer-items" id="cartDrawerItems"></div>
            <div class="cart-drawer-footer">
                <div class="cart-total-row">
                    <span>Total Amount:</span>
                    <span id="cartDrawerTotal">₹0</span>
                </div>
                <button class="btn" style="width:100%" onclick="checkout()">Proceed to Checkout</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', drawerHTML);

    document.querySelectorAll('.cart-icon, .icon-btn .fa-shopping-cart').forEach(el => {
        el.closest('.icon-btn, .cart-icon').addEventListener('click', toggleCartDrawer);
    });

    document.getElementById('closeCart').addEventListener('click', toggleCartDrawer);
    document.getElementById('cartOverlay').addEventListener('click', toggleCartDrawer);
}

function toggleCartDrawer() {
    const drawer = document.getElementById('cartDrawer');
    const overlay = document.getElementById('cartOverlay');
    drawer.classList.toggle('open');
    overlay.classList.toggle('open');
}

// Add to Cart
document.addEventListener('click', (e) => {
    if (e.target.closest('.add-to-cart')) {
        const btn = e.target.closest('.add-to-cart');
        const product = btn.closest('.product');
        
        const item = {
            id: product.dataset.id || product.querySelector('.product-title').innerText,
            title: product.querySelector('.product-title').innerText,
            price: parseInt(product.querySelector('.product-price').innerText.replace(/[^0-9]/g, '')) || 299,
            image: product.querySelector('img').src,
            quantity: 1
        };

        const existing = cart.find(i => i.title === item.title);
        if (existing) {
            existing.quantity++;
        } else {
            cart.push(item);
        }

        localStorage.setItem('gp_cart', JSON.stringify(cart));
        updateCartUI();
        showToast(`"${item.title}" added to cart!`);

        btn.innerHTML = `<i class="fas fa-check"></i> Added`;
        btn.style.background = '#10b981';
        btn.style.color = '#fff';
        setTimeout(() => {
            btn.innerHTML = `<i class="fas fa-shopping-bag"></i> Add to Cart`;
            btn.style.background = '';
            btn.style.color = '';
        }, 1500);
    }
});

function updateCartUI() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('.cart-count').forEach(badge => {
        badge.textContent = totalCount;
    });

    const itemsContainer = document.getElementById('cartDrawerItems');
    const totalElement = document.getElementById('cartDrawerTotal');
    
    if (itemsContainer && totalElement) {
        if (cart.length === 0) {
            itemsContainer.innerHTML = `<div style="text-align:center; padding:40px 10px; color:#94a3b8;">
                <i class="fas fa-shopping-basket" style="font-size:40px; margin-bottom:12px;"></i>
                <p>Your cart is empty.</p>
            </div>`;
            totalElement.textContent = '₹0';
            return;
        }

        let total = 0;
        itemsContainer.innerHTML = cart.map((item, idx) => {
            total += item.price * item.quantity;
            return `
                <div class="cart-item">
                    <img src="${item.image}" alt="${item.title}">
                    <div class="cart-item-details">
                        <div class="cart-item-title">${item.title}</div>
                        <div class="cart-item-price">₹${item.price} × ${item.quantity}</div>
                        <span class="cart-item-remove" onclick="removeCartItem(${idx})">Remove</span>
                    </div>
                </div>
            `;
        }).join('');

        totalElement.textContent = `₹${total}`;
    }
}

function removeCartItem(index) {
    cart.splice(index, 1);
    localStorage.setItem('gp_cart', JSON.stringify(cart));
    updateCartUI();
}

function checkout() {
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'fas fa-exclamation-circle');
        return;
    }
    alert('Thank you for your order! Redirecting to secure checkout.');
    cart = [];
    localStorage.removeItem('gp_cart');
    updateCartUI();
    toggleCartDrawer();
}

// Search
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    const performSearch = () => {
        const query = (searchInput?.value || '').toLowerCase().trim();
        const products = document.querySelectorAll('.product');
        
        products.forEach(p => {
            const title = p.querySelector('.product-title')?.textContent.toLowerCase() || '';
            p.style.display = title.includes(query) ? 'flex' : 'none';
        });
    };

    searchBtn?.addEventListener('click', performSearch);
    searchInput?.addEventListener('keyup', performSearch);
}

// Filter tags
function initFilters() {
    const filterBtns = document.querySelectorAll('.subcategory-btn');
    if (!filterBtns.length) return;

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;
            const products = document.querySelectorAll('.product');

            products.forEach(product => {
                const price = parseInt(product.querySelector('.product-price').innerText.replace(/[^0-9]/g, '')) || 0;
                if (filter === 'all') {
                    product.style.display = 'flex';
                } else if (filter === 'under-500' && price <= 500) {
                    product.style.display = 'flex';
                } else if (filter === 'luxury' && price > 500) {
                    product.style.display = 'flex';
                } else if (filter === 'personalized' && product.innerText.toLowerCase().includes('personalized')) {
                    product.style.display = 'flex';
                } else {
                    product.style.display = 'none';
                }
            });
        });
    });
}

// Wishlist
function initWishlist() {
    document.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn')) {
            const btn = e.target.closest('.wishlist-btn');
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            if (btn.classList.contains('active')) {
                icon.className = 'fas fa-heart';
                showToast('Added to Wishlist!', 'fas fa-heart');
            } else {
                icon.className = 'far fa-heart';
            }
        }
    });
}

// Modals
function initModals() {
    const loginModal = document.getElementById('loginModal');
    const loginBtn = document.getElementById('loginBtn');
    const closeBtn = loginModal?.querySelector('.close-btn');

    loginBtn?.addEventListener('click', () => loginModal?.classList.remove('hidden'));
    closeBtn?.addEventListener('click', () => loginModal?.classList.add('hidden'));

    window.addEventListener('click', (e) => {
        if (e.target === loginModal) loginModal.classList.add('hidden');
    });

    const tabs = document.querySelectorAll('.modal-tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
        });
    });
}

// Mobile Nav
function initMobileNav() {
    const toggle = document.querySelector('.mobile-toggle');
    const navMenu = document.querySelector('.nav-menu');
    toggle?.addEventListener('click', () => {
        navMenu?.classList.toggle('active');
    });
}