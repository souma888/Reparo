# Tests

Run npm test from the repository root. Vitest tests live in frontend/src/*.test.ts and *.test.tsx and import the real shared/server/API modules. Coverage includes camera and guide UI, API validation/safety, free-provider policy, per-attempt accounting, streaming JSON parsing, storage/backups/reminders, recurrence/cost helpers and retrieval/citation scope. evals/hazards.json and evals/retrieval.json provide versioned safety/citation fixtures. Root npm run build checks server/API and frontend types; GitHub Actions runs both tests and build.
