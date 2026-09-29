# Shadow Agent Instructions

## Dev environment tips

- Run `npm install shadow-plugin` (or your preferred package manager) to add the package to your workspace so Vite, ESLint, and TypeScript can see it
- In the CSS file, which includes `@import "tailwindcss";`, add the following line: `@import "shadow-plugin";`

## CSS (tailwind) class instructions

- Use `smooth-shadow`, or the size variants `smooth-shadow-xs` up to `smooth-shadow-2xl`
- Color the shadow with tokens like `shadow-red-500`
- Use `smooth-shadow-elevation-0` through `smooth-shadow-elevation-5` when the level must communicate actual distance from the surface; do not add a separate `border`/`ring` to the same element
- Customize an elevation recipe as one semantic token with `--smooth-shadow-elevation-{n}`; do not add per-layer adjustment variables
- For a soft shadow with a hairline edge, use `smooth-shadow-ring` or the size variants `smooth-shadow-ring-xs` up to `smooth-shadow-ring-2xl`; never add a `border`/`ring` to the same element
- Color the ring independently from the shadow with `smooth-ring-{color}`, e.g. `smooth-ring-black/10`
- The hairline follows the project's `--default-ring-width` automatically (1px if unset); override `--smooth-ring-width` only when it must differ from the project ring width
- The utilities carry no `!important` and follow the normal cascade. If one must win against CSS that outranks it (a component library's own `box-shadow`), use Tailwind's important modifier on that element — `smooth-shadow-md!` — rather than a global override
- To replace Tailwind's own shadow scale instead of adding new class names, import `shadow-plugin/unprefixed` and use the native `shadow-{size}` utilities (this keeps `shadow-md/40` and `shadow-{color}` working; a `@theme { --shadow-md: var(--smooth-shadow-md); }` remap does not)

## Avoid double borders

- A `border-*` (or `ring-*`) next to a `shadow-*` on the same element draws two stacked edges: a hard line, then the shadow starting just outside it. That double border reads heavy and greyed
- Whenever you would pair a border/ring with a softness shadow on an elevated surface, use `smooth-shadow-ring-{size}` instead. When the hierarchy needs distance semantics, remove the border/ring and use `smooth-shadow-elevation-{0..5}`
- The reusable skill lives at `.claude/skills/smooth-shadow-ring/SKILL.md`; the Cursor Bugbot rule lives at `BUGBOT.md`
