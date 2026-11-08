# Reparo frontend

React 19 + TypeScript + Vite. Black `#181818`, ivory `#F5F1E9`, and bronze `#A77B46`, with generous whitespace, serif display headings, fine borders, and an original SVG appliance illustration. Google Fonts are optional enhancements; system font fallbacks keep the app usable if fonts are unavailable.

## Run from the repository root

```sh
npm install
npm run dev
npm test
npm run build
npm run preview
```

Requires Node.js 22.12+. Development serves at `http://127.0.0.1:5173`; production preview at `http://127.0.0.1:4173`.

## Included

- Responsive landing page, mobile navigation, appliance selection, safety principles, and FAQ disclosures.
- Native modal guide with mandatory hazard triage, symptom intake, and conservative general observations.
- Yes or unsure safety answers stop the flow. Conservative text matching can escalate a no answer; it is not a validated natural-language hazard detector.
- Plain-text summary download. No answer uploads, storage, or inference.
- Keyboard controls, native dialog focus containment, Escape dismissal, and reduced-motion support.
- Vitest safety regression cases and GitHub Actions build checks.

## Vercel

Import the repository with Root Directory at the repository root (`.`). `vercel.json` supplies install/build/output settings. No environment variables are required. The npm workspace lockfile is at the repository root.

## Boundaries

This is an explicitly labeled frontend preview, not a diagnostic product. It provides general external observations and escalation without possible-cause rankings, confidence claims, model-specific instructions, or safety certification. Answers are cleared when the modal closes or the page reloads. A downloaded summary stays on the user's device.

The backend and reviewed knowledge base remain future work. Expand safety rules only with domain review and evaluation. No repository license has been selected.
