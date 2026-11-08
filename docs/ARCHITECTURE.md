# Architecture

Browser React/Vite → same-origin Vercel TypeScript API → direct unbilled Google Gemini for optional analysis/vision, or Neon PostgreSQL for authenticated cloud text copies. Browser → managed Neon Auth for email/password sessions and signed JWTs. Basic guidance stays local.

Modules: shared/analysis.ts for validation/safety; shared/vision.ts for camera contracts; shared/retrieval.ts for lexical exact-model retrieval; shared/repair-guides.ts for constrained owner-level guides; frontend/src/workshop-data.ts for record validation/calendars; frontend/src/local-files.ts for receipts/manuals; api/sync.ts for token-verified, revision-checked cloud copies. See IMPLEMENTATION.md for the detailed behavior and limitations.
