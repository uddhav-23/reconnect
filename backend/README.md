# Optional FastAPI backend (not used by the web app)

The **Reconnect** production frontend uses **Firebase Authentication + Cloud Firestore** only.

This Python/FastAPI code is preserved for experimentation or future services (e.g. heavy batch jobs, integrations). It is **not** wired to the Vite client and there is **no** required `VITE_API_URL` or axios layer.

To work on the alumni platform UI and data model, use:

- `src/services/firebaseFirestore.ts` — core Firestore API
- `src/services/platformFirestore.ts` — events, jobs, mentorship, groups, notifications, reports

If you add a separate API later, introduce `VITE_API_URL` and a thin `src/services/api.ts` explicitly; do not duplicate auth logic with Firebase unless you migrate off Firebase Auth.
