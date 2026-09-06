![Smooth Shadow Plugin](https://shadow.floriankiem.com/images/hero.webp)

# Smooth Shadow Plugin

A simple Tailwind plugin that makes your shadows finally look good.

**[shadow.floriankiem.com](https://shadow.floriankiem.com)** — try every size, ring and color in the browser and copy the class.

## Install

```bash
npm i shadow-plugin
```

## Usage

### Tailwind stylesheet

```css
@import "shadow-plugin";
```

### Element classes

```html
<div class="smooth-shadow-md" />
```

The plugin supports Tailwind's shadow color utilities:

```html
<div class="smooth-shadow-md shadow-blue-500/50" />
```

### Elevation shadows

The default `smooth-shadow-*` scale is tuned for softness and emphasis. For
actual distance semantics, use the optional `smooth-shadow-elevation-{0..5}`
scale: every level keeps a crisp contact shadow while its ambient layer moves
farther away and becomes lighter.

```html
<div class="smooth-shadow-elevation-3 shadow-blue-500/50" />
```

`smooth-shadow-elevation-0` removes the shadow. Override any complete level
with its matching semantic token. Define it on `:root` for a project-wide
scale, on a component scope, or on one element:

```css
.product-shell {
  --smooth-shadow-elevation-3: 0 2px 3px rgb(0 0 0 / 6%),
    0 14px 30px rgb(0 0 0 / 3%);
}
```

This replaces the complete level rather than exposing each internal layer as a
separate API. Custom recipes own their colors; `shadow-{color}` continues to
tint the built-in recipes. The `unprefixed` entrypoint retains the explicit
elevation class names.

### Shadow + ring

For surfaces that need a soft shadow plus a hairline edge, use `smooth-shadow-ring-{size}`, the same stacked shadow with a 1px hairline ring baked in as the final layer, so the edge morphs into the shadow instead of sitting next to it as a separate `border`. Don't add a `border`/`ring` on top; the ring is already in there. Use the elevation scale above when the level must communicate distance instead.

```html
<div class="smooth-shadow-ring-md" />
```

The ring and the shadow are colored independently. `shadow-{color}` tints the shadow, `smooth-ring-{color}` tints the ring, and they compose freely:

```html
<div class="smooth-shadow-ring-md smooth-ring-black/10" />
<div class="smooth-shadow-ring-md smooth-ring-blue-500/40 shadow-blue-500" />
```

The ring defaults to `rgba(0, 0, 0, 0.05)` and flips to `rgba(255, 255, 255, 0.18)` in dark mode. That happens automatically under a `.dark` class, `data-theme="dark"`, or — for OS-preference dark modes — whenever the page declares `color-scheme: light dark`.

The flip deliberately never keys off `prefers-color-scheme` alone: that media query reports the visitor's OS setting, not whether your site has a dark theme, so a light-only site keeps its light ring for every visitor instead of serving dark-OS users an invisible white hairline. If your dark mode is driven purely by a `prefers-color-scheme` media query, declare it (good practice anyway — it also fixes scrollbars and form controls) and the ring follows automatically:

```css
:root {
  color-scheme: light dark;
}
```

The dark alpha is deliberately much higher than the light one. The ring is an outer layer, so it paints on the page *behind* the surface and takes its rendered colour from the page background rather than from the surface it outlines. In light mode that is forgiving, because a black hairline darkens away from any near-white surface. In dark mode a white hairline lightens *toward* a raised surface, so too low an alpha lands the ring on the surface's own colour and the edge vanishes.

If your surface is light enough to sit near the ring anyway (`neutral-700` and up on a dark page), set it explicitly:

```css
:root {
  --smooth-ring-color: rgba(255, 255, 255, 0.28);
}
```

#### Ring width

The hairline follows your project's Tailwind ring width, so a scale built on a thinner ring gets a matching one here — no configuration needed:

```css
@theme {
  --default-ring-width: 0.5px;
}
```

It defaults to `1px`, matching Tailwind's own default. To set the ring width independently of `--default-ring-width`, or to change it for one subtree, set `--smooth-ring-width` at any scope:

```css
:root {
  --smooth-ring-width: 2px;
}
```

Per element, Tailwind's arbitrary-property syntax works too: `<div class="smooth-shadow-ring-md [--smooth-ring-width:2px]" />`.

### Overriding a smooth shadow

The utilities are plain Tailwind utilities with no `!important`, so they follow the normal cascade — a later utility, an inline `style`, or a JS animation on `box-shadow` all override them the way you'd expect.

If you need one to win against CSS that would otherwise beat it (a component library's own `box-shadow`, which usually ships unlayered), use Tailwind's important modifier rather than reaching for a global setting:

```html
<div class="smooth-shadow-md!" />
```

It works on every utility here, including variants and the ring: `smooth-shadow-ring-lg!`, `hover:smooth-shadow-lg!`, `smooth-ring-blue-500/40!`.

### Optional: Replace all your default shadows

Import the unprefixed entrypoint and Tailwind's own `shadow-xs` … `shadow-2xl` render the smooth stacks — no new class names to learn:

```css
@import "tailwindcss";
@import "shadow-plugin/unprefixed";
```

Because it writes literal values into Tailwind's `--shadow-*` theme tokens, the full native feature set keeps working: the opacity modifier (`shadow-md/40`), `shadow-{color}`, and variants. The `smooth-shadow-ring-*` utilities have no native equivalent, so they come along under their own names. An existing scale migrates by deleting the `smooth-` prefix.

> Don't use `@theme { --shadow-md: var(--smooth-shadow-md); }` for this. It renders, but Tailwind can't see inside the var to reach the individual layers, so `shadow-md/40` and `shadow-{color}` silently stop working.

## Available classes

| Class                                              | Size                                                                   |
| -------------------------------------------------- | ---------------------------------------------------------------------- |
| `smooth-shadow-xs`                                 | Extra small                                                            |
| `smooth-shadow-sm`                                 | Small                                                                  |
| `smooth-shadow` / `smooth-shadow-md`               | Medium (default)                                                       |
| `smooth-shadow-lg`                                 | Large                                                                  |
| `smooth-shadow-xl`                                 | Extra large                                                            |
| `smooth-shadow-2xl`                                | 2x large                                                               |
| `smooth-shadow-none`                               | None                                                                   |
| `smooth-shadow-ring-xs` … `smooth-shadow-ring-2xl` | Shadow + 1px hairline ring (`smooth-shadow-ring` = medium)             |
| `smooth-shadow-elevation-0` … `-5`                 | Optional distance/elevation scale                                      |
| `smooth-ring-{color}`                              | Ring color override, supports opacity (e.g. `smooth-ring-blue-500/40`) |

The ring reads two custom properties you can set at any scope: `--smooth-ring-color` and `--smooth-ring-width`.

## Agent skills

To stop AI tools from pairing a `border` with a `shadow` (the double edge) and reach for `smooth-shadow-ring` instead:

- Claude / agent skill: [`.claude/skills/smooth-shadow-ring/SKILL.md`](.claude/skills/smooth-shadow-ring/SKILL.md)
- Cursor Bugbot rule: [`BUGBOT.md`](BUGBOT.md)

## License

MIT

Created by [Nils Eller](https://x.com/nilseller), [Eduard Wieandt](https://x.com/eduardwieandt), and [Florian Kiem](https://x.com/flornkm), in collaboration with [Rogo](https://rogo.ai/).
