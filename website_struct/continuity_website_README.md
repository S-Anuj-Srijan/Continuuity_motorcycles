# Continuity Motors — Experimental Product Website

> **Purpose:** A premium, believable product website for Continuity Motors that also functions as a clean product-validation instrument.  
> **Primary products:** C-01 Camel and C-01 Messerschmitt (these names are treated as internal/public working names and can be changed without changing the analytics model).  
> **Hosting:** Cloudflare  
> **Analytics:** First-party experiment events + Google Analytics 4 + Microsoft Clarity  
> **Database:** Cloudflare D1  
> **Optional at scale:** Cloudflare Workers Analytics Engine  
> **Anti-spam:** Cloudflare Turnstile

---

## 1. What this website is supposed to do

This website has two jobs and both matter equally:

1. **Look like a serious premium motorcycle company.**
2. **Generate trustworthy experiment data about which product direction creates stronger interest.**

It must not look like a survey, market-research landing page, or student project. The visitor should experience a coherent automotive brand first. Measurement should happen invisibly in the background.

The website should answer these questions with data:

- Which C-01 direction earns more attention?
- Which product gets deeper technical exploration?
- Which product gets more repeat viewing?
- Which product creates stronger high-intent actions?
- Which visual assets create the most engagement?
- Which traffic sources produce curiosity versus actual intent?
- Does first exposure order affect preference?
- Does one product attract more mobile engagement and the other more desktop engagement?
- Which sections cause people to continue versus abandon the page?
- How much of the product page do people actually consume?
- Do people switch from one product to the other and then switch back?
- Which product converts better to an early-access lead?
- Which product is shared more often?
- Which product causes visitors to inspect engineering rather than only look at styling?

The experiment should favor **behavioral evidence** over asking visitors what they think.

---

# 2. Reference websites and what to borrow from them

Do not copy these sites visually. Use them to understand successful information architecture and interaction patterns.

### Maeving
Reference: https://maeving.com/en-us/pages/maeving-rm1-electric-motorcycle

Useful patterns:
- Strong full-width product imagery.
- Important EV numbers visible early.
- Product story is broken into simple feature modules.
- Heritage styling and electric technology are presented together rather than as opposites.
- Primary actions such as configure/test ride are obvious without taking over the page.

### LiveWire
Reference: https://www.livewire.com/products/s2-motorcycles

Useful patterns:
- Treats the electric platform itself as a product story.
- Gives hard numbers such as range, charge time, speed and energy in a compact format.
- Provides family/variant navigation without making the page feel like a comparison spreadsheet.
- Makes switching between models easy.

### Triumph
Reference: https://www.triumphmotorcycles.com/motorcycles/classic/speed-400

Useful patterns:
- Strong editorial product narrative.
- Alternates emotion, design, technical detail and numbers.
- Uses repeated conversion opportunities without making every section a CTA.
- Separates “style”, “character”, “quality”, specifications and final actions.

### Arc
Reference: https://www.arcvehicle.com/

Useful patterns:
- Very sparse luxury presentation.
- Large imagery and controlled typography.
- Engineering is presented as part of the identity, not hidden in a specification table.
- Page has confidence because it avoids filling every empty area with content.

### Design principle for Continuity

Continuity should sit roughly at the intersection of:

**Arc’s restraint + Maeving’s heritage/electric story + LiveWire’s electric-platform clarity + Triumph’s product-page structure.**

The website should not look like a generic EV startup. The visual world already established in the supplied assets is stronger than that: dark aviation, engineering, British/European heritage, brushed metal, racing green, leather and exposed power electronics.

---

# 3. Brand and visual direction

## 3.1 Visual personality

Use the supplied assets as the source of truth.

The site should feel:

- engineered
- cinematic
- restrained
- historical without looking nostalgic
- premium without looking ornamental
- technical without looking like a specification sheet
- electric without using neon-blue “EV” clichés

### Core visual palette

Suggested starting tokens derived from the current artwork:

```css
:root {
  --ink: #0b0b0b;
  --ink-soft: #151515;
  --ivory: #e7dfd3;
  --paper: #d8d0c4;
  --racing-green: #102a24;
  --heritage-brown: #4a3126;
  --aluminium: #b7b5ae;
  --copper: #c96328;
  --muted: #8f8a82;
}
```

Do not use these as rigid brand standards yet; refine after viewing the site on several displays.

## 3.2 Typography

Use a clean open-source grotesk rather than relying on a commercial font without a license.

Good options:
- Manrope
- Inter
- IBM Plex Sans
- Geist

Recommended approach:
- headings: light/regular weight, generous letter spacing
- body: regular weight, high readability
- labels: uppercase, small, tracked
- numbers/specs: tabular numerals where available

The current image language uses a lot of air and letter spacing. Keep that.

## 3.3 Motion

Motion should make the product feel expensive, not make the page feel interactive for its own sake.

Use:
- 250–500 ms fades
- image crossfades
- gentle image scaling on hover
- restrained parallax on desktop only
- masked section reveals
- smooth but not slow page transitions

Avoid:
- cursor followers
- aggressive horizontal scrolling
- excessive text animation
- spinning 3D effects unless there is a real 3D model
- scroll-jacking
- autoplay audio
- animation that delays access to information

