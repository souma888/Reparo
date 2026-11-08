# Reparo free-tier architecture and feature plan

Verified against official documentation on 8 November 2026. Target: $0 recurring for a small personal project. Free allowances change; this is not an unlimited-usage or uptime promise.

## Cost contract

- Keep providers on genuine free plans. No payment card, prepaid credits, trial balance, paid fallback model, GPU server, or automatic upgrade is part of this design.
- Use a Google project WITHOUT billing enabled. A free-eligible model can still incur charges on a billed project. The app cannot determine billing tier from the key.
- Quota exhaustion degrades or pauses a cloud feature. Never rotate accounts/keys to evade quotas. Never activate billing just to resolve a quota error.
- Keep the free hosting subdomain. A purchased domain, paid expert review, commercial booking, or parts-price integration is outside this budget.

## Resource choices

| Feature                   | Resource                                          | Limits and recovery                                                                                                                                | Status                          |
| ------------------------- | ------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Site and API              | Existing Vercel project on Hobby                  | Personal/non-commercial use only. Hosting can pause at usage caps. No Pro trial or overage purchases.                                              | Compatible now; keep Hobby      |
| Text/photo AI             | Direct Google Gemini API; `gemini-3.5-flash-lite` | Unbilled project only. Actual project/model quotas are visible in AI Studio; no fixed request allowance is promised. Fails over to basic guidance. | Implemented; owner supplies key |
| Safety/basic guide        | Browser rules mirrored on server                  | No model, key, or analysis request in explicit basic mode. Cannot infer a cause or analyze a photo.                                                | Implemented                     |
| Cases/appliances          | Opt-in localStorage                               | Browser-specific, no sync; browser clearing removes records. Text export is a manual backup.                                                       | Implemented                     |
| Photos                    | Browser resize/re-encode                          | 1200px, source max 8 MB; no bucket, transformation service, or retained image.                                                                     | Implemented                     |
| Source/CI                 | Existing public GitHub repository/Actions         | No paid runners or private artifact service.                                                                                                       | Implemented                     |
| Manuals                   | Manufacturer links                                | No search API, paid grounding, vector database, or scraped manuals.                                                                                | Implemented                     |
| Future login/sync         | One Supabase Free project, if requested           | Current free allowances: 500 MB database, 50,000 MAU, 1 GB storage, 5 GB egress; two active projects. Can pause after inactivity.                  | Planned; not provisioned        |
| Future commercial hosting | Cloudflare Workers Free and static assets         | Vercel Hobby is unsuitable for commercial use. Port the API handler, remain on Free, and accept request/CPU caps.                                  | Alternative plan; not deployed  |

## Implemented controls

Local appliance editing, recurring care dates, completion records, and calendar-file exports add no cloud service. JSON backup/import transfers records manually between devices without an account. Files are limited to 2 MB, validated, and merged without replacing existing IDs. Backups contain private, unencrypted text. Calendar export is one event and does not auto-sync or guarantee a notification.

1. Direct Google provider object, not a bare AI SDK model string that implicitly uses Vercel AI Gateway. Legacy Gateway/OIDC credentials are ignored for inference.
2. One fixed free-eligible model; no premium-model environment override or cross-provider fallback. No paid grounding/tools, managed files, embeddings, background loops, or retries.
3. One call per analysis, 25-second model timeout, 1,800 output-token cap, three attempts per open guide. Reopening resets the client counter: it is a convenience limit, not authentication.
4. Five requests/hour/IP per warm API instance, then basic guidance. Instances do not share counters; this is not a distributed spending cap. An unbilled Google project is the actual no-paid-overage boundary.
5. Safety stops precede inference. No invented photo interpretation or hypotheses when AI is unavailable. No photos in saved case history.

## Setup without a card

1. Keep the existing Vercel project on Hobby for personal/non-commercial use.
2. In [Google AI Studio](https://aistudio.google.com/apikey), create/select a Free Tier project. Do not attach Google billing or prepay.
3. Create a key. In Vercel Project Settings → Environment Variables, add the secret `GOOGLE_GENERATIVE_AI_API_KEY` for the intended environments, then redeploy. Never paste it into chat, source, or a `VITE_` variable.
4. Locally, store it in ignored `.env.local`; run `npm run dev:api` and `npm run dev` separately.
5. Check actual model availability and quotas in AI Studio. If access is unavailable in that account/region, leave AI disabled and use basic guidance. No billing setup is required by the app.
6. `AI_GATEWAY_API_KEY`, `AI_GATEWAY_MODEL`, and OIDC are not needed. No existing billing setting is changed by the code migration.

## Privacy tradeoff

Google's unpaid Gemini services may use inputs and outputs to improve products, with human review. Consent text discloses this. Avoid faces, names, addresses, documents, identifiers, and sensitive information. Choose basic mode for private observations; it sends no analysis request. Local records remain opt-in and are visible to others using the browser.

## Feature roadmap within free resources

### Phase 1: current application

Keep the guide, local history, appliance records, handoff export, manual portals, and optional limited AI. Core checks must remain usable without keys. Do not describe fallback output as AI analysis.

### Phase 2: accounts and sync

If cross-device access is required, add one Supabase Free project, OAuth sign-in, row-level ownership policies, and explicit sync consent. Prefer OAuth so login does not depend on a paid SMTP service; free email sending is limited. Store text only with per-user caps below provider limits. Keep local export when the cloud project is paused. Do not add paid realtime, artificial keepalive traffic, or paid backups. This requires implementation and account setup; it is not shipped.

### Phase 3: grounding and audio

Bundle a small permissioned, expert-reviewed knowledge file; use local keyword search with source/model/version metadata before considering embeddings. Add short audio clips only after validation, consent, and benchmarking with a verified free-eligible multimodal model. A transcript is not a fault diagnosis. Avoid retaining recordings. Audio is planned, not currently supported.

### Phase 4: constrained expansion

Video needs strict clip/frame limits and measured diagnostic value. Prefer browser extraction of a few safe exterior frames over continuous server processing; no unlimited video promise. Use bundled translations for multilingual UI and typed fallback for unsupported speech input. Keep technician handoff as a text export. Booking, live parts prices, SMS, and continuous expert review are not assumed free; defer anything without a genuine free allowance.

## Quota recovery

| Limit                                                     | Behavior                                                                  |
| --------------------------------------------------------- | ------------------------------------------------------------------------- |
| No Google key, quota exhaustion, outage, malformed output | Labeled basic guidance; no image analysis or paid retry; export available |
| Session/API-instance allowance                            | Basic guidance, no provider switching                                     |
| Vercel function cap                                       | Explicit browser basic mode works while static assets remain available    |
| Hosting request/transfer cap                              | Site can pause until reset; local development remains possible            |
| Future DB/storage limit or pause                          | Stop sync/uploads; keep local work and export; restore manually           |
| Browser storage full/blocked                              | Show save error and offer text export                                     |

## Official sources

- [Gemini pricing](https://ai.google.dev/gemini-api/docs/pricing): free-model availability and data use.
- [Gemini billing](https://ai.google.dev/gemini-api/docs/billing/): unbilled versus paid projects.
- [Gemini rate limits](https://ai.google.dev/gemini-api/docs/rate-limits): account/project quotas.
- [Gemini terms](https://ai.google.dev/gemini-api/terms): data handling and regional conditions.
- [Vercel Hobby](https://vercel.com/docs/plans/hobby): personal/non-commercial scope and caps.
- [Supabase pricing](https://supabase.com/pricing): free auth/database/storage and pause limits.
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/): future hosting alternative.
