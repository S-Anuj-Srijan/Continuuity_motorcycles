# Continuity Motors

Astro + TypeScript website for the C-01 digital motorcycle concept. Public content is static HTML; Cloudflare Workers handles `/api/session`, `/api/events`, `/api/experiment` and `/api/lead`, with D1 for sessions, events, summaries and registrations. No React runtime or external database is required.

## Local setup

Use Node 22.19+ and npm. A project-local Node 22 development dependency lets npm scripts run on the original workstation, which has Node 22.14.

```sh
npm ci
npm run build
npm run db:local
npm run preview
```

Open `http://localhost:8787` for the full Worker + static site + local D1. For hot reload, keep preview running and start `npm run dev` in a second terminal. Astro proxies `/api` to port 8787.

Copy `.env.example` to `.env` for public build settings. Without keys, GA4/Clarity stay disabled and early access displays an unavailable state rather than accepting an unprotected registration. Worker secrets belong in ignored `.dev.vars`, not `PUBLIC_*` variables.

```sh
npm run check
npm test
npm run test:e2e
```

Browser tests require a build and local migrations. If necessary, install their browser with `npx playwright install chromium`. Screenshots go to ignored `artifacts/`. There is no separate linter; strict Astro/TypeScript checks cover application and Worker code.

## Cloudflare deployment