Respect `prefers-reduced-motion`.

---

# 4. Information architecture

```text
/
├── /c-01
│   ├── /c-01/camel
│   └── /c-01/messerschmitt
├── /engineering
├── /about
├── /early-access
├── /privacy
└── /legal
```

For the experiment, all traffic should ultimately resolve to a trackable landing context.

Recommended campaign URLs:

```text
/?utm_source=reddit&utm_medium=organic&utm_campaign=c01_validation
/?utm_source=instagram&utm_medium=organic&utm_campaign=c01_validation
/c-01/camel?utm_source=reddit&utm_medium=organic&utm_campaign=camel_post
/c-01/messerschmitt?utm_source=reddit&utm_medium=organic&utm_campaign=messerschmitt_post
```

Do not create different page structures for different traffic sources. That would make the experiment harder to interpret.

---

# 5. Global navigation

Desktop:

```text
[Continuity logo]        C-01   Engineering   About        Early Access
```

Mobile:

```text
[Continuity logo]                                      [Menu]
```

Rules:
- transparent over hero
- solid dark background after scrolling
- no giant mega menu
- current product should always be reachable in one click
- early-access CTA should remain visible but visually quieter than the product itself

---

# 6. Homepage layout

The homepage is the brand introduction and the neutral entry point to the experiment.

## Section 01 — Full-screen hero

**Goal:** Establish the company before explaining it.

Content:
- logo or wordmark
- “C-01”
- “Electric Motorcycle”
- one short line only
- CTA: `Explore C-01`

Visual:
- use the strongest cinematic hangar poster as a full-bleed image
- do not put a large paragraph over it
- use a gradient only if required for legibility

Experiment:
- either randomly rotate Camel/Messerschmitt hero at session start, or
- use a neutral C-01 hero if one is created later

Track:
- `hero_impression`
- `hero_active_ms`
- `hero_cta_click`
- shown product/asset ID

## Section 02 — Brand thesis

Suggested structure:

```text
SAME SOUL.
CLEANER FUTURE.

A motorcycle should still feel mechanical,
intentional and alive — even when the engine changes.
```

Keep this section minimal.

Track:
- `section_view`
- active time

## Section 03 — The two C-01 directions

Two large editorial cards.

```text
C-01 CAMEL                        C-01 MESSERSCHMITT
[large side image]                [large side image]
Explore →                         Explore →
```

On desktop the cards can occupy 50/50 width.
On mobile they should stack.

Important:
- randomize left/right order per session during comparison experiments
- store the exposure order
- do not always give the same model first position

Track:
- product card impression
- card active time
- card hover on pointer devices
- card click
- exposure order
- which product was clicked first

## Section 04 — Engineering as form

Use the component-analysis imagery.

This is the bridge between the emotional design story and the engineering story.

Copy style:
- 1 heading
- 1 short paragraph
- one CTA to `/engineering`

No oversized spec table here.

## Section 05 — Product numbers

Only show engineering claims that are validated.

Recommended layout:

```text
POWER          BATTERY          ARCHITECTURE        CHARGING
— kW           — kWh            Electric            — kW
```

Until engineering values are approved, render `TBA` or omit the metric.  
Do **not** publish numbers simply because they appear in concept artwork.

## Section 06 — Final brand image

Full-bleed image from the opposite product direction from the hero.

Purpose:
- gives both products exposure
- prevents the homepage from becoming one-sided

## Section 07 — Early access

Minimal.

```text
BE THERE BEFORE THE FIRST RIDE.

[ Email address                         ] [Join]
```

No long form.

Optional second field only after submission:
- country/region
- riding experience category

Do not ask for phone number initially.

---

# 7. Product page template

Both product pages should use the same structural template. This is essential for clean comparison.

If one page has more content or a stronger CTA than the other, conversion differences become less trustworthy.

---

## Product section 01 — Hero

Use the clean side-profile composite or cinematic poster.

Content:

```text
CONTINUITY
C-01

[product direction name]

Electric motorcycle
```

Primary CTA:
`Request Early Access`

Secondary:
`Explore the machine`

Track:
- `view_item` / `product_view`
- hero visibility
- hero active time
- CTA clicks
- scroll-start latency

---

## Product section 02 — The silhouette

Use the large side-profile asset.

Layout:
- large image
- 2–3 lines of narrative copy
- restrained technical caption

Purpose:
Measure whether the core motorcycle form itself carries attention.

Track:
- section visibility
- active time
- image zoom/open
- image hover/touch
- exit after section

---

## Product section 03 — Key numbers

Four compact product facts.

Example structure only:

```text
BATTERY          PEAK POWER         CHARGE          DRIVE
TBA              TBA                TBA             Single speed
```

The values in the concept-art annotations should remain **provisional** until deliberately approved.

---

## Product section 04 — Visible engineering

Use:
- `componend_analysis_camle.png` for Camel
- `messerschmidt_componend_analysis.png` for Messerschmitt

Desktop:
- full-width image
- numbered or hoverable hotspots if the artwork resolution supports it

Mobile:
- image opens in a full-screen pan/zoom viewer
- list engineering notes underneath

