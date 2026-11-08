# Development Guide

## Current status
Documentation only. No runnable frontend, backend, package manifests or model weights are present yet.

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
