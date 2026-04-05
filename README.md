<<<<<<< HEAD
# Diginance

A full-stack **personal finance dashboard**: track income and expenses, analyze trends, set monthly budgets, run recurring entries, export CSV reports, and view smart spending insights. Built as a **dark, SaaS-style** React client on a **JWT-secured** Express + MongoDB API.

---

## Features

| Area | What you get |
|------|----------------|
| **Auth** | Register / login with username + password; JWT session; role-based access (`user`, `manager`, `admin`). |
| **Transactions** | Create, list, filter (type, category, dates, search, amount range), sort, optional pagination; per-user data isolation. |
| **Dashboard** | Server-driven totals, monthly trends, recent activity, category breakdown. |
| **Insights** | Month-over-month expense comparison and top spending category with human-readable messages. |
| **Budgets** | Monthly caps per category; spent / remaining vs actual expenses. |
| **Recurring** | Scheduled rules (`daily` / `weekly` / `monthly`); cron posts transactions automatically. |
| **Export** | Download filtered transactions as **CSV**. |
| **Admin** | User directory (`admin` only). |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| **API** | Node.js, Express 5, Mongoose, bcrypt, jsonwebtoken, cors, node-cron |
| **Database** | MongoDB (Atlas or self-hosted) |
| **UI** | React 19, Vite 8, React Router 7, Tailwind CSS 4, Recharts, Lucide React |

---

## Repository Layout

```
Project/                    # API root
├── src/
│   ├── config/             # DB connection
│   ├── controllers/        # Route handlers (auth, transactions, dashboard, budgets, insights, recurring, reports)
│   ├── middleware/         # JWT verification, role checks
│   ├── models/             # User, Transaction, Budget, RecurringTransaction
│   ├── routes/             # Express routers
│   ├── services/           # Recurring scheduler logic
│   └── utils/              # API responses, query builders, month helpers
├── .env                    # Secrets (not committed)
└── package.json

diginance-ui/               # React client
├── src/
│   ├── components/         # UI primitives, layout, modals
│   ├── context/            # Auth + finance state
│   ├── lib/                # API client, CSV download
│   ├── pages/              # Dashboard, Records, Analytics, Budgets, Users, Login, Register
│   └── ...
├── .env                    # Optional: VITE_API_URL
└── package.json
```

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm**
- A **MongoDB** deployment and connection URI

---

## Environment Variables

### API (`Project/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `CONNECTION_STRING` | Yes | MongoDB connection URI |
| `JWT_SECRET` | Yes | Secret for signing JWTs (use a long random string in production) |
| `PORT` | No | API port (default **7002**) |
| `CLIENT_ORIGIN` | No | Allowed CORS origin for the browser app (default `http://localhost:5173`) |

### Frontend (`diginance-ui/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | No | API base URL without trailing slash (default `http://localhost:7002`) |

---

## Quick Start

### 1. Install API dependencies

```bash
cd Project
npm install
```

### 2. Install UI dependencies

```bash
cd diginance-ui
npm install
```

### 3. Configure the API

Create `Project/.env`:

```env
CONNECTION_STRING=mongodb+srv://...
JWT_SECRET=your_long_random_secret
PORT=7002
CLIENT_ORIGIN=http://localhost:5173
```

### 4. Run the API

```bash
cd Project
npm run dev
```

### 5. Run the UI (separate terminal)

If your API uses a port other than **7002**, set `VITE_API_URL` in `diginance-ui/.env`.

```bash
cd diginance-ui
npm run dev
```

Open the URL Vite prints (typically **http://localhost:5173**). Register a user, then sign in.

---

## API Overview

All protected routes expect:

```http
Authorization: Bearer <access_token>
```

### Auth

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/register` | Body: `username`, `password`, `role` |
| `POST` | `/api/auth/login` | Body: `username`, `password` → returns `token`, `user` |
| `GET` | `/api/auth/me` | Current user from token |

### Transactions

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/transactions` | Query: `type`, `category`, `startDate`, `endDate`, `search`, `minAmount`, `maxAmount`, `sortBy`, `sortOrder`, `page`, `limit` |
| `POST` | `/api/transactions` | Create one-off transaction |
| `POST` | `/api/transactions/recurring` | Create recurring rule |
| `GET` | `/api/transactions/recurring` | List recurring rules |

### Dashboard

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/dashboard/summary` | Income, expense, net |
| `GET` | `/api/dashboard/trends` | Monthly income vs expense |
| `GET` | `/api/dashboard/recent` | Latest transactions |
| `GET` | `/api/dashboard/category` | Totals by category |

### Insights & budgets

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/insights` | Spending trends + top category messages |
| `GET` | `/api/budgets` | List budgets (optional `?month=YYYY-MM`) |
| `POST` | `/api/budgets` | Create budget |
| `PUT` | `/api/budgets/:id` | Update budget |
| `DELETE` | `/api/budgets/:id` | Delete budget |
| `GET` | `/api/budgets/status` | Per-budget spent / remaining (`?month=YYYY-MM`) |

### Reports & users

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/reports/export?format=csv&...` | CSV export (same filters as `GET /transactions`) |
| `GET` | `/api/users/list` | **Admin only** — user list |

Legacy demo routes under `/api/users` (`/admin`, `/manager`, `/user`) still exist for role testing.

---

## Recurring Jobs

The API runs **node-cron** on **`*/10 * * * *`** (every 10 minutes) to materialize due recurring rules into normal transactions and advance `nextRunAt`. Keep the Node process running in production for schedules to fire.

---

## Production Build (UI)

```bash
cd diginance-ui
npm run build
npm run preview   # optional local preview of dist/
```

Serve `dist/` behind your static host or CDN. Set `VITE_API_URL` at **build time** to your public API URL. Update `CLIENT_ORIGIN` on the API to match your deployed UI origin.

---

## Security Notes

- Never commit `.env` or real `JWT_SECRET` / Mongo URIs.
- Restrict who can register as `admin` or `manager` before going public.
- Use **HTTPS** in production; keep JWT expiry and refresh strategy aligned with your product needs.
- **MongoDB Atlas**: allowlist your server (or `0.0.0.0/0` only for quick tests).

---

## Scripts Reference

| Location | Command | Purpose |
|----------|---------|---------|
| API | `npm run dev` | Nodemon + Express |
| UI | `npm run dev` | Vite dev server |
| UI | `npm run build` | Production bundle |
| UI | `npm run preview` | Preview production build |
| UI | `npm run lint` | ESLint |

---

## License

ISC (see `package.json`). Adjust as needed for your distribution.

---

**Diginance** — finance intelligence, end to end.
=======
# Diginance
>>>>>>> 45d6361c26d61b88a5c16829aae50d907fbfd55d
