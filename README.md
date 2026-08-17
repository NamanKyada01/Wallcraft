# Wallcraft 🖼️

A modern, high-quality wallpaper app built with React Native + Expo, with a full admin dashboard for managing users, wallpapers, and support tickets.

## Tech Stack

| Layer | Technology |
|---|---|
| Mobile | React Native + Expo + TypeScript |
| UI/Styling | NativeWind v4 (Tailwind for RN) + custom design system |
| Navigation | React Navigation v7 (Native Stack + Bottom Tabs + Drawer) |
| Animations | react-native-reanimated + Lottie |
| Backend | Supabase (PostgreSQL, Auth, Row-Level Security) |
| Image Storage/CDN | Cloudinary (auto-resize, WebP, dynamic transforms) |
| i18n | i18next + react-i18next (en, es, fr, hi, ar — RTL support) |
| Admin Dashboard | Vite + React + TypeScript + Tailwind + TanStack Query + Recharts |

## Project Structure

```
apps/
├── mobile/     # React Native Expo app
└── admin/      # Admin dashboard (Vite + React)
supabase/
└── migrations/ # Database schema + RLS policies
```

## Getting Started

### 1. Database
Create a free project at [supabase.com](https://supabase.com), then run `supabase/migrations/001_initial_schema.sql` in the SQL Editor.

### 2. Mobile App
```bash
cd apps/mobile
npm install
# Add your Supabase + Cloudinary credentials to app.json (extra field)
npx expo start
```

### 3. Admin Dashboard
```bash
cd apps/admin
npm install
npm run dev
```

## Features
- 🎬 Animated onboarding (Lottie)
- 🔐 Supabase auth (email/password)
- 🖼️ Featured carousel, categories, trending, masonry grids
- ⬇️ Download & set as wallpaper
- ❤️ Favorites
- 🎫 Support ticket system with conversation threads
- 🌍 Multi-language with RTL support
- 🌗 Dark-first theming (all colors from a single `colors.ts`)
- 📊 Admin dashboard: users, wallpapers, categories, tickets, analytics
