# Current implementation

Reparo now has a React/Vite client and a TypeScript Vercel Function at `/api/analyze`, replacing the original plan to begin with FastAPI. No Python backend is required by the deployed application.

The main experience now starts at the camera workbench. Users open a local live preview, take a mobile photo, or upload a photo. `/api/vision` identifies the appliance from a frame and returns visible observations, uncertainty, and hazard flags. Visible model text is never guessed from appearance. The user confirms/corrects a supported category before the frame and reported problem are passed into safety and symptom intake. A visible/reported hazard stops this handoff.

Live analysis samples frames rather than sending a video stream: at most five calls per visual session, sequential requests with at least ten seconds between responses and the next request. The browser requests video only, and releases tracks on stop, hide, guide handoff, unmount, or a late grant after cancellation. Provider failures do not become fake recognition. Camera hardware itself must also be tested on target phones/browsers; component tests use mocked streams to avoid accessing private cameras.

After analysis, a fixed owner-level task guide can be selected only after the user confirms an observed condition and checks their model manual. Supported tasks currently cover a visible food item blocking a fridge door, a model-documented washer delay control, and a loose external fan airflow obstruction. Source links are manufacturer examples, not proof of model applicability. There are no model-authored internal repair procedures. An unsafe/unresolved task escalates to a technician.

The function validates a bounded JSON request, applies deterministic hazard stops, and calls the direct Google provider through AI SDK 7 with structured output. The fixed model is `gemini-3.5-flash-lite`, verified free-eligible on 2026-11-08. A missing key, malformed AI response, quota error, or provider failure returns labeled basic guidance. A model-reported hazard discards all hypotheses. Safety checks always precede inference. Vercel AI Gateway is no longer used.

Appliance records and text cases are saved only after explicit opt-in, in versioned, validated browser storage. Photos are re-encoded client-side and sent transiently for analysis, not included in saved cases. No cloud login or database is configured.

The workspace supports appliance editing, user-selected recurring care dates, last-care records, due indicators, and RFC 5545 calendar-file export. Reminders are in-app dates; the exported file is one event, not a notification service or calendar sync.

Backup & data downloads/imports text-only JSON locally. Files are capped at 2 MB, schema-checked, and merged without replacing matching IDs. Duplicate IDs and over-capacity imports are rejected atomically. Imported cases are labeled archives. Changes propagate between open tabs of the same browser. This is manual cross-device transfer, not cloud sync.

AI follow-up questions with operating/action verbs are discarded server-side. This guard supplements prompt constraints; it does not certify all model text as safe.

Explicit basic mode runs in the browser without sending evidence to a server. Optional AI requires `GOOGLE_GENERATIVE_AI_API_KEY` from an unbilled Google project. Read FREE_TIER_PLAN.md for resource choices, privacy tradeoffs, quotas, and phased future features. Older architecture documents describe plans, not shipped functionality.
