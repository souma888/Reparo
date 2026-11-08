# Reparo

An appliance care workspace with AI-assisted text and exterior-photo analysis, deterministic safety stops, local appliance records, case history, and technician summaries. Black, ivory, and bronze visual design.

## Run

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

In another terminal, run `npm run dev:api`. Vite serves at `http://localhost:5173` and proxies `/api` to port 3001. Optional free-tier AI uses `GOOGLE_GENERATIVE_AI_API_KEY` from an unbilled Google project, stored in untracked `.env.local`. Never use a `VITE_` secret. Basic guidance runs on the device without an API key or analysis request.

```sh
npm test
npm run build
```

The build checks both server and frontend TypeScript. Tests cover safety gates, validation, malformed AI output, consent, and API behavior. Provider behavior needs live evaluation; passing software tests does not establish diagnostic accuracy.

## Deploy on Vercel

Import `souma888/Reparo`, branch `main`, Root Directory `./`, Framework `Vite`. The tracked configuration sets `npm install`, `npm run build`, and `frontend/dist`. The root `api/analyze.ts` is deployed as a Node.js Vercel Function.

For a personal, non-commercial project, keep hosting on Vercel Hobby. AI calls Google directly using fixed free-eligible model `gemini-3.5-flash-lite`. Add `GOOGLE_GENERATIVE_AI_API_KEY` from a Google AI Studio project WITHOUT billing enabled as a server-only variable. No Gateway, card, prepaid credits, or paid-provider fallback is used. Missing keys and free-quota failures produce labeled basic guidance. The app cannot determine billing tier from an API key: the owner must keep the Google project unbilled. See [the free-tier architecture and feature plan](docs/FREE_TIER_PLAN.md).

## Working features

- Clickable appliance categories and an accessible, keyboard-navigable workspace.
- Mandatory hazard triage before AI; yes/unsure and recognized hazard phrases stop analysis.
- Structured AI observations, tentative explanations, explicit uncertainty, unknowns, and follow-up questions.
- Optional exterior JPEG/PNG/WebP photo, resized to 1200px and re-encoded without metadata before submission. Maximum source size 8 MB; encoded request is bounded server-side.
- Safe next actions from a fixed ruleset; model output never defines the action checklist.
- Consent-based local case history: search/filter, expand, resolve/reopen, feedback, delete, and text export.
- Local appliance records with brand/model and user-selected in-app care dates.
- Manufacturer support portal links and a care resource library.
- Real loading, retry, timeout, validation, storage failure, and provider-unavailable states.

## Data and limitations

Optional AI requests send evidence directly from the server to Google after consent. Google's free tier may use inputs/outputs for product improvement and human review; avoid sensitive information. Basic mode makes no analysis request. A separate opt-in saves text records locally; photos are excluded. Anyone using that browser can see saved records. Reparo does not persist evidence on its server; provider policies still apply.

Hypotheses are unverified and not calibrated probabilities. Manufacturer portals are navigation links, not retrieved citations. AI text and images can be wrong. Hazard phrase matching is conservative and incomplete; domain expert review and a representative safety evaluation are required before treating this as a diagnostic product. It cannot certify safety or replace a technician.

Each guide allows three AI attempts. The API has a best-effort five-requests/hour/IP allowance per function instance, then basic guidance. This is not a global quota. AI is capped at 1,800 output tokens, a 25-second timeout, and zero automatic retries. Keeping provider billing disabled is the actual no-paid-overage boundary. No plans or budgets are upgraded automatically.

## Future work

Cloud accounts and cross-device sync, audio/video analysis, verified manual retrieval with citations, technician booking, pricing integrations, and expert-reviewed model evaluations are not implemented. No controls pretend those integrations are available.

## Source map

- `frontend/src/components/AnalysisGuide.tsx`: intake, images, AI results, follow-ups.
- `frontend/src/components/Workspace.tsx`: appliance records, history, resources.
- `frontend/src/workshop.ts`: validated local records and exports.
- `shared/analysis.ts`: request/result schemas, safety rules, approved checks.
- `server/analyze.ts`: structured AI SDK integration.
- `api/analyze.ts`: deployed HTTP endpoint and request limits.
- `docs/`: original product plans and implementation notes.

No license has been selected.
