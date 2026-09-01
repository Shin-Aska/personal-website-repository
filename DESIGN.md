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

## 4. Spacing & Layout

The base spacing unit is 4px. Existing guide rhythm uses 4, 8, 12, 16, 20, 24, 32, and 40px steps through rem values.

- Content shell: `min(1180px, calc(100% - 2rem))`; mobile shell: `min(100% - 1rem, 1180px)`.
- Primary breakpoints: 520px for compact phone controls, 760px for one-column content, and 980px for dashboard stacking.
- Campaign controls use grid for chapter structure and horizontal overflow only as a last-resort affordance; the primary reading column must never create page-level horizontal scroll.
- Preparation guidance sits directly beneath its controlling chapter rail. The global checklist follows chapter content as a secondary ledger, never between the chapter control and its content.

## 5. Components

### Guide navigation rail

- **Structure**: semantic `nav` containing anchor controls with icons and labels.
- **States**: default, hover, active with `aria-current`, and visible keyboard focus.
- **Layout**: centered cluster on desktop; horizontally scrollable cluster on small screens.
- **Motion**: color and surface transitions only.

### Campaign view switcher

- **Structure**: two-button `tablist` switching Main and Side Quest `tabpanel` regions.
- **States**: default, hover, selected via `aria-selected`, and visible focus.
- **Layout**: equal two-column grid; stacks internal label hierarchy on compact phones.

### Campaign route rail

- **Structure**: ordered Act I–IV `tablist`; each tab contains act number, title, purpose, and live completed/total count; each controls one chapter `tabpanel`.
- **States**: default paper, hover amber wash, selected wine/forest material, completed forest indicator, keyboard focus, and compact phone layout.
- **Accessibility**: arrow-key movement is supported within the tablist, `aria-controls` and `aria-labelledby` pair tabs with panels, and selection is always expressed independently of color.
- **Layout**: four-column route on wide screens, two columns on tablet, and one readable column on phone.
- **Motion**: selected panel enters with the existing 220ms opacity/transform arrival; reduced motion disables it.

### Preparation callout

- **Structure**: semantic `aside` with a preparation label, title, prerequisite checklist, acquisition route, use/limits, and connection to the active chapter objective.
- **Variants**: chapter preparation and side-quest summary.
- **States**: static instructional content; any contained action uses standard button/link focus and hover states.
- **Layout**: asymmetric two-column dossier on desktop and a single reading column below 760px.
- **Accessibility**: headings preserve reading order; lists carry the steps without relying on icons or color.

### Main objective checklist

- **Structure**: sequential checkbox rows rendered from campaign data, with status and atlas action.
- **States**: locked, current, complete, hover, focus, and storage-unavailable fallback.
- **Layout**: grid rows collapse to label plus action on compact screens.

### Side-quest card

- **Structure**: category/location header, trackable title, recommendation, instruction copy, reward, and atlas action.
- **States**: default, hover, checked/complete, focus, and local-storage-unavailable fallback.
- **Layout**: two-column card grid on desktop and one column below 980px.

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
