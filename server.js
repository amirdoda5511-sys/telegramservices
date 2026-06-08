const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-Memory Database
let users = [];
let transactions = [];
let reviews = [];

// Static Files
const prices = require('./config/prices.json');
const themes = require('./config/themes.json');
const languages = require('./config/languages.json');

// API Routes

// Get Languages
app.get('/api/languages', (req, res) => {
  res.json(languages);
});

// Get Prices
app.get('/api/prices', (req, res) => {
  res.json(prices);
});

// Get Themes
app.get('/api/themes', (req, res) => {
  res.json(themes);
});

// Auth
app.post('/api/auth/login', (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json({ success: false });
  
  let user = users.find(u => u.username === username);
  if (!user) {
    user = { id: Date.now(), username, created_at: new Date() };
    users.push(user);
  }
  res.json({ success: true, user });
});

app.post('/api/auth/signup', (req, res) => {
  const { firstname, lastname, username } = req.body;
  if (!firstname || !username) return res.status(400).json({ success: false });
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ success: false, message: 'Username already exists' });
  }
  
  const user = { id: Date.now(), firstname, lastname, username, created_at: new Date() };
  users.push(user);
  res.json({ success: true, user });
});

// Payment
app.post('/api/payment/process', async (req, res) => {
  const { userId, amount, productType } = req.body;
  if (!userId || !amount) return res.status(400).json({ success: false });

  const transaction = {
    id: Date.now(),
    userId,
    amount,
    productType,
    status: 'processing',
    created_at: new Date()
  };
  transactions.push(transaction);

  // Telegram notification
  setTimeout(async () => {
    try {
      const message = `✅ YANGI TO'LOV\n\n👤 User: ${userId}\n💰 Summa: ${amount} UZS\n📦 Mahsulot: ${productType}\n✓ Tasdiqlandi`;
      
      // Send to Telegram Bot
      await require('axios').post(
        `https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/sendMessage`,
        { chat_id: process.env.ADMIN_CHAT_ID, text: message }
      ).catch(() => {});
    } catch (error) {
      console.error('Telegram error:', error.message);
    }
  }, 1000);

  res.json({ success: true, transactionId: transaction.id });
});

app.get('/api/payment/status/:transactionId', (req, res) => {
  const tx = transactions.find(t => t.id === parseInt(req.params.transactionId));
  if (tx) {
    tx.status = Math.random() > 0.1 ? 'completed' : 'failed';
    res.json({ success: true, transaction: tx });
  } else {
    res.status(404).json({ success: false });
  }
});

// Reviews
app.get('/api/reviews', (req, res) => {
  res.json({ success: true, reviews });
});

app.post('/api/reviews', (req, res) => {
  const { userId, rating, comment } = req.body;
  const review = { id: Date.now(), userId, rating, comment, created_at: new Date() };
  reviews.push(review);
  res.json({ success: true, review });
});

// Admin
app.post('/api/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === process.env.ADMIN_PASSWORD) {
    res.json({ success: true, token: 'admin-token' });
  } else {
    res.status(401).json({ success: false });
  }
});

app.get('/api/admin/users', (req, res) => {
  res.json({ success: true, users, count: users.length });
});

app.get('/api/admin/transactions', (req, res) => {
  res.json({ success: true, transactions, total: transactions.length });
});

app.delete('/api/admin/users/:userId', (req, res) => {
  users = users.filter(u => u.id !== parseInt(req.params.userId));
  res.json({ success: true });
});

// Health
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date() });
});

// 404
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🤖 Telegram Bot: ${process.env.TELEGRAM_BOT_TOKEN}`);
  console.log(`🔐 Admin Panel: http://localhost:${PORT}/admin.html`);
});
