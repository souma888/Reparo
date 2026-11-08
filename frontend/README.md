# Frontend

React + TypeScript + Vite with a shared validated AI request/result contract. See the root README and docs/IMPLEMENTATION.md for the current run/deployment instructions and feature boundaries.

Use `npm run dev` and, in another terminal, `npm run dev:api` from the repository root. Optional free-tier AI requires `GOOGLE_GENERATIVE_AI_API_KEY` from an unbilled project, stored server-side in untracked `.env.local`. Basic guidance works without a key and runs locally. Root `npm run build` checks server and client code; `npm test` runs regression tests. Read docs/FREE_TIER_PLAN.md for resource limits and future work.

The workspace supports appliance records, local case history, resource navigation, and AI intake/results. Browser-only persistence is opt-in and excludes photos. Accounts, sync, audio/video, and retrieved manual citations are not available.
