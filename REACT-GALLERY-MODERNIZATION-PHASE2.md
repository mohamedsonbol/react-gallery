# React Gallery — Modernization Phase 2

**Date:** 2026-10-09  
**Branch:** `fix/recovery-phase-1`  
**Status:** Toolchain migration complete and validated; browser automation remains unconfigured.

## Baseline preserved

The uncommitted Phase 1 changes were inspected and retained before this migration. The baseline consists of one `/` application screen, `NavBar` and `Album` components, the JSONPlaceholder photo request, an initial 10-image display, Load More increments of 10 to a 50-image maximum, retry/error/loading behavior, and unmount cancellation.

Before changing tooling, Node 14.21.3/npm 6.14.18 ran the existing CRA regression suite successfully: **1 suite, 4 tests passed**. No commits, pushes, deployments, secrets, or production services were changed.

## Before and after

| Area | Before | After |
| --- | --- | --- |
| Runtime | Node 14.21.3 / npm 6.14.18 | Node 24.18.0 / npm 11.16.0 |
| Build/dev server | Create React App / `react-scripts` 4.0.1 | Vite 8.3.4 / `@vitejs/plugin-react` 6.1.2 |
| React | React / React DOM 17.0.1 | React / React DOM 19.3.0 |
| UI library | Material UI Core 4.11.2 | MUI Material 9.4.0 with Emotion 11 |
| Test runner | CRA-managed Jest | Vitest 5.0.3 with jsdom 30.1.2 |
| Linting | CRA ESLint integration | ESLint 10 flat configuration |
| Lockfile | npm v1, 1,975 installed packages | npm v3, 245 audited packages |

## Migration changes and compatibility notes

- Replaced `react-scripts` with Vite scripts: `dev`, `start`, `build`, `preview`, `test`, `test:ci`, and `lint`.
- Replaced CRA’s `public/index.html` with Vite’s root `index.html`; public icons, manifest, and robots file remain served from `public/`.
- Converted the React entry point to `createRoot` for React 19.
- Renamed JSX-bearing files from `.js` to `.jsx`; Vite 8/Rolldown requires JSX-bearing modules to be unambiguous rather than using the old CRA `.js` transform behavior.
- Migrated `@material-ui/core` imports to `@mui/material`. Existing `AppBar`, `Toolbar`, `Typography`, `Button`, and `Grid` usage compiled successfully; the presentation and interaction model were not redesigned.
- Converted Jest calls to Vitest (`vi`) and configured jsdom plus `@testing-library/jest-dom/vitest`.
- Added `eslint.config.js` using ESLint’s current flat configuration.
- Added `.github/workflows/ci.yml`: Node selected from `.nvmrc`, followed by `npm ci`, lint, tests, and build.
- Removed the tracked CRA-era `.eslintcache`, which is generated tooling state rather than project source.
- Removed unused CRA-only `react-scripts`, unused `axios`, unused `web-vitals`, and unused Testing Library `user-event`, after source and test searches confirmed no imports.
- Replaced the old lockfile intentionally. npm could not resolve the React 19 graph from the legacy npm v1 CRA lockfile, even after removing `node_modules`; the regenerated npm v3 lockfile is required for reproducible `npm ci`.

There are no `process.env` or CRA `REACT_APP_*` usages to translate. Vite’s `VITE_*` environment-variable convention is therefore not needed yet. No application CSS or asset import paths required conversion.

## Installation and validation

The selected Node 24 line is supported by Vite 8 (`^20.19.0 || >=22.12.0`), Vitest 5 (`^22.12.0 || ^24.0.0 || >=26.0.0`), jsdom 30 (`^22.22.2 || ^24.15.0 || >=26.0.0`), and ESLint 10 (`^20.19.0 || ^22.13.0 || >=24`).

Use:

```bash
nvm use
npm ci
npm run dev
```

| Command | Result |
| --- | --- |
| `nvm use 24.18.0 && npm install` | PASS — deliberate migration install; 245 packages audited |
| `nvm use 24.18.0 && npm ci` | PASS — clean script-enabled install; 244 packages added, 245 audited |
| `npm run lint` | PASS |
| `npm run test:ci` | PASS — 1 file, 4 tests |
| `npm run build` | PASS — Vite production build completed |
| Dev HTTP smoke | PASS — temporary `vite` server returned HTTP 200 from `127.0.0.1:5173` |
| Preview HTTP smoke | PASS — temporary `vite preview` returned HTTP 200 from `127.0.0.1:4173` |
| Browser automation | NOT RUN — no browser automation was available in this environment |

The focused test coverage verifies successful album filtering/display, Load More without a refetch, failed request plus retry, and abort/stale-response safety on unmount. The development and preview server processes were stopped after their probes.

## Security and dependency results

No `npm audit fix --force`, audit suppression, or peer-dependency bypass was used.

| Audit scope | Before Phase 2 | After Phase 2 |
| --- | ---: | ---: |
| All dependencies | 210 total: 6 low, 119 moderate, 63 high, 22 critical | 0 |
| `npm audit --omit=dev` | 210 total: 6 low, 119 moderate, 63 high, 22 critical | 0 |

The Phase 1 tree classified its build/test stack as production dependencies, so the old omit-dev count was identical to all dependencies. The new manifest correctly places test/build/lint tooling in `devDependencies`; both current audit commands return zero findings.

## Remaining issues and production readiness

- Browser/e2e tests are still not configured. No visual, responsive, keyboard, or real-network image test is claimed.
- The application continues to fetch and filter the full external JSONPlaceholder photo collection in the browser. Phase 1 made the lifecycle safe, but an API boundary, pagination, caching, validation, and image optimization remain future work.
- The successful Vite build’s JavaScript entry is 340.04 kB (108.04 kB gzip), largely driven by MUI; bundle monitoring and optimization are not yet configured.
- The existing README remains largely CRA-oriented and should be updated in Phase 3 with Vite commands and operational guidance.

**Production readiness:** substantially improved—clean install, lint, regression tests, build, local dev HTTP, preview HTTP, CI definition, and zero audited vulnerabilities are verified. It is not yet fully release-ready until browser/e2e coverage and the external-data/performance risks are addressed.

## Recommended Phase 3

Add browser automation and a small e2e smoke suite covering the gallery load, Load More, retry, unmount, and mobile/desktop layout. Then replace the full external collection fetch with a controlled, paginated data boundary; add image loading/performance safeguards; and update user-facing project documentation.
