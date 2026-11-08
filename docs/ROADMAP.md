# Development Roadmap

No deadlines are committed.

## Phase 0 — Foundation
- [x] Establish vision, scope, architecture and documentation.
- [ ] Choose license and final MVP appliance categories.
- [x] Scaffold React/TypeScript frontend with a responsive landing page and browser-only guided preview.
- [ ] Scaffold FastAPI backend.
- [x] Add frontend TypeScript build checks, safety-gate regression tests, and GitHub Actions.
- [ ] Configure linting and backend tests.

## Phase 1 — Safe text-first MVP
- [ ] Design symptom and hazard taxonomies.
- [ ] Implement deterministic hazard triage with hard stops.
- [ ] Create reviewed diagnostic trees for 2–3 low-risk appliance scenarios.
- [ ] Build guided intake and structured result UI.
- [ ] Add reference tests and evaluation harness.

## Phase 2 — Knowledge grounding
- [ ] Gather permissioned manufacturer manuals and structured troubleshooting data.
- [ ] Build retrieval with provenance and model applicability.
- [ ] Compare retrieval-assisted results against rules-only baseline.
- [ ] Add feedback, corrections and audit/version history.

## Phase 3 — Productization
- [ ] Add authentication, session storage and deletion controls.
- [ ] Introduce optional photo analysis and upload safeguards.
- [ ] Improve UX, accessibility, analytics and monitoring.
- [ ] Run small usability tests and document limitations.

## Phase 4 — Audio and multimodal research
- [ ] Acquire legally usable labeled audio with realistic background noise.
- [ ] Benchmark against non-ML and single-modality baselines.
- [ ] Calibrate uncertainty and add abstention thresholds.
- [ ] Evaluate privacy, latency and per-session compute cost.

## Phase 5 — Expansion
- [ ] Broaden appliance coverage only after safety reviews.
- [ ] Explore video, multilingual support and technician handoff.
- [ ] Improve personalization without compromising privacy.

## Release gates
No feature ships without safety review, reproducible tests, known limitations and clear user messaging.
