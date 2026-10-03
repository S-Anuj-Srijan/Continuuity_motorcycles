# Continuity Motors — Colour Palette Specification

**Theme:** Dark Heritage Engineering  
**Status:** Recommended base website colour system  
**Purpose:** Define the core colours, CSS tokens, intended usage, and visual hierarchy for the Continuity Motors website.

---

## 1. Core palette

| Token | Colour name | Hex | Primary use |
|---|---|---:|---|
| `--color-bg` | Carbon Black | `#090B0A` | Main page background, full-screen dark sections |
| `--color-surface` | Workshop Charcoal | `#151713` | Cards, alternate dark sections, modal surfaces |
| `--color-surface-green` | Racing Green | `#18251F` | Brand surfaces, product sections, premium dark accents |
| `--color-surface-green-raised` | Deep Green | `#22342B` | Hover states, raised green cards, selected states |
| `--color-text` | Warm Ivory | `#E5DACD` | Main headings, primary body text, CTA fills |
| `--color-text-muted` | Muted Stone | `#948A81` | Secondary text, captions, metadata, helper text |
| `--color-aluminium` | Brushed Aluminium | `#B8B6AF` | Technical labels, engineering dividers, neutral technical accents |
| `--color-brass` | Aged Brass | `#B58A55` | Premium accent, borders, links, secondary CTA, small highlights |
| `--color-copper` | Copper | `#C86732` | Engineering/power-flow highlights, active technical states |
| `--color-leather` | Leather Brown | `#4A3026` | Warm supporting accents, editorial/design sections |
| `--color-border` | Warm Dark Border | `#3A352F` | Subtle borders, separators, card outlines |
| `--color-black` | Near Black | `#050605` | Deepest overlays, image gradients, shadow surfaces |

---

## 2. Recommended colour balance

Use the palette approximately in this ratio across the site:

- **65%** Carbon Black + Workshop Charcoal
- **15%** Racing Green + Deep Green
- **10%** Warm Ivory
- **7%** Aged Brass + Brushed Aluminium
- **3%** Copper + Leather Brown

The site should remain visually dark. The motorcycle imagery should usually be the most colourful element on screen.

---

## 3. CSS variables

```css
:root {
  --color-bg: #090B0A;
  --color-surface: #151713;
  --color-surface-green: #18251F;
  --color-surface-green-raised: #22342B;

  --color-text: #E5DACD;
  --color-text-muted: #948A81;
  --color-aluminium: #B8B6AF;

  --color-brass: #B58A55;
  --color-copper: #C86732;
  --color-leather: #4A3026;

  --color-border: #3A352F;
  --color-black: #050605;
}
```

---

## 4. Colour usage by UI role

### Main website background

Use:

```css
background: var(--color-bg);
color: var(--color-text);
```

**Colour:** Carbon Black `#090B0A`

Use for:
- page background
- homepage
- product pages
- journal pages
- full-screen image sections with overlays

---

### Alternate dark surface

Use:

```css
background: var(--color-surface);
```

**Colour:** Workshop Charcoal `#151713`

Use for:
- cards
- footer
- modals
- comparison blocks
- FAQ sections
- alternate dark content bands

---

### Brand green surface

Use:

```css
background: var(--color-surface-green);
```

**Colour:** Racing Green `#18251F`

Use for:
- C-01 feature sections
- product cards
- navigation after scroll
- selected product states
- editorial product blocks
- footer accents

Avoid making the whole site green.

---

### Raised / hover green

Use:

```css
background: var(--color-surface-green-raised);
```

**Colour:** Deep Green `#22342B`

Use for:
- hover states
- selected cards
- active navigation backgrounds
- interactive product tiles

---

### Primary text

Use:

```css
color: var(--color-text);
```

**Colour:** Warm Ivory `#E5DACD`

Use for:
- H1/H2/H3
- main body text
- high-priority labels
- button backgrounds for primary CTAs

Avoid pure white `#FFFFFF` unless absolutely necessary.

---

### Secondary text

Use:

```css
color: var(--color-text-muted);
```

**Colour:** Muted Stone `#948A81`

Use for:
- captions
- metadata
- image descriptions
- timestamps
- supporting paragraphs
- form helper text
- muted navigation items

---

### Technical neutral

Use:

```css
color: var(--color-aluminium);
```

**Colour:** Brushed Aluminium `#B8B6AF`

Use for:
- engineering labels
- specification headings
- component diagrams
- technical dividers
- status labels

---

### Premium accent

Use:

```css
color: var(--color-brass);
border-color: var(--color-brass);
```

**Colour:** Aged Brass `#B58A55`

Use for:
- secondary CTAs
- links
- tiny underlines
- micro-labels
- active navigation
- premium borders
- section eyebrow text

Do not use as large filled backgrounds.

---

