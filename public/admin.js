let adminToken = localStorage.getItem('adminToken') || null;
let prices = {};
let themes = {};

// Check auth
if (!adminToken) {
  const password = prompt('🔐 Admin parolini kiriting:');
  if (password === '_935705511_') {
    adminToken = 'admin-token-' + Date.now();
    localStorage.setItem('adminToken', adminToken);
  } else {
    alert('❌ Parol noto\'g\'ri!');
    window.location.href = 'index.html';
  }
}

// Load data
async function loadData() {
  try {
    const pricesRes = await fetch('./config/prices.json');
    prices = await pricesRes.json();

    const themesRes = await fetch('./config/themes.json');
    themes = await themesRes.json();

    renderPrices();
    renderThemes();
    updateStats();
  } catch (error) {
    console.error('Error loading data:', error);
  }
}

// Render prices
function renderPrices() {
  const starsList = document.getElementById('starsPrices');
  starsList.innerHTML = prices.telegram_stars.map((p, i) => `
    <div class="price-item">
      <input type="text" value="${p.name_uz}" placeholder="Nomi">
      <input type="number" value="${p.stars}" placeholder="Stars">
      <input type="number" value="${p.price_uzs}" placeholder="Narx UZS">
      <input type="number" value="${p.discount}" placeholder="Chegirma %">
      <button class="btn btn-danger" onclick="deletePrice('stars', ${i})">O'chirish</button>
    </div>
  `).join('');

  const premiumList = document.getElementById('premiumPrices');
  premiumList.innerHTML = prices.telegram_premium.map((p, i) => `
    <div class="price-item">
      <input type="text" value="${p.duration_uz}" placeholder="Muddati">
      <input type="number" value="${p.months}" placeholder="Oylar">
      <input type="number" value="${p.price_uzs}" placeholder="Narx UZS">
      <input type="number" value="${p.discount}" placeholder="Chegirma %">
      <button class="btn btn-danger" onclick="deletePrice('premium', ${i})">O'chirish</button>
    </div>
  `).join('');
}

// Render themes
function renderThemes() {
  const lightPicker = document.getElementById('lightThemePicker');
  lightPicker.innerHTML = Object.entries(themes.light_theme).map(([key, value]) => `
    <div class="color-item">
      <label>${key}</label>
      <input type="color" value="${value}" id="light_${key}" onchange="updateThemePreview()">
      <small>${value}</small>
    </div>
  `).join('');

  const darkPicker = document.getElementById('darkThemePicker');
  darkPicker.innerHTML = Object.entries(themes.dark_theme).map(([key, value]) => `
    <div class="color-item">
      <label>${key}</label>
      <input type="color" value="${value}" id="dark_${key}" onchange="updateThemePreview()">
      <small>${value}</small>
    </div>
  `).join('');
}

// Update stats
function updateStats() {
  document.getElementById('totalUsers').textContent = '15';
  document.getElementById('totalTransactions').textContent = '42';
  document.getElementById('totalRevenue').textContent = '5,250,000 UZS';
  document.getElementById('successRate').textContent = '96%';
}

// Save prices
function savePrices() {
  alert('✅ Narxlar saqlandi! (Demo mode)');
}

// Save themes
function saveThemes() {
  alert('✅ Ranglar saqlandi! (Demo mode)');
}

// Save settings
function saveSettings() {
  alert('✅ Sozlamalar saqlandi! (Demo mode)');
}

// Delete price
function deletePrice(type, index) {
  if (confirm('Ochirmoqchimiz?')) {
    alert('✅ O\'chirildi! (Demo mode)');
  }
}

// Add new price
function addNewPrice(type) {
  alert('📝 Yangi paket qo\'shish formasini to\'ldiring');
}

// Update theme preview
function updateThemePreview() {
  // Preview update logic
}

// Navigation
document.querySelectorAll('.nav-item').forEach(btn => {
  btn.addEventListener('click', (e) => {
    if (!e.target.classList.contains('logout')) {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      e.target.classList.add('active');
      document.getElementById(e.target.dataset.page).classList.add('active');
    }
  });
});

// Theme switcher
document.getElementById('themeSwitcher')?.addEventListener('click', () => {
  document.body.classList.toggle('dark-theme');
  document.getElementById('themeSwitcher').textContent = 
    document.body.classList.contains('dark-theme') ? '☀️' : '🌙';
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', () => {
  localStorage.removeItem('adminToken');
  window.location.href = 'index.html';
});

// Init
document.addEventListener('DOMContentLoaded', loadData);
