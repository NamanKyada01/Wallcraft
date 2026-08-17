
# 🖼️ Wallpaper App — Full Architecture Plan (v2)

## Final Tech Stack

| Layer | Technology |
|---|---|
| **Mobile** | React Native + Expo + TypeScript |
| **UI/Styling** | NativeWind v4 (Tailwind for RN) + custom reusable components |
| **Navigation** | React Navigation v7 (Native Stack + Bottom Tabs, minimal Drawer) |
| **Animations** | react-native-reanimated + Lottie (onboarding/empty states) |
| **Backend/Auth/DB** | Supabase (PostgreSQL, Auth, Row-Level Security) |
| **Image Storage/CDN** | Cloudinary (auto-resize, WebP/AVIF, dynamic transforms) |
| **i18n** | i18next + react-i18next |
| **Admin Dashboard** | Vite + React + TypeScript + Tailwind CSS |
| **Admin Data Fetching** | TanStack Query |
| **Admin Forms** | React Hook Form + Zod |
| **Admin Charts** | Recharts |

---

## Project Structure

```
test/
├── apps/
│   ├── mobile/                    # React Native Expo app
│   │   ├── app.json
│   │   ├── tailwind.config.js     # NativeWind config
│   │   ├── index.js
│   │   ├── metro.config.js
│   │   ├── global.css             # Tailwind directives + global styles
│   │   ├── src/
│   │   │   ├── theme/
│   │   │   │   └── colors.ts      # ← SINGLE file: ALL color tokens
│   │   │   ├── i18n/
│   │   │   │   ├── index.ts       # i18next config
│   │   │   │   └── locales/
│   │   │   │       ├── en.json   # ← ALL static text (primary)
│   │   │   │       ├── es.json
│   │   │   │       ├── fr.json
│   │   │   │       ├── hi.json
│   │   │   │       └── ar.json   # RTL support
│   │   │   ├── navigation/
│   │   │   │   ├── AppNavigator.tsx      # Root: auth gate → main
│   │   │   │   ├── AuthNavigator.tsx     # Onboarding → Login → Signup
│   │   │   │   ├── MainNavigator.tsx     # Bottom tabs (Home, Search, Favorites, Profile)
│   │   │   │   └── DrawerNavigator.tsx   # Minimal: Settings, Help, About, Logout
│   │   │   ├── screens/
│   │   │   │   ├── onboarding/
│   │   │   │   │   ├── OnboardingScreen.tsx
│   │   │   │   │   └── components/OnboardingPage.tsx
│   │   │   │   ├── auth/
│   │   │   │   │   ├── LoginScreen.tsx
│   │   │   │   │   └── SignupScreen.tsx
│   │   │   │   ├── home/
│   │   │   │   │   └── HomeScreen.tsx
│   │   │   │   ├── category/
│   │   │   │   │   └── CategoryDetailScreen.tsx
│   │   │   │   ├── wallpaper/
│   │   │   │   │   └── WallpaperDetailScreen.tsx
│   │   │   │   ├── search/
│   │   │   │   │   └── SearchScreen.tsx
│   │   │   │   ├── favorites/
│   │   │   │   │   └── FavoritesScreen.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── ProfileScreen.tsx
│   │   │   │   ├── settings/
│   │   │   │   │   └── SettingsScreen.tsx
│   │   │   │   ├── about/
│   │   │   │   │   └── AboutScreen.tsx
│   │   │   │   ├── contact/
│   │   │   │   │   └── ContactScreen.tsx
│   │   │   │   └── help/
│   │   │   │       ├── HelpScreen.tsx
│   │   │   │       ├── CreateTicketScreen.tsx
│   │   │   │       ├── TicketListScreen.tsx
│   │   │   │       └── TicketDetailScreen.tsx
│   │   │   ├── components/          # Custom design system (no Material UI)
│   │   │   │   ├── ui/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── TextInput.tsx
│   │   │   │   │   ├── Card.tsx
│   │   │   │   │   ├── Badge.tsx
│   │   │   │   │   ├── Modal.tsx
│   │   │   │   │   ├── BottomSheet.tsx
│   │   │   │   │   └── LoadingSpinner.tsx
│   │   │   │   ├── WallpaperCard.tsx
│   │   │   │   ├── FeaturedCarousel.tsx
│   │   │   │   ├── CategoryChip.tsx
│   │   │   │   ├── SearchBar.tsx
│   │   │   │   ├── TicketStatusBadge.tsx
│   │   │   │   ├── EmptyState.tsx     # Lottie + text
│   │   │   │   └── TabBar.tsx         # Custom animated bottom tab bar
│   │   │   ├── services/
│   │   │   │   ├── supabase.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── wallpaper.service.ts
│  │   │   │   ├── category.service.ts
│   │   │   │   ├── favorites.service.ts
│  │   │   │   ├── ticket.service.ts
│  │   │   │   └── storage.service.ts
│   │   │   ├── hooks/
│  │   │   │   ├── useAuth.ts
│  │   │   │   ├── useWallpapers.ts
│  │   │   │   ├── useFavorites.ts
│  │   │   │   └── useTickets.ts
│  │   │   ├── utils/
│  │   │   │   ├── responsive.ts
│  │   │   │   └── helpers.ts
│  │   │   └── types/
│  │   │       └── index.ts
│   │   └── assets/
│  │       ├── lottie/
│  │       └── images/
│   └── admin/                     # React Web Dashboard
│       ├── package.json
│       ├── vite.config.ts
│       ├── tailwind.config.js
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── App.tsx
│           ├── api/
│           │   └── supabase.ts
│           ├── lib/
│           │   └── queryClient.ts   # TanStack Query setup
│           ├── components/
│           │   ├── Layout.tsx
│           │   ├── StatsCard.tsx
│           │   ├── DataTable.tsx
│           │   └── Chart.tsx
│           ├── pages/
│           │   ├── Dashboard.tsx
│           │   ├── Users.tsx
│           │   ├── Wallpapers.tsx
│           │   ├── Categories.tsx
│           │   ├── Tickets.tsx
│           │   ├── TicketDetail.tsx
│           │   └── Settings.tsx
│           └── hooks/
│               ├── useAuth.ts
│               ├── useUsers.ts
│               ├── useWallpapers.ts
│               └── useTickets.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── README.md
```

