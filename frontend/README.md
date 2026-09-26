# Breaking Down Grammars — Frontend

React + Vite + Tailwind CSS interface (no TypeScript). The frontend performs
**no** grammar algorithms itself — it only sends the raw grammar text to the
backend and renders whatever structured JSON comes back. The backend is the
single source of truth.

## Setup

```bash
cd frontend
npm install
```

## Run (dev server, proxies /api to the backend on :8000)

```bash
npm run dev
```

Open `http://localhost:5173`. Make sure the backend (`uvicorn app.main:app
--port 8000`) is running first.

## Build

```bash
npm run build
npm run preview   # serve the production build locally
```

## Structure

- `src/services/api.js` — thin fetch wrapper around every backend endpoint
- `src/components/` — reusable UI pieces (grammar input box, tab bar, parse-tree renderer, code blocks)
- `src/pages/` — one component per dashboard tab (Grammar, Diagnostics, Transform, FIRST, FOLLOW, LL(1), Parsing Table, Parser, Parse Tree, Learn)
- `src/App.jsx` — top-level state (current grammar, analysis result, active tab) and layout