Possible hotspot concepts:
- battery pack
- motor
- inverter
- control unit
- onboard charger
- DC/DC converter
- power electronics

Track:
- diagram visible time
- hotspot opens
- hotspot IDs
- pan/zoom usage
- technical-section completion
- technical-to-CTA transition

This is a particularly valuable signal because it separates “the bike looks cool” from “I am genuinely inspecting the product.”

---

## Product section 05 — Every angle

Use:
- `camel_different_views.png`
- `messerschmidt_diferent_views.png`

Do **not** shrink this into a tiny gallery tile.

Recommended:
- edge-to-edge image
- click/tap opens full-screen viewer
- desktop may use a magnifier or pan
- mobile uses pinch/zoom

Track:
- image open
- time in viewer
- zoom
- close
- section active time

---

## Product section 06 — Details

Use the detail panels already contained in the concept sheets.

If individual crops are created later, convert the section into a horizontal/stacked editorial sequence:

```text
Headlight
Tank
Power electronics
Motor
Tail
Cockpit
```

Each detail should have one short sentence, not a paragraph.

Track:
- detail card impression
- detail card interaction
- detail ID
- time per detail

---

## Product section 07 — In its world

Use the cinematic hangar poster:
- Camel: `camel_poster.png`
- Messerschmitt: `messersmidt_poster.png`

This should be visually dominant and mostly free of UI.

Track:
- section visible time
- share from image
- full-screen open

---

## Product section 08 — Compare directions

Quiet switcher:

```text
C-01
[ Camel ]       [ Messerschmitt ]
```

Show one large image of the alternate product and a link.

Do not present a giant comparison table unless engineering specifications genuinely differ.

Track:
- `variant_switch`
- source product
- destination product
- switch timestamp
- number of switches
- whether visitor switches back
- dwell before switching
- dwell after switching

This data is one of the strongest signals in the entire experiment.

---

## Product section 09 — Early access

Repeat the lead CTA at the end.

Suggested copy:

```text
FOLLOW THE C-01 TO PRODUCTION.

Get development updates, first-access announcements
and future ride opportunities.

[ email ] [ Join early access ]
```

Track:
- form impression
- form focus
- form start
- submit attempt
- validation error
- successful lead
- product at conversion
- first product seen
- last product seen
- number of product switches before conversion

---

# 8. Engineering page

The engineering page should prove that Continuity is not only a mood board.

Structure:

1. Hero: `Engineering should be visible.`
2. C-01 architecture overview.
3. Battery architecture.
4. Motor and reduction drive.
5. Power electronics.
6. Control and rider interface.
7. Packaging philosophy.
8. Development status/disclaimer.
9. Early-access CTA.

Important:
- if the product is still conceptual, label specifications as **design targets**, **concept specifications**, or **under development**
- do not imply homologation, production readiness or tested performance unless true

Track:
- which product the visitor came from
- technical modules opened
- total engineering dwell
- return-to-product action
- lead conversion after engineering page

---

# 9. About page

Do not overbuild this at the experiment stage.

Structure:
- brand idea
- why Continuity exists
- design philosophy
- what is currently being developed
- contact / early access

The page should increase credibility, not invent company history.

---

# 10. Asset structure

Rename assets once and keep stable IDs forever. Filenames should not contain typos or temporary labels.

Recommended structure:

```text
/public
└── assets
    ├── brand
    │   └── continuity-logo.png
    │
    └── products
        └── c01
            ├── camel
            │   ├── hero-side.png
            │   ├── views-board.png
            │   ├── poster-hangar.png
            │   └── engineering-board.png
            │
            └── messerschmitt
                ├── hero-side.png
                ├── views-board.png
                ├── poster-hangar.png
                └── engineering-board.png
```

Current file mapping:

| Stable asset ID | Current supplied file |
|---|---|
| `brand_logo_primary` | `logo.png` |
| `camel_hero_side` | `C01-camel.png` |
| `camel_views_board` | `camel_different_views.png` |
| `camel_poster_hangar` | `camel_poster.png` |
| `camel_engineering_board` | `componend_analysis_camle.png` |
| `messerschmitt_hero_side` | `c01-messerschmidt.png` |
| `messerschmitt_engineering_board` | `messerschmidt_componend_analysis.png` |
| `messerschmitt_views_board` | `messerschmidt_diferent_views.png` |
| `messerschmitt_poster_hangar` | `messersmidt_poster.png` |

Use **asset IDs**, not file names, in analytics.

---

# 11. Front-end technical stack

Recommended MVP:

```text
Astro
TypeScript
CSS / CSS Modules
small React islands only where interaction requires them
Cloudflare Workers deployment
Cloudflare D1
Cloudflare Turnstile
GA4
Microsoft Clarity
```

Why Astro:
- mostly static editorial site
- excellent fit for image-heavy product pages
- very little client JavaScript required
- allows interactive islands for gallery, compare switcher and lead form
- easy to host on Cloudflare

Do not build the entire site as a heavy client-side React SPA unless there is a real need.

---

# 12. Cloudflare architecture

