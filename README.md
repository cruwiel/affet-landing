## Landing Page (GitHub Pages Source)

- Builds the interactive “forgive me” web view shown at `cruwiel.github.io`.
- Keep source code (we’ll use Vite + React + TypeScript) under `src/` and output bundle to `dist/`.
- After running `npm run build`, copy the contents of `dist/` into the separate `cruwiel.github.io` repo for deployment.
- Configure CORS in the backend to allow fetches from the GitHub Pages domain.

## Planned Features

- Read `token` from query string, call backend `GET /api/links/:token`.
- Show localized phrase (same as app) and render playful Yes/No buttons (No dodges, Yes grows).
- Handle expired/invalid token states with a friendly message.
- Optional analytics ping (future).

## Stack & Commands

- Vite + React + TypeScript.
- Styling with vanilla CSS (see `App.css` / `index.css`).
- Requests via `fetch`.
- `npm install`
- `npm run dev` – local preview
- `npm run build` – outputs to `dist/`

## Environment Variables

- Copy `env.example` to `.env` and set `VITE_API_BASE_URL` (e.g., `https://api.affet.app`).
- When running locally, point it to `http://localhost:8080`.

## Deployment

1. `npm run build`
2. Copy `dist/*` into `~/projects/cruwiel.github.io/` (your Pages repo), commit, push.
3. GitHub Pages publishes automatically.
