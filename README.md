# 🔐 Система аутентификации с кэшированием и сессиями

Профессиональное веб-приложение с полным циклом аутентификации и защитой данных

## 🚀 Основные возможности
### Безопасность
- Шифрование паролей с использованием bcrypt
- Сессии с HTTP-only cookies (`sameSite=lax`)
- Защита маршрутов middleware аутентификации

### Персонализация
- Динамическое переключение тем (light/dark)
- Сохранение настроек в localStorage
- Персональная зона пользователя

### Производительность
- Файловый кэш API-ответов (TTL: 60 сек)
- Оптимизированная обработка запросов
- Автоматическое обновление данных

## 📦 Технологический стек
| Категория       | Технологии                          |
|-----------------|-------------------------------------|
| Бэкенд          | Node.js 18+, Express 4.x           |
| Безопасность    | Bcrypt, Cookie-parser               |
| Клиент          | Vanilla JS, CSS3 Variables         |
| Хранение данных | In-memory sessions, File-system cache |

## ⚙️ Требования
- Node.js v18+
- npm v9+
- Доступ к порту 3000

## 🛠 Установка и запуск
1. Клонируйте репозиторий:
   ```bash
   git clone https://github.com/your-repo/auth-system.git && cd auth-system

2. Установите зависимости:
  ```bash
  npm install --production

3. Создайте структуру каталогов:
  ```bash
  mkdir -p {public,cache,sessions}

4. Запустите сервер:
  ```bash
  npm start

5. Откройте в браузере:
  http://localhost:3000