---

## Custom UI Design System Philosophy

Since we're NOT using React Native Paper, we build a custom design system focused on:
- **Large immersive imagery** — full-bleed cards, rounded corners (24px), minimal chrome
- **Dark-first design** — wallpapers look best on dark backgrounds
- **Glassmorphism accents** — frosted glass overlays on cards and bottom sheets
- **Smooth micro-interactions** — spring animations on every tap, swipe, and scroll
- **NativeWind utility classes** — all styling via `className` with Tailwind, referencing colors from `colors.ts` via CSS custom properties

### UI Component Examples:
- **Button**: Rounded-full, subtle shadow, press scale animation (reanimated)
- **Card**: Rounded-3xl, overflow-hidden, image fill, gradient overlay for text
- **BottomSheet**: Drag-handle, backdrop blur, spring-physics dismiss
- **TabBar**: Custom SVG icons with animated indicator dot, pill-shaped active state
- **TextInput**: Floating label, focus ring animation, error shake

---

## Navigation Flow

```
App Start
  ├─→ Onboarding (first time only, 3 Lottie pages)
  │    └─→ Auth (Login / Signup)
  └─→ Auth (no session)
       └─→ Main App
            ├─ Bottom Tabs (custom animated):
            │    ├─ Home      (featured carousel, categories, trending)
            │    ├─ Explore   (search + browse + filters)
            │    ├─ Favorites (saved wallpapers grid)
            │    └─ Profile   (user info → opens Drawer)
            │
            └─ Stack Screens (pushed on top):
                 ├─ Category Detail (masonry grid)
                 ├─ Wallpaper Detail (full preview, download, set as wallpaper)
                 ├─ Settings (theme, language, notifications)
                 ├─ About (app info, privacy, terms)
                 ├─ Contact (email, socials)
                 ├─ Help & Support (FAQ accordion)
                 ├─ Create Ticket (form)
                 ├─ Ticket List (status badges)
                 └─ Ticket Detail (conversation thread)

Drawer (from Profile swipe):
  Settings, Help & Support, About, Rate App, Logout
```

---

## Supabase Database Schema

