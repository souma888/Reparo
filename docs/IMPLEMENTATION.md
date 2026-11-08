# Current implementation

Reparo now has a React/Vite client and a TypeScript Vercel Function at `/api/analyze`, replacing the original plan to begin with FastAPI. No Python backend is required by the deployed application.

The function validates a bounded JSON request, applies deterministic hazard stops, calls Vercel AI SDK 7 with structured output, and combines unverified hypotheses with a fixed safe-action checklist. A model-reported hazard discards all hypotheses and returns a stop. Client-side checks never replace server validation.

Appliance records and text cases are saved only after explicit opt-in, in versioned, validated browser storage. Photos are re-encoded client-side and sent transiently for analysis, not included in saved cases. No cloud login or database is configured.

See the root README for setup, credentials, retention, rate limiting, and remaining features. Original architecture and feature documents are planning references, not a claim that all planned features have shipped.
