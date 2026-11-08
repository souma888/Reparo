# Implementation

React 19 + Vite frontend, TypeScript server/API, AI SDK with the direct Google adapter, Zod Mini runtime schemas. Vercel hosts static assets and same-origin functions. There is no Python runtime, paid AI gateway or paid provider fallback.

`shared/analysis.ts` owns schemas, the hazard gate, approved checks, generated-procedure rejection and safe fallback. `evals/hazards.json` contains the labeled phrase corpus. `server/analyze.ts` supports complete JSON and NDJSON streaming; complete draft hypothesis items are screened before release and are explicitly provisional. Only the final validated result can be saved. `server/model.ts` reads GOOGLE_AI_MODEL and fails closed outside its reviewed free model allowlist. An unbilled provider account is still required to prevent provider-side paid usage.

`api/analyze.ts` validates bodies and handles local basic/safety responses before counting model requests. An atomic Neon PostgreSQL counter enforces the AI-only allowance across instances; a database quota-check failure disables online inference. The Vercel firewall rule remains log-only after broad enforcement was rejected by approval review. Browser sessionStorage is a usability budget, not an authentication/security boundary.

`/` contains the camera workbench and landing; `/app` loads the workspace separately. `useAnalysis.ts` uses a reducer for async result state and streaming. GuideResult, CareTools (CSS Module), ManualLibrary, Receipt, AccountPanel, Handoff and Preferences separate major responsibilities. Legacy preview getGuidance was removed. Fonts are bundled locally.

Workshop text records live in localStorage. Receipt blobs and imported PDF/text manual pages live in IndexedDB. Case.deviceId links saved-device guides to timelines and six-month symptom recurrence flags. Manual files and receipt blobs are excluded from backups and cloud text copies. Manual retrieval is exact-model lexical ranking, capped at three 900-character passages. User-selected source metadata is not verified. The server permits only supplied model-matched citation IDs; invented citations are discarded.

Managed Neon Auth runs on the free reparo-sync resource. `api/sync.ts` verifies EdDSA JWT signatures, issuer, audience and expiry using the auth host's JWKS. It selects only the signed subject's row and uses revision-checked updates. No client user ID controls ownership. There is no anonymous access or automatic sync. Database credentials are server-only. Schema is in migrations/001_workshops.sql.

The build emits a versioned service worker and manifest. Precache is restricted to static application assets. Navigation uses the network with an offline shell fallback. API paths, auth responses, prompts and images are not cached. Updates wait for the user's reload action. Basic guidance, saved data and local tools work offline after a successful initial visit.
