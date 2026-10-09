# React Gallery Technical Audit

**Audit date:** 2026-10-09  
**Overall status:** **CRITICAL** — Phase 1 restored a runnable local baseline and resolved the fetch loop, but the locked dependency tree still has critical security findings.

## Executive summary

`react-gallery` is a very small client-side image gallery, bootstrapped with Create React App (CRA). It renders a Material UI application bar and fetches photo records from JSONPlaceholder, filters them to one item for each even-numbered album, and progressively displays up to 50 images.

The source is easy to understand, but not production-ready. Phase 1 changed the core gallery effect so it only fetches on mount or explicit retry, and added cleanup, loading, error, retry, and regression-test coverage. A reproducible Node 14.21.3/npm 6.14.18 baseline now installs from the existing lockfile and passes lint, tests, build, and local HTTP smoke testing. Separately, the unchanged lockfile still reports **210 vulnerabilities: 22 critical, 63 high, 119 moderate, and 6 low**.

No application source files were changed. This report is the sole intentional repository change.

## Project purpose and evidenced features

- A single-page React gallery with no router or multiple routes.
- A Material UI `AppBar` headed “Image Gallery App”.
- `Album` requests `https://jsonplaceholder.typicode.com/photos` with the browser `fetch` API.
- It retains even `albumId` records, reduces them to the first record per album, and displays the first 10 image URLs initially.
- A “Load More” button increments the client-side display limit by 10, to a maximum of 50, then is hidden.

The README is the uncustomized CRA starter README; it does not document the gallery, its data source, supported Node version, environment, testing strategy, or deployment procedure.

## Repository and Git status

| Item | Evidence / result |
| --- | --- |
| Working directory | `/home/mohamedsonbol/react-gallery` |
| Branch | `main` |
| Remote | `origin git@github.com:mohamedsonbol/react-gallery.git` (fetch/push) |
| Working tree before this report | Clean (`git status --short` produced no entries) |
| Latest commit | `d6e7bb9ea8700104f1016589b911c79b4f3f56d2` — `lets make it better` — 2020-12-15T20:26:38+01:00 |
| Recent history | 3 commits; latest code commit is approximately six years old |

## Technology stack

| Area | Evidence |
| --- | --- |
| Framework/build system | Create React App, `react-scripts` 4.0.1 |
| UI framework | React 17.0.1, React DOM 17.0.1, Material UI Core 4.11.2 |
| Language | JavaScript; no TypeScript configuration or `.ts`/`.tsx` files |
| Package manager | npm, with committed `package-lock.json` (legacy lockfile format) |
| Test tooling | CRA/Jest and Testing Library packages declared; no test files found |
| Network/data | Browser `fetch`; JSONPlaceholder public API; no application backend |
| Current runtime | Node `v24.18.0`, npm `11.16.0` |

## Architecture and folder structure

```
src/
  index.js                 ReactDOM render entry point
  App.js                   Composition of NavBar and Album
  App.css                  One image-width rule
  components/
    Navbar.js              Material UI app bar
    Album.js               Remote fetch, filtering, display limit, gallery markup
public/                    CRA HTML, manifest, icons and robots.txt
```

Data flows directly from the public third-party API into `Album` state and then `<img>` elements. There is no abstraction for API access, cancellation, validation, retry, loading state, error state, cache, image fallback, routing, or automated test coverage.

## Installation and environment

- The correct reproducible installation command is `npm ci`, because `package-lock.json` is committed.
- No `.env` or `.env.example` files were found. Source search found no `process.env` usage, so no application environment variables are currently required or documented.
- `node_modules` was absent at audit start.
- `npm ci --ignore-scripts` was attempted without dependency upgrades. npm warned that the lockfile is old and attempted metadata fix-up requests; the install did not complete and left `node_modules` absent. The decisive errors were registry `ETIMEDOUT` errors for packages including `@babel/parser` and Babel proposal plugins.
- npm additionally could not write its user-level log files in this environment; this did not modify project files.

The current Node/npm pair is much newer than this 2020 CRA 4 dependency set. Compatibility should be explicitly validated in a supported CI/runtime matrix after dependencies are restored; it was not possible to do so here.

## Test and validation results

Status meanings: **PASS** completed successfully; **FAIL** executed and failed; **BLOCKED** could not execute due to a documented prerequisite; **NOT CONFIGURED** has no configured command or artifacts.