```sql
-- profiles (extends auth.users)
CREATE TABLE profiles (
  id          UUID REFERENCES auth.users PRIMARY KEY,
  username    TEXT UNIQUE,
  full_name   TEXT,
  avatar_url  TEXT,
  role        TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- wallpaper categories
CREATE TABLE categories (
  id          SERIAL PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  icon        TEXT,
  color       TEXT,
  sort_order  INT DEFAULT 0
);

-- wallpapers (images in Cloudinary, metadata here)
CREATE TABLE wallpapers (
  id              SERIAL PRIMARY KEY,
  title           TEXT NOT NULL,
  description     TEXT,
  cloudinary_id   TEXT NOT NULL,
  cloudinary_url  TEXT NOT NULL,
  category_id     INT REFERENCES categories(id),
  tags            TEXT[],
  width           INT,
  height          INT,
  is_featured     BOOLEAN DEFAULT FALSE,
  is_premium      BOOLEAN DEFAULT FALSE,
  download_count  INT DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- user favorites
CREATE TABLE favorites (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users ON DELETE CASCADE,
  wallpaper_id  INT REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, wallpaper_id)
);

-- support tickets
CREATE TABLE tickets (
  id          SERIAL PRIMARY KEY,
  user_id     UUID REFERENCES auth.users ON DELETE CASCADE,
  subject     TEXT NOT NULL,
  category    TEXT CHECK (category IN ('bug','feature','billing','other')),
  status      TEXT DEFAULT 'open' CHECK (status IN ('open','in_progress','resolved','closed')),
  priority    TEXT DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ticket conversation
CREATE TABLE ticket_messages (
  id          SERIAL PRIMARY KEY,
  ticket_id   INT REFERENCES tickets(id) ON DELETE CASCADE,
  sender_id   UUID REFERENCES auth.users,
  sender_type TEXT CHECK (sender_type IN ('user','admin')),
  message     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- download tracking
CREATE TABLE downloads (
  id            SERIAL PRIMARY KEY,
  user_id       UUID REFERENCES auth.users ON DELETE CASCADE,
  wallpaper_id  INT REFERENCES wallpapers(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies on all tables
-- Users: read wallpapers/categories, manage own favorites/tickets
-- Admins: full CRUD on all tables via role check in RLS
```

---

## Cloudinary URL Transform Strategy

```
Thumbnail (grid):    cloudinary_url + /w_400,c_fill,q_auto,f_webp/...
Preview (detail):    cloudinary_url + /w_1080,q_auto,f_webp/...
Download (full):     cloudinary_url + /fl_lossy,q_auto/...
Placeholder (blur):  cloudinary_url + /w_20,e_blur:1000,q_1/...
```

---

## i18n Translation Structure (en.json example)

```json
{
  "onboarding": {
    "discover_title": "Discover Amazing Wallpapers",
    "discover_desc": "Browse thousands of high-quality wallpapers curated just for you",
    "personalize_title": "Personalize Your Screen",
    "personalize_desc": "Set beautiful wallpapers directly from the app",
    "collections_title": "Build Your Collection",
    "collections_desc": "Save favorites and never lose a wallpaper you love",
    "skip": "Skip",
    "next": "Next",
    "getStarted": "Get Started"
  },
  "auth": {
    "login": "Log In",
    "signup": "Sign Up",
    "email": "Email",
    "password": "Password",
    "username": "Username",
    "forgotPassword": "Forgot Password?",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?"
  },
  "tabs": {
    "home": "Home",
    "explore": "Explore",
    "favorites": "Favorites",
    "profile": "Profile"
  },
  "home": {
    "featured": "Featured",
    "categories": "Categories",
    "trending": "Trending Now",
    "newArrivals": "New Arrivals"
  },
  "wallpaper": {
    "download": "Download",
    "setWallpaper": "Set as Wallpaper",
    "favorite": "Favorite",
    "related": "Related Wallpapers",
    "resolution": "Resolution"
  },
  "search": {
    "placeholder": "Search wallpapers...",
    "recent": "Recent Searches",
    "noResults": "No wallpapers found"
  },
  "favorites": {
    "empty": "No favorites yet",
    "emptyDesc": "Tap the heart on any wallpaper to save it here"
  },
  "profile": {
    "editProfile": "Edit Profile",
    "downloads": "Downloads",
    "favorites": "Favorites"
  },
  "settings": {
    "title": "Settings",
    "theme": "Theme",
    "language": "Language",
    "notifications": "Notifications",
    "clearCache": "Clear Cache",
    "logout": "Log Out"
  },
  "help": {
    "title": "Help & Support",
    "createTicket": "Create Ticket",
    "myTickets": "My Tickets",
    "subject": "Subject",
    "description": "Description",
    "priority": "Priority",
    "category": "Category",
    "submit": "Submit Ticket",
    "faq": "Frequently Asked Questions"
  },
  "ticket": {
    "open": "Open",
    "inProgress": "In Progress",
    "resolved": "Resolved",
    "closed": "Closed",
    "low": "Low",
    "medium": "Medium",
    "high": "High"
  },
  "about": { "title": "About", "version": "Version", "privacy": "Privacy Policy", "terms": "Terms of Service" },
  "contact": { "title": "Contact Us", "email": "Email Us", "social": "Follow Us" },
  "common": { "cancel": "Cancel", "save": "Save", "delete": "Delete", "edit": "Edit", "close": "Close", "loading": "Loading...", "error": "Something went wrong", "retry": "Retry" }
}
```

