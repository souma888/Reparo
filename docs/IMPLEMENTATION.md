# Current implementation

Reparo now has a React/Vite client and a TypeScript Vercel Function at `/api/analyze`, replacing the original plan to begin with FastAPI. No Python backend is required by the deployed application.

The function validates a bounded JSON request, applies deterministic hazard stops, and calls the direct Google provider through AI SDK 7 with structured output. The fixed model is `gemini-3.5-flash-lite`, verified free-eligible on 2026-11-08. A missing key, malformed AI response, quota error, or provider failure returns labeled basic guidance. A model-reported hazard discards all hypotheses. Safety checks always precede inference. Vercel AI Gateway is no longer used.

Appliance records and text cases are saved only after explicit opt-in, in versioned, validated browser storage. Photos are re-encoded client-side and sent transiently for analysis, not included in saved cases. No cloud login or database is configured.

Explicit basic mode runs in the browser without sending evidence to a server. Optional AI requires `GOOGLE_GENERATIVE_AI_API_KEY` from an unbilled Google project. Read FREE_TIER_PLAN.md for resource choices, privacy tradeoffs, quotas, and phased future features. Older architecture documents describe plans, not shipped functionality.