| Check | Status | Exact command / evidence |
| --- | --- | --- |
| Repository inspection | PASS | `pwd`, `git branch --show-current`, `git remote -v`, `git status --short`, `git log -1` |
| Source/document/configuration inspection | PASS | Inspected all tracked source, README, `package.json`, public files, and `.gitignore`; no additional app configuration files exist |
| Dependency installation | BLOCKED | `npm ci --ignore-scripts`; registry `ETIMEDOUT`; `node_modules` remained absent |
| Dependency security audit | FAIL | `npm audit --package-lock-only --json`: 210 total vulnerabilities (22 critical / 63 high / 119 moderate / 6 low) |
| Production build | BLOCKED | `npm run build` → `sh: 1: react-scripts: not found` |
| Unit test command | BLOCKED | `npm test -- --watchAll=false` → `sh: 1: react-scripts: not found` |
| Lint command | NOT CONFIGURED | `npm run lint` → `npm error Missing script: "lint"`; CRA would normally lint during build/start, but both are blocked |
| TypeScript check | NOT CONFIGURED | JavaScript-only project; no TypeScript compiler/configuration or typecheck script |
| Integration/e2e tests | NOT CONFIGURED | No test files, e2e tooling, or scripts were found |
| Development server / HTTP response | BLOCKED | `npm start` → `sh: 1: react-scripts: not found` |
| Browser navigation/rendering/interactions/responsive tests | BLOCKED | The app could not start; no browser result is claimed |

## Functional issues and bugs

1. **Critical: fetch/render loop.** In `src/components/Album.js`, the effect depends on `[limit, images]`, while `fetchImages()` calls `setImages(uniqueItems)`. Every successful fetch creates a new array, changes `images`, runs the effect again, and starts another full API request. This produces continuing traffic, renders, console noise, and unpredictable UI/network behavior. `limit` also unnecessarily triggers a refetch when only display slicing changes.
2. **High: absent user-visible loading and failure behavior.** Failures are only sent to `console.log`; the page supplies no loading indicator, retry action, status message, or accessible error feedback. An unavailable third-party service leaves an empty gallery without explanation.
3. **High: third-party API is fetched in full.** The endpoint returns the whole photo collection and filtering/deduplication occurs only after download. The UI ultimately uses at most 50 records, creating avoidable transfer, parsing, and memory work. Availability and response shape are externally controlled.
4. **Medium: no automated tests.** No test files exist despite Testing Library dependencies. The central fetch/filter/limit behavior has no regression coverage.
5. **Medium: gallery robustness is incomplete.** Images lack `loading="lazy"`, dimensions/aspect-ratio reservation, and an error fallback. This risks unnecessary network work, layout shifts, and broken tiles when remote images fail.
6. **Medium: stale developer diagnostics.** `console.log(err)` and `console.log(newLimit)` remain in production code.
7. **Low: product metadata and documentation are generic.** The HTML meta description and README retain CRA defaults; manifest/branding assets are also starter assets.

## Dependency, security, and maintenance findings

The dependency stack is materially out of date: React 17, Material UI v4, CRA/react-scripts 4, Axios 0.21.0, and Testing Library 11/12 declarations date from the project’s 2020 era. `axios` and `web-vitals` are declared but not imported by any application source file; `Album` uses native `fetch` instead of Axios.

`npm audit --package-lock-only --json` completed against the lockfile and found 210 vulnerable packages. Notable direct/transitive paths include:

- Direct `axios@0.21.0`: reported high-severity vulnerabilities; it is unused and should be removed or replaced only if a real use case exists.
- `react-scripts@4.0.1` introduces a large vulnerable webpack/Babel/Jest/workbox tree. The audit identifies a major upgrade to `react-scripts@5.0.1` for some paths, but that alone should be planned and tested rather than applied blindly.
- Critical findings include vulnerable transitive Babel, `workbox-build`, `url-parse`, and `websocket-driver` paths.

Because the app is a static browser client and does not use Axios in source, many development-tool vulnerabilities may not be deployed to users. They still affect developer/CI environments and establish that the lockfile needs an intentional modernization/security remediation effort. Do not treat `npm audit fix --force` as a safe automatic remedy.

## Code quality, accessibility, performance, and responsive design

**Architecture and maintainability:** Component boundaries are understandable but minimal. API/business logic sits inside a presentation component. There are no types, tests, reusable data layer, lint script, CI configuration, error boundary, or documented development contract. The code is maintainable only at this very small scale; it is not a dependable foundation for feature growth.

**React patterns/state/data fetching:** Functional components and hook use are appropriate in principle, and `album.id` is used as a list key. However the effect dependency is incorrect, fetching has no cancellation, and derived data is recalculated after each full response. `limit` should control presentation, not trigger the API side effect.

**Accessibility:** Static review confirms each image has an `alt` value and “Load More” uses a semantic Material UI button. Gaps include no loading/error announcements, no tests with assistive technologies, and no verification of keyboard focus or contrast. Browser accessibility testing was blocked; this is not an accessibility pass certification.

