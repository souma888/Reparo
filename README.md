# Reparo

Camera-led appliance identification, safe symptom triage, and interactive owner-level care guides. Premium minimal interface in black, ivory and bronze.

## Run locally

Node 22.12+ and npm. Run `npm ci`, `npm run dev:api`, and `npm run dev` in separate terminals. Open http://127.0.0.1:5173. Basic guidance needs no credentials. Copy `.env.example` to `.env.local` for optional AI/account services. Never commit secrets.

`npm test` runs API, camera/guide UI, safety, retrieval, rate-accounting and local-data regressions. `npm run build` typechecks the server and APIs, then builds the frontend. GitHub Actions runs both on pushes and pull requests.

## Deploy to Vercel

Import the repository root. Framework: Vite. Install: `npm ci`. Build: `npm run build`. Output: `frontend/dist`. Node: 22.x or newer. `/app` is the workspace; `/` contains camera entry and project information. API handlers live in `api/`.

Optional environment variables: `GOOGLE_GENERATIVE_AI_API_KEY`, `GOOGLE_AI_MODEL`, `DATABASE_URL`, `NEON_AUTH_BASE_URL`, `VITE_NEON_AUTH_URL`. The Google project must remain unbilled. Unsupported model configuration fails closed to basic guidance; there is no paid fallback. See [free-tier boundaries](docs/FREE_TIER_PLAN.md).

## Available now

- Upload / mobile capture / live camera snapshots, explicit AI consent, appliance confirmation, safe handoff to a guide.
- Nine categories: washer, fridge, fan, small appliance, dishwasher, vacuum, air purifier, water purifier, mixer-grinder. Microwave, gas, HVAC and specialist internal repair are excluded.
- Shared hazard gate, 100+ labeled phrase regression corpus, generated-text instruction filtering, streamed provisional hypotheses and final validated results.
- Offline basic guidance and installable PWA; static app assets cached, API and account responses never cached.
- Browser-local appliance records, case timelines, recurring issue flags, warranty dates, receipt images in IndexedDB, reminders and recurring ICS export.
- Repair-cost comparison with a user-selected threshold; a small curated LG/Samsung washer-code catalog with manufacturer links.
- Optional private PDF/text manual import and keyword retrieval, exact-model matching, page citations, and opt-in passage context for AI. Source/model metadata is user supplied and not independently verified.
- Optional Neon email/password accounts, explicit cloud text-record upload/merge, revision conflict protection, signed-token authorization and per-user ownership. Photos, receipts and manuals remain local.
- Technician text download, clipboard, supported native sharing and print view. Self-hosted fonts, theme preference, Hindi guide headings/safety text and browser voice notes where supported.

## Limits

This is not a diagnostic certification. Guides cover three specific owner-level conditions; expanded categories offer external triage, not internal repairs. Error-code coverage is deliberately small. Manual retrieval is lexical, and scanned PDFs require OCR outside the app. Its synthetic citation benchmark does not measure real-world repair accuracy. Hindi coverage currently includes the guide headings and safety notice; the rest of the interface and generated text remain English. Speech recognition depends on browser support and may use the browser vendor's cloud.

Free services have finite quotas. The client budget persists in sessionStorage; atomic Neon counters share an AI-only allowance across function instances, with a bounded in-process fallback for local development. The firewall rule remains log-only. Neither is a global spend ledger. Cloud copies merge with local records taking precedence, and receipts/manuals are excluded from text backups. Password recovery/production mail branding need an owner-configured SMTP service; no paid mailer is provisioned.

See [implementation](docs/IMPLEMENTATION.md), [roadmap](docs/ROADMAP.md), and [safety evaluation](docs/SAFETY_AND_EVALUATION.md).

## License

MIT. See [LICENSE](LICENSE). Manufacturer material retains its original ownership; the repository does not redistribute manuals.
