# Reparo

**An AI-assisted appliance troubleshooting and repair guidance platform.**

Reparo is a planned full-stack application that helps people understand appliance faults through structured symptom reports, optional photos, sound recordings, and eventually video. Its goal is to provide **evidence-backed, safety-aware diagnostic guidance** rather than confident guesses.

> **Status:** Documentation and repository initialization. No application, trained model, or diagnostic service is implemented yet.

## Why Reparo?
When an appliance fails, users may not know what to check, whether the issue is safe to investigate, or when professional help is necessary. Reparo aims to turn symptoms and available evidence into understandable troubleshooting steps, uncertainty estimates, and clear escalation guidance.

## Planned experience
1. Select an appliance type and describe symptoms.
2. Answer targeted follow-up questions and optionally upload a photo or short audio clip.
3. Receive possible causes **ranked with uncertainty**, supporting observations, and safe checks.
4. Review safety warnings and stop conditions before any action.
5. Save a diagnostic session and optionally export a summary for a technician (later).

## Initial scope
**MVP:** a limited set of common appliance categories, text-based symptom intake, rule-based troubleshooting trees, safety triage, guided questions, and structured results. Start with low-risk, non-invasive checks.

**Later:** image analysis, audio classification, multimodal fusion, retrieval from verified manuals, user accounts, repair histories, technician handoff, and carefully scoped video support.

## Proposed technology (not yet installed)
- Frontend: React, TypeScript, Vite
- Backend: Python, FastAPI, Pydantic
- Database: PostgreSQL when accounts and saved sessions are introduced
- ML: PyTorch/scikit-learn or hosted inference where validated and cost-effective
- Retrieval: manual/document ingestion, provenance metadata, optional vector search
- Jobs/storage: object storage and async workers for media processing when needed
- Quality: pytest, frontend tests, evaluation datasets, CI

## Documentation
- [Product context](docs/PROJECT_CONTEXT.md)
- [Architecture](docs/ARCHITECTURE.md)
- [Features and MVP](docs/FEATURES.md)
- [Roadmap](docs/ROADMAP.md)
- [Data and ML strategy](docs/DATA_AND_ML.md)
- [Safety and evaluation](docs/SAFETY_AND_EVALUATION.md)
- [Development plan](docs/DEVELOPMENT.md)
- [Contributing](CONTRIBUTING.md)
- [Security](SECURITY.md)

## Repository layout
```text
Reparo/
├── .github/             # Issue and pull-request templates
├── docs/                # Product and technical plans
├── frontend/            # Future web client
├── backend/             # Future API, reasoning and ML services
├── tests/               # Future integration and evaluation cases
├── .env.example
└── README.md
```

## Getting started
This is a documentation-first setup. **There is no runnable app or backend yet.** Read [the development plan](docs/DEVELOPMENT.md) for proposed implementation steps.

## Important safety notice
Reparo must never encourage users to open energized devices, bypass interlocks, handle refrigerants, test exposed mains wiring, or perform other hazardous repairs. Suspected gas leaks, smoke, fire, electric shock, or other emergencies require immediate cessation of troubleshooting and appropriate emergency/professional assistance. Guidance is educational and does not replace a qualified technician.

## License
No license has been chosen yet. The repository being public does not itself grant permission to reuse its contents.
