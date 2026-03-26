# YachtBase

A closed, scalable yacht database with an admin panel, private API, and media management system.

## Overview

YachtBase is designed for centralized storage, manual and automated (parsing) updates of yacht data, including technical specifications and media files. The core value is a **flexible private API** that allows authorized users and external services to access up-to-date yacht information.

## Features

- 🚢 **Yacht Registry** — structured data for motor yachts, sailing yachts, catamarans, and superyachts
- 🖼 **Media Management** — main gallery, media inbox/queue, and external video links (YouTube, Instagram, TikTok)
- 🔐 **Private API** — strict API key access with scopes and rate limiting
- 👥 **Role-based Access** — Super Admin, Admin, Editor, Viewer, API Client Manager
- 📋 **Audit Logs** — full history of admin actions
- 📅 **Booking Calendar** — external calendar URL per yacht (Google Calendar / TimeTree)
- 📖 **API Documentation** — versioned API docs with changelog

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend / Admin | Next.js 16 (App Router, TypeScript) |
| UI | Tailwind CSS |
| Backend / Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth + Google OAuth |
| Storage | Supabase Storage |
| Deploy | Vercel |

## Testing

Unit tests use [Vitest](https://vitest.dev/) and run entirely in Node — no real Supabase connection required.

```bash
npm test                # run all tests once
npm run test:watch      # watch mode
npm run test:coverage   # run with coverage report
```

To run tests locally you do **not** need a `.env.local` file. All Supabase calls are mocked with `vi.mock()`.
If you want to create a local env for reference, copy the example:

```bash
cp .env.test.example .env.test.local
```

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/aylisrg/yachtbase.git
cd yachtbase
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in your Supabase credentials in `.env.local`.

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the admin panel.

## Project Structure

```
src/
├── app/
│   ├── admin/               # Protected admin panel
│   │   ├── layout.tsx       # Admin shell with sidebar + header
│   │   ├── page.tsx         # Dashboard
│   │   ├── yachts/          # Yacht management
│   │   ├── users/           # User management
│   │   ├── api-clients/     # API client management
│   │   ├── audit-logs/      # Audit log viewer
│   │   └── docs/api/        # API documentation
│   ├── api/
│   │   └── v1/
│   │       └── meta/        # GET /api/v1/meta
│   ├── auth/callback/       # OAuth callback handler
│   └── login/               # Login page
├── components/
│   ├── auth/                # Auth components
│   └── layout/              # Layout components (sidebar, header)
├── lib/
│   ├── supabase/            # Supabase client utilities
│   ├── constants.ts         # App constants, roles, scopes
│   └── utils.ts             # Utility functions
├── services/                # Data service layer (TBD)
└── types/
    └── index.ts             # TypeScript types for all entities
```

## Data Models

- `yachts` — main yacht registry
- `yacht_specifications` — technical dimensions and performance data
- `yacht_locations` — marina/port information
- `media_assets` — unified media (photos, videos, external links)
- `users` — admin users with roles
- `api_clients` — API access management
- `api_keys` — API key storage (hashed)
- `audit_logs` — change history
- `import_jobs` — background parsing jobs
- `api_versions` + `api_changelog` — API versioning

## API

Base URL: `/api/v1`

Authentication: `Authorization: Bearer <api-key>`

| Method | Endpoint | Scope | Description |
|---|---|---|---|
| GET | `/api/v1/meta` | — | API metadata |
| GET | `/api/v1/yachts` | `read:yachts` | List yachts |
| GET | `/api/v1/yachts/:id` | `read:yachts` | Get yacht |
| GET | `/api/v1/yachts/:id/media` | `read:media` | Get yacht media |
| GET | `/api/v1/yachts/:id/specifications` | `read:specifications` | Get specifications |

## Roles

| Role | Description |
|---|---|
| `super_admin` | Full access, manages all users and settings |
| `admin` | Can manage yachts and media |
| `editor` | Can edit yacht data and media |
| `viewer` | Read-only access |
| `api_client_manager` | Manages API clients and keys |

## License

Private — all rights reserved.
