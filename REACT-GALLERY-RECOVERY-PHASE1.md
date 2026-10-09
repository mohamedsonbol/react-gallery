# React Gallery — Recovery Phase 1

**Date:** 2026-10-09  
**Branch:** `fix/recovery-phase-1`  
**Status:** Baseline recovered; not ready for Phase 2 deployment work until dependency security remediation is planned.

## Scope and verification

`REACT-GALLERY-AUDIT.md` was read first. Its central source finding was verified directly: `src/components/Album.js` used `useEffect(..., [limit, images])`, while the effect called `setImages`. A successful response therefore produced a new `images` array, reran the effect, and fetched again. `limit` also triggered an unnecessary request.

The existing UI and interaction are preserved: the app bar, three-breakpoint grid, initial 10 images, Load More increments of 10, and 50-image maximum remain unchanged.

## Environment recovery

| Check | Result |
| --- | --- |
| Initial runtime | Node 24.18.0 / npm 11.16.0 |
| Registry/proxy configuration | Registry `https://registry.npmjs.org/`; `proxy` and `https-proxy` null; no proxy environment variable found |
| First audit-time install | `npm ci --ignore-scripts` timed out while npm 11 retrieved supplemental metadata for the legacy v1 lockfile |
| Bounded retry | Node 22.23.1/npm 10.9.8; `npm ping --fetch-retries=1 --fetch-timeout=15000` returned PONG in 515 ms; bounded `npm ci` completed |
| Node 22 build | Blocked by `ERR_PACKAGE_PATH_NOT_EXPORTED` from legacy `postcss-safe-parser`/PostCSS during CRA 4 build |
| Compatible baseline | Node 14.21.3/npm 6.14.18, selected because it successfully runs this legacy CRA 4 tree |
| Reproducible install | `nvm use 14.21.3 && npm ci --ignore-scripts` completed: 1,975 packages in 11.081s |
| Lockfile | `package-lock.json` was neither deleted nor regenerated; `git diff -- package-lock.json` is empty |

The repository now contains `.nvmrc` (`14.21.3`) and `engines` metadata (`node: 14.x`, `npm: 6.x`). Use:

```bash
nvm use
npm ci
```

No unresolved network or registry blocker remains. The first timeout was transient while npm 11 attempted old-lockfile metadata fix-up. Node 22 is deliberately not the documented runtime because its production build fails with this unmodified CRA 4 dependency tree.

## Changes

- `src/components/Album.js`
  - Fetches on mount and explicit retry only, never when image state or display limit changes.
  - Uses `AbortController` plus an active-request guard for unmount and stale response safety.
  - Handles non-OK responses, network failures, loading state, error message, and retry.
  - Replaces repeated-array `reduce` work with a `Set` while preserving the first image from each even album.
  - Removes console logging.
- `src/components/Album.test.js`
  - Adds four regression tests: success/filtering, Load More no-refetch, failure/retry, and cleanup/stale response behavior.
- `package.json`
  - Adds `lint` and non-watch `test:ci` scripts and documents the verified engine range.
- `.nvmrc`
  - Pins the verified Node runtime.

No dependency was upgraded, removed, or added. This avoids an undocumented lockfile rewrite or a broad CRA/React migration during stabilization.

## Validation results

All commands below were run from the repository root with `nvm use --silent 14.21.3` unless otherwise noted.

| Command | Result |
| --- | --- |
| `npm ci --ignore-scripts` | PASS — installed lockfile tree, 1,975 packages |
| `npm run lint` | PASS |
| `npm run test:ci` | PASS — 1 suite, 4 tests |
| `npm run build` | PASS — optimized CRA production build completed |
| Local server smoke test | PASS — start server, `curl http://127.0.0.1:3000/` returned HTTP 200; verified title and root node; stopped server afterward |
| Browser/visual/responsive tests | NOT RUN — browser automation was not available in this session |

Build and start report an outdated `caniuse-lite` database. Updating it requires a deliberate dependency/lockfile refresh and is deferred with the dependency work below.

## Dependency security

The security review intentionally made **no automatic dependency changes**. `npm audit fix --force` was not used.

`npm audit --package-lock-only --omit=dev --json`, run with npm 10.9.8 to use the current audit API, reported the same counts before and after this Phase 1 source-only change:

| Scope | Low | Moderate | High | Critical | Total |
| --- | ---: | ---: | ---: | ---: | ---: |
| Before (audit baseline) | 6 | 119 | 63 | 22 | 210 |
| After (current lockfile) | 6 | 119 | 63 | 22 | 210 |

`--omit=dev` does not materially separate the reported set because the project declares test/build tooling under `dependencies`, not `devDependencies`. Direct vulnerable packages reported are `axios` (high, and unused by source), `react-scripts` (high), and `@testing-library/jest-dom` (moderate). The remaining critical findings are transitive, chiefly in the obsolete CRA 4/Babel/webpack/workbox ecosystem.

### Safe upgrade path (deferred)

1. Remove unused `axios` only after a dedicated lockfile review; the application uses native `fetch`.
2. Classify runtime versus developer/build dependencies and move tooling to `devDependencies` in a planned dependency PR.
3. Test an intentional `react-scripts` 5.0.1 upgrade in isolation, regenerate the lockfile, and retest Node compatibility. This is a major toolchain change and is not safe to bundle with the fetch-loop recovery.
4. Plan the longer-term migration away from unmaintained CRA 4 and Material UI 4, including React/tooling upgrade work.

## Remaining risks and next steps

- **P0 security:** 22 critical and 63 high audit findings remain; deployment remains blocked pending a dependency remediation plan.
- **External data:** the application still downloads the full public JSONPlaceholder photo collection and has no cache, schema validation, or controlled service boundary.
- **Browser coverage:** no browser automation was available; manually/with e2e tooling verify navigation, loaded images, retry, Load More, mobile breakpoints, keyboard focus, and assistive technology behavior.
- **Performance:** image lazy loading, dimensions/aspect-ratio reservation, responsive image sources, and bundle monitoring remain outside this focused phase.
- **Automation:** add CI that uses `nvm use`, `npm ci`, lint, test, and build before Phase 2 feature work.

## Phase 2 readiness

The project is ready for **Phase 2 stabilization and security planning**, not for production release. The local development and test baseline is now reproducible under the documented runtime, and the confirmed fetch-loop regression is covered. Dependency modernization and browser/e2e validation should be the next approved work.
