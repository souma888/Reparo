# Proposed System Architecture

> Planning document; components are not yet implemented.

```text
React / TypeScript browser client
  ├── Appliance + symptom intake
  ├── Safety warnings and guided questions
  ├── Media upload (later)
  └── Diagnosis explanations and session view
                 │ HTTPS
                 ▼
FastAPI service
  ├── Typed request validation and rate limits
  ├── Safety triage / hard stop rules
  ├── Session orchestration
  ├── Rule-based diagnostic engine (MVP)
  ├── Evidence retrieval with source attribution (later)
  ├── ML inference adapters (later)
  └── Structured response and audit metadata
          ├── PostgreSQL (sessions/users, later)
          ├── Object storage (consented media, later)
          └── Async worker (media analysis, later)
```

## Suggested code boundaries
- `frontend/src/features/intake/`: symptom collection.
- `frontend/src/features/diagnosis/`: findings, evidence and next steps.
- `frontend/src/features/safety/`: warnings and escalation.
- `frontend/src/components/`: accessible shared UI.
- `backend/app/api/`: versioned routes.
- `backend/app/schemas/`: request/response models.
- `backend/app/safety/`: deterministic hazard detection.
- `backend/app/diagnostics/`: rule trees and evidence aggregation.
- `backend/app/retrieval/`: cited manual search, later.
- `backend/app/ml/`: optional media inference, later.
- `backend/tests/`: safety and diagnostic tests.

## Diagnostic response contract (proposal)
Return appliance type, symptom summary, safety state, safe next questions/checks, possible causes with confidence **only when calibrated**, evidence sources, unresolved unknowns, and escalation guidance. Do not present uncalibrated scores as probabilities.

## Critical processing order
**Safety triage must run before diagnosis.** A generative model must not be allowed to override a deterministic hazard stop or invent missing evidence. Retrieval must carry document source, appliance model applicability, and revision date.

## Persistence and privacy
Start stateless where possible. If sessions are saved, require explicit consent and user ownership. Strip unnecessary EXIF/geolocation, enforce upload size/type limits, scan media, use retention limits, and support deletion. Never commit API keys.

## Operations
Apply authentication and authorization before storing personal sessions; enforce rate limits and media-processing quotas. Log operational events without storing sensitive content by default. Version knowledge, rules and models to reproduce decisions.
