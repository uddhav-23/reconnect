# Deployment guide (Netlify + Firebase)

## Prerequisites

- Firebase project with **Authentication** (Email/Password) and **Firestore** enabled.
- Netlify account (or any static host that supports SPA redirects).

## Environment variables (Netlify)

In **Site settings → Environment variables**, add the same keys as in `.env.example`:

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_*` | Overrides embedded defaults; required for production if you rotate keys. |
| `VITE_INSTITUTIONAL_EMAIL_DOMAINS` | Optional. Domains that auto-set `verifiedAlumni` at signup for alumni. |

Do **not** commit real secrets to git; configure them only in the host UI.

## Firestore

1. Deploy rules and indexes:

```bash
firebase deploy --only firestore:rules,firestore:indexes
```

2. **Legacy blog documents** without a `status` field will not appear in public listings (queries use `status == 'published'`). In the Firebase console, batch-update old posts to `status: "published"` or run a one-off script.

## Build

```bash
npm install
npm run build
```

Output is in `dist/`.

## Netlify settings

- **Build command:** `npm run build`
- **Publish directory:** `dist`
- **Node:** 20.x (see `netlify.toml`)

The included `netlify.toml` adds a **SPA fallback** so client routes (`/admin`, `/events/…`, etc.) resolve to `index.html`.

## Post-deploy checks

- Open `/`, `/alumni`, `/blogs`, `/events`, `/jobs` without login.
- Sign in and verify `/dashboard/...`, messaging, and admin (`/admin`) for admin roles.
- Confirm Firebase Auth authorized domains include your Netlify URL.

## Optional FastAPI backend

The `backend/` folder is **not** used by the React app. It is kept only as an optional reference. The production architecture is **Firebase only**.
