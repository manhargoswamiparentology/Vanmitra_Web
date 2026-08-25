# Vanamitra — Tree dedication & gifting website

A full-stack Next.js 16 application for Vanamitra, a 10-acre tree farm in Kheda, Gujarat. Customers pay ₹500 to dedicate a tree in someone's name; the team plants it, photographs it monthly, GPS-tags it, and welcomes dedicators every Saturday.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Proxy/Middleware) |
| Language | TypeScript |
| Database | PostgreSQL via **Neon** (Vercel integration) |
| ORM | **Prisma 7** (adapter-based, no connection pooling issues) |
| Auth | JWT sessions (jose) + bcrypt, HTTP-only cookies |
| File storage | **Vercel Blob** |
| Fonts | Bricolage Grotesque · Source Serif 4 · JetBrains Mono (Google Fonts) |
| Styles | CSS custom properties (design token system), no Tailwind utilities |

## Routes

### Public
| Route | Purpose |
|---|---|
| `/` | Landing page (13 sections) |
| `/plant` | 5-step tree dedication wizard |
| `/plant/[occasion]` | Occasion-specific landing page |
| `/dedications/[id]` | Post-purchase confirmation + certificate |
| `/journal` | Blog index |
| `/journal/[slug]` | Blog post |
| `/farm` | About the farm |
| `/csr` | Corporate / CSR plans |

### Auth
| Route | Purpose |
|---|---|
| `/auth/login` | Sign in (email + password) |
| `/auth/register` | Create account (email + password + confirm) |

### Dashboard (requires login)
| Route | Purpose |
|---|---|
| `/dashboard` | Home — greeting, stats, recent updates |
| `/dashboard/trees` | My trees — detail view with photos & updates |
| `/dashboard/certificates` | View & download certificates |
| `/dashboard/notes` | Personal notes about trees |
| `/dashboard/badges` | Streaks & gamification badges |
| `/dashboard/visits` | Farm visit history |
| `/dashboard/account` | Profile & notifications settings |

### Admin (requires `isAdmin = true`)
| Route | Purpose |
|---|---|
| `/admin` | Overview — stats, recent activity |
| `/admin/trees` | Trees list — filter by status |
| `/admin/trees/[id]` | Tree detail — update status, tag, plot, GPS |
| `/admin/users` | User management |
| `/admin/blog` | Blog post list |
| `/admin/blog/new` | Create blog post |

---

## Local Development

### 1. Prerequisites
- Node.js 20+
- A PostgreSQL database (local or Neon free tier)

### 2. Clone & install
```bash
git clone <repo>
cd vanamitra
npm install
```

### 3. Environment variables
Copy `.env.example` to `.env` and fill in values:
```bash
cp .env.example .env
```

```env
# Neon PostgreSQL connection string
DATABASE_URL="postgresql://user:pass@host/vanamitra?sslmode=require"

# JWT secret — generate with: openssl rand -base64 32
JWT_SECRET="your-secret-here"

# Vercel Blob token (get from Vercel dashboard after adding Blob storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_xxxxx"
```

### 4. Generate Prisma client & migrate
```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 5. Seed the database
```bash
npx tsx prisma/seed.ts
```

This creates:
- **Admin account**: `admin@vanamitra.in` / `admin123456`
- **Demo user**: `demo@vanamitra.in` / `demo123456`
- All 15 badges
- 6 blog posts
- 1 demo tree with an admin update

### 6. Run dev server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial Vanamitra implementation"
git remote add origin https://github.com/your-org/vanamitra.git
git push -u origin main
```

### Step 2 — Import project in Vercel
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your GitHub repo
3. Framework: **Next.js** (auto-detected)

### Step 3 — Add Neon PostgreSQL
1. In Vercel dashboard → **Storage** → **Create Database** → **Neon**
2. Vercel automatically sets `DATABASE_URL` in your project's environment variables

### Step 4 — Add Blob Storage
1. Vercel dashboard → **Storage** → **Create Database** → **Blob**
2. Vercel automatically sets `BLOB_READ_WRITE_TOKEN`

### Step 5 — Set remaining env vars
In Vercel → Project → Settings → Environment Variables, add:
```
JWT_SECRET = <openssl rand -base64 32>
```

### Step 6 — Run migrations & seed on Neon
After first deploy, run migrations using the Neon connection string:
```bash
DATABASE_URL="your-neon-url" npx prisma migrate deploy
DATABASE_URL="your-neon-url" npx tsx prisma/seed.ts
```

Or use the Neon Console SQL editor to run migrations manually.

---

## Admin Panel Usage

1. Sign in at `/auth/login` with the admin credentials
2. Navigate to `/admin`
3. **Pending trees**: When a user completes the plant flow (`/plant`), a tree is created with `status: PENDING`
4. Go to `/admin/trees` → click **View** on a pending tree
5. **Assign tag & plot**: Fill in Block / Row / Position / GPS and save
6. **Send update to user**: Write a message (and optionally upload a photo) — this appears in the user's `/dashboard/trees` page
7. **Upload photos**: Use the photo upload form to add monthly tree photos

The user sees all updates and photos in their dashboard under **My Trees**.

---

## Database Schema Overview

```
User → Tree[] → TreePhoto[]
              → TreeUpdate[]   (admin messages + photos to user)
              → Certificate[]
              → Note[]         (user's personal notes)
     → Visit[]
     → UserBadge[] → Badge
```

Key enums:
- `TreeStatus`: PENDING → PLANTED → GROWING → COMPLETED
- `BadgeTier`: BRONZE / SILVER / GOLD / PLATINUM
- `NoteMood`: JOY / REFLECTION / ANTICIPATION

---

## Design System

All colors use oklch CSS custom properties defined in `src/app/globals.css`:

| Token | Value | Use |
|---|---|---|
| `--forest` | `oklch(0.32 0.06 150)` | Primary brand green |
| `--terra` | `oklch(0.62 0.13 45)` | CTAs, urgency |
| `--moss` | `oklch(0.55 0.09 145)` | Accent, italic phrases |
| `--paper` | `oklch(0.97 0.012 85)` | Background |
| `--ink` | `oklch(0.22 0.02 80)` | Primary text |
| `--gold` | `oklch(0.78 0.10 80)` | Gold badges |

Fonts: loaded from Google Fonts in `globals.css`.
