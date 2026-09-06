import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repo = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const elevation = await readFile(new URL("../src/elevation.css", import.meta.url), "utf8");

function utilityBody(name) {
  const start = elevation.indexOf(`@utility ${name} {`);
  assert.notEqual(start, -1, `${name} utility is missing`);
  const end = elevation.indexOf("\n}", start);
  return elevation.slice(start, end);
}

test("elevation levels separate ambient distance while reducing alpha", () => {
  assert.match(
    utilityBody("smooth-shadow-elevation-0"),
    /box-shadow: var\(--smooth-shadow-elevation-0, none\)/,
  );

  let previousRatio = 0;
  let previousContactAlpha = Infinity;
  let previousAmbientAlpha = Infinity;

  for (let level = 1; level <= 5; level += 1) {
    const body = utilityBody(`smooth-shadow-elevation-${level}`);
    assert.match(body, new RegExp(`box-shadow: var\\(\\s*--smooth-shadow-elevation-${level},`));
    const layers = [
      ...body.matchAll(
        /0 ([\d.]+)px ([\d.]+)px 0 color-mix\(in srgb, var\(--smooth-shadow-color\) ([\d.]+)%/g,
      ),
    ].map(([, offset, blur, alpha]) => ({
      offset: Number(offset),
      blur: Number(blur),
      alpha: Number(alpha),
    }));

    assert.equal(layers.length, 2, `elevation ${level} should have contact and ambient layers`);
    assert.deepEqual(layers[0], { offset: 1, blur: 2, alpha: 8 - level });

    const ambientRatio = layers[1].offset / layers[1].blur;
    assert.ok(ambientRatio > previousRatio, `elevation ${level} should separate farther`);
    assert.ok(layers[0].alpha < previousContactAlpha, `elevation ${level} contact alpha should decrease`);
    assert.ok(layers[1].alpha < previousAmbientAlpha, `elevation ${level} ambient alpha should decrease`);

    previousRatio = ambientRatio;
    previousContactAlpha = layers[0].alpha;
    previousAmbientAlpha = layers[1].alpha;
  }
});

test("both published entrypoints contain the complete elevation scale", async () => {
  for (const file of ["shadow-plugin.css", "shadow-plugin.unprefixed.css"]) {
    const css = await readFile(new URL(`../dist/${file}`, import.meta.url), "utf8");
    assert.doesNotMatch(css, /@import\s+["']\.\//);
    for (let level = 0; level <= 5; level += 1) {
      assert.match(css, new RegExp(`@utility smooth-shadow-elevation-${level}`));
    }
  }
});

test("Tailwind compiles the published elevation utilities", async () => {
  const directory = await mkdtemp(join(repo, ".shadow-plugin-package-"));
  const input = join(directory, "input.css");
  const output = join(directory, "output.css");

  try {
    await writeFile(
      input,
      `@import "tailwindcss";\n@import "${repo}/dist/shadow-plugin.css";\n@source inline("smooth-shadow-elevation-0 smooth-shadow-elevation-3 smooth-shadow-elevation-5");\n`,
    );
    await execFileAsync(
      "npx",
      ["--no-install", "@tailwindcss/cli", "--cwd", repo, "-i", input, "-o", output],
      { cwd: repo },
    );
    const css = await readFile(output, "utf8");
    assert.match(css, /\.smooth-shadow-elevation-0\s*\{/);
    assert.match(css, /\.smooth-shadow-elevation-3\s*\{/);
    assert.match(css, /\.smooth-shadow-elevation-5\s*\{/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
