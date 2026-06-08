// Global Config
const API_URL = 'http://localhost:5000/api';
let CURRENT_USER = JSON.parse(localStorage.getItem('user')) || null;
let CURRENT_LANGUAGE = localStorage.getItem('language') || 'uz';
let CURRENT_THEME = localStorage.getItem('theme') || 'light';

let LANGUAGES = {};
let PRICES = {};
let THEMES = {};

// Initialize
async function initializeApp() {
  try {
    // Load data
    const langRes = await fetch('./config/languages.json');
    LANGUAGES = await langRes.json();

    const pricesRes = await fetch('./config/prices.json');
    PRICES = await pricesRes.json();

    const themesRes = await fetch('./config/themes.json');
    THEMES = await themesRes.json();

    // Apply theme
    applyTheme(CURRENT_THEME);
    
    // Render
    renderProducts();
    renderReviews();
    setupEventListeners();

    console.log('✅ App initialized');
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Apply theme
function applyTheme(theme) {
  CURRENT_THEME = theme;
  localStorage.setItem('theme', theme);
  document.body.className = theme === 'dark' ? 'dark-theme' : 'light-theme';
  document.getElementById('themeBtn').textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Get translation
function t(key) {
  return LANGUAGES[CURRENT_LANGUAGE]?.[key] || key;
}

// Change language
function changeLanguage(lang) {
  CURRENT_LANGUAGE = lang;
  localStorage.setItem('language', lang);
  location.reload();
}

// Render products
function renderProducts() {
  // Stars
  const starsGrid = document.getElementById('starsGrid');
  if (starsGrid) {
    starsGrid.innerHTML = PRICES.telegram_stars.map(p => `
      <div class="product-card ${p.popular ? 'popular' : ''}">
        <div class="product-icon">⭐</div>
        <h3>${p.name_uz}</h3>
        <p class="product-description">${p.stars} Stars</p>
        <div class="product-price">${p.price_uzs.toLocaleString()} UZS</div>
        ${p.discount > 0 ? `<div class="product-discount">-${p.discount}%</div>` : ''}
        <button class="btn btn-primary btn-full" onclick="buyProduct('stars', ${p.id})">Sotib Ol</button>
      </div>
    `).join('');
  }

  // Premium
  const premiumGrid = document.getElementById('premiumGrid');
  if (premiumGrid) {
    premiumGrid.innerHTML = PRICES.telegram_premium.map(p => `
      <div class="product-card ${p.popular ? 'popular' : ''}">
        <div class="product-icon">👑</div>
        <h3>${p.duration_uz}</h3>
        <p class="product-description">Telegram Premium</p>
        <div class="product-price">${p.price_uzs.toLocaleString()} UZS</div>
        ${p.discount > 0 ? `<div class="product-discount">-${p.discount}%</div>` : ''}
        <button class="btn btn-primary btn-full" onclick="buyProduct('premium', ${p.id})">Sotib Ol</button>
      </div>
    `).join('');
  }
}

// Render reviews
function renderReviews() {
  const reviewsGrid = document.getElementById('reviewsGrid');
  const sampleReviews = [
    { author: 'Ali', rating: 5, comment: '✅ Juda yaxshi, tezkor yetkazib berdi!' },
    { author: 'Fatima', rating: 5, comment: '💯 Tavsiya qilaman, ishonchli sayt' },
    { author: 'Oybek', rating: 4, comment: '👍 Yaxshi, biroq chat support kerak edi' }
  ];

  if (reviewsGrid) {
    reviewsGrid.innerHTML = sampleReviews.map(r => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-author">👤 ${r.author}</div>
          <div class="review-rating">${'⭐'.repeat(r.rating)}</div>
        </div>
        <p class="review-text">"${r.comment}"</p>
        <div class="review-date">2 kun oldin</div>
      </div>
    `).join('');
  }
}

// Buy product
function buyProduct(type, productId) {
  if (!CURRENT_USER) {
    openAuthModal();
    return;
  }

  if (type === 'stars') {
    const product = PRICES.telegram_stars.find(p => p.id === productId);
    window.PAYMENT_PRODUCT = product.name_uz;
    window.PAYMENT_AMOUNT = product.price_uzs;
  } else {
    const product = PRICES.telegram_premium.find(p => p.id === productId);
    window.PAYMENT_PRODUCT = product.duration_uz;
    window.PAYMENT_AMOUNT = product.price_uzs;
  }

  document.getElementById('paymentProduct').textContent = window.PAYMENT_PRODUCT;
  document.getElementById('paymentAmount').textContent = window.PAYMENT_AMOUNT.toLocaleString() + ' UZS';
  openModal('paymentModal');
}

// Setup events
function setupEventListeners() {
  // Theme toggle
  document.getElementById('themeBtn')?.addEventListener('click', () => {
    applyTheme(CURRENT_THEME === 'dark' ? 'light' : 'dark');
  });

  // Language toggle
  document.getElementById('langBtn')?.addEventListener('click', () => {
    const langs = { uz: 'ru', ru: 'en', en: 'uz' };
    changeLanguage(langs[CURRENT_LANGUAGE]);
  });

  // Auth tabs
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.add('hidden'));
      e.target.classList.add('active');
      document.getElementById(e.target.dataset.tab + 'Form').classList.remove('hidden');
    });
  });

  // Login
  document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value;
    CURRENT_USER = { username, created_at: new Date() };
    localStorage.setItem('user', JSON.stringify(CURRENT_USER));
    closeModal('authModal');
    alert('✅ Muvaffaqiyatli kirdiniz!');
  });

  // Signup
  document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const firstname = document.getElementById('signup-firstname').value;
    const lastname = document.getElementById('signup-lastname').value;
    const username = document.getElementById('signup-username').value;
    CURRENT_USER = { firstname, lastname, username, created_at: new Date() };
    localStorage.setItem('user', JSON.stringify(CURRENT_USER));
    closeModal('authModal');
    alert('✅ Ro\'yxatdan o\'ttingiz!');
  });

  // Payment
  document.getElementById('paymentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    alert('✅ To\'lov qayta ishlanyapmiz...\n\n@amerdoda telegram botga 2-3 daqiqa ichida bildirishnoma kelib tushadi.');
    closeModal('paymentModal');
    location.reload();
  });

  // Modals
  document.getElementById('buyBtn')?.addEventListener('click', () => {
    CURRENT_USER ? openModal('paymentModal') : openAuthModal();
  });

  document.getElementById('addReviewBtn')?.addEventListener('click', () => {
    CURRENT_USER ? alert('Sharh qo\'shish formasini to\'ldiring') : openAuthModal();
  });

  // Close modals
  document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.target.closest('.modal').classList.add('hidden');
    });
  });

  window.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
      e.target.classList.add('hidden');
    }
  });
}

// Modal helpers
function openAuthModal() {
  document.getElementById('authModal')?.classList.remove('hidden');
}

function openModal(id) {
  document.getElementById(id)?.classList.remove('hidden');
}

function closeModal(id) {
  document.getElementById(id)?.classList.add('hidden');
}

// Init on load
document.addEventListener('DOMContentLoaded', initializeApp);