Uses [Workers Static Assets](https://developers.cloudflare.com/workers/static-assets/), with Worker-first routing only for `/api/*`. Unknown public paths return the branded HTTP 404.

```sh
npx wrangler login
npx wrangler d1 create continuity-motors
```

Replace the placeholder `database_id` in `wrangler.jsonc` with the returned UUID; keep binding `DB`. Set `PUBLIC_SITE_URL` to the final HTTPS origin, create a Turnstile widget restricted to that domain, and supply the public IDs below.

```sh
npx wrangler secret put TURNSTILE_SECRET_KEY
npm run db:remote
npm run check
npm test
npm run deploy
```

Attach the custom domain in Cloudflare. For Workers Builds, use `npm ci` as installation and `npm run deploy` as deployment; configure public build variables there too. The deploy script rejects placeholder D1 IDs and `example.com` canonicals. It does not provision accounts or resolve missing legal details. No production deployment has been performed.

| Setting | Purpose |
| --- | --- |
| `PUBLIC_SITE_URL` | Canonical HTTPS origin, sitemap and structured data |
| `PUBLIC_TURNSTILE_SITE_KEY` | Public widget key; missing means form disabled |
| `TURNSTILE_SECRET_KEY` | Worker secret; required before saving leads |
| `TURNSTILE_HOSTNAME` | Optional hostname override; defaults to request hostname |
| `PUBLIC_GA_MEASUREMENT_ID` | Optional GA4 ID, e.g. `G-…` |
| `PUBLIC_CLARITY_PROJECT_ID` | Optional Clarity project ID |
| `DB` | D1 binding |
| `API_LIMITER`, `LEAD_LIMITER` | Wrangler rate-limit bindings, 60 API requests/minute and 5 lead attempts/minute per edge IP key |

## Forms, privacy and analytics

Turnstile loads as the form approaches the viewport. The server calls [Siteverify](https://developers.cloudflare.com/turnstile/get-started/server-side-validation/) and checks success, hostname and `early_access` action before inserting a lead. Malformed inputs, cross-origin POSTs, failed tokens, missing secrets and rate-limit failures reject the request. Lead and conversion inserts are transactional. Normalized email is unique; duplicates receive the same success response without a second conversion or membership disclosure.

Optional analytics default to denied worldwide. Necessary browser-session cookies keep the visual assignment and form attribution stable. D1 behaviour events, a persistent random visitor UUID, GA4 and Clarity require analytics opt-in. **Privacy preferences** in the footer reopens controls. Revocation clears the visitor ID, updates D1 consent, signals third-party tools and reloads to stop their scripts.

Email stays in `leads`. Generic events reject arbitrary keys, free-text metadata, query strings and unknown page/section IDs. There is no keystroke, mouse-coordinate, fingerprint or raw-IP-profile collection. IPs are ephemeral rate-limit keys only; edge rate limits are not a global transactional quota. Campaign values permit short tokens only; never put personal information in campaign names or URLs.

In GA4, add custom dimensions `product_id`, `experiment_id`, `variant_id`, `entry_product`; mark `generate_lead` as a key event. Page views and `view_item`, `select_item`, `generate_lead` provide the high-level funnel; D1 conversions remain authoritative. Configure Clarity and verify its explicit form masking and [consent signals](https://learn.microsoft.com/en-us/clarity/setup-and-installation/consent-management) on the final domain before launch.

## Experiment operation

`c01_direction_v1`, version `1`, allocates neutral arrivals 50/50 with cryptographic browser randomness. Direct product landings use `direct_campaign`; keep these separate in analysis. Assignment controls homepage poster, card order and engineering teaser. It persists through reloads/navigation for the browser session. An HttpOnly cookie authorizes the API; a non-secret session cookie exposes only the visual variant to prevent a new-tab flash. Browser session restoration can retain session cookies; this intentionally uses the browser-session boundary rather than an inactivity timeout.

Both products share one template. Version meaningful content/image changes in the experiment seed and Worker; do not silently change one direction mid-comparison.

Engagement needs a visible tab, activity within 30 seconds and half the section or viewport (whichever is smaller) visible. The viewport denominator lets large boards qualify on mobile. Summaries flush every 15 seconds and on hide/exit. UUID deduplication prevents retried batches from inflating rollups. Total active product time is measured separately from overlapping section time.

Exposure order is first-observed order. Only actual product views update `last_product_id`; card impressions cannot overwrite it. Switch-to and switch-back derive from the product-page sequence. Explicit switch controls record switch-away. `client_seq` supports raw path reconstruction.

Append `?test=1` on the first URL to mark internal traffic for the session. Clear session cookies/storage for a fresh session. Exclude test traffic and separate direct campaigns:

```sql
SELECT sp.product_id, COUNT(*) AS exposed_sessions,
  SUM(sp.product_active_ms >= 15000 AND sp.max_scroll_pct >= 50) AS qualified_views,
  SUM(sp.lead_submitted) AS leads,
  AVG(sp.engineering_active_ms) AS mean_engineering_ms,
  SUM(sp.returned_after_switch) AS returning_sessions
FROM session_product_summary sp JOIN sessions s USING (session_id)
WHERE s.is_test_traffic = 0 AND s.assignment_method = 'randomized'
  AND s.analytics_consent = 'accepted'
GROUP BY sp.product_id;
```

Keep attention, technical interest, switching and conversion separate. Qualification thresholds are version 1 analysis definitions.

## Content and assets

- Original specifications remain unchanged in `website_struct/`.
- Build imports all 16 public pages through `scripts/content.mjs` into `src/content/pages.json`. Update approved source copy and rebuild. Internal instructions are not displayed as page copy.
- `PageContent.astro` preserves product parity; `BaseLayout.astro` owns navigation, footer, SEO and shared dialogs. Other reusable components provide product cards, image boards, FAQs, status and forms.
- `src/styles/tokens.css` copies the supplied palette verbatim. `global.css` provides responsive layout, typography and accessibility states.
- All nine source images were present and remain in `assets/`. `scripts/assets.mjs` reads the authoritative map, emits `src/content/assets.json`, and creates `public/assets/brand/` and `public/assets/products/c01/{camel,messerschmitt}/`.
- Run `npm run prepare:assets` after asset changes. Existing derivatives are cached: remove only the matching derivatives or version the filenames to regenerate a replaced source. AVIF/WebP widths stop at original resolution (896–1536 px); higher widths need higher-resolution originals. Only the assigned homepage hero loads eagerly.
- Add Journal articles in the master's existing `JOURNAL ARTICLE … / URL:` format with title, description, H1 and Opening. Routes, index and sitemap are generated. Article paragraphs without final punctuation become H2 headings; inspect the result. Extend `validPath` in `worker/validation.ts` for a new URL. Unapproved publication dates and personal author biographies are omitted.
- Update the Development table and date in the master first when facts change; then reconcile product copy, FAQs, Journal and structured data. Never promote artwork numbers to verified specifications.

## Architecture and schema notes

`0001_initial.sql` is a byte-for-byte copy of the supplied schema. `0002_asset_paths.sql` aligns seed paths and alt text with the authoritative asset map. `0003_event_rollups.sql` adds atomic, retry-safe SQLite triggers; it removes no tables or columns. Raw events remain append-oriented; only server conversion inserts set `lead_submitted`.

The API lives in `worker/` rather than Astro routes because public HTML is fully pre-rendered. This directly implements Workers + Static Assets without a rendering adapter. The full-screen viewer uses native dialogs, zoom, desktop pan and touch controls. Stable IDs and reusable boards support future hotspots; no fabricated carousel or hotspot overlay is added.

## Launch items requiring owner input

- Final domain, Cloudflare account/database ID, Turnstile keys and optional GA4/Clarity IDs.
- Contact/privacy emails, legal entity, required address, retention periods, governing law and final Privacy/Terms review. Drafts are labelled; unresolved bracket placeholders are not published.
- Official social links, naming/trademark clearance, approved positioning and subscription scope. No fabricated contact addresses, biographies, partners or social profiles are present.
- Live-domain Turnstile/analytics acceptance tests, plus Safari/iOS/Android hardware checks. Automated Chromium desktop/mobile checks do not replace these.
- A process for unsubscribe/deletion requests and retention enforcement before sending updates. This site stores registrations; it does not send email or integrate a mailing provider.
