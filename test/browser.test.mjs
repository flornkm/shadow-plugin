import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import test from "node:test";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const repo = new URL("..", import.meta.url).pathname.replace(/\/$/, "");
const chromeCandidates = [
  process.env.CHROME_BIN,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);

async function firstExecutable(paths) {
  for (const path of paths) {
    try {
      await execFileAsync(path, ["--version"]);
      return path;
    } catch {
      // Keep looking for a browser supplied by the host or CI.
    }
  }
  return null;
}

const chrome = await firstExecutable(chromeCandidates);

test(
  "browser resolves built-in colors and scoped complete-level overrides",
  { skip: chrome ? false : "Chromium is not available" },
  async () => {
    const directory = await mkdtemp(join(repo, ".shadow-plugin-browser-"));
    const input = join(directory, "input.css");
    const output = join(directory, "output.css");
    const html = join(directory, "index.html");

    try {
      await writeFile(
        input,
        `@import "tailwindcss";\n@import "${repo}/src/index.css";\n@source inline("smooth-shadow-elevation-1 smooth-shadow-elevation-3 smooth-shadow-elevation-5 shadow-blue-500/50");\n`,
      );
      await execFileAsync(
        "npx",
        ["--no-install", "@tailwindcss/cli", "--cwd", repo, "-i", input, "-o", output],
        { cwd: repo },
      );
      await writeFile(
        html,
        `<!doctype html><link rel="stylesheet" href="file://${output}">
<div id="low" class="smooth-shadow-elevation-1 shadow-blue-500/50"></div>
<div id="high" class="smooth-shadow-elevation-5 shadow-blue-500/50"></div>
<div style="--smooth-shadow-elevation-3: 0 2px 3px rgb(255 0 0 / 40%), 0 14px 30px rgb(255 0 0 / 20%)">
  <div id="custom" class="smooth-shadow-elevation-3"></div>
</div>
<script>
  const style = (id) => getComputedStyle(document.querySelector(id)).boxShadow;
  document.body.dataset.low = style('#low');
  document.body.dataset.high = style('#high');
  document.body.dataset.custom = style('#custom');
</script>`,
      );

      const { stdout } = await execFileAsync(
        chrome,
        ["--headless", "--no-sandbox", "--disable-gpu", "--dump-dom", `file://${html}`],
        { maxBuffer: 1024 * 1024 * 4 },
      );
      const body = stdout.match(/<body[^>]+>/)?.[0] ?? "";
      const attribute = (name) => body.match(new RegExp(`data-${name}="([^"]*)"`))?.[1] ?? "";
      const low = attribute("low");
      const high = attribute("high");
      const custom = attribute("custom");

      assert.doesNotMatch(low, /color\(srgb 0 0 0/);
      assert.match(low, /1px 2px/);
      assert.match(low, /1px 8px/);
      assert.doesNotMatch(high, /color\(srgb 0 0 0/);
      assert.match(high, /32px 40px/);
      assert.match(custom, /rgba\(255, 0, 0, 0\.4\) 0px 2px 3px/);
      assert.match(custom, /rgba\(255, 0, 0, 0\.2\) 0px 14px 30px/);
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