---

## Admin Dashboard Pages

1. **Dashboard** — Stats cards (total users, wallpapers, downloads, open tickets), line chart (downloads over time), pie chart (category distribution), bar chart (ticket status)
2. **Users** — Table with search/filter, view user profile (favorites, downloads, tickets), ban/unban
3. **Wallpapers** — Grid/table view, upload to Cloudinary via upload preset, edit metadata, delete, toggle featured/premium, bulk select
4. **Categories** — CRUD with icon picker, color picker, drag-to-reorder
5. **Tickets** — Filterable table (status, priority, date), click to view conversation, reply as admin (React Hook Form + Zod), change status, close ticket
6. **Settings** — App config, Cloudinary settings, notification preferences

---

## Implementation Order

### Phase 1: Foundation (4 steps)
1. Initialize Expo project with TypeScript, install all dependencies (NativeWind, React Navigation, Reanimated, Lottie, i18next, Supabase SDK)
2. Create `colors.ts` (single color file), `global.css` (NativeWind setup with CSS custom properties for colors), `tailwind.config.js`
3. Create i18n setup with `en.json` (complete translation file), add es/fr/hi/ar stubs
4. Create Supabase client + full database migration SQL

### Phase 2: Navigation Shell (4 steps)
5. Build custom UI components: Button, TextInput, Card, Badge, LoadingSpinner
6. Build AuthNavigator: OnboardingScreen (3 Lottie pages, swipe gestures), LoginScreen, SignupScreen (all SafeAreaView + KeyboardAvoidingView)
7. Build MainNavigator: Custom animated TabBar + 4 tab screens (Home, Explore, Favorites, Profile)
8. Build DrawerNavigator: Custom drawer with glassmorphism header, minimal menu items

### Phase 3: Core Wallpaper Screens (5 steps)
9. HomeScreen: Featured carousel (auto-play, snap), categories grid (2-col), trending horizontal scroll
10. CategoryDetailScreen: Masonry grid (FlashList), pull-to-refresh, infinite scroll
11. WallpaperDetailScreen: Full image, pinch-zoom, download button, set-as-wallpaper, favorite toggle, related
12. SearchScreen: Animated search bar, recent searches (AsyncStorage), results grid
13. FavoritesScreen: Grid with reanimated exit animations, swipe-to-remove, empty state (Lottie)

### Phase 4: Profile & Support (5 steps)
14. ProfileScreen: Avatar, name, email, stats cards, edit profile
15. SettingsScreen: Theme picker, language selector, notification toggle, clear cache, logout
16. AboutScreen + ContactScreen
17. HelpScreen: FAQ accordion + create ticket CTA
18. Ticket System: CreateTicketScreen, TicketListScreen (status badges), TicketDetailScreen (chat thread)

### Phase 5: Admin Dashboard (4 steps)
19. Initialize Vite + React + TS + Tailwind + TanStack Query + React Hook Form + Zod + Recharts
20. Build Layout (sidebar nav) + Dashboard page (stats + charts)
21. Build Users + Wallpapers + Categories management pages
22. Build Tickets management (list + detail + admin reply)

---

## Key Constraints
- **Every screen**: SafeAreaView wrapper + KeyboardAvoidingView where inputs exist
- **Every color**: Referenced from `colors.ts` via NativeWind CSS variables, never hardcoded
- **Every text string**: Uses `t('key')` from i18next, never hardcoded
- **Every animation**: Uses react-native-reanimated (spring physics), Lottie only for onboarding/empty states
- **Dark mode**: Default theme (wallpaper app), light mode toggle available
- **RTL**: Arabic locale with `dir: 'rtl'` support in React Navigation and NativeWind
