import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const read = (path) =>
  readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

test("the required theme bootstrap runs before application JavaScript", () => {
  const html = read("index.html");
  const themePosition = html.indexOf('get("scoutTheme")');
  const appPosition = html.indexOf('src="/src/main.tsx"');

  assert.ok(themePosition > 0);
  assert.ok(appPosition > themePosition);
  assert.match(html, /document\.documentElement\.setAttribute\("data-theme", theme\)/);
});

test("the complete Clawpilot theme and required typography are present", () => {
  const css = read("src/index.css");
  const requiredTokens = [
    "--cp-bg",
    "--cp-bg-elevated",
    "--cp-surface",
    "--cp-border",
    "--cp-text",
    "--cp-accent",
    "--cp-success",
    "--cp-danger",
    "--cp-warning",
    "--cp-link",
  ];

  for (const token of requiredTokens) assert.ok(css.includes(token), token);
  assert.match(
    css,
    /"Segoe UI", Aptos, Calibri, -apple-system, BlinkMacSystemFont, sans-serif/,
  );
  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /@media print/);
});

test("the key product surfaces are linked from the application shell", () => {
  const app = read("src/App.tsx");
  const collection = read("src/components/CollectionView.tsx");

  for (const route of [
    "briefing",
    "collect",
    "sources",
    "priorities",
    "about",
  ]) {
    assert.match(app, new RegExp(`"${route}"`));
  }
  assert.match(app, /IgorMark/);
  assert.match(app, /loadArchive/);
  assert.match(collection, /Collection workflow runs/);
  assert.match(collection, /fetchCollectionRuns/);
  assert.match(collection, /Prepared locally, but no matching GitHub run yet/);
  assert.match(app, /parseWorkspace/);
  assert.match(app, /saveWorkspace/);
  assert.match(app, /exportWorkspace/);
});

test("the repository contains no obvious credential literals", () => {
  const files = [
    "src/App.tsx",
    "src/data/seed.ts",
    "src/lib/workspace.ts",
    "src/lib/githubRuns.ts",
    ".github/workflows/pages.yml",
    ".github/workflows/collect.yml",
    "scripts/collect.mjs",
  ];
  const secretPatterns = [
    /gho_[A-Za-z0-9]{20,}/,
    /github_pat_[A-Za-z0-9_]{20,}/,
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /linkedin.*password\s*[:=]/i,
  ];

  for (const file of files) {
    const contents = read(file);
    for (const pattern of secretPatterns) {
      assert.doesNotMatch(contents, pattern, `${file} contains ${pattern}`);
    }
  }
});