```text
Browser
   |
   v
Cloudflare Edge
   |
   +---- static HTML/CSS/JS/images
   |
   +---- /api/events ----------> Worker ----------> D1
   |
   +---- /api/session ---------> Worker ----------> D1
   |
   +---- /api/lead ------------> Worker ----------> D1
   |                                  |
   |                                  +--> Turnstile verification
   |
   +---- optional R2 for future large video/master media
```

For the initial experiment, high-resolution web derivatives can live as static assets.

Use R2 later for:
- large video
- original master assets
- downloadable press packs
- very large media libraries

---

# 13. Analytics architecture — what each tool is responsible for

Do not make GA4, Clarity and D1 all do the same job.

## Layer A — D1 = experiment source of truth

D1 stores:
- sessions
- product exposures
- experiment assignment
- meaningful interaction events
- product switches
- CTA actions
- leads/conversions
- session-product summaries

This is where the experiment should be analyzed.

## Layer B — GA4 = acquisition and funnel analytics

GA4 is for:
- traffic source / campaign
- page views
- landing pages
- device and browser breakdown
- cross-page funnels
- high-level engagement
- product views
- lead conversion
- campaign comparisons

GA4 should not become the only source of experiment data.

## Layer C — Microsoft Clarity = qualitative behavior

Clarity is for:
- recordings
- heatmaps
- click maps
- scroll maps
- rage clicks
- dead clicks
- viewport behavior
- qualitative inspection of why a page performs the way it does

Do **not** duplicate raw mouse movement into D1.

## Layer D — Cloudflare Web Analytics = performance sanity check

Optional but useful:
- visits
- page views
- page-load performance
- Core Web Vitals

It is useful for checking whether one page loses users simply because it loads slower.

---

# 14. Identity model

Never use email address as an analytics identifier.

Generate:

```text
visitor_id   = random UUID stored first-party when allowed
session_id   = random UUID per session
event_id     = random UUID per event
```

Also record:

```text
client_seq = 1,2,3,4...
```

This allows events arriving out of order to be reconstructed.

Recommended session boundary:
- new session after 30 minutes inactivity, or
- new browser session

Keep a consistent rule.

For visitors who decline analytics consent:
- do not create a persistent cross-session visitor ID
- a short-lived session ID may still be used for operational/session-level functionality
- do not send disallowed analytics signals

---

# 15. Experiment assignment

Create an experiment:

```text
experiment_id: c01_direction_v1
```

Variants:

```text
camel
messerschmitt
```

For neutral traffic:

```text
50% -> Camel first
50% -> Messerschmitt first
```

Persist assignment for the session.

Store:

```text
experiment_id
variant_id
assignment_time
assignment_method
first_product_id
exposure_order
```

Do not re-randomize on each page load.

If a user enters a direct Camel or Messerschmitt campaign URL, mark:

```text
assignment_method = direct_campaign
```

Do not pretend that traffic was randomized.

That distinction is critical when interpreting Reddit/Instagram posts.

---

# 16. Event design

Use one shared event function:

```ts
track(eventName, payload)
```

Every event sent to the first-party API should inherit:

```json
{
  "event_id": "uuid",
  "event_name": "gallery_open",
  "occurred_at": "ISO-8601",
  "session_id": "uuid",
  "visitor_id": "uuid-or-null",
  "client_seq": 18,

  "experiment_id": "c01_direction_v1",
  "variant_id": "camel",

  "product_id": "c01_camel",
  "page_path": "/c-01/camel",
  "section_id": "every_angle",
  "element_id": "views_board",
  "asset_id": "camel_views_board",

  "elapsed_ms": 48742,
  "value_num": null,
  "value_text": null,

  "metadata": {}
}
```

Rules:
- canonical fields get columns in D1
- rarely used extra data goes into `metadata_json`
- no PII inside `metadata_json`
- event names use `snake_case`
- event names should be stable after launch

---

# 17. Core event taxonomy

| Event | Meaning | D1 | GA4 | Clarity |
|---|---|---:|---:|---:|
| `session_start` | first website interaction | yes | automatic/optional | automatic |
| `product_view` | meaningful product page exposure | yes | `view_item` | tag |
| `section_view` | section crosses visibility threshold | yes | selected only | automatic scroll + optional event |
| `section_engagement` | active time accumulated in a section | yes | no | no |
| `asset_open` | image/board opens full-screen | yes | custom | custom event |
| `asset_zoom` | user zooms a product image | yes | no | custom event |
| `gallery_next` | gallery image advances | yes | custom | custom event |
| `technical_hotspot_open` | engineering hotspot opened | yes | custom | custom event |
| `spec_expand` | specification group opened | yes | custom | custom event |
| `variant_switch` | user switches product direction | yes | custom | custom event |
| `share_click` | share interaction | yes | custom/recommended where appropriate | custom event |
| `cta_click` | high-intent CTA click | yes | custom | custom event |
| `lead_form_start` | email form interaction starts | yes | custom | custom event |
| `lead_form_error` | form validation/server error | yes | no | custom event |
| `lead_submit` | successful early-access submission | yes | `generate_lead` | custom event |
| `scroll_summary` | final max scroll depth | yes | selected checkpoints | Clarity already records |
| `session_summary` | end/timeout summary | yes | no | no |

Do not fire `section_view` repeatedly. Fire once per section per page view.

---

# 18. Section engagement measurement

