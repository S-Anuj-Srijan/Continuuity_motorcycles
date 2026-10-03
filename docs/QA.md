# Verification — 3 October 2026

- `npm run check`: passed, zero Astro/TypeScript errors, warnings or hints.
- `npm test`: seven API/database tests passed, including assignment persistence, direct campaign classification, event retry idempotency, exposure order, switch-back, consent rejection, input/PII rejection, rate limiting, Turnstile verification, duplicate lead handling and transactional rollback.
- `npm run test:e2e`: 16 Chromium tests passed across desktop and Pixel 7 emulation. Covers all public routes, canonical path normalization, metadata, headings, no horizontal overflow, product parity, viewer zoom/keyboard/focus restoration, mobile menu, consent/revocation, unavailable APIs, missing Turnstile keys, both assigned heroes, real Worker event delivery and 404 status.
- `npm run build`: 16 required public pages plus 404; robots and sitemap generated.
- `npm run db:local`: all three migrations applied to local Cloudflare D1.
- `wrangler deploy --dry-run`: passed; Worker and static assets package correctly. No deployment was made.
- `npm audit`: zero vulnerabilities, including development dependencies.
- `git diff --check`: passed.
- Initial migration hash matches the supplied SQL exactly. All original reference files and images are preserved.
- All nine supplied asset identities are represented. Eight product images have responsive AVIF/WebP derivatives; the logo remains PNG. Source resolution limits derivatives to 896–1536 px rather than upscaling.
- Desktop and mobile screenshots were visually reviewed. Full-page captures explicitly wait for lazy images to decode.

## Performance observations

The bundle is approximately 13 KB of minified application JavaScript (about 5 KB transferred compressed). Local synthetic checks used 150 ms latency and 1.6 Mbps download bandwidth. One desktop sample recorded LCP 4.79 s and CLS 0.0015; one mobile sample recorded LCP 0.84 s and CLS 0. These are local, single-run observations with different randomized posters, not production field measurements or a claim that Core Web Vitals pass. Validate the deployed domain with repeated runs and real-user data before interpreting experiment differences.

Generated screenshots, traces and raw observations are under ignored `artifacts/` and `test-results/`.

## Remaining external validation

Real Turnstile tokens, GA4 reporting and Clarity recordings require the owner's final domain and keys. API tests mock only the external Siteverify response while executing the actual validation and transactional SQL. Safari, iOS hardware and Android hardware were not available for this verification. Final legal review, contact details, retention policy and subscription operations remain owner launch prerequisites documented in the README.
