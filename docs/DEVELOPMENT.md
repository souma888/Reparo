# Development

Node 22.12+; npm ci at the repository root. No Python service is required.

Run npm run dev:api and npm run dev in separate terminals. Vite proxies /api to 127.0.0.1:3001. Optional configuration lives in untracked .env.local; .env.example contains names only. The browser sees only VITE_NEON_AUTH_URL, a public service URL. Google and database credentials stay on the server.

npm test runs the regression suite; npm run build typechecks APIs/server/shared modules and then the frontend. To test offline behavior, build and run npm run preview --workspace frontend. Service workers register only in production builds. API tests use explicit mocked providers; live smoke checks require the configured service.

Follow the safety boundary in SAFETY_AND_EVALUATION.md. Keep Google unbilled, the Neon resource on Free, and do not introduce paid fallback behavior.