Do not estimate interest from scroll position alone.

Use `IntersectionObserver` plus Page Visibility API.

A section becomes active when:
- at least 50% is visible
- tab is visible
- user has not been idle for an extended period

Accumulate active milliseconds client-side.

When:
- section exits
- page hides
- route changes
- session closes

send one summarized event:

```json
{
  "event_name": "section_engagement",
  "section_id": "visible_engineering",
  "value_num": 18342
}
```

This creates better data and dramatically fewer DB writes than logging every scroll event.

---

# 19. Product-specific data to calculate

Create a summary row for **every session × product**.

Fields:

```text
session_id
product_id
first_seen_at
last_seen_at
first_exposure_order
product_active_ms
hero_active_ms
silhouette_active_ms
engineering_active_ms
views_board_active_ms
detail_active_ms
poster_active_ms
max_scroll_pct
asset_opens
asset_zooms
technical_interactions
spec_expands
share_clicks
cta_clicks
lead_form_started
lead_submitted
switches_away
switches_to
returned_after_switch
```

This table is the fastest way to compare the two products without reading the raw event stream every time.

---

# 20. Metrics that actually matter

## Discovery

```text
Product View Rate
= product viewers / qualified sessions
```

## Qualified Product View

Recommended definition:

```text
product_active_ms >= 15,000
AND max_scroll_pct >= 50
```

Keep the threshold versioned. Do not change it silently mid-experiment.

## Deep Technical Interest

```text
technical_interaction_rate
= sessions with technical_hotspot_open OR engineering_active_ms >= threshold
  / product viewers
```

## Product Switch Rate

```text
switch_away_rate
= sessions that leave product A for product B
  / sessions exposed to product A
```

## Switch-Back Rate

A strong comparative signal:

```text
switch_back_rate
= sessions that see A -> B -> A
  / sessions that switch A -> B
```

Calculate the reverse direction separately.

## CTA Intent Rate

```text
cta_rate
= sessions with cta_click / qualified product viewers
```

## Lead Conversion

```text
lead_rate
= successful lead submissions / qualified product viewers
```

## Share Rate

```text
share_rate
= sessions with share_click / qualified product viewers
```

## Technical-to-Intent Rate

```text
technical_to_lead
= leads after technical interaction / sessions with technical interaction
```

This can reveal whether engineering content is actually increasing conviction.

---

# 21. Do not collapse everything into one score

Avoid a single arbitrary “winner score” as the primary result.

Keep these dimensions visible separately:

```text
Attention
Depth
Technical curiosity
Comparative preference
CTA intent
Lead conversion
Sharing
Return behavior
```

If an internal composite score is later created, document its weights and treat it as secondary.

---

# 22. D1 database model

The supplied `schema.sql` contains the implementation-ready schema.

Main tables:

```text
products
assets
experiments
experiment_variants
visitors
sessions
product_exposures
events
session_product_summary
leads
conversions
```

Why both `events` and `session_product_summary`?

- `events` preserves detailed raw experiment behavior.
- `session_product_summary` makes day-to-day analysis human-readable and cheap.

The event table is append-only.

Do not mutate historical events.

---

# 23. PII separation

Analytics data and contact data should not be mixed casually.

`events` must never contain:
- email
- phone
- name
- full postal address

The `leads` table may contain:
- email
- consent state
- created timestamp
- product context

Analytics tables should refer to the lead using:

```text
lead_id
```

not by copying email into every event.

If an email hash is needed for deduplication, use a server-side cryptographic hash and document why it exists.

---

# 24. Lead form

Minimum:

```text
email
analytics/marketing consent state where applicable
turnstile token
```

Server flow:

```text
POST /api/lead
    |
    +-- validate JSON
    +-- verify Turnstile
    +-- normalize email
    +-- rate-limit
    +-- deduplicate if required
    +-- insert lead
    +-- insert conversion
    +-- return success
```

Never trust the client to say Turnstile passed.

---

# 25. API routes

```text
POST /api/session
POST /api/events
POST /api/lead
GET  /api/experiment
```

## `/api/events`

Accept a batch:

```json
{
  "session_id": "uuid",
  "events": [
    {},
    {},
    {}
  ]
}
```

Recommended:
- maximum 25 events/request
- reject oversized payloads
- validate event names against an allowlist
- ignore unknown metadata fields or validate them explicitly
- use server timestamp in addition to client timestamp
- rate-limit abnormal traffic

Use `navigator.sendBeacon()` or `fetch(..., { keepalive: true })` for page-exit flushes.

---

# 26. Google Analytics 4 setup

GA4 should receive only the events useful in GA reporting.

Recommended mapping:

### Product page view

```js
gtag("event", "view_item", {
  currency: "INR",
  value: 0,
  items: [{
    item_id: "c01_camel",
    item_name: "C-01 Camel",
    item_category: "Electric Motorcycle"
  }]
});
```

Do not fabricate a price just to populate GA4.

### Product selection

```js
gtag("event", "select_item", {
  item_list_name: "C-01 Directions",
  items: [{
    item_id: "c01_messerschmitt",
    item_name: "C-01 Messerschmitt"
  }]
});
```

### Lead

