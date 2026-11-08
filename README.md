# Reparo

An appliance care workspace with AI-assisted text and exterior-photo analysis, deterministic safety stops, local appliance records, case history, and technician summaries. Black, ivory, and bronze visual design.

## Run

Requires Node.js 22.12+ and npm.

```sh
npm install
npm run dev
```

In another terminal, run `npm run dev:api`. Vite serves at `http://localhost:5173` and proxies `/api` to the companion server on port 3001. For local AI requests, set `AI_GATEWAY_API_KEY` in untracked `.env.local`. Never put credentials in a `VITE_` variable. Safety stops do not require an AI call.

```sh
npm test
npm run build
```

The build checks both server and frontend TypeScript. Tests cover safety gates, validation, malformed AI output, consent, and API behavior. Provider behavior needs live evaluation; passing software tests does not establish diagnostic accuracy.

## Deploy on Vercel

Import `souma888/Reparo`, branch `main`, Root Directory `./`, Framework `Vite`. The tracked configuration sets `npm install`, `npm run build`, and `frontend/dist`. The root `api/analyze.ts` is deployed as a Node.js Vercel Function.

AI Gateway needs an enabled account with access/credits. Vercel deployments can authenticate with OIDC; alternatively configure `AI_GATEWAY_API_KEY` as a server-side environment variable. The optional `AI_GATEWAY_MODEL` overrides the default model; choose an image-capable model from the current gateway catalog. No secret is bundled into the browser.

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

Analysis requests send observations and optional images through Vercel AI Gateway to the model provider only after consent. Reparo does not persist them on its server; provider/gateway retention policies still apply. Operational errors log type only. A separate opt-in saves text cases and appliance records to this browser's localStorage. Photos are never saved in history. Browser data is not encrypted or synchronized; anyone using that browser may see saved records.

Hypotheses are unverified and not calibrated probabilities. Manufacturer portals are navigation links, not retrieved citations. AI text and images can be wrong. Hazard phrase matching is conservative and incomplete; domain expert review and a representative safety evaluation are required before treating this as a diagnostic product. It cannot certify safety or replace a technician.

The endpoint includes a bounded per-instance abuse guard (8 requests/hour/IP). This is not a distributed quota: add a Vercel Firewall rate-limit rule for `/api/analyze` and configure Gateway spend limits for broad public use. No paid budgets are changed by this repository.

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
