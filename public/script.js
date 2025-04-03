// Общие функции
document.addEventListener('DOMContentLoaded', function() {
    // Инициализация темы
    initTheme();
    
    // Обработчики для переключения вкладок
    const tabButtons = document.querySelectorAll('.tab-btn');
    if (tabButtons.length > 0) {
      tabButtons.forEach(button => {
        button.addEventListener('click', () => {
          const tabName = button.getAttribute('data-tab');
          switchTab(tabName);
        });
      });
    }
    
    // Обработчик формы входа
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        loginUser(username, password);
      });
    }
    
    // Обработчик формы регистрации
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        registerUser(username, password);
      });
    }
    
    // Обработчик кнопки выхода
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', logoutUser);
    }
    
    // Обработчик кнопки обновления данных
    const refreshBtn = document.getElementById('refreshData');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', fetchData);
      fetchData(); // Загружаем данные сразу при загрузке страницы
    }
    
    // Отображение имени пользователя
    const usernameElement = document.getElementById('username');
    if (usernameElement) {
      // Проверяем, авторизован ли пользователь
      checkAuth().then(username => {
        if (username) {
          usernameElement.textContent = username;
        } else {
          window.location.href = '/';
        }
      });
    }
    
    // Обработчик переключения темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
      themeToggle.addEventListener('click', toggleTheme);
    }
  });
  
  // Функции для работы с темой
  function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light-theme';
    document.body.className = savedTheme;
  }
  
  function toggleTheme() {
    const body = document.body;
    if (body.classList.contains('light-theme')) {
      body.classList.remove('light-theme');
      body.classList.add('dark-theme');
      localStorage.setItem('theme', 'dark-theme');
    } else {
      body.classList.remove('dark-theme');
      body.classList.add('light-theme');
      localStorage.setItem('theme', 'light-theme');
    }
  }
  
  // Функции для работы с вкладками
  function switchTab(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.add('hidden');
    });
    
    document.querySelector(`.tab-btn[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(`${tabName}-form`).classList.remove('hidden');
  }
  
  // Функции для работы с API
  async function loginUser(username, password) {
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        const data = await response.text();
        alert(data);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Login failed');
    }
  }
  
  async function registerUser(username, password) {
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });
      
      if (response.ok) {
        alert('Registration successful! Please login.');
        switchTab('login');
        document.getElementById('registerForm').reset();
      } else {
        const data = await response.text();
        alert(data);
      }
    } catch (error) {
      console.error('Registration error:', error);
      alert('Registration failed');
    }
  }
  
  async function logoutUser() {
    try {
      const response = await fetch('/logout', {
        method: 'POST'
      });
      
      if (response.redirected) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  }
  
  async function checkAuth() {
    try {
      const response = await fetch('/api/user', {
        method: 'GET',
        credentials: 'include' // Важно для отправки кук
      });
      
      if (response.ok) {
        const userData = await response.json();
        return userData.username;
      }
      return null;
    } catch (error) {
      console.error('Auth check error:', error);
      return null;
    }
  }
  
  async function fetchData() {
    const dataContainer = document.getElementById('dataContainer');
    try {
      dataContainer.innerHTML = '<p>Loading data...</p>';
      
      const response = await fetch('/data', {
        credentials: 'include' // Отправляем куки сессии
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      
      const data = await response.json();
      let html = `
        <p><strong>Timestamp:</strong> ${data.timestamp}</p>
        <p><strong>Data:</strong> ${data.data}</p>
        <p><em>${data.cached ? 'Served from cache' : 'Freshly generated'}</em></p>
      `;
      dataContainer.innerHTML = html;
      
    } catch (error) {
      console.error('Data fetch error:', error);
      dataContainer.innerHTML = '<p>Error loading data. Please try again.</p>';
    }
  }