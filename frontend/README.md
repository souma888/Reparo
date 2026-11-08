# Frontend

React + TypeScript + Vite with a shared validated AI request/result contract. See the root README and docs/IMPLEMENTATION.md for the current run/deployment instructions and feature boundaries.

Use `npm run dev` and, in another terminal, `npm run dev:api` from the repository root. Local AI requires a server-only key in untracked `.env.local`. Root `npm run build` checks both server and browser code; `npm test` runs regression tests.

The workspace supports appliance records, local case history, resource navigation, and AI intake/results. Browser-only persistence is opt-in and excludes photos. Accounts, sync, audio/video, and retrieved manual citations are not available.
