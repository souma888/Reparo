# Development Guide

## Current status
A React/TypeScript/Vite frontend is runnable, with a browser-only guided preview and safety-gate regression tests. The backend, diagnostic service, and model weights are not present yet.

From the repository root, run `npm install`, `npm run dev`, `npm test`, and `npm run build`. Vercel configuration is tracked at the root; import the repository without changing its Root Directory. No frontend environment variables are required.

## Proposed stack
- Node.js LTS, React + TypeScript + Vite
- Python 3.11+, FastAPI, Pydantic, pytest
- PostgreSQL after persistence is needed
- Optional media processing workers after validation

## First implementation milestones
1. Scaffold frontend and backend with health endpoint.
2. Define typed appliance/symptom/safety schemas.
3. Build deterministic hazard rules and comprehensive tests.
4. Implement 2–3 limited diagnostic trees with reviewed sources.
5. Connect guided intake to structured responses.
6. Add evaluation harness and deployment configuration.

## Suggested workflow
Clone with `git clone https://github.com/souma888/Reparo.git`. Create local environment files from `.env.example` once services exist. Never commit credentials. Add run commands only after scaffolding has been tested.

## Suggested boundaries
Keep rules, ML adapters, retrieval, safety policy and API handlers separate. Each diagnosis must carry its rule/model version and supporting evidence.