```js
gtag("event", "generate_lead", {
  product_id: "c01_camel",
  experiment_id: "c01_direction_v1"
});
```

Useful custom dimensions:
- `product_id`
- `experiment_id`
- `variant_id`
- `entry_product`
- `section_id` only if genuinely needed in GA reports

Do not mirror every D1 field into GA4.

UTM fields should remain the primary acquisition dimensions.

---

# 27. Microsoft Clarity setup

Clarity is the visual debugging layer.

Set custom tags after experiment/product assignment:

```js
window.clarity?.("set", "experiment_id", "c01_direction_v1");
window.clarity?.("set", "variant_id", "camel");
window.clarity?.("set", "product_id", "c01_camel");
window.clarity?.("set", "entry_source", "reddit");
```

Send high-value custom events:

```js
window.clarity?.("event", "variant_switch");
window.clarity?.("event", "technical_hotspot_open");
window.clarity?.("event", "asset_open");
window.clarity?.("event", "cta_click");
window.clarity?.("event", "lead_submit");
```

Do not send email addresses, names or other direct identifiers to Clarity.

If using Clarity’s custom identification features, use an internal non-PII session/visitor identifier and only where the consent/privacy model allows it.

---

# 28. Consent and privacy

Do not load analytics blindly.

Recommended consent categories:

```text
Necessary
Analytics
Marketing (only if added later)
```

Necessary:
- security
- Turnstile
- session operation required to serve the experience

Analytics:
- GA4
- Clarity where consent is required/selected
- persistent analytical visitor ID

Implementation rule:
- default analytics state to denied where required by applicable law/traffic geography
- update GA/Clarity after consent
- store the visitor's consent choice
- provide a privacy page explaining each analytics layer

Clarity currently requires valid consent signals for full functionality for visitors in the EEA, UK and Switzerland. Google likewise provides Consent Mode so Google tags can respect the user’s consent state.

Do not treat this README as legal advice; the final production privacy configuration should match where the site is marketed and applicable law.

---

# 29. Clarity masking

Any form with contact information should be masked.

Examples:
- email field
- optional name field
- any free-text input

Do not rely only on defaults; explicitly verify recordings before launch.

Use Clarity masking attributes where appropriate.

---

# 30. Cloudflare Turnstile

Use Turnstile on:
- early-access form
- any contact form

Do not add it to every click.

The server must verify the token before saving a lead.

---

# 31. Image performance

The current assets are visually strong but high-resolution product imagery can destroy page performance if served naïvely.

For each major image create:

```text
480w
768w
1280w
1920w
2560w where justified
```

Preferred formats:
1. AVIF
2. WebP fallback
3. PNG/JPEG only where required

Use:
- `srcset`
- `sizes`
- `loading="lazy"` below the fold
- hero preload only for the actual first hero
- explicit width/height or aspect ratio
- responsive crops if necessary

Do not preload both product heroes on mobile.

Performance is experiment integrity. A slower variant can look like a less desirable product even when the problem is simply page speed.

---

# 32. Accessibility

Minimum:
- semantic headings
- keyboard usable navigation
- visible focus states
- alt text that describes product view, not marketing copy
- text contrast
- reduced-motion support
- no critical information available only on hover
- gallery controls labeled
- forms properly associated with labels
- error text programmatically linked to inputs

---

# 33. Suggested alt text

Examples:

```text
Side profile of the Continuity C-01 Camel electric motorcycle in racing green.
```

```text
C-01 Camel multi-view design board showing side, front, rear, top and three-quarter views.
```

```text
Continuity C-01 Messerschmitt electric motorcycle photographed beside a vintage aircraft in a wet hangar setting.
```

Keep alt text factual.

---

# 34. Content model

Do not hardcode all copy into page components.

Recommended:

```text
/content/products/c01-camel.ts
/content/products/c01-messerschmitt.ts
```

Example:

```ts
export const c01Camel = {
  id: "c01_camel",
  name: "C-01 Camel",
  family: "C-01",
  type: "Electric Motorcycle",
  status: "concept",
  heroAssetId: "camel_hero_side",
  posterAssetId: "camel_poster_hangar",
  engineeringAssetId: "camel_engineering_board",
  viewsAssetId: "camel_views_board",
  claims: [],
  specs: {
    batteryKwh: null,
    peakPowerKw: null,
    chargeKw: null
  }
};
```

This prevents accidental contradictions between pages.

---

# 35. Folder structure

```text
continuity-motors/
├── README.md
├── schema.sql
├── package.json
├── wrangler.jsonc
├── astro.config.mjs
├── tsconfig.json
│
├── public/
│   └── assets/
│       ├── brand/
│       └── products/
│
├── src/
│   ├── components/
│   │   ├── Navigation.astro
│   │   ├── ProductHero.astro
│   │   ├── ProductStats.astro
│   │   ├── EditorialImage.astro
│   │   ├── TechnicalBoard.astro
│   │   ├── ProductSwitcher.astro
│   │   ├── EarlyAccessForm.tsx
│   │   └── ConsentBanner.tsx
│   │
│   ├── content/
│   │   └── products/
│   │
│   ├── layouts/
│   │   └── BaseLayout.astro
│   │
│   ├── lib/
│   │   ├── analytics.ts
│   │   ├── experiment.ts
│   │   ├── session.ts
│   │   └── consent.ts
│   │
│   ├── pages/
│   │   ├── index.astro
│   │   ├── c-01/
│   │   │   ├── index.astro
│   │   │   ├── camel.astro
│   │   │   └── messerschmitt.astro
│   │   ├── engineering.astro
│   │   ├── about.astro
│   │   ├── privacy.astro
│   │   └── api/
│   │       ├── session.ts
│   │       ├── events.ts
│   │       ├── experiment.ts
│   │       └── lead.ts
│   │
│   └── styles/
│       ├── tokens.css
│       ├── global.css
│       └── motion.css
│
└── migrations/
    └── 0001_initial.sql
```

