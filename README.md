# DevDirectory

An engineering portal where team leads find developers, read their bulletins and publish new ones, plus a
**Project Vault**: a store where you keep your own projects (news frontend, todo app, anything else).

React 18 | React Router 6 | Axios | modern CSS (charcoal and black theme) | Express backend with JWT auth

## Run it

```bash
npm run setup        # installs frontend and backend dependencies
npm run dev:all      # starts Vite on :5173 and the API on :5000
```

Only the frontend: `npm install && npm run dev`. The app detects that the backend is missing and keeps
working in offline mode (projects saved in localStorage). The footer shows which mode is active.

Production check required by the brief: `npm run build && npm run preview`.

Demo login (backend): `admin@devdirectory.in` / `Admin@123`. Any valid email and a 4+ character password
also works in offline mode.

## Folder structure (as specified)

```
src/
  assets/       global.css, logo.svg
  components/   Navbar, UserCard, ProtectedRoute, SkeletonLoader, AlertBanner  (required)
                + ProjectCard, CommandPalette, ConfirmDialog, EmptyState, BarList,
                  Avatar, Footer, Layout, ErrorBoundary
  context/      AuthContext (required) + ToastContext, FavoritesContext
  hooks/        useDebounce (required) + useFetch, useLocalStorage, usePageTitle
  pages/        Home, UserDirectory, UserProfile, AddPost, Login, NotFound  (required)
                + Projects, ProjectDetail, AddProject
  services/     api.js, postService.js (required) + userService, projectService, authService
  utils/        indianProfiles.js (name mapping), formatters.js
  App.jsx       route definitions
  main.jsx      entry point with providers
server/         Express API (auth, projects, stats) with JSON-file storage
```

## Brief checklist

| Requirement | Where |
|---|---|
| Routes `/ /users /users/:id /login /add-post *` | `src/App.jsx` |
| Single Axios client, base URL, 8000 ms timeout | `src/services/api.js` (default export) |
| `GET /users`, `GET /users/:id`, `GET /posts?userId=`, `POST /posts` | `userService.js`, `postService.js` |
| `AuthContext`: `isAuthenticated`, `login(payload)`, `logout()` | `src/context/AuthContext.jsx` |
| `<Navigate replace state={{ from: location }} to="/login" />` and return to the original route | `ProtectedRoute.jsx`, `Login.jsx` |
| Controlled form, title 5-80, body 20-500, author dropdown from `/users`, 201 handling, reset | `src/pages/AddPost.jsx` |
| Real-time search on name or company, no reload | `src/pages/UserDirectory.jsx` |
| Skeleton while pending, dismissible error with Retry, layout intact | `SkeletonLoader.jsx`, `AlertBanner.jsx`, `useFetch.js` |
| 404 for invalid user id and unknown routes | `UserProfile.jsx`, `NotFound.jsx` |

Search note: JSONPlaceholder returns Western names, which are mapped to Indian names in
`utils/indianProfiles.js`. The original API name is kept, so typing "Leanne" still finds that developer
(shown as Aarav Sharma), which keeps the acceptance scenario true.

## Project Vault (your own projects)

1. Sign in, then use **New project** (navbar or Projects page).
2. Pick **Start from: News frontend / Todo app** for a pre-filled form, or fill your own.
3. Add repo and live links. The detail page can preview a live site inline and open it in a new tab.
4. Edit and delete from the detail page. Export or import the whole vault as JSON.

Two seed entries (NewsLens and TaskFlow) are included. Edit them to add your real links.

## Extra features

Command palette (Ctrl/Cmd + K), saved developers and projects, sort and team filters, grid/list view,
URL-synced search, bulletin draft autosave with live preview, route-level code splitting, error boundary,
backend health indicator, JWT auth with bcrypt, rate limiting and validation on the server.

## API (Express, `server/`)

| Method | Path | Auth |
|---|---|---|
| GET | `/api/health`, `/api/stats` | no |
| POST | `/api/auth/register`, `/api/auth/login` | no |
| GET | `/api/projects`, `/api/projects/:id` | no |
| POST | `/api/projects`, `/api/projects/import` | yes |
| PUT / DELETE | `/api/projects/:id` | yes |

Data lives in `server/data/db.json` (created on first run).

## Deploying

- Frontend: Netlify or Vercel (`npm run build`, publish `dist`). Rewrites for SPA routing are included.
  Without `VITE_BACKEND_URL` it runs in offline mode.
- Backend (optional): Render or Railway, start command `npm start` inside `server/`. Set `JWT_SECRET` and
  `CLIENT_ORIGIN`, then set `VITE_BACKEND_URL` on the frontend to `https://your-api/api`.
  Note that free hosts may reset the JSON file on redeploy. Swap `server/src/db.js` for MongoDB or
  Postgres when you need durable storage.

## Submission reminders (from the lab sheet)

Repository `bca-frontend-devdirectory-<RollNumber>`, conventional commits (`feat:`, `fix:`, `style:`),
hosting link, and the PDF report with the component tree and data-flow diagram, annotated screenshots
(loading, error, desktop, mobile) and the self-evaluation.
