# Reparo

**An AI-assisted appliance troubleshooting and repair guidance platform.**

Reparo is a planned full-stack application that helps people understand appliance faults through structured symptom reports, optional photos, sound recordings, and eventually video. Its goal is to provide **evidence-backed, safety-aware diagnostic guidance** rather than confident guesses.

> **Status:** A responsive React frontend and browser-only guided preview are implemented. The backend, trained models, and diagnostic service are not implemented yet.

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

## Technology
- Frontend (implemented): React, TypeScript, Vite
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
├── frontend/            # Web client and guided preview
├── backend/             # Future API, reasoning and ML services
├── tests/               # Future integration and evaluation cases
├── .env.example
└── README.md
```

## Getting started
Requires Node.js 22.12+ and npm. From the repository root:

```sh
npm install
npm run dev
```

Run `npm test` for safety-gate regression cases and `npm run build` for TypeScript checks and a production build. No environment variables or backend are required for the frontend preview. Answers remain in memory until the guide is closed; users can download a text summary.

### Deploy on Vercel

Import `souma888/Reparo`, select the `main` branch, and leave **Root Directory at the repository root**. The tracked `vercel.json` configures Vite, `npm run build`, and `frontend/dist`. No environment variables are needed. The deployment is a static frontend; AI diagnosis, accounts, uploads, and saved histories are not available yet.

See [frontend setup](frontend/README.md) and [the development plan](docs/DEVELOPMENT.md) for details.

## Important safety notice
Reparo must never encourage users to open energized devices, bypass interlocks, handle refrigerants, test exposed mains wiring, or perform other hazardous repairs. Suspected gas leaks, smoke, fire, electric shock, or other emergencies require immediate cessation of troubleshooting and appropriate emergency/professional assistance. Guidance is educational and does not replace a qualified technician.

## License
No license has been chosen yet. The repository being public does not itself grant permission to reuse its contents.