---

# 36. Environment variables / secrets

Public build-time values:

```text
PUBLIC_GA_MEASUREMENT_ID
PUBLIC_CLARITY_PROJECT_ID
PUBLIC_TURNSTILE_SITE_KEY
```

Secrets:

```text
TURNSTILE_SECRET_KEY
```

Bindings:

```text
DB -> D1 database
```

Never expose:
- Turnstile secret
- API tokens
- Cloudflare account tokens
- any future email-service secret

---

# 37. Recommended data flow

On first page:

```text
1. Read consent.
2. Create session_id.
3. Determine campaign source.
4. Determine experiment assignment.
5. POST /api/session.
6. Render page.
7. Set GA4/Clarity context after consent.
8. Queue meaningful events.
9. Batch POST /api/events.
10. Flush summaries on route/page hide.
```

Lead flow:

```text
1. User starts form.
2. track lead_form_start.
3. User submits.
4. Turnstile token sent to Worker.
5. Worker verifies token.
6. D1 lead + conversion inserted transactionally.
7. Browser receives success.
8. track lead_submit to GA4/Clarity.
```

The D1 conversion should be created on the server, not merely from a client-side success event.

---

# 38. Server-derived context

Where appropriate, the Worker may add:

```text
country_code
region_code
colo
user_agent_family
request_received_at
```

Store only coarse data that has a clear experiment purpose.

Do not build a fingerprinting system.

Do not store raw IP addresses in the experiment database unless there is a specific security requirement and retention policy.

---

# 39. Session-product summary generation

Preferred MVP implementation:

- client sends section engagement summaries
- Worker updates `session_product_summary`
- raw event also gets appended to `events`

Example logic:

```text
section_engagement(engineering, 18.3s)
    ->
events INSERT
    ->
session_product_summary.engineering_active_ms += 18300
```

This makes the database readable in real time.

---

# 40. Useful SQL questions

## Which product gets more qualified attention?

```sql
SELECT
  product_id,
  COUNT(*) AS sessions,
  AVG(product_active_ms) AS avg_active_ms,
  AVG(max_scroll_pct) AS avg_scroll
FROM session_product_summary
GROUP BY product_id;
```

## Which product creates more leads?

```sql
SELECT
  product_id,
  SUM(lead_submitted) AS leads,
  COUNT(*) AS exposed_sessions,
  1.0 * SUM(lead_submitted) / COUNT(*) AS lead_rate
FROM session_product_summary
GROUP BY product_id;
```

## Do people switch back?

```sql
SELECT
  product_id,
  SUM(switches_away) AS switches_away,
  SUM(returned_after_switch) AS returned_after_switch
FROM session_product_summary
GROUP BY product_id;
```

## Which traffic source creates qualified intent?

```sql
SELECT
  s.utm_source,
  sp.product_id,
  COUNT(*) AS sessions,
  SUM(sp.lead_submitted) AS leads,
  AVG(sp.product_active_ms) AS avg_product_ms
FROM session_product_summary sp
JOIN sessions s ON s.session_id = sp.session_id
GROUP BY s.utm_source, sp.product_id;
```

---

# 41. Dashboard views to build

Do not start with dozens of dashboards.

Build these five:

### 1. Experiment overview
- sessions
- qualified sessions
- Camel exposure
- Messerschmitt exposure
- lead conversion by product
- CTA conversion by product
- median active time
- max scroll distribution

### 2. Product depth
- section active time
- technical interaction rate
- image open rate
- share rate
- switch-away rate
- switch-back rate

### 3. Acquisition
- UTM source
- campaign
- referrer
- device
- qualified rate
- lead rate

### 4. Path behavior
- first product
- second product
- switch sequence
- final product before lead

### 5. UX diagnostics
Use Clarity:
- rage clicks
- dead clicks
- heatmap
- scroll drop-offs
- selected session recordings

---

# 42. Experiment integrity rules

1. Keep both product pages structurally equivalent.
2. Do not quietly change one page mid-test.
3. Version significant copy/image changes.
4. Record experiment version in every event.
5. Keep campaign links distinguishable through UTMs.
6. Randomize product order for neutral traffic.
7. Separate randomized traffic from direct-product traffic.
8. Use the same CTA wording on both products during a comparison test.
9. Do not compare one product with validated specs against another with missing specs.
10. Watch performance by product page before interpreting behavior.

---

# 43. What not to collect

Do not collect data merely because it is technically possible.

