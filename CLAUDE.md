# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Single-page landing site + booking system for **Nut. Brenda Coloccini (Nutri.bcg)**, a nutritionist. Built with Next.js 15 App Router + Tailwind CSS v4 + Prisma 5 + SQLite.

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
Client component with 5 steps: `select` → `form` → `payment` (transfer) → `transfer-sent` or redirect to Mercado Pago. On mount fetches `/api/settings` to get live settings (bank data, WhatsApp numbers, prices, MP link, min_days_ahead).

- **Mercado Pago button** only renders if `settings.mp_link` is set. If empty, only transfer is shown.
- **Dual pricing:** transfer uses `consultation_fee`, MP uses `consultation_fee_mp`. Each price shown inside its button.
- **Minimum booking lead time:** `min_days_ahead` setting controls how many days ahead patients must book (default: 1 = tomorrow onwards). Days before that threshold are disabled in the calendar.
- **Booking hold:** on creation, `pending_transfer` and `pending_mp` bookings get `expiresAt = now + 30min`. The slot is blocked for 30 minutes. If not confirmed, it auto-cancels on the next availability query for that date/mode.

### Settings system (`lib/settings.ts`)
All configurable values live in the `Setting` model (key/value). `getSettings()` merges DB rows over `.env.local` defaults. Server components call `getSetting(key)` directly; client components fetch `/api/settings` (public, read-only).

**All setting keys:**
| Key | Default | Description |
|---|---|---|
| `whatsapp_number` | env | Public WhatsApp on the site and FAB button |
| `whatsapp_comprobante` | env | WhatsApp that receives transfer receipts |
| `transfer_cbu` | env | Bank CBU |
| `transfer_alias` | env | Bank alias |
| `transfer_titular` | env | Account holder name |
| `transfer_banco` | env | Bank name |
| `consultation_fee` | env | Price for transfer payment |
| `consultation_fee_mp` | env | Price for Mercado Pago payment |
| `mp_link` | `''` | Fixed MP payment link. If set, used instead of SDK preference. If empty, MP button is hidden. |
| `slots_presencial` | JSON array | Available time slots for presencial mode |
| `slots_online` | JSON array | Available time slots for online mode |
| `min_days_ahead` | `'1'` | Minimum days in advance a patient can book (0 = same day, 1 = tomorrow, etc.) |

### Admin panel (`/admin/*`)
Protected by `middleware.ts` via JWT cookie (`admin_token`, 24h, `jose` HS256). Default password: `nutriboc2026` (overridden by DB `admin_password` setting). Login at `/admin/login`.

**Pages:**
- **Dashboard** (`/admin`) — stats cards + upcoming bookings list
- **Reservas** (`/admin/bookings`) — full booking table with filters. Also shows manually blocked slots (BlockedSlot with `slot !== 'all'`) as rows with a "🔒 Bloqueado" badge and a "Desbloquear" button. Cancelled bookings auto-delete after 30 seconds with a visible countdown on the "Restaurar" button.
- **Horarios y bloqueos** (`/admin/schedule`) — three sections:
  - **SlotEditor** (`components/admin/SlotEditor.tsx`) — add/remove individual time slots per mode (presencial/online). Stored as JSON in settings.
  - **BlockDayManager** — block entire days
  - **BlockSlotManager** — block specific slots on specific dates (these appear in Reservas table)
- **Configuración** (`/admin/settings`) — editable sections:
  - 📱 Contacto (WhatsApp numbers)
  - 🏦 Datos bancarios y precio (CBU, alias, titular, banco, price for transfer, price for MP)
  - 📅 Agenda (min_days_ahead)
  - 💳 Mercado Pago (mp_link)
  - 🔒 Cambiar contraseña

Admin API routes all verify `getAdminFromCookies()` from `lib/auth.ts`.

