import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  compilePlan,
  GOVERNANCE_MAV,
  WORKFLOWS,
  WORKFLOW_PROFILES,
  ALL_MODES,
  normalizeMode,
  JsonStore,
  Runtime,
  CATALOG_VERSION,
  ENGINE_PIPELINE,
  MASTER_STACKS,
  CONNECTORS,
  CONNECTOR_POLICY,
  SKILL_FAMILIES,
  VERSION
} from '../index.mjs';
import path from 'node:path';
import fs from 'node:fs/promises';
import os from 'node:os';

test('governance workflow is registered', () => {
  assert.ok(WORKFLOWS.includes(GOVERNANCE_MAV));
  assert.ok(WORKFLOW_PROFILES[GOVERNANCE_MAV]?.length > 0);
});

test('new governance modes exist', () => {
  for (const m of ['VERIFICATIONLEDGER', 'AGENTCONSENSUS', 'AGENTDISSENT', 'GOVERNANCEGATE', 'RELEASEGATE']) {
    assert.ok(ALL_MODES.includes(m), `missing mode ${m}`);
  }
});

test('aliases normalize', () => {
  assert.equal(normalizeMode('AI GOVERNANCE'), 'AI_GOVERNANCE');
  assert.equal(normalizeMode('AGENT VERIFICATION'), 'AGENTVERIFICATION');
  assert.equal(normalizeMode('MULTI AGENT'), 'MULTIAGENT');
  assert.equal(normalizeMode('CROSS MODEL VERIFY'), 'CROSSMODELVERIFY');
});

test('governance-multi-agent-verification compiles with required modes', () => {
  const plan = compilePlan({
    objective: 'Run multi-agent governance verification for release',
    workflowId: GOVERNANCE_MAV
  });
  assert.equal(plan.schema, 'aurion.plan.v2');
  assert.ok(plan.commands.includes('AGENTVERIFICATION'));
  assert.ok(plan.commands.includes('AI_GOVERNANCE'));
  assert.ok(plan.commands.includes('FINALVERIFICATION'));
  assert.ok(plan.commands.includes('MULTIAGENT'));
  assert.ok(plan.commands.includes('HUMANINTHELOOP'));
});

test('objective heuristic adds governance modes without workflow', () => {
  const plan = compilePlan({
    objective: 'Council multi-agent verification of governance gates'
  });
  assert.ok(plan.commands.includes('AI_GOVERNANCE'));
  assert.ok(plan.commands.includes('AGENTVERIFICATION'));
});

test('implications expand AGENTVERIFICATION and GOVERNANCEGATE', () => {
  const plan = compilePlan({
    objective: 'Gate a release with agent verification',
    modes: ['GOVERNANCEGATE']
  });
  assert.ok(plan.commands.includes('AI_GOVERNANCE'));
  assert.ok(plan.commands.includes('AGENTVERIFICATION'));
  assert.ok(plan.commands.includes('AGENTCRITIC'));
  assert.ok(plan.commands.includes('CROSSMODELVERIFY'));
  assert.ok(plan.commands.includes('FINALVERIFICATION'));
});

test('Runtime.verifyRun requires evidence and verified claims', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gov-mav-'));
  const store = new JsonStore(dir);
  const runtime = new Runtime(store);
  await runtime.init();
  const run = await runtime.createRun(
    { objective: 'Verify multi-agent governance release package', workflowId: GOVERNANCE_MAV },
    { id: 'tester' }
  );
  for (let i = 0; i < 40; i++) {
    const rows = await store.read('runs');
    if (rows.find((r) => r.id === run.id)?.state === 'completed') break;
    await new Promise((r) => setTimeout(r, 25));
  }
  const report = await runtime.verifyRun(run.id);
  assert.equal(report.ok, true);
  assert.equal(report.releaseState, 'approved');
  assert.ok(report.evidenceCount >= 1);
  assert.ok(report.claimsVerified);

  const approval = await runtime.requestGovernanceReview(run.id, { id: 'tester' });
  assert.equal(approval.resourceType, 'governance-verification');
  assert.equal(approval.status, 'pending');

  const status = await runtime.status();
  assert.equal(status.version, '2.1.0');
  assert.equal(status.basePath, '/api/governance');
});


test('catalog rebuild exports Master AI registry', () => {
  assert.equal(CATALOG_VERSION, '2.1.0');
  assert.equal(VERSION, '2.1.0');
  assert.ok(ENGINE_PIPELINE.length >= 10);
  assert.ok(MASTER_STACKS.default.includes('FINALVERIFICATION'));
  assert.ok(MASTER_STACKS.aurion.includes('AURIONMODE'));
  assert.ok(CONNECTORS.includes('GitHub'));
  assert.ok(CONNECTORS.includes('Vercel'));
  assert.equal(CONNECTOR_POLICY.doNotAssumeConnected, true);
  assert.ok(Object.keys(SKILL_FAMILIES).length >= 5);
  assert.ok(ALL_MODES.includes('ARCHITECTUREAUDIT'));
  assert.ok(ALL_MODES.includes('BANKERMODE'));
  assert.ok(ALL_MODES.includes('RELEASEGATE'));
});

test('governance profile includes RELEASEGATE', () => {
  assert.ok(WORKFLOW_PROFILES[GOVERNANCE_MAV].includes('RELEASEGATE'));
});


test('decideApproval hard-blocks maker===checker with 409', async () => {
  const dir = await fs.mkdtemp(path.join(os.tmpdir(), 'gov-mav-mc-'));
  const store = new JsonStore(dir);
  const runtime = new Runtime(store);
  await runtime.init();
  const maker = { id: 'maker-1' };
  const run = await runtime.createRun(
    { objective: 'Maker checker separation', workflowId: GOVERNANCE_MAV },
    maker,
  );
  for (let i = 0; i < 80; i++) {
    const rows = await store.read('runs');
    if (rows.find((r) => r.id === run.id)?.state === 'completed') break;
    await new Promise((r) => setTimeout(r, 25));
  }
  await runtime.verifyRun(run.id);
  const approval = await runtime.requestGovernanceReview(run.id, maker);
  await assert.rejects(
    () => runtime.decideApproval(approval.id, 'approved', maker),
    (err) => err && err.status === 409,
  );
  const decided = await runtime.decideApproval(approval.id, 'approved', { id: 'checker-2' });
  assert.equal(decided.status, 'approved');
  assert.equal(decided.checker, 'checker-2');
  assert.notEqual(decided.maker, decided.checker);
});