**Responsive design:** Material UI grid breakpoints (`xs=12`, `sm=6`, `md=4`) provide an intended one/two/three-column layout, and `.albumImg { width: 100%; }` fills a tile. No visual, viewport, or touch testing occurred. There are no explicit image aspect-ratio, object-fit, or layout-shift protections.

**Performance:** The infinite fetch loop is the dominant risk. Full-collection retrieval, image eagerness, no caching, no lazy loading, and no optimized/responsive image variants are additional risks. No Lighthouse or production bundle measurement was possible because the build and server were blocked.

**Application security:** No secrets, authentication, local storage, dangerous HTML insertion, or backend code were found. The principal concerns are the obsolete vulnerable dependency tree, direct reliance on a public third-party endpoint, and lack of failure handling. The external image URLs are rendered directly from API-provided data; validation or a controlled image source should be considered if the API ceases to be trusted.

## Production readiness assessment

**Not ready to deploy.** A successful clean install, build, test run, and local browser verification are missing. Even if dependencies install elsewhere, the confirmed state/effect loop makes the central screen issue repeated API calls. The severe dependency audit findings and lack of test/CI coverage are independent release blockers.

## Prioritized action plan

| Priority | Recommended action | Rationale | Estimated effort |
| --- | --- | --- | --- |
| P0 | Correct the `Album` effect so fetching is not dependent on the state it sets; fetch once (or with a deliberate query dependency), add cancellation, and avoid refetch on “Load More”. | Fixes confirmed request/render loop and excess traffic. | 0.5–1 day |
| P0 | Restore reproducible installs in a clean supported Node environment, then run build/test/server checks and add CI to enforce them. | Current audit cannot execute the app; deployment evidence is absent. | 0.5–1 day |
| P0 | Plan and execute dependency modernization/security remediation, replacing the obsolete CRA toolchain where appropriate; regenerate lockfile deliberately and re-audit. Remove unused Axios/web-vitals if not needed. | 22 critical and 63 high audit findings; obsolete core tooling. | 2–5 days |
| P1 | Add loading, empty, error, retry, and image-error states with accessible status announcements. | Makes third-party API failures usable and diagnosable. | 1–2 days |
| P1 | Request only needed data or provide a controlled gallery API/data fixture; cache and validate the result. | Reduces transfer and external-service dependency. | 1–3 days |
| P1 | Add unit/component tests for fetch success/failure, filtering/deduplication, initial 10 items, and Load More boundary; add an e2e smoke test. | Establishes regression protection for the core feature. | 1–2 days |
| P2 | Add lazy loading, defined dimensions/aspect ratio, responsive image strategy, and test layout at mobile/tablet/desktop widths. | Reduces layout shift and image cost. | 1–2 days |
| P2 | Replace generic README/metadata/manifest content and document Node, install, test, data-source, and deployment requirements. | Improves maintainability and operational handoff. | 0.5–1 day |
| P3 | Remove console diagnostics and establish explicit lint/type-quality policy (ESLint and optionally TypeScript/JSDoc). | Raises baseline code quality. | 0.5–2 days |

## Recommended next development phase

Start with a stabilization/security phase: establish a compatible, reproducible toolchain; remediate the P0 gallery loop; add the smallest useful test suite and CI; then modernize dependencies in a tested branch. Only after a clean install, build, test pass, local server response, and browser smoke test should visual enhancements or new gallery features be scheduled.

## Phase 1 recovery update — 2026-10-09

The following original findings are resolved and were verified on branch `fix/recovery-phase-1`:

- **Environment recovery:** `.nvmrc` and `package.json` now specify Node 14.21.3/npm 6.x. `npm ci --ignore-scripts` completed successfully with the existing v1 lockfile; it added 1,975 packages in 11 seconds and did not change `package-lock.json`.
- **Album fetch loop:** `Album` no longer depends on `images` or `limit` in its fetch effect. It fetches on mount and on explicit retry only; an `AbortController` and current-request guard prevent unmounted/stale updates.
- **Failure handling:** the gallery now provides loading and accessible error/retry states instead of logging request errors to the console.
- **Regression coverage:** four focused tests cover successful filtering/display, Load More without a refetch, failure/retry, and unmount cleanup/stale response handling.
- **Executable baseline:** under Node 14.21.3, `npm run lint`, `npm run test:ci` (4/4), and `npm run build` all pass. A temporary development server returned HTTP 200 from `http://127.0.0.1:3000/` and was stopped after the probe.

Browser automation was not available in the recovery environment, so visual, navigation, image-loading, and responsive validation remain unexecuted. The security/dependency, third-party-data, image-optimization, generic documentation, and CI findings remain open. The current npm 10 lockfile audit count is unchanged at 210 total vulnerabilities (22 critical, 63 high, 119 moderate, 6 low).

