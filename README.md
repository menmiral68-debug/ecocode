# ЭкоКод

**ЭкоКод** — игровой симулятор цифровой школы безопасности в лесу для школьников 10–15 лет. Пилотная версия ориентирована на ЯНАО.

## Стек

- React
- Vite
- JavaScript
- CSS без UI-фреймворка
- GitHub Pages через GitHub Actions

## Запуск

```bash
npm install
npm run dev
```

Сборка:

```bash
npm run build
npm run preview
```

## Данные

Прогресс и имя хранятся только в `localStorage` браузера. Серверной части, аналитики и внешних API в MVP нет.

## Публикация

Проект публикуется на GitHub Pages по адресу:

`https://menmiral68-debug.github.io/ecocode/`

## Структура

`src/components` — интерфейсные компоненты  
`src/data` — сценарии и источники  
`src/game` — состояние и расчёт прогресса  
`src/styles` — визуальная система
