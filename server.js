const express = require('express');
const bcrypt = require('bcrypt');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = 3000;

// Настройки
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Хранилище данных (вместо БД для простоты)
const users = [];
const sessions = {};

// Middleware для проверки аутентификации
function authenticate(req, res, next) {
  const sessionId = req.cookies.sessionId;
  
  if (!sessionId || !sessions[sessionId]) {
    return res.redirect('/');
  }
  
  req.user = sessions[sessionId];
  next();
}

// Создание хэша пароля
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

// Проверка пароля
async function checkPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// Генерация случайных данных для кэширования
function generateData() {
  return {
    timestamp: new Date().toISOString(),
    data: crypto.randomBytes(16).toString('hex')
  };
}

// Проверка актуальности кэша
function isCacheValid(cachePath) {
  if (!fs.existsSync(cachePath)) return false;
  
  const stats = fs.statSync(cachePath);
  const now = new Date();
  const cacheAge = (now - stats.mtime) / 1000; // в секундах
  
  return cacheAge < 60; // 1 минута
}

// Роуты
app.post('/register', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).send('Username and password are required');
  }
  
  if (users.some(u => u.username === username)) {
    return res.status(400).send('User already exists');
  }
  
  const hashedPassword = await hashPassword(password);
  users.push({ username, password: hashedPassword });
  
  res.redirect('/');
});

app.post('/login', async (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username);
  
  if (!user || !(await checkPassword(password, user.password))) {
    return res.status(401).send('Invalid credentials');
  }
  
  const sessionId = crypto.randomBytes(16).toString('hex');
  sessions[sessionId] = { username };
  
  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production', // HTTPS в production
    maxAge: 24 * 60 * 60 * 1000
  });
  
  res.redirect('/profile');
});

app.post('/logout', (req, res) => {
  const sessionId = req.cookies.sessionId;
  
  if (sessionId) {
    delete sessions[sessionId];
    res.clearCookie('sessionId');
  }
  
  res.redirect('/');
});

app.get('/profile', authenticate, (req, res) => {
  res.sendFile(path.join(__dirname, 'public/profile.html'));
});

app.get('/api/user', authenticate, (req, res) => {
    res.json({ username: req.user.username });
  });

app.get('/data', authenticate, (req, res) => {
  const cachePath = path.join(__dirname, 'cache/data.json');
  
  if (isCacheValid(cachePath)) {
    const cachedData = JSON.parse(fs.readFileSync(cachePath));
    return res.json({ ...cachedData, cached: true });
  }
  
  const newData = generateData();
  fs.writeFileSync(cachePath, JSON.stringify(newData));
  
  res.json({ ...newData, cached: false });
});

app.use(express.static('public'));

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});