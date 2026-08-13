# Любовь и Кофе

Визуальный сайт кофейни «Любовь и Кофе» (Псков, ул. Максима Горького 14/6).

Статический одностраничник с анимациями на GSAP + ScrollTrigger.

## Стек

- HTML / CSS / vanilla JS
- [GSAP 3.12.5](https://gsap.com/) + ScrollTrigger (через CDN)
- Google Fonts: Playfair Display, Manrope, Caveat
- Фотографии — Unsplash

## Локальный запуск

Любой статический сервер подойдёт:

```bash
python -m http.server 5177
```

Открыть `http://localhost:5177`.

## Деплой на Vercel

Проект — статика. Никакой сборки не нужно.

1. Импортировать репозиторий в Vercel
2. Framework Preset: **Other**
3. Build Command: пусто
4. Output Directory: пусто (корень)
5. Install Command: пусто

Кеширование ассетов настроено в [`vercel.json`](./vercel.json).