Avoid:
- raw mouse coordinates in D1
- every scroll pixel
- keystrokes
- form field contents in analytics events
- raw IP addresses for behavioral profiling
- canvas/device fingerprinting
- contact information in GA4
- contact information in Clarity tags/events
- hidden demographic inference

Clarity already supplies the dense interaction layer.

---

# 44. Suggested launch stages

## Stage 1 — Visual shell

Build:
- homepage
- both product pages
- navigation
- responsive layout
- image optimization

No analytics except local console validation.

## Stage 2 — First-party experiment layer

Build:
- session ID
- experiment assignment
- D1
- `/api/session`
- `/api/events`
- session-product summary

Verify database before adding more tools.

## Stage 3 — GA4 + Clarity

Add:
- consent layer
- GA4
- Clarity
- custom tags/events
- UTM testing

## Stage 4 — Conversion

Add:
- early-access form
- Turnstile
- D1 leads/conversions
- `generate_lead`

## Stage 5 — QA

Test:
- Chrome desktop
- Safari desktop
- iOS Safari
- Android Chrome
- slow mobile connection
- analytics denied
- analytics accepted
- direct traffic
- Reddit UTM
- Instagram UTM
- Camel-first assignment
- Messerschmitt-first assignment

---

# 45. Definition of done

The first experiment release is done when:

- [ ] Homepage looks credible without explaining that it is an experiment.
- [ ] Camel and Messerschmitt pages use the same content structure.
- [ ] All supplied assets have stable IDs.
- [ ] Pages are fully responsive.
- [ ] No unverified engineering claim is presented as production fact.
- [ ] Every product view is attributable to a session.
- [ ] Experiment assignment is recorded.
- [ ] Product exposure order is recorded.
- [ ] Section active time is recorded.
- [ ] Product switches are recorded.
- [ ] Early-access leads are recorded server-side.
- [ ] GA4 receives acquisition + funnel events.
- [ ] Clarity receives product/experiment context.
- [ ] PII does not appear in analytics events.
- [ ] Lead form is protected by Turnstile.
- [ ] Analytics behavior respects consent.
- [ ] Image payload is optimized for mobile.
- [ ] Core Web Vitals are checked.
- [ ] Test traffic is marked/excluded.
- [ ] SQL queries can compare product performance without manually cleaning data.

---

# 46. Recommended first experiment

**Experiment:** `c01_direction_v1`

**Question:** Which C-01 direction creates stronger behavioral interest under equivalent presentation?

**Variants:**
- `camel`
- `messerschmitt`

**Primary behavioral outcomes:**
- qualified product-view rate
- CTA intent rate
- lead conversion

**Secondary outcomes:**
- product active time
- engineering active time
- asset-open rate
- switch-away rate
- switch-back rate
- share rate

**Diagnostic outcomes:**
- scroll depth
- section drop-off
- Clarity heatmaps
- dead/rage clicks
- page performance

Do not make the decision from page views alone.

---

# 47. Implementation note on Cloudflare D1 scale

D1 is appropriate for this MVP if the event model remains intentional.

Do not log continuous telemetry into D1.

At larger traffic volumes:
- keep conversions/sessions/summaries in D1
- move high-volume telemetry to Workers Analytics Engine
- keep Clarity responsible for detailed movement/recording data

This prevents the experiment from becoming an expensive event firehose.

---

# 48. Optional future features

Only add these after the first test establishes useful demand signals:

- build/configure flow
- color selector
- reservation intent
- test-ride location interest
- launch city selection
- interactive exploded view
- development journal
- embedded product video
- founder/development story
- press page
- email automation
- CRM integration

Do not add all of these before the first experiment.

---

# 49. Sources / implementation references

Product experience references:

- Maeving RM1: https://maeving.com/en-us/pages/maeving-rm1-electric-motorcycle
- LiveWire S2: https://www.livewire.com/products/s2-motorcycles
- Triumph Speed 400: https://www.triumphmotorcycles.com/motorcycles/classic/speed-400
- Arc Vehicle: https://www.arcvehicle.com/

Analytics and infrastructure:

- Cloudflare D1: https://developers.cloudflare.com/d1/
- Cloudflare D1 limits: https://developers.cloudflare.com/d1/platform/limits/
- Cloudflare Workers Analytics Engine: https://developers.cloudflare.com/analytics/analytics-engine/
- Cloudflare Web Analytics: https://developers.cloudflare.com/web-analytics/
- Cloudflare Turnstile: https://developers.cloudflare.com/turnstile/
- Microsoft Clarity client API: https://learn.microsoft.com/clarity/setup-and-installation/clarity-api
- Microsoft Clarity consent management: https://learn.microsoft.com/clarity/setup-and-installation/consent-management
- Google Analytics 4 developer docs: https://developers.google.com/analytics/devguides/collection/ga4
- GA4 recommended events: https://developers.google.com/analytics/devguides/collection/ga4/reference/events

---

# 50. Final operating principle

The site should behave like a **real product site with an instrumented research layer**, not like a research instrument dressed up as a product site.

If a tracking requirement makes the experience obviously artificial, redesign the tracking.

If an attractive interaction creates ambiguous experiment data, instrument it properly before launching.

If a metric does not help answer a product question, do not collect it.
