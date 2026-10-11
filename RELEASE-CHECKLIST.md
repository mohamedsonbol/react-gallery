# React Gallery v1.0.0 Release Checklist

**Release candidate branch:** `feat/phase-4`
**Validation date:** 2026-10-09
**Recommendation:** **GO, conditional on root-path static hosting and the manual release steps below.**

## Completed checks

| Check | Result |
| --- | --- |
| Git state | `feat/phase-4` is 2 commits ahead of `main`, 0 behind; Phase 4 changes are intentionally unstaged. |
| Clean install | `npm ci` passed (249 packages added). |
| Lint | `npm run lint` passed. |
| Unit tests | `npm run test:ci` passed: 1 file, 5 tests. |
| Production build | `npm run build` passed. Output: `dist/`; JS is 340.34 kB / 108.13 kB gzip. |
| Browser tests | `npm run test:e2e` passed: 10 tests across Chromium desktop and 390px mobile. This covers keyboard focus, axe scan, loading/error/retry, 10-image pagination, image fallback, and mobile overflow. |
| Security audit | `npm audit` passed: 0 vulnerabilities. |
| Production-only audit | `npm audit --omit=dev` passed: 0 vulnerabilities. |
| Preview smoke test | `vite preview` served `/`, `/data/gallery.json`, and `/images/gallery-tile.svg?image=1` with HTTP 200. |
| Secrets and artifacts | No secrets were detected in source/configuration. No build output, test reports, or generated files are staged or tracked. |
| CI parity | GitHub Actions runs clean install, lint, unit tests, build, both audits, Chromium installation, and browser tests. |

## Deployment requirements

- Deploy the contents of `dist/` to the web-server document root.
- Host the application at the site root (`/`). `vite.config.js` uses Vite's default base (`/`), and the application references `/data/gallery.json`, `/images/gallery-tile.svg`, `/favicon.ico`, and `/manifest.json` with root-relative paths.
- No runtime environment variables or secrets are required. The application contains no Vite environment-variable reads.
- No client-side router is present, so no SPA history fallback is required for application routes. A normal static-host 404 policy is sufficient.
- Do not deploy beneath a path prefix such as `/gallery/` without a separately tested base-path change; the current root-relative asset paths would not work there.

## Manual deployment procedure

```bash
nvm use
npm ci
npm run lint
npm run test:ci
npm run build
npm audit
npm audit --omit=dev
npx playwright install --with-deps chromium
npm run test:e2e
# Upload the contents of dist/ to the hosting provider's site root.
```

After upload, verify HTTP 200 for `/`, `/data/gallery.json`, and `/images/gallery-tile.svg?image=1`; verify ten gallery images load, Load More shows twenty, and an intentionally blocked image is replaced by the accessible "Image unavailable" placeholder.

## Rollback procedure

1. Keep the previously deployed static artifact/version available in the hosting provider.
2. Repoint the site to that prior artifact (or restore the prior release in the provider's release history).
3. Purge the CDN/cache for `/`, `/assets/*`, `/data/gallery.json`, and `/images/*`.
4. Verify the restored root page and static assets return HTTP 200.
5. Record the rollback reason and preserve the failed release artifact for investigation; do not rewrite Git history.

## Remaining risks

- The production JavaScript entry is 108.13 kB gzip, primarily from MUI. Bundle monitoring and reduction are deferred.
- The gallery fixture is static and intentionally contains 50 curated records. Updating gallery content requires rebuilding/redeploying the static site.
- Browser coverage is Chromium desktop/mobile. Other browsers and deployed-host/CDN behavior still require post-deployment smoke checks.
- Root-path hosting is a release requirement; subpath hosting is not supported by this candidate.
