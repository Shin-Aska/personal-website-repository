# Personal Guide Design System

## 1. Atmosphere & Identity

The guides feel like carefully preserved field manuals: warm paper, archival ink, restrained heraldic color, and practical controls layered over dense reference material. Ultima V's signature is a resistance dossier in amber, wine, and forest tones, with Lora headings and textured parchment making progress tools feel native to Britannia rather than like a generic dashboard.

## 2. Color

### Ultima V palette

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Text / primary | `--u5-ink` | `#30271d` | Body copy and default icons |
| Text / secondary | `--u5-muted` | `#75654f` | Supporting copy, metadata, inactive states |
| Surface / primary | `--u5-paper` | `#f7edcf` | Page background beneath the paper texture |
| Surface / elevated | `--u5-paper-light` | `#fffaf0` | Cards, controls, and active reading surfaces |
| Border / default | `--u5-rule` | `rgba(116, 74, 28, 0.24)` | Dividers, card outlines, and control groups |
| Accent / primary | `--u5-amber` | `#a96008` | Kicker labels, links, and interactive emphasis |
| Accent / secondary | `--u5-gold` | `#d79a22` | Progress, focus, and heraldic highlights |
| Accent / chapter | `--u5-wine` | `#7d2b25` | Active chapter controls and critical actions |
| Status / prepared | `--u5-forest` | `#263a2e` | Completed, ready, and resistance states |

### Rules

- New Ultima V UI uses the variables above; raw colors already present in legacy CSS are extraction debt, not precedent for new values.
- Amber identifies available action, wine identifies the selected campaign chapter, and forest identifies readiness or completion.
- Paper texture and warm translucent surfaces preserve the archival material; avoid flat white dashboard panels.

### Al-Qadim sourcebook palette

| Role | Token | Value | Usage |
| --- | --- | --- | --- |
| Text / primary | `--aq-source-ink` | `#2f241a` | Walkthrough copy on parchment surfaces |
| Text / secondary | `--aq-source-muted` | `#55432f` | Supporting directions and metadata |
| Surface / elevated | `--aq-source-paper-light` | `#f7edcf` | Chapter and control surfaces |
| Border / default | `--aq-source-rule` | `rgba(101, 65, 31, 0.34)` | Sourcebook dividers and control outlines |
| Accent / action | `--aq-source-oxblood` | `#6f2427` | Inline Atlas locators and chapter actions |
| Accent / confirmation | `--aq-source-green` | `#173d30` | Hover, focus, and confirmed Atlas states |

## 3. Typography

| Level | Family | Size | Weight | Line height | Usage |
| --- | --- | --- | --- | --- | --- |
| Display | `U5 Lora`, Georgia, serif | `clamp(2.05rem, 4.5vw, 3.25rem)` | 700 | 0.98 | Guide masthead |
| Section | `U5 Lora`, Georgia, serif | `clamp(1.75rem, 4vw, 2.55rem)` | 700 | 1.08 | Major guide sections |
| Card title | `U5 Lora`, Georgia, serif | `1.05rem`–`1.35rem` | 700 | 1.25 | Objectives and preparation cards |
| Body | `U5 Inter`, system-ui, sans-serif | `1rem` | 400 | 1.6 | Reading copy |
| Small | `U5 Inter`, system-ui, sans-serif | `0.72rem`–`0.88rem` | 400–700 | 1.45 | Metadata, status, secondary directions |
| Kicker | `U5 Inter`, system-ui, sans-serif | `0.69rem` | 800 | 1.3 | Uppercase archival labels |

Headings use `text-wrap: balance` where available; body copy uses `text-wrap: pretty`. Body text must not fall below `0.875rem` for instructional content.

Ultima V component typography uses `--u5-text-kicker`, `--u5-text-caption`, `--u5-text-small`, `--u5-text-body`, `--u5-text-base`, `--u5-text-card`, `--u5-text-section`, and `--u5-text-number`. Line-height and tracking use `--u5-leading-tight`, `--u5-leading-compact`, `--u5-leading-body`, and `--u5-tracking-kicker`.

## 4. Spacing & Layout

The base spacing unit is 4px. Existing guide rhythm uses 4, 8, 12, 16, 20, 24, 32, and 40px steps through rem values.

