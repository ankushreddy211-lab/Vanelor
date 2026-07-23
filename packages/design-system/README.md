# VALENOR Design System — Phase 2

Token-driven design system per the founding architecture doc §2 (Design
System) and §4/§13 (packages/design-system). Ships as a standalone package
now; Phase 3 folds it into the monorepo at `packages/design-system` unchanged.

## What's here

**Tokens** (`src/tokens/`) — the twelve categories called for in the brand
brief, each in its own file with usage rationale in comments:
`color.ts`, `typography.ts`, `spacing.ts`, `grid.ts`, `motion.ts`,
`shadow.ts`, `radius.ts`, `component.ts`, `accessibility.ts`.

**Two themes** — dark (the brand's home surface) and light (for admin/ops
tooling, per architecture §13), switched via a `data-theme` attribute and
consumed exclusively through semantic tokens (`bg`, `fg`, `accent`...) never
raw hex. See `src/css/tokens.css` and `src/lib/ThemeProvider.tsx`.

**Primitives** (`src/primitives/`) — Button, Input, Text, Divider, Eyebrow,
Card, and Tabs (built on Radix UI, per architecture §3 — the one primitive
here with real interaction complexity, to prove the pattern before more are
added in Phase 3+).

**Contrast audit** (`scripts/contrast-audit.mjs` → `CONTRAST_AUDIT.md`) —
computes real WCAG 2.x contrast ratios for every semantic color pair in both
themes, rather than eyeballing the palette. Run `npm run audit:contrast`
after any color token change; re-check the output before merging.

**Style guide** (`src/styleguide/`) — the "Storybook or equivalent" doc site
called for in Phase 2's deliverables. A single living page rendering every
token and primitive with a live dark/light toggle, rather than a full
Storybook install — chosen to keep this phase's footprint small; revisit if
the primitive count grows past what one page can hold clearly.

## Running it

```bash
npm install
npm run dev              # style guide at the printed local URL
npm run build:styleguide # production build, type-checked
npm run audit:contrast   # regenerate CONTRAST_AUDIT.md
```

## Consuming from the landing app (or any future app)

```ts
import { Button, Text, ThemeProvider, semanticColor } from "@valenor/design-system";
```

The landing prototype from Phase 5 currently duplicates a subset of these
tokens locally (its own `tailwind.config.ts`/`globals.css`). Folding it onto
this package is Phase 3 work — noted so the duplication doesn't look like an
oversight.

## Known gaps / deliberately deferred

- No automated TS → CSS custom property generator yet — `tokens/color.ts`
  and `css/tokens.css` are hand-synced. Low risk at this size; flagged as a
  Phase 3 nice-to-have if the palette grows.
- Only 7 primitives. The rest of the component library (form fields,
  navigation, modal/dialog, toast) is scoped to Phase 3 (Foundation) and
  Phase 8 (Admin) as those domains actually need them — building primitives
  ahead of a consumer is exactly the kind of premature architecture the
  brand brief and architecture doc (§2: "no architecture flexing") warn
  against.
- Accessibility audit covers color contrast only. Keyboard/screen-reader
  behavior is inherited from Radix for Tabs; Button/Input are native
  elements. A full axe-core pass happens per architecture §23/§28 once
  there's a real page to audit, not against isolated primitives.
