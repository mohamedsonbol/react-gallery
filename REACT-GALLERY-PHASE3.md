# React Gallery — Phase 3

**Branch:** `feat/phase-3`  
**Status:** Browser-tested baseline with bounded gallery requests; not yet a full production release.

## Changes implemented

- Added Playwright 1.64 and a real Chromium browser configuration with desktop and 390px mobile projects.
- Added deterministic browser tests that intercept JSONPlaceholder responses; no live third-party data is used in tests.
- Changed photo requests from one unbounded `/photos` response (5,000 records) to explicit 1,000-record `_start`/`_limit` pages. The initial page yields the first 10 even-album images; each deliberate Load More request fetches the next bounded page and preserves order.
- Preserved AbortController/current-request safeguards, retry behavior, and the 50-image display maximum.
- Added native image `loading` hints, fixed 600×600 dimensions to reserve layout space, fallback alt text, and an image-error fallback that hides a broken image.
- Added Playwright installation and browser testing to GitHub Actions.

## Browser coverage

`npm run test:e2e` executed against installed Chromium binaries and passed **6/6** tests:

- Gallery rendering and heading.
- Ten initial images and bounded next-page Load More behavior.
- Image dimensions and lazy-loading attributes.
- Accessible API failure message and Retry recovery.
- Desktop Chromium and mobile Chromium (390×844) layouts.

Keyboard focus behavior is covered by native MUI buttons and browser-visible controls, but no dedicated keyboard traversal assertion or automated contrast scanner has been added. Browser tests mock data and therefore do not certify real JSONPlaceholder availability or image CDN behavior.

## Data loading

JSONPlaceholder supports `_start` and `_limit`; it does not offer a single query that returns only the first photo from each even album. A 1,000-record bounded page contains 20 sequential albums (50 photos per album), enough for ten even-album gallery tiles. Load More intentionally requests the following page only when the current loaded set is exhausted, rather than refetching due to an ordinary state update.

This reduces initial data from 5,000 to 1,000 records (80% fewer source records). It is an implementation-backed record-count reduction; no network-byte claim is made. A controlled gallery API returning exactly the required images remains the preferred long-term solution.

## Validation

| Check | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run test:ci` | PASS — 4 Vitest regressions |
| `npm run build` | PASS — 340.39 kB JavaScript / 108.17 kB gzip |
| `npm run test:e2e` | PASS — 6 Chromium browser tests |
| `npm audit` | PASS — 0 vulnerabilities |
| `npm audit --omit=dev` | PASS — 0 vulnerabilities |

The Phase 2 dev and preview HTTP smoke checks remain valid for the Vite toolchain. Playwright starts a fresh production build and preview server for its browser run.

## Remaining issues and Phase 4

- Add keyboard-tab-order and contrast assertions, plus a real image-error visual treatment rather than hidden broken tiles.
- Add a controlled/paginated gallery backend or curated static data source; JSONPlaceholder is still an external development service.
- Add bundle analysis and consider reducing the 108.17 kB gzip MUI-driven JavaScript entry.
- Add real-network monitoring separately from deterministic tests.

**Production readiness:** improved: clean modern toolchain, zero audited vulnerabilities, unit coverage, real-browser desktop/mobile coverage, and bounded requests are verified. Release approval should still require the controlled data-source and accessibility/performance follow-ups above.
