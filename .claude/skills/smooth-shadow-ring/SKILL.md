---
name: smooth-shadow-ring
description: Use when styling any elevated surface (card, dialog, popover, dropdown, menu, tooltip, sheet, toast) in a Tailwind project that has shadow-plugin installed. Prevents the double-border artifact caused by pairing a border/ring with a shadow, by routing elevation through the smooth-shadow-ring-* utilities.
---

# Elevated surfaces: choose ring softness or distance elevation

## When this applies

Any element that floats above the page surface: cards, dialogs, modals,
popovers, dropdowns, menus, tooltips, sheets, toasts, command palettes.

## The problem

Putting a `border-*` (or `ring-*`) and a `shadow-*` on the same element draws
two stacked edges: the border paints a hard 1px stroke, and the shadow begins
just outside it. The result is a visible double border, a crisp line then a
soft one. It looks heavy, greyed, and cheap.

## The rule

If you are about to write a `border-*` or `ring-*` class next to any `shadow-*`
on an elevated surface, first choose the intended semantics. For softness and
emphasis, use `smooth-shadow-ring-{size}`; it bakes a 1px hairline ring into the
final shadow layer. For actual distance hierarchy, remove the border/ring and
use `smooth-shadow-elevation-{0..5}`.

- `border shadow-md` → `smooth-shadow-ring-md`
- `ring-1 ring-neutral-200 shadow-lg` → `smooth-shadow-ring-lg`
- Sizes: `smooth-shadow-ring-xs`, `-sm`, `-md` (or bare `smooth-shadow-ring`), `-lg`, `-xl`, `-2xl`
- Never keep a `border` or `ring` on an element that already has
  `smooth-shadow-ring-*`. The ring is already in there; a second edge doubles up.
- If the surface should have no edge stroke at all, use plain
  `smooth-shadow-{size}` (no ring), not a border.
- If the surface's level must read as physical distance, use
  `smooth-shadow-elevation-{0..5}` without a separate border or ring.

## Coloring

The ring and shadow tint independently and compose on the same element:

- `shadow-{color}` tints the shadow, e.g. `shadow-blue-500`
- `smooth-ring-{color}` tints the ring, e.g. `smooth-ring-black/10`, `smooth-ring-blue-500/40`

The ring defaults to `rgba(0,0,0,0.05)` and flips to `rgba(255,255,255,0.18)`
in dark mode — under a `.dark` class, `data-theme="dark"`, or (for
OS-preference dark modes) when the page declares `color-scheme: light dark`.
It never keys off `prefers-color-scheme` alone, so light-only sites keep the
light ring for every visitor. If the site's dark mode is driven purely by a
`prefers-color-scheme` media query, make sure it declares
`:root { color-scheme: light dark; }` so the ring follows.

The dark alpha is much higher than the light one on purpose. The ring paints
outside the surface, so its rendered colour comes from the page behind it, not
from the surface it outlines. A white hairline therefore lightens *toward* a
raised dark surface, and too low an alpha makes the edge land on the surface's
own colour and disappear. If a surface is light enough to sit near the ring
anyway (`neutral-700` and up on a dark page), set `smooth-ring-*` explicitly.

## Ring width

The hairline is `1px` by default and follows the project's Tailwind ring width
automatically, so a project with `@theme { --default-ring-width: 0.5px; }` gets
a 0.5px hairline here with no extra setup. Do not hardcode a width to match;
override `--smooth-ring-width` at any scope only when it must differ from the
project ring width — per element via `[--smooth-ring-width:2px]`.

## Overriding

The utilities carry no `!important` and follow the normal cascade, so a later
utility, an inline `style`, or a JS animation on `box-shadow` overrides them
normally. When one has to win against CSS that outranks it — a component
library's own `box-shadow`, which usually ships unlayered — use Tailwind's
important modifier on that element instead of a global override:

```html
<div class="smooth-shadow-ring-md!">…</div>
```

For distance semantics, use `smooth-shadow-elevation-0` through
`smooth-shadow-elevation-5`. They keep a crisp contact shadow while moving the
ambient layer farther out and reducing both layers' alpha. Keep the default
`smooth-shadow-*` scale for softness/emphasis semantics.

```html
<div class="smooth-shadow-elevation-3 shadow-blue-500/50">…</div>
```

Override a complete level with `--smooth-shadow-elevation-{n}` at the project,
component, or element scope. Custom recipes own their colors; Tailwind
`shadow-{color}` continues to tint the built-in recipes.

## Example

```html
<!-- Wrong: border + shadow renders a double edge -->
<div class="rounded-2xl border border-neutral-200 shadow-md">…</div>

<!-- Right: one continuous edge -->
<div class="rounded-2xl smooth-shadow-ring-md">…</div>

<!-- Right: tuned ring + tinted shadow -->
<div class="rounded-2xl smooth-shadow-ring-md smooth-ring-black/10 shadow-blue-500">…</div>
```
