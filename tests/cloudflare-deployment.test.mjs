import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

test("Cloudflare Worker build is configured", () => {
  const config = fs.readFileSync(path.join(root, "wrangler.jsonc"), "utf8");
  const openNextConfig = fs.readFileSync(path.join(root, "open-next.config.ts"), "utf8");
  const packageJson = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  const nextConfig = fs.readFileSync(path.join(root, "next.config.ts"), "utf8");

  assert.match(config, /"main":\s*"\.open-next\/worker\.js"/);
  assert.match(config, /"nodejs_compat"/);
  assert.match(config, /"directory":\s*"\.open-next\/assets"/);
  assert.match(openNextConfig, /defineCloudflareConfig/);
  assert.match(packageJson.scripts["cf:build"], /opennextjs-cloudflare build/);
  assert.match(packageJson.scripts["cf:preview"], /opennextjs-cloudflare preview/);
  assert.match(packageJson.scripts["cf:deploy"], /opennextjs-cloudflare deploy/);
  assert.match(nextConfig, /destination:\s*"\/api\/governance"/);
});

test("retired hosting configs are absent", () => {
  assert.equal(fs.existsSync(path.join(root, "vercel.json")), false);
  assert.equal(
    fs.existsSync(path.join(root, "packages/aurion-governance-mav/vercel.json")),
    false,
  );
});