### Technical / electrical accent

Use:

```css
color: var(--color-copper);
```

**Colour:** Copper `#C86732`

Use for:
- engineering hotspots
- battery/power-flow diagrams
- active technical states
- data visualization highlights
- small status indicators
- selected component markers

Do not use Copper as the main brand colour.

---

### Warm supporting accent

Use:

```css
color: var(--color-leather);
```

**Colour:** Leather Brown `#4A3026`

Use for:
- design/editorial sections
- subtle warm details
- material storytelling
- background accents in heritage sections

Use sparingly.

---

## 5. Buttons

### Primary CTA

Recommended:

```css
.button-primary {
  background: var(--color-text);
  color: var(--color-bg);
  border: 1px solid var(--color-text);
}
```

Example:
- `Explore the C-01`
- `Join early access`

Visual:
- Warm Ivory background
- Carbon Black text

This should be the strongest CTA style.

---

### Secondary CTA

Recommended:

```css
.button-secondary {
  background: transparent;
  color: var(--color-brass);
  border: 1px solid var(--color-brass);
}
```

Example:
- `See development status`
- `Read the design philosophy`

Visual:
- Transparent background
- Aged Brass text + border

---

### Tertiary / text link

```css
.link-tertiary {
  color: var(--color-text);
  text-decoration-color: var(--color-brass);
}
```

Use for:
- article links
- internal navigation
- related content

---

## 6. Borders and separators

Use:

```css
border-color: var(--color-border);
```

**Colour:** `#3A352F`

Use for:
- cards
- FAQ rows
- navigation separators
- spec tables
- image viewer chrome

For technical sections, Brushed Aluminium can be used very lightly instead.

---

## 7. Page-specific colour emphasis

### Homepage

Primary emphasis:
- Carbon Black
- Racing Green
- Warm Ivory
- Aged Brass

Suggested feel:
**premium + restrained + cinematic**

---

### C-01 family page

Primary emphasis:
- Carbon Black
- Racing Green
- Warm Ivory
- Aged Brass

Suggested feel:
**brand identity + product family**

---

### Camel page

Primary emphasis:
- Carbon Black
- Racing Green
- Warm Ivory
- Aged Brass
- Leather Brown

Suggested feel:
**classic roadster + warmer heritage character**

---

### Messerschmitt page

Primary emphasis:
- Carbon Black
- Racing Green
- Warm Ivory
- Brushed Aluminium
- Aged Brass

Suggested feel:
**sharper + technical + focused**

---

### Engineering page

Primary emphasis:
- Carbon Black
- Workshop Charcoal
- Brushed Aluminium
- Copper
- Warm Ivory

Suggested feel:
**instrument panel / industrial / technical**

Copper should be noticeably more present here than on the rest of the site.

---

### Design page

Primary emphasis:
- Carbon Black
- Racing Green
- Leather Brown
- Aged Brass
- Warm Ivory

Suggested feel:
**heritage + watches + aviation + material culture**

---

### Development page

Primary emphasis:
- Workshop Charcoal
- Warm Ivory
- Brushed Aluminium
- small Copper/Green status indicators

Suggested feel:
**clear, factual, transparent**

---

### Journal

Primary emphasis:
- Carbon Black
- Warm Ivory
- Muted Stone
- Aged Brass

Suggested feel:
**editorial / technical journal**

---

## 8. Recommended status colours

Keep status colours inside the existing palette rather than introducing generic UI colours.

### Active / currently selected

```css
color: var(--color-brass);
```

### Technical activity / power

```css
color: var(--color-copper);
```

### Neutral / pending

```css
color: var(--color-aluminium);
```

### Positive / available / completed

Prefer a restrained green derived from the palette:

```css
color: #4F6F5E;
```

### Warning / not final

Use brass rather than bright yellow:

```css
color: var(--color-brass);
```

Avoid bright red/green traffic-light colours unless a true error/safety state requires them.

---

## 9. Overlay recommendations for photography

For text over imagery:

```css
background:
  linear-gradient(
    90deg,
    rgba(5, 6, 5, 0.78) 0%,
    rgba(5, 6, 5, 0.35) 45%,
    rgba(5, 6, 5, 0.05) 100%
  );
```

Use Near Black `#050605` as the base.

Avoid blue-tinted black overlays.

---

## 10. What to avoid

Do not introduce these as major brand colours:

- bright electric blue
- neon cyan
- bright lime green
- pure white as the dominant text colour
- saturated orange as a primary CTA colour
- generic purple/blue startup gradients
- glowing “EV” neon effects

These would fight the existing C-01 visual identity.

---

## 11. Design principle

The website should visually communicate:

**machinery + materials + craft + aviation + watches + motorcycles**

rather than:

**generic technology startup + app + smart mobility**

The colour palette should support the product imagery, not compete with it.
