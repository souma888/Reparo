# Reparo

A camera-led appliance troubleshooting application: take/upload a photo or use a live camera view, identify the appliance, confirm it, and continue into symptom analysis and supported owner-level repair guides. Includes safety stops, local case history, and technician summaries.

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

Import `souma888/Reparo`, branch `main`, Root Directory `./`, Framework `Vite`. The tracked configuration sets `npm install`, `npm run build`, and `frontend/dist`. `api/analyze.ts` and `api/vision.ts` deploy as Node.js Vercel Functions. Both use the same server-only Google key. The camera requires HTTPS (or localhost); `Permissions-Policy` allows the same-origin camera and blocks microphone/geolocation.

For a personal, non-commercial project, keep hosting on Vercel Hobby. AI calls Google directly using fixed free-eligible model `gemini-3.5-flash-lite`. Add `GOOGLE_GENERATIVE_AI_API_KEY` from a Google AI Studio project WITHOUT billing enabled as a server-only variable. No Gateway, card, prepaid credits, or paid-provider fallback is used. Missing keys and free-quota failures produce labeled basic guidance. The app cannot determine billing tier from an API key: the owner must keep the Google project unbilled. See [the free-tier architecture and feature plan](docs/FREE_TIER_PLAN.md).

## Working features

- Camera-first homepage: live preview, mobile photo capture, or image upload; no camera access until the user clicks.
- AI appliance identification, visible brand/model reading, image observations, visible concerns, uncertainty, and explicit user confirmation. Unclear images do not get invented device/model details; specialist devices are marked unsupported.
- Optional live snapshot analysis: one request at a time, at least ten seconds after each response, at most five scans per visual session. This is sampled image analysis, not continuous video inference. Streams stop on hide, stop, handoff, or unmount.
- Camera frame and problem description carry into safety/symptom intake and subsequent analysis.
- Interactive, fixed owner-level guides for a visible fridge-door obstruction, a confirmed model-specific washer delay setting, and an external fan airflow obstruction. Require condition/manual acknowledgement, offer an immediate stop, and link manufacturer reference examples. They do not cover internal repairs or establish exact-model compatibility.
- Clickable appliance categories and an accessible, keyboard-navigable workspace.
- Mandatory hazard triage before AI; yes/unsure and recognized hazard phrases stop analysis.
- Structured AI observations, tentative explanations, explicit uncertainty, unknowns, and follow-up questions.
- Optional exterior JPEG/PNG/WebP photo, resized to 1200px and re-encoded without metadata before submission. Maximum source size 8 MB; encoded request is bounded server-side.
- Safe next actions from a fixed ruleset; model output never defines the action checklist.
- Consent-based local case history: search/filter, expand, resolve/reopen, feedback, delete, and text export.
- Local appliance records with brand/model and user-selected in-app care dates.
- Edit appliances, choose recurring care intervals, record completed care, and export a single all-day calendar reminder. Calendar files do not auto-sync or guarantee notifications.
- Download/import a validated JSON backup between devices. Imports preserve existing IDs and label imported analyses as unverified archives. Backups contain private text and are not encrypted.
- Manufacturer support portal links and a care resource library.
- Real loading, retry, timeout, validation, storage failure, and provider-unavailable states.

## Data and limitations

Optional AI requests send evidence directly from the server to Google after consent. Google's free tier may use inputs/outputs for product improvement and human review; avoid sensitive information. Basic mode makes no analysis request. A separate opt-in saves text records locally; photos are excluded. Anyone using that browser can see saved records. Reparo does not persist evidence on its server; provider policies still apply.

Hypotheses are unverified and not calibrated probabilities. Manufacturer portals are navigation links, not retrieved citations. AI text and images can be wrong. Hazard phrase matching is conservative and incomplete; domain expert review and a representative safety evaluation are required before treating this as a diagnostic product. It cannot certify safety or replace a technician.

Each troubleshooting guide allows three AI attempts; visual sessions allow five scans. Analysis has a best-effort five-requests/hour/IP allowance per instance; vision has twenty. These are not distributed quotas. Analysis/vision output caps are 1,800/1,300 tokens, with a 25-second model timeout and zero retries. Vision failure is shown honestly with manual entry available; it never fabricates an identification. Keeping provider billing disabled is the no-paid-overage boundary.

## Future work

Cloud accounts and automatic cross-device sync, audio and continuous-video analysis, retrieved model-specific manuals, internal repair procedures, technician booking, pricing integrations, and expert-reviewed diagnostic evaluations are not implemented. Real camera hardware varies by browser/device; automated camera tests use mocked streams, while image preparation is browser-verified.

## Source map

- `frontend/src/components/AnalysisGuide.tsx`: intake, images, AI results, follow-ups.
- `frontend/src/components/CameraWorkbench.tsx`: camera lifecycle, photo input, sampled live identification, and confirmed handoff.
- `frontend/src/components/RepairGuide.tsx` and `shared/repair-guides.ts`: interactive fixed owner-level task guides.
- `server/vision.ts`, `api/vision.ts`, `shared/vision.ts`: typed multimodal device recognition.
- `frontend/src/components/Workspace.tsx`: appliance records, history, resources.
- `frontend/src/workshop.ts`: validated local records and exports.
- `frontend/src/workshop-data.ts`: backup validation/merge and date/calendar utilities.
- `frontend/src/components/BackupPanel.tsx`: local backup download and consent-based import.
- `shared/analysis.ts`: request/result schemas, safety rules, approved checks.
- `server/analyze.ts`: structured AI SDK integration.
- `api/analyze.ts`: deployed HTTP endpoint and request limits.
- `docs/`: original product plans and implementation notes.

No license has been selected.