- Spacing tokens: `--u5-space-1` through `--u5-space-6`, plus `--u5-space-8` and `--u5-space-10`, map the approved 4px rhythm.
- Radius tokens: `--u5-radius-sm`, `--u5-radius-md`, and `--u5-radius-lg`; primary control height uses `--u5-control-min`.
- Reading measure: `--u5-reading-measure` caps expanded instructional prose at `78ch` so route steps and field notes do not become tiring desktop-wide lines.

- Content shell: `min(1180px, calc(100% - 2rem))`; mobile shell: `min(100% - 1rem, 1180px)`.
- Primary breakpoints: 520px for compact phone controls, 760px for one-column content, and 980px for dashboard stacking.
- Campaign controls use a single journal column so the recommended route reads from top to bottom; the primary reading column must never create page-level horizontal scroll.
- Preparation is Grand Quest 01, not a detached side-quest detour. The remaining optional pursuits follow the complete Grand Quest as a secondary ledger.

## 5. Components

### Guide navigation rail

- **Structure**: semantic `nav` containing anchor controls with icons and labels.
- **States**: default, hover, active with `aria-current`, and visible keyboard focus.
- **Layout**: centered cluster on desktop; horizontally scrollable cluster on small screens.
- **Motion**: color and surface transitions only.

### Grand Quest journal

- **Structure**: one ordered list of Grand Quest chapters. Each chapter header contains its sequence number, strategic purpose, live completed/total count, and a disclosure control for the chapter body.
- **States**: upcoming, current, complete, hover, and visible keyboard focus. The current chapter is identified by text and an amber marker; completion uses both a check mark and forest treatment.
- **Layout**: a wide journal column with a compact number gutter. On phones, metadata wraps below the title without reducing instructional copy below `0.875rem`.
- **Accessibility**: chapter buttons expose `aria-expanded` and `aria-controls`; chapter regions retain a labelled heading even when collapsed. Opening one chapter does not forcibly close another.

### Grand Quest objective

- **Structure**: an ordered objective card with a trackable completion control, concise goal, location, outcome, atlas action, and a `Next steps` disclosure. Contextual economy or survival advice appears as a `Field notes` block after the exact route and before the outcome.
- **States**: default, expanded, complete, hover, and visible keyboard focus. Preparation objectives can mirror existing side-quest progress; decisive objectives retain their ordered main-campaign progress.
- **Layout**: title and actions share one row on desktop and stack on compact phones. Exact instructions live in the disclosure directly beneath the goal they explain and share the `--u5-reading-measure` cap on wide screens.
- **Accessibility**: `Next steps` is a real button with `aria-expanded` and `aria-controls`; instructions are an ordered list, field notes are a labelled unordered list, and both remain understandable without icons or color. Completion controls have explicit action labels.

### Field notes

- **Structure**: a compact labelled aside inside a Grand Quest disclosure, containing short `label + advice` entries for optional optimizations, warnings, prices, or resource-saving alternatives.
- **States**: static guidance shown only while its parent `Next steps` disclosure is expanded.
- **Layout**: a forest-tinted inset separated from the exact route by the shared spacing rhythm; entries form one reading column at every breakpoint.
- **Accessibility**: the aside has an explicit `Field notes` label, uses a semantic list, and never makes an optimization sound mandatory when the normal route remains valid.

### Inline Atlas locator

- **Structure**: a text-level button used inside instructional prose when a named NPC, place, or quest item has a precise Atlas destination. The visible name remains part of the sentence and carries a small map-pin icon.
- **Behavior**: a place or interior item locator opens the correct floor, a mapped world item opens its exact marker, and an NPC locator also sets a documented daytime hour, highlights that resident, and opens the NPC popup. Exact routes remain in Campaign `Next steps`.
- **States**: default, hover, active, and visible keyboard focus, using each guide's established accent pair (amber-to-wine in Ultima V, oxblood-to-green in Al-Qadim) and 150ms color transitions.
- **Accessibility**: each locator has an explicit `Show … in the Atlas` accessible name, uses a real button, preserves sentence reading order, and never relies on its icon or color alone.

### Opening strategy briefing

- **Structure**: a semantic `aside` before Grand Quest 01 that states the recommended party, supply threshold, and why the route delays shrine grinding until the resistance is mobile.
- **Layout**: three concise briefing facts on desktop and one reading column below 760px.
- **Accessibility**: guidance is text-first, with no meaning carried only by decorative route lines.

