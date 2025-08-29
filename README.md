# The Oracle Cube - ARC 2025 Festival

Интерактивный 3D опыт "Oracle Cube" для ARC 2025 Festival. Пользователи могут задавать вопросы и получать мистические ответы в красивом 3D окружении.

## Технологии

- React 18
- TypeScript
- Three.js
- Vite
- GitHub Pages

## Установка и запуск

1. Установите зависимости:
```bash
npm install
```

2. Запустите проект в режиме разработки:
```bash
npm run dev
```

3. Соберите проект для продакшена:
```bash
npm run build
```

## Деплой на GitHub Pages

1. Создайте репозиторий на GitHub с названием `oracle-cube-arc-festival`

2. Обновите `package.json` - замените `yourusername` на ваше имя пользователя GitHub в поле `homepage`

3. Инициализируйте Git и загрузите код:
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/oracle-cube-arc-festival.git
git push -u origin main
```

4. Деплой:
```bash
npm run deploy
```

5. В настройках репозитория GitHub включите GitHub Pages и выберите ветку `gh-pages`

## Особенности

- Полноэкранный 3D опыт с Three.js
- Адаптивный дизайн для мобильных устройств
- Glitch эффекты для текста
- Интерактивные частицы и сфера
- Анонимность - данные не сохраняются

## Автор

The Vessel - [Instagram](https://www.instagram.com/vesselvibe)

## Лицензия

MIT
