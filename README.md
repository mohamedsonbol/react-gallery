# React Gallery

A small React 19/Vite static gallery. It displays 50 versioned local fixture records in pages of ten and has no runtime dependency on JSONPlaceholder or another external API.

## Requirements and local use

Use the Node and npm versions in `.nvmrc`:

```bash
nvm use
npm ci
npm run dev
```

Useful checks:

```bash
npm run lint
npm run test:ci
npm run build
npm run test:e2e
npm audit
npm audit --omit=dev
```

`npm run test:e2e` builds the production artifact and runs Playwright in Chromium. Install the browser once when needed with `npx playwright install --with-deps chromium`.

## Data and image behavior

`public/data/gallery.json` is the controlled, versioned source of gallery metadata. `src/data/galleryFixtures.js` requests that same-origin file and returns one 10-item slice at a time, up to 50 items. The static SVG image is local too. Consequently, JSONPlaceholder availability cannot affect production behavior.

If the local fixture request fails, the gallery announces an error and exposes Retry. Each image reserves a 1:1 space and is lazy-loaded after the first three; a failed image is replaced with an accessible “Image unavailable” tile rather than leaving a broken-image icon or shifting the grid.

For a future product that needs live, user-managed imagery, replace the fixture loader with a maintained, authenticated gallery API rather than restoring a public demo API. That change should define schema validation, pagination, ownership, CDN/image transformations, availability monitoring, and cache invalidation.

## Static deployment (Netlify)

`netlify.toml` configures Netlify to run `npm run build` and publish `dist/`. It sets immutable caching for Vite’s hashed `/assets/*` files, a five-minute cache for the editable gallery JSON, and a one-day cache for local images.

Deploy at the site root. The application deliberately uses root-relative static paths (`/data/gallery.json`, `/images/gallery-tile.svg`, `/favicon.ico`, and `/manifest.json`), so subpath hosting such as `example.com/gallery/` is unsupported unless `vite.config.js`, data URLs, and browser tests are changed together. There is no client-side router; a normal static 404 policy is sufficient.

Before publishing, use a clean checkout and run:

```bash
npm ci
npm run lint
npm run test:ci
npm run build
npm audit
npm audit --omit=dev
npx playwright install --with-deps chromium
npm run test:e2e
```

Upload only the generated `dist/` directory. Do not upload `.env` files, `node_modules`, source files, or test reports. No runtime environment variables or secrets are required by the current application.

After deployment, confirm HTTP 200 for `/`, `/data/gallery.json`, and `/images/gallery-tile.svg?image=1`, then verify the first ten tiles and Load More in the deployed browser.
