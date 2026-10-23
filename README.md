# Workbench frontend

React (JavaScript) + MUI v9 + Vite. Talks to the p-learning API (Stages 1–4).

## Run

```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL, default http://localhost:3000/api/v1
npm run dev              # http://localhost:5173
```

Backend must allow the origin: `CORS_ORIGINS=http://localhost:5173` (the default). The refresh cookie needs the API and the app on the same site (both `localhost`).

## Scripts

`npm run dev` · `npm run build` · `npm run preview` · `npm run lint`

## Screens

| Role | Screens |
| --- | --- |
| Public | Sign in, register, forgot password, reset password (`/reset-password?token=…`) |
| Learner | Onboarding, My learning, Tracks, Track detail + enroll, Progress path, Task workspace (submit / resubmit / attempts), Submissions, Profile |
| Mentor | Tracks (read-only; review UI arrives with backend Stage 5) |
| Admin | Content (tracks, modules, tasks, publish, reorder, delete), Users (role, status) |

## Structure

```
src/api          fetch client (in-memory access token, single-flight refresh on 401) + endpoint map
src/auth         AuthContext (session restore via /auth/refresh → /auth/me)
src/theme        MUI theme and palette
src/components   shared UI (Trail progress path, StatusChip, Markdown, dialogs)
src/layouts      AppShell, AuthLayout
src/pages        route screens
```

Task text is rendered as Markdown with raw HTML disabled.
