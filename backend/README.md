# Backend location

The active backend is TypeScript: `server/analyze.ts`, `server/vision.ts`, and Vercel handlers in `api/`. Local requests use `server/dev.ts`. There is no FastAPI service to install or deploy. Run `npm run dev:api` from the repository root. Accounts use managed Neon Auth; cloud workshop data uses its free PostgreSQL resource.
