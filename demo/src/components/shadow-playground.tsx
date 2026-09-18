import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { CodeField } from "./code-field";
import { cn } from "../utils/cn";
import type { ResolvedTheme } from "../utils/theme";

const SIZES = [
  { label: "XS", smooth: "smooth-shadow-xs", ring: "smooth-shadow-ring-xs", tailwind: "shadow-xs" },
  { label: "SM", smooth: "smooth-shadow-sm", ring: "smooth-shadow-ring-sm", tailwind: "shadow-sm" },
  /* "MD" rather than "Default": every other label is ~15px wide and that one was
     39px, so the reserved slot it forced left a visible hole next to whichever
     side of it was aligned. It also freed up "Default" for the left preview box,
     which uses it to mean Tailwind's own shadow. */
  { label: "MD", smooth: "smooth-shadow", ring: "smooth-shadow-ring", tailwind: "shadow" },
  { label: "LG", smooth: "smooth-shadow-lg", ring: "smooth-shadow-ring-lg", tailwind: "shadow-lg" },
  { label: "XL", smooth: "smooth-shadow-xl", ring: "smooth-shadow-ring-xl", tailwind: "shadow-xl" },
];

/* The gradient-border plugin demo's palette, same swatches in the same order,
   so the two pages feel like one family. Every hex maps to a real Tailwind
   token, which is what the generated class string below the preview quotes. */
const SWATCHES: { hex: string; token: string }[] = [
  { hex: "#ffffff", token: "white" },
  { hex: "#fafafa", token: "neutral-50" },
  { hex: "#d4d4d4", token: "neutral-300" },
  { hex: "#a3a3a3", token: "neutral-400" },
  { hex: "#525252", token: "neutral-600" },
  { hex: "#404040", token: "neutral-700" },
  { hex: "#262626", token: "neutral-800" },
  { hex: "#171717", token: "neutral-900" },
  { hex: "#000000", token: "black" },
  { hex: "#38bdf8", token: "sky-400" },
  { hex: "#60a5fa", token: "blue-400" },
  { hex: "#818cf8", token: "indigo-400" },
  { hex: "#a78bfa", token: "violet-400" },
  { hex: "#c084fc", token: "purple-400" },
  { hex: "#e879f9", token: "fuchsia-400" },
  { hex: "#f472b6", token: "pink-400" },
  { hex: "#fb7185", token: "rose-400" },
  { hex: "#f87171", token: "red-400" },
  { hex: "#fb923c", token: "orange-400" },
  { hex: "#fbbf24", token: "amber-400" },
  { hex: "#a3e635", token: "lime-400" },
  { hex: "#4ade80", token: "green-400" },
  { hex: "#34d399", token: "emerald-400" },
  { hex: "#22d3ee", token: "cyan-400" },
];

/* The hairline is 1px, so a tinted ring needs real alpha to read at all — but
   not so much that it turns back into the hard border the plugin exists to
   avoid. The generated class string quotes this same number. */
const RING_ALPHA = 30;
/* Tailwind's own shadows paint the color at full strength, so the comparison
   box mixes it down to roughly the `shadow-black/10` it ships with. */
const DEFAULT_SHADOW_ALPHA = 10;

type Target = "shadow" | "ring";
type Colors = Record<Target, string>;

/* The shadow stays black in both themes — that's the plugin's own default, and
   a white shadow on a dark ground reads as a glow around the box rather than a
   shadow under it. Only the ring flips, since a black hairline disappears
   there. Until the shadow is actually tinted we set no color at all, so both
   previews render exactly what the page shipped with.

   The dark ring has to be *lighter* than the preview box, not darker: the ring
   paints outside the box, and the old `neutral-600` was dimmer than the
   `neutral-800` box, so it left no visible edge at all. `neutral-400` clears
   the box without going to the glare of a full white hairline. */
const DEFAULT_SHADOW = "#000000";
const LIGHT_DEFAULTS: Colors = { shadow: DEFAULT_SHADOW, ring: "#d4d4d4" };
const DARK_DEFAULTS: Colors = { shadow: DEFAULT_SHADOW, ring: "#a3a3a3" };