### Expedition readiness ledger

- **Structure**: a campaign-support section made of stage-specific loadout cards. Each card names the Grand Quest it prepares for, shows a saved checklist and local ready count, and links back to that Grand Quest for acquisition routes and sequencing.
- **Responsibility**: the ledger answers “what must be in hand before departure”; the Grand Quest journal remains the only source for “where to go next” and exact routes. Readiness copy must not duplicate a walkthrough.
- **States**: incomplete, ready, checked item, hover, and visible keyboard focus. The overall summary counts ready loadouts rather than averaging unrelated inventory into a percentage.
- **Layout**: a two-column ledger above 980px and one reading column below it. Card headers keep the campaign gate and status together; checklist rows remain at least 44px tall and wrap naturally on phones.
- **Accessibility**: every card is a labelled semantic article, status text is announced politely, checkboxes retain explicit labels, and readiness is never communicated by color alone.

### Main objective checklist

- **Structure**: sequential checkbox rows rendered from campaign data, with status and atlas action.
- **States**: locked, current, complete, hover, focus, and storage-unavailable fallback.
- **Layout**: grid rows collapse to label plus action on compact screens.

### Side-quest card

- **Structure**: category/location header, trackable title, recommendation, instruction copy, reward, and atlas action.
- **States**: default, hover, checked/complete, focus, and local-storage-unavailable fallback.
- **Layout**: two-column card grid on desktop and one column below 980px.

### Side-quest preparation group

- **Structure**: a semantic section headed by the Grand Quest it prepares for, a short strategic rationale, and its optional side-quest cards ordered from highest to lowest practical usefulness.
- **States**: group headings remain visible while individual cards retain their default, hover, complete, and keyboard-focus states; optional completion never locks or blocks the Grand Quest.
- **Layout**: groups form one full-width preparation timeline; cards use the shared two-column side-quest grid and collapse to one column below 980px. Group headings stack below 760px.
- **Accessibility**: each group is labelled by its own heading, the sequence is communicated in text as well as card numbering, and reading order matches the recommended play order.

## 6. Motion & Interaction

| Type | Duration | Easing | Usage |
| --- | --- | --- | --- |
| Micro | 150ms | ease-out | Focus, hover, and check feedback |
| Standard | 220ms | ease-out | Section and chapter panel arrival |
| Emphasis | 300ms | ease-in-out | Progress and major surface transitions |

- Animate only `opacity`, `transform`, and color/surface properties.
- Every interactive element has hover, active, and `:focus-visible` feedback.
- `prefers-reduced-motion: reduce` disables non-essential arrival and scrolling animation.

## 7. Depth & Surface

Strategy: mixed warm borders, tonal shifts, and one shared tinted shadow.

- Resting controls: translucent `--u5-paper-light` surface plus `--u5-rule` border.
- Selected chapter: wine/forest gradient with gold type and a restrained warm shadow.
- Elevated cards: `--u5-shadow` (`0 18px 45px rgba(60, 39, 16, 0.12)`).
- Paper texture remains visible through large surfaces; avoid opaque flat fills unless needed for text contrast.

## 8. Accessibility Constraints & Accepted Debt

### Constraints

- WCAG 2.2 AA target, visible focus for every control, full keyboard reachability, 44px minimum touch targets where controls are primary, and no color-only state.
- Tab controls expose tab/tabpanel relationships and support arrow-key movement.
- The campaign remains usable when localStorage is unavailable.
- At 375px, primary content has no horizontal overflow; long labels wrap without clipping.
- Reduced-motion preferences suppress non-essential animation.

### Accepted debt

| Item | Location | Why accepted | Owner / Exit |
| --- | --- | --- | --- |
| Legacy raw color and spacing values | `guides/css/Ultima5.css` | Pre-existing guide predates this extracted contract; consolidating the whole file is outside the campaign integration scope. | Consolidate during a dedicated guide-wide token cleanup. |
| Runtime Tailwind utility classes mixed with authored CSS | `guides/Ultima5.html` | Existing static-guide architecture; replacing it would be a broad framework migration. | Revisit only during a full guide architecture redesign. |
