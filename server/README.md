# TrustiFix API

Express JSON-file backend for auth, providers, bookings, wallet, and safety alerts.

## Run locally

```bash
cd server
npm install
npm run seed
npm run dev
```

API: `http://localhost:8787`

Point the frontend at it with `.env.local`:

```
VITE_API_URL=http://localhost:8787
```

Then restart `npm run dev` in the project root.

## Demo accounts (after seed)

| Login | Password | Role |
|---|---|---|
| `admin` | `admin35` | admin |
| `customer@trustifix.test` | `demo123` | customer |
| `alex@trustifix.test` | `demo123` | provider |

## Notes

- Data is stored in `server/data/db.json` (gitignored).
- GitHub Pages hosts the frontend only — deploy this API to Render, Railway, Fly.io, or similar for production.
- Supabase schema remains available in `/supabase/schema.sql` as an alternate cloud path.
