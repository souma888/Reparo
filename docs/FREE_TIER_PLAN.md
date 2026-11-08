# Free-tier deployment

Use Vercel Hobby and an unbilled Google Gemini API project. Reparo calls Google directly and never selects a paid alternate provider. GOOGLE_AI_MODEL defaults to gemini-3.5-flash-lite; unknown IDs fail closed. A model deprecation produces honest basic guidance, not a guessed replacement. Free model availability must be rechecked before adding an ID to the reviewed allowlist.

The account database is Neon reparo-sync, provisioned with Vercel Marketplace plan free_v3. Managed auth and database share that free resource. No credit card, paid mailer, object storage or vector service was added. Quota exhaustion can interrupt AI/sync; local guides and exports remain usable. Do not upgrade the database or enable Google billing if zero spend is required.

A sessionStorage allowance limits the guide to three AI attempts per tab session. Camera sessions cap live scans at five. The server applies an atomic shared Neon allowance of five analysis attempts/hour and twenty vision attempts/hour per hashed IP. Invalid, basic, safety and unconfigured requests do not reserve an AI attempt. Budget rows expire after their short retention window; no raw IPs, images or prompts are stored. A failed database quota check stops inference. The Vercel project firewall rule remains in log-only mode. These controls mitigate abuse but do not replace provider quotas or create a global application-wide allowance.

Photos, receipt images and manuals remain off cloud storage. Receipt/manual IndexedDB storage is limited by browser quota; text backup/import is capped at 2 MB and 100 cases/50 devices. PDF import is capped at 4 MB, 100 pages, and 500,000 extracted characters. Up to ten manuals are stored locally. AI context uses up to three model-matched passages with explicit consent.

Neon Free documentation: https://neon.com/blog/neon-free-plan-1-gb-per-project . Vercel firewall documentation: https://vercel.com/docs/vercel-firewall . Current plan limits can change; the service dashboards remain authoritative.
