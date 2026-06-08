# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page landing site + booking system for **Nut. Brenda Coloccini (NUTRIBOC)**, a nutritionist. Built with Next.js 15 App Router + Tailwind CSS v4 + Prisma 5 + SQLite.

## Commands

```bash
# Development
npm run dev          # starts dev server (usually port 3000, falls back to 3001/3002)
npm run build        # production build
npm run lint         # ESLint

# Database
npx prisma generate          # regenerate client after schema changes (must kill dev server first on Windows — EPERM issue)
npx prisma migrate dev       # create and apply migration
npx prisma studio            # visual DB browser
npx prisma db push           # push schema without migration (dev only)
```

**Windows gotcha:** before running `prisma generate` while the dev server is running, kill all Node processes first:
```powershell
taskkill /F /IM node.exe
```

## First-time setup on a new machine

```bash
npm install
npx prisma generate
# create .env.local (see below)
npm run dev
```

## Environment variables (.env.local — not committed)

```
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="cambiar-esto-por-una-clave-segura-en-produccion"
ADMIN_PASSWORD="nutriboc2026"
NEXT_PUBLIC_BASE_URL="http://localhost:3000"
MP_ACCESS_TOKEN="TU_ACCESS_TOKEN_AQUI"
NEXT_PUBLIC_MP_PUBLIC_KEY="TU_PUBLIC_KEY_AQUI"

# These are fallback defaults — DB values (set in /admin/settings) take priority at runtime
NEXT_PUBLIC_WHATSAPP_NUMBER="542314541335"
NEXT_PUBLIC_TRANSFER_CBU="0000000000000000000000"
NEXT_PUBLIC_TRANSFER_ALIAS="nutriboc.brenda"
NEXT_PUBLIC_TRANSFER_TITULAR="Brenda Coloccini"
NEXT_PUBLIC_TRANSFER_BANCO="Banco a completar"
NEXT_PUBLIC_CONSULTATION_FEE="5000"
```

## Architecture

### Public site (`app/page.tsx`)
Server-rendered single page. Sections: `Header`, `Hero`, `HowItWorks`, `Agenda` (contains `BookingCalendar`), `PaymentMethods`, `Contact`, `Footer`, `WhatsAppFAB`. `SectionReveal` wraps sections for IntersectionObserver scroll animations.

### Styling
- **Main site:** `app/globals.css` — Tailwind v4 (`@import "tailwindcss"`) + `@theme` tokens + custom CSS classes (`.section`, `.wrap`, `.bk-*` for booking, etc.)
- **Admin panel:** `app/admin/admin.css` — completely separate stylesheet imported only in `app/admin/layout.tsx`. All admin classes prefixed with `adm-`.
- **Fonts:** Newsreader (serif, `--font-newsreader`) + Outfit (sans, `--font-outfit`) via `next/font/google`.

### Booking flow (`components/BookingCalendar.tsx`)
Client component with 5 steps: `select` → `form` → `payment` (transfer) → `transfer-sent` or redirect to Mercado Pago. On mount fetches `/api/settings` to get live bank data and WhatsApp numbers (not hardcoded env vars).

### Settings system (`lib/settings.ts`)
All configurable values (WhatsApp numbers, bank transfer data, consultation fee, admin password) live in the `Setting` model (key/value). `getSettings()` merges DB rows over `.env.local` defaults. Server components call `getSetting(key)` directly; client components fetch `/api/settings` (public, read-only).

### Admin panel (`/admin/*`)
Protected by `middleware.ts` via JWT cookie (`admin_token`, 24h, `jose` HS256). Default password: `nutriboc2026` (overridden by DB `admin_password` setting). Login at `/admin/login`.

Pages: Dashboard (`/admin`), Reservas (`/admin/bookings`), Horarios y bloqueos (`/admin/schedule`), Configuración (`/admin/settings`).

Admin API routes all verify `getAdminFromCookies()` from `lib/auth.ts`.

### Database models (Prisma 5 + SQLite)
- **Booking** — patient name/email/phone, mode (`presencial`|`online`), date (YYYY-MM-DD string), slot (HH:MM), paymentType (`transfer`|`mercadopago`), status (`pending`|`pending_transfer`|`pending_mp`|`confirmed`|`cancelled`), MP payment/preference IDs
- **BlockedSlot** — blocks a specific slot on a date for a mode (or `mode: 'both'`, `slot: 'all'`)
- **BlockedDay** — blocks an entire day (unique date)
- **Setting** — key/value store for runtime configuration

### Availability logic (`app/api/availability/route.ts`)
Hardcoded slot lists: presencial `['09:00','10:00','11:00','12:00','15:00','16:00','17:00','18:00']`, online `['08:00','09:00','13:00','14:00','19:00','20:00']`. Excludes blocked days, blocked slots, and bookings with status `pending_transfer | confirmed | pending_mp`.

### Mercado Pago
- Preference created at `/api/mp/preference` — sets `external_reference` to `bookingId`
- Webhook at `/api/mp/webhook` — maps MP payment status to booking status (`approved→confirmed`, `pending→pending_mp`, `rejected/cancelled→cancelled`)
- After successful MP payment, MP redirects to `/reserva/exito` or `/reserva/pendiente`
- `lib/mercadopago.ts` wraps the `mercadopago` SDK

### Route protection
`middleware.ts` protects all `/admin/*` except `/admin/login`. Verifies JWT from `admin_token` cookie; redirects to login on failure.

### Key API routes
| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/availability` | GET | public | available slots for date+mode |
| `/api/bookings` | POST | public | create booking |
| `/api/bookings/[id]` | PATCH | public | update booking status |
| `/api/settings` | GET | public | read-only site settings for client |
| `/api/auth/login` | POST | — | issue JWT cookie |
| `/api/auth/logout` | POST | — | clear cookie |
| `/api/admin/settings` | GET/PUT | admin | full settings CRUD + password change |
| `/api/admin/stats` | GET | admin | dashboard statistics |
| `/api/admin/block-slot` | GET/POST | admin | manage blocked slots |
| `/api/admin/block-day` | GET/POST | admin | manage blocked days |
| `/api/mp/preference` | POST | public | create MP payment preference |
| `/api/mp/webhook` | POST/GET | public | MP payment events |
