import { test, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';
import { pathToFileURL } from 'node:url';

const runtimePath = path.join(
  path.dirname(new URL(import.meta.url).pathname),
  '..',
  'lib',
  'governance-runtime.mjs',
);

const ENV_KEYS = [
  'AURION_GOVERNANCE_ENABLED',
  'AURION_GOVERNANCE_AUTH_TOKEN',
  'AURION_GOVERNANCE_AUTH_TOKENS',
  'AURION_GOVERNANCE_ACTOR_ID',
  'AURION_DATA_DIR',
];

const saved = {};

beforeEach(() => {
  for (const k of ENV_KEYS) {
    saved[k] = process.env[k];
    delete process.env[k];
  }
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});

async function loadRuntime() {
  // Bust module cache via query so env-dependent exports re-read process.env
  const url = pathToFileURL(runtimePath).href + `?t=${Date.now()}-${Math.random()}`;
  return import(url);
}

function mockReq(headers = {}) {
  const normalized = {};
  for (const [k, v] of Object.entries(headers)) {
    normalized[k.toLowerCase()] = v;
  }
  return {
    headers: {
      get(name) {
        return normalized[String(name).toLowerCase()] || null;
      },
    },
  };
}

test('RC2: governanceEnabled defaults OFF when env unset', async () => {
  const { governanceEnabled } = await loadRuntime();
  assert.equal(governanceEnabled(), false);
});

test('RC2: governanceEnabled true only for 1/true/yes', async () => {
  const { governanceEnabled } = await loadRuntime();
  process.env.AURION_GOVERNANCE_ENABLED = '0';
  assert.equal(governanceEnabled(), false);
  process.env.AURION_GOVERNANCE_ENABLED = 'false';
  assert.equal(governanceEnabled(), false);
  process.env.AURION_GOVERNANCE_ENABLED = '1';
  assert.equal(governanceEnabled(), true);
  process.env.AURION_GOVERNANCE_ENABLED = 'true';
  assert.equal(governanceEnabled(), true);
  process.env.AURION_GOVERNANCE_ENABLED = 'yes';
  assert.equal(governanceEnabled(), true);
});

test('RC1: spoofing actor via body/header without auth fails', async () => {
  const { actorFromRequest } = await loadRuntime();
  process.env.AURION_GOVERNANCE_AUTH_TOKENS = JSON.stringify({
    'real-token': 'alice',
  });

  const spoofReq = mockReq({
    'x-aurion-actor': 'bob-checker',
    'x-actor-id': 'bob-checker',
  });

  assert.throws(
    () =>
      actorFromRequest(
        spoofReq,
        { actorId: 'bob-checker', actor: { id: 'bob-checker' } },
        { requireAuth: true },
      ),
    (err) => err && err.status === 401,
  );
});

test('RC1: client actorId ignored; auth token binds actor', async () => {
  const { actorFromRequest } = await loadRuntime();
  process.env.AURION_GOVERNANCE_AUTH_TOKENS = JSON.stringify({
    'maker-secret': 'alice',
    'checker-secret': 'bob',
  });

  const req = mockReq({
    authorization: 'Bearer maker-secret',
    'x-aurion-actor': 'spoofed-checker',
  });
  const actor = actorFromRequest(req, { actorId: 'spoofed-checker' }, { requireAuth: true });
  assert.equal(actor.id, 'alice');
  assert.equal(actor.authenticated, true);

  const checker = actorFromRequest(
    mockReq({ 'x-aurion-auth': 'checker-secret' }),
    { actorId: 'alice' },
    { requireAuth: true },
  );
  assert.equal(checker.id, 'bob');
});

test('RC1: missing auth config rejects requireAuth paths', async () => {
  const { actorFromRequest } = await loadRuntime();
  assert.throws(
    () => actorFromRequest(mockReq(), {}, { requireAuth: true }),
    (err) => err && err.status === 401 && /not configured/i.test(err.message),
  );
});

test('RC1: single AURION_GOVERNANCE_AUTH_TOKEN maps to actor', async () => {
  const { actorFromRequest } = await loadRuntime();
  process.env.AURION_GOVERNANCE_AUTH_TOKEN = 'solo-token';
  process.env.AURION_GOVERNANCE_ACTOR_ID = 'ops-1';
  const actor = actorFromRequest(
    mockReq({ authorization: 'Bearer solo-token' }),
    { actorId: 'ignored' },
    { requireAuth: true },
  );
  assert.equal(actor.id, 'ops-1');
});

test('RC1: auth-bound maker≠checker decideApproval still works; self-approve 409', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gov-auth-'));
  process.env.AURION_DATA_DIR = dir;
  process.env.AURION_GOVERNANCE_AUTH_TOKENS = JSON.stringify({
    'tok-maker': 'maker-a',
    'tok-checker': 'checker-b',
  });

  const { actorFromRequest } = await loadRuntime();
  const { JsonStore, Runtime, GOVERNANCE_MAV } = await import(
    '../packages/aurion-governance-mav/index.mjs'
  );

  const store = new JsonStore(dir);
  const runtime = new Runtime(store);
  await runtime.init();

  const maker = actorFromRequest(
    mockReq({ authorization: 'Bearer tok-maker' }),
    { actorId: 'spoof' },
    { requireAuth: true },
  );
  assert.equal(maker.id, 'maker-a');

  const run = await runtime.createRun(
    { objective: 'Auth-bound maker checker gate', workflowId: GOVERNANCE_MAV },
    maker,
  );
  for (let i = 0; i < 80; i++) {
    const rows = await store.read('runs');
    if (rows.find((r) => r.id === run.id)?.state === 'completed') break;
    await new Promise((r) => setTimeout(r, 25));
  }
  const report = await runtime.verifyRun(run.id);
  assert.equal(report.ok, true);

  const approval = await runtime.requestGovernanceReview(run.id, maker);
  assert.equal(approval.maker, 'maker-a');
  assert.equal(approval.status, 'pending');

  // Same auth-bound actor cannot decide (maker===checker)
  await assert.rejects(
    () => runtime.decideApproval(approval.id, 'approved', maker),
    (err) => err && err.status === 409,
  );

  // Spoofed client identity must not bypass — wrong/missing token already 401 above;
  // distinct auth-bound checker succeeds
  const checker = actorFromRequest(
    mockReq({ authorization: 'Bearer tok-checker' }),
    { actorId: 'maker-a' },
    { requireAuth: true },
  );
  assert.equal(checker.id, 'checker-b');

  const decided = await runtime.decideApproval(approval.id, 'approved', checker);
  assert.equal(decided.status, 'approved');
  assert.equal(decided.checker, 'checker-b');
  assert.notEqual(decided.maker, decided.checker);
});