### Database models (Prisma 5 + SQLite)
- **Booking** — patient name/email/phone, mode (`presencial`|`online`), date (YYYY-MM-DD string), slot (HH:MM), paymentType (`transfer`|`mercadopago`), status (`pending`|`pending_transfer`|`pending_mp`|`confirmed`|`cancelled`), MP payment/preference IDs, amount (Float), `expiresAt` (DateTime?, set to now+30min on pending bookings, cleared on confirm)
- **BlockedSlot** — blocks a specific slot on a date for a mode (or `mode: 'both'`, `slot: 'all'`). Slots with `slot !== 'all'` appear in the Reservas admin table.
- **BlockedDay** — blocks an entire day (unique date)
- **Setting** — key/value store for runtime configuration

### Availability logic (`app/api/availability/route.ts`)
Slot lists are read from DB settings (`slots_presencial`, `slots_online`), falling back to hardcoded defaults. Before computing available slots, lazily cancels any expired `pending_transfer`/`pending_mp` bookings for the queried date+mode (`expiresAt <= now`). Excludes blocked days, blocked slots, and active bookings (`pending_transfer | confirmed | pending_mp`).

### Mercado Pago
- **Fixed link mode (preferred):** if `mp_link` setting is set, patients are redirected directly to that URL. No SDK call needed.
- **SDK mode (fallback):** if `mp_link` is empty, calls `/api/mp/preference` to create a preference. Requires `MP_ACCESS_TOKEN` in env.
- Webhook at `/api/mp/webhook` — maps MP payment status to booking status (`approved→confirmed`, `pending→pending_mp`, `rejected/cancelled→cancelled`)
- After successful MP payment, MP redirects to `/reserva/exito` or `/reserva/pendiente`
- `lib/mercadopago.ts` wraps the `mercadopago` SDK

### Booking expiry (30-minute hold)
When a booking is created with `pending_transfer` or `pending_mp`, `expiresAt` is set to `now + 30 minutes`. The slot is blocked during that window. Expiry is handled **lazily**:
- On `/api/availability` query: expired bookings for that date+mode are cancelled before computing slots.
- On `/api/bookings` POST: expired bookings for that slot are cancelled before the conflict check.

When admin confirms a booking via PATCH, `expiresAt` is set to `null` so it never auto-cancels.

### Cancelled booking auto-delete (admin)
In `BookingActions.tsx`, when a booking has `status: 'cancelled'`, a 30-second countdown starts. The "Restaurar" button shows the remaining seconds. At 0, the booking is hard-deleted via `DELETE /api/bookings/[id]`. Clicking "Restaurar" before countdown ends cancels the timer and sets the booking to `confirmed`.

### Route protection
`middleware.ts` protects all `/admin/*` except `/admin/login`. Verifies JWT from `admin_token` cookie; redirects to login on failure.

### Key API routes
| Route | Method | Auth | Purpose |
|---|---|---|---|
| `/api/availability` | GET | public | available slots for date+mode (lazy-expires pending bookings) |
| `/api/bookings` | POST | public | create booking (sets expiresAt, lazy-expires conflicting bookings) |
| `/api/bookings/[id]` | PATCH | admin | update booking status (clears expiresAt on confirm) |
| `/api/bookings/[id]` | DELETE | admin | hard-delete booking from DB |
| `/api/settings` | GET | public | read-only site settings for client |
| `/api/auth/login` | POST | — | issue JWT cookie |
| `/api/auth/logout` | POST | — | clear cookie |
| `/api/admin/settings` | GET/PUT | admin | full settings CRUD + password change |
| `/api/admin/stats` | GET | admin | dashboard statistics |
| `/api/admin/block-slot` | GET/POST | admin | manage blocked slots |
| `/api/admin/block-slot/[id]` | DELETE | admin | remove a blocked slot |
| `/api/admin/block-day` | GET/POST | admin | manage blocked days |
| `/api/admin/block-day/[id]` | DELETE | admin | remove a blocked day |
| `/api/mp/preference` | POST | public | create MP payment preference (SDK mode) |
| `/api/mp/webhook` | POST/GET | public | MP payment events |
