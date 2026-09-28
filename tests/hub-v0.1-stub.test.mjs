import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const root = process.cwd();

/** Hardcoded vendor preview / contract host URLs we must not ship. */
const FORBIDDEN_HOST_RE = /https?:\/\/[^\s"'`]*vercel\.app/i;

test('HUB stub uses /hub/v0.1 not /v0', () => {
  const stubPath = path.join(root, 'app/hub/v0.1/[[...path]]/route.ts');
  assert.equal(fs.existsSync(stubPath), true, 'hub v0.1 stub route should exist');
  const src = fs.readFileSync(stubPath, 'utf8');
  assert.match(src, /hub-phase1-intermediary/);
  assert.match(src, /\/hub\/v0\.1/);
  assert.doesNotMatch(src, FORBIDDEN_HOST_RE);
  assert.equal(fs.existsSync(path.join(root, 'app/v0')), false);
  assert.equal(fs.existsSync(path.join(root, 'app/api/v0')), false);
});

test('docs do not claim .com is deployed on Vercel', () => {
  const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');
  assert.doesNotMatch(readme, /Deployed on Vercel/i);
  assert.doesNotMatch(readme, FORBIDDEN_HOST_RE);
  assert.match(readme, /\/hub\/v0\.1/);
  assert.match(readme, /ADR-0003/);
  const adr = fs.readFileSync(path.join(root, 'docs/adr-0003-host.md'), 'utf8');
  assert.match(adr, /Cloudflare/);
  assert.doesNotMatch(adr, FORBIDDEN_HOST_RE);
  assert.match(adr, /\/hub\/v0\.1/);
});

test('plan.mjs has no hardcoded vendor preview gateway host', () => {
  const plan = fs.readFileSync(path.join(root, '.agent/scripts/plan.mjs'), 'utf8');
  assert.doesNotMatch(plan, FORBIDDEN_HOST_RE);
  assert.match(plan, /AI_GATEWAY_URL/);
  assert.match(plan, /process\.env\.AI_GATEWAY_URL/);
});