function mix(hex: string, alpha: number) {
  return `color-mix(in srgb, ${hex} ${alpha}%, transparent)`;
}

/* The surface the selection ring is drawn against — the control panel, not the
   card behind it, since that's what the swatches actually sit on. */
const PANEL: Record<ResolvedTheme, string> = { light: "#ffffff", dark: "#171717" };
/* A 1.5px ring is decorative, not text, so this sits far below the WCAG 4.5:1
   for copy — it's just the floor at which the hairline stops disappearing. */
const MIN_RING_CONTRAST = 1.6;

const channels = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance(hex: string) {
  const [r, g, b] = channels(hex)
    .map((c) => c / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}

function blend(hex: string, toward: string, amount: number) {
  const [a, b] = [channels(hex), channels(toward)];
  const hexed = a.map((c, i) => Math.round(c * (1 - amount) + b[i] * amount));
  return `#${hexed.map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

/* The selection ring wears the swatch's own color — but white on the light card
   (or black on the dark one) is a ring you can't see. Walk the color toward the
   opposite end of the scale until it clears the floor above; anything that
   already contrasts is returned untouched, so saturated swatches keep their
   exact hue and only the near-invisible ends get pulled. */
function ringColor(hex: string, theme: ResolvedTheme) {
  const panel = PANEL[theme];
  const toward = theme === "dark" ? "#ffffff" : "#000000";
  for (let amount = 0; amount < 1; amount += 0.1) {
    const candidate = blend(hex, toward, amount);
    if (contrast(candidate, panel) >= MIN_RING_CONTRAST) return candidate;
  }
  return toward;
}

function tokenFor(hex: string) {
  return SWATCHES.find((swatch) => swatch.hex === hex)?.token ?? `[${hex}]`;
}

/* A real segmented control rather than a row of text buttons: a sunken track
   with one raised thumb that slides between options. The thumb is a
   smooth-shadow-ring-xs, so the page is wearing the thing it sells. */
function Segmented({ children }: { children: ReactNode }) {
  return (
    <div className="flex w-fit items-center gap-0.5 rounded-full p-0.5 bg-neutral-100 dark:bg-neutral-800">
      {children}
    </div>
  );
}

function Segment({
  active,
  layoutId,
  onClick,
  disabled,
  dot,
  children,
}: {
  active: boolean;
  layoutId: string;
  onClick: () => void;
  disabled?: boolean;
  /** Hex to show as a swatch before the label — what this option currently is. */
  dot?: string;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "relative rounded-full py-1 text-xs font-medium whitespace-nowrap transition-colors",
        // A dot reads as its own left margin, so it needs less padding than text
        // would to sit the same distance off the pill's edge.
        dot ? "pr-2.5 pl-1.5" : "px-2.5",
        disabled
          ? "cursor-not-allowed text-neutral-300 dark:text-neutral-600"
          : active
            ? "cursor-pointer text-neutral-900 dark:text-white"
            : "cursor-pointer text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200"
      )}
    >
      {active && (
        <motion.span
          layoutId={layoutId}
          className="absolute inset-0 rounded-full bg-white dark:bg-neutral-700 smooth-shadow-ring-xs"
          transition={{ type: "spring", duration: 0.4, bounce: 0.15 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-1.5">
        {dot && (
          // The hairline keeps a white dot from vanishing into the raised thumb.
          <span
            className={cn(
              "size-2.5 rounded-full border border-black/10 dark:border-white/20 transition-opacity",
              disabled && "opacity-40"
            )}
            style={{ backgroundColor: dot }}
          />
        )}
        {children}
      </span>
    </button>
  );
}

/* One settings row: label in a fixed column on the left, control on the right.
   The fixed column is what actually lines the panel up — every control starts
   at the same x no matter how long its label is. */
function Field({
  label,
  align = "center",
  children,
}: {
  label: string;
  /** `start` for controls taller than one line, so the label sits on the first. */
  align?: "center" | "start";
  children: ReactNode;
}) {
  return (
    // Stacks below `sm`, where a fixed label column plus a control leaves too
    // little width for either. The control wrapper needs `min-w-0`: a flex child
    // defaults to `min-width: auto`, so without it the swatches refuse to shrink
    // and punch straight out of the panel instead of wrapping.
    <div
      className={cn(
        "flex flex-col gap-1 sm:flex-row sm:gap-4",
        align === "start" ? "sm:items-start" : "sm:items-center"
      )}
    >
      <span
        className={cn(
          "text-xs text-neutral-400 sm:w-12 sm:shrink-0",
          // Clears the segmented control's own padding so the two texts line up.
          align === "start" && "sm:pt-1.5"
        )}
      >
        {label}
      </span>
      {/* Controls go in block-level: an inline-level one adds a line box here and
          the descender space under it throws the label off centre. */}
      <div className="min-w-0 sm:flex-1">{children}</div>
    </div>
  );
}

/* Fill and thumb are motion-driven, so dragging between the five steps springs
   rather than snapping, and the hover halo has a real element to transition on.
   The native input rides on top at zero opacity and does the actual input
   handling — pointer drag, arrow keys, screen readers. */
function SizeSlider({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  /* Travel is measured in px, not percent: at 100% the thumb's center would sit
     on the track's end and half of it would hang past into the label. Its centre
     runs from one radius in to one radius short instead. */
  const TRACK = 160; // w-40
  const THUMB = 16; // size-4
  const centre = THUMB / 2 + (value / (SIZES.length - 1)) * (TRACK - THUMB);
  const spring = { type: "spring", stiffness: 400, damping: 32 } as const;

  return (
    <div className="size-slider relative h-4" style={{ width: TRACK }}>
      <div
        className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-colors"
        style={{ backgroundColor: "var(--slider-track)" }}
      />
      {/* `initial={false}` on both: motion would otherwise animate up from the
          element's computed start, and `left: auto` has nothing to spring from. */}
      <motion.div
        className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full transition-colors"
        style={{ backgroundColor: "var(--slider-fill)" }}
        initial={false}
        animate={{ width: centre }}
        transition={spring}
      />
      {/* `y` rather than a `-translate-y-1/2` class: motion owns the transform
          on an element it animates, and a Tailwind translate would be dropped. */}
      <motion.div
        className="absolute top-1/2 left-0"
        style={{ y: "-50%" }}
        initial={false}
        animate={{ left: centre }}
        transition={spring}
      >
        <div className="size-slider-thumb size-4 -translate-x-1/2 rounded-full" />
      </motion.div>
      <input
        type="range"
        min={0}
        max={SIZES.length - 1}
        step={1}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        aria-label="Shadow size"
        aria-valuetext={label}
        className="size-slider-input absolute inset-0 m-0 h-full w-full opacity-0"
      />
    </div>
  );
}

/* The preview box. The plugin's sizes don't share a layer count (xs stacks 2
   shadows, sm 7, the rest 6), so CSS can't tween between them — box-shadow only
   interpolates when both sides have the same shape, and otherwise it snaps. So
   the shadow lives on a bare overlay above an opaque box, and motion cross-fades
   a new overlay in over the outgoing one. Any pair of sizes blends smoothly,
   and the box underneath never goes translucent mid-transition. */
function Stage({
  shadowKey,
  className,
  style,
}: {
  shadowKey: string;
  className: string;
  style?: CSSProperties;
}) {
  return (
    <div className="relative size-24 sm:size-32 rounded-2xl bg-white dark:bg-neutral-800">
      <AnimatePresence initial={false}>
        <motion.div
          key={shadowKey}
          // Colors still change on the same overlay, so they keep a plain CSS
          // transition rather than re-mounting and cross-fading.
          className={cn("absolute inset-0 rounded-2xl transition-shadow duration-300", className)}
          style={style}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
        />
      </AnimatePresence>
    </div>
  );
}

/* The switch from florians-site (redesign-2): a 32×20 track with a 16px knob
   that slides on `right`, 200ms ease-out, no spring. Same geometry, wired to
   this page's neutral scale instead of that site's tokens. */
function Switch({
  checked,
  onCheckedChange,
  label,
}: {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Names the switch for screen readers; the row's own label carries it visually. */
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onCheckedChange(!checked)}
      /* `flex w-fit`, not `inline-flex`: an inline-level control sits on a line
         box in the row's block wrapper, which then reserves the font's descender
         space under it. That made the wrapper 26px tall around a 20px switch, so
         the row's `items-center` centred the label against six pixels of empty
         space and left it sitting low. Block-level, the wrapper is exactly the
         switch's height; `w-fit` keeps the hit area on the switch itself. */
      className="flex w-fit cursor-pointer items-center"
    >
      <span
        className={cn(
          "relative h-5 w-8 rounded-full p-0.5 transition-all duration-200 ease-out",
          checked ? "bg-neutral-900 dark:bg-white" : "bg-neutral-200 dark:bg-neutral-800"
        )}
      >
        <span
          className={cn(
            "absolute top-1/2 z-10 size-4 -translate-y-1/2 rounded-full transition-all duration-200 ease-out",
            checked ? "right-0.5 bg-white dark:bg-black" : "right-3.5 bg-white dark:bg-neutral-600"
          )}
        />
      </span>
    </button>
  );
}

export function ShadowPlayground({ theme }: { theme: ResolvedTheme }) {
  const [selected, setSelected] = useState(2);
  const [ring, setRing] = useState(true);
  const [target, setTarget] = useState<Target>("shadow");
  const [colors, setColors] = useState<Colors>(() =>
    theme === "dark" ? DARK_DEFAULTS : LIGHT_DEFAULTS
  );
  const picked = useRef<Partial<Record<Target, boolean>>>({});

  // A black hairline is invisible on black, so untouched colors follow the
  // theme back to sensible defaults whenever it flips. Anything the visitor
  // picked themselves survives — flipping the theme shouldn't undo their work.
  useEffect(() => {
    const defaults = theme === "dark" ? DARK_DEFAULTS : LIGHT_DEFAULTS;
    setColors((prev) => ({
      shadow: picked.current.shadow ? prev.shadow : defaults.shadow,
      ring: picked.current.ring ? prev.ring : defaults.ring,
    }));
  }, [theme]);

  // `smooth-ring-*` does nothing without a ring, so don't offer it as a target.
  const activeTarget: Target = ring ? target : "shadow";
  const shadowTinted = colors.shadow !== DEFAULT_SHADOW;

  const size = SIZES[selected];
  const classString = [
    ring ? size.ring : size.smooth,
    `shadow-${tokenFor(colors.shadow)}`,
    ring ? `smooth-ring-${tokenFor(colors.ring)}/${RING_ALPHA}` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="w-full space-y-5">
      <h2 className="font-medium leading-tight">Try it out</h2>
      {/* Concentric radii: the card's 16px minus its 8px padding leaves exactly
          the panel's 8px, so the two curves stay parallel instead of the inner
          one bulging against a wider outer corner. */}
      <div className="p-2 rounded-2xl bg-neutral-50 dark:bg-neutral-950 space-y-2">
        <div className="flex items-center justify-center gap-8 sm:gap-16 px-6 py-24">
          <div className="flex flex-col items-center gap-3">
            <Stage
              shadowKey={size.tailwind}
              className={cn("shadow-black/10 dark:shadow-white/10", size.tailwind)}
              style={
                shadowTinted
                  ? ({
                      "--tw-shadow-color": mix(colors.shadow, DEFAULT_SHADOW_ALPHA),
                    } as CSSProperties)
                  : undefined
              }
            />
            <span className="text-sm text-neutral-400">Default</span>
          </div>
          <div className="flex flex-col items-center gap-3">
            <Stage
              shadowKey={ring ? size.ring : size.smooth}
              className={ring ? size.ring : size.smooth}
              style={
                {
                  ...(shadowTinted ? { "--tw-shadow-color": colors.shadow } : {}),
                  ...(ring ? { "--smooth-ring-color": mix(colors.ring, RING_ALPHA) } : {}),
                } as CSSProperties
              }
            />
            <span className="text-sm text-neutral-400">{ring ? "Smooth + ring" : "Smooth"}</span>
          </div>
        </div>

        {/* The controls get their own raised surface inside the card, wearing
            the plugin's own elevated-surface utility. Centering each row on its
            own width left three different edges and read as three things
            floating; a labelled panel gives them one column to line up in. */}
        <div className="space-y-4 rounded-lg bg-white dark:bg-neutral-900 p-4 smooth-shadow-ring-xs">
          {/* A slider, because the five sizes are one ordered scale — dragging
              up and down it shows the ramp in a way five separate buttons
              never did. */}
          {/* No value readout: the class string at the foot of the panel already
              names the size, and it was the only control that needed a fixed
              slot to keep the row from shuffling as you drag. */}
          <Field label="Size">
            <SizeSlider value={selected} onChange={setSelected} label={size.label} />
          </Field>

          <Field label="Ring">
            <Switch checked={ring} onCheckedChange={setRing} label="Ring" />
          </Field>

          <Field label="Color" align="start">
            {/* `w-fit` so the segmented track hugs its two options instead of
                stretching to fill the control column. */}
            <div className="w-fit space-y-2">
              <Segmented>
                {[
                  { label: "Shadow", value: "shadow" as Target },
                  { label: "Ring", value: "ring" as Target },
                ].map((option) => (
                  <Segment
                    key={option.label}
                    active={activeTarget === option.value}
                    layoutId="target-selector"
                    onClick={() => setTarget(option.value)}
                    // `smooth-ring-*` does nothing without a ring to paint.
                    disabled={!ring && option.value === "ring"}
                    dot={colors[option.value]}
                  >
                    {option.label}
                  </Segment>
                ))}
              </Segmented>

              {/* Each dot carries a 28px transparent target around it — they
                  were a pixel hunt at their own 20px size. `-mx-1` pulls that
                  padding back out so the first dot's *edge* lands on the column,
                  not its hit area. Wrapping against a 12-target cap rather than
                  a fixed 12-column grid: it still breaks two-by-twelve at full
                  width, but reflows to whatever fits once the panel narrows,
                  where a fixed grid would just overflow. */}
              <div className="-mx-1 flex w-full max-w-[21.5rem] flex-wrap items-center">
              {SWATCHES.map(({ hex, token }) => {
                const active = colors[activeTarget] === hex;
                return (
                  <motion.button
                    key={hex}
                    type="button"
                    aria-label={`${activeTarget} ${token}`}
                    aria-pressed={active}
                    title={token}
                    onClick={() => {
                      picked.current[activeTarget] = true;
                      setColors((prev) => ({ ...prev, [activeTarget]: hex }));
                    }}
                    className="group grid size-7 cursor-pointer place-items-center rounded-full outline-none"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.9 }}
                    transition={{ type: "spring", stiffness: 500, damping: 28 }}
                  >
                    <span
                      className={cn(
                        "size-5 rounded-full border-[1.5px] transition-colors",
                        active
                          ? "border-black/5 ring-[1.5px] ring-offset-2 ring-offset-white dark:border-white/15 dark:ring-offset-neutral-900"
                          : "border-black/5 group-hover:border-black/10 dark:border-white/15 dark:group-hover:border-white/25"
                      )}
                      style={{
                        backgroundColor: hex,
                        // The swatch's own color rather than a fixed grey, so it
                        // reads as "this one" instead of a generic marker on top
                        // of it — contrast-corrected so it can't vanish.
                        ...(active ? { "--tw-ring-color": ringColor(hex, theme) } : {}),
                      }}
                    />
                  </motion.button>
                );
              })}
              </div>
            </div>
          </Field>

          {/* The class string is the panel's output, so it lives in the panel —
              a hairline and the panel's own padding instead of a third bordered
              box nested inside the second. Not wrapped: a long string truncates
              under the fade like every other snippet on the page. */}
          <div className="-mx-4 -mb-4 border-t border-neutral-200 dark:border-neutral-800">
            <CodeField code={`<div className="${classString}" />`} plain bare />
          </div>
        </div>
      </div>
    </div>
  );
}
