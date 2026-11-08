# Reparo — Project Context

## Vision
A trustworthy, approachable assistant for troubleshooting everyday appliances through structured reasoning, multimodal evidence, and safety-first explanations.

## Problem
Users often encounter vague symptoms (noise, leaking, no power, poor performance), unreliable forum advice, and repair information scattered across manuals. They need help identifying **safe next steps**, not unsupported diagnoses.

## Intended users
- Homeowners and renters assessing non-invasive problems.
- Students and hobbyists learning basic appliance troubleshooting.
- Repair professionals receiving organized symptom summaries (future).

## Core principles
1. **Safety before diagnosis:** detect dangerous symptoms before recommending checks.
2. **Uncertainty by design:** distinguish observed facts, hypotheses, and unknowns.
3. **Explainability:** show why a cause is considered and what evidence would change it.
4. **Grounding:** prefer verified manufacturer instructions and trusted repair documentation.
5. **Privacy:** minimize retention of photos, audio, addresses, and device identifiers.
6. **Incremental multimodality:** add a modality only after demonstrating measurable value.

## Target appliance categories (candidate scope)
Fans, washing machines, refrigerators, air conditioners, microwaves, mixers, water purifiers, and small appliances. **Not all are MVP candidates**: high-voltage, sealed refrigeration, gas, and microwave internals demand strict restrictions.

## Core workflow
Appliance selection → immediate hazard triage → structured symptom questions → safe observational checks → ranked possible causes with evidence and uncertainty → stop/escalate guidance → optional session summary.

## Product ambitions
- Guided diagnostic interview with adaptive follow-ups.
- Photos of visible external symptoms and model labels.
- Audio samples of unusual sounds with uncertainty-aware classification.
- Video only when privacy, cost and evaluation are addressed.
- Manual-based retrieval with citations, model compatibility checks and versioning.
- Session history, repair log, cost estimates and technician handoff (later).
- Admin-reviewed knowledge base and evaluation dashboard.

## Non-goals
- Certifying an appliance as safe to use.
- Giving step-by-step instructions for hazardous electrical/gas/refrigerant repairs.
- Pretending to detect faults reliably from arbitrary media.
- Promising manufacturer-level diagnostic accuracy without measured evidence.
- Replacing qualified technicians.

## Open decisions
Exact MVP appliance list, dataset licensing and coverage, inference architecture, privacy/retention policy, hosting budget, authentication timing, regional safety guidance, and repository license.

## Status
All features are planned; implementation has not started.
