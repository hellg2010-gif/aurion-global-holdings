import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { JsonStore, Runtime, GOVERNANCE_MAV } from '../index.mjs';

const dataDir = mkdtempSync(path.join(tmpdir(), 'aurion-gov-ci-'));
const store = new JsonStore(dataDir);
const runtime = new Runtime(store);
await runtime.init();

const actor = { id: 'ci-maker' };
const run = await runtime.createRun(
  {
    objective: 'CI verifyRun gate for G6 release',
    workflowId: GOVERNANCE_MAV,
    domain: 'governance',
  },
  actor,
);

for (let i = 0; i < 80; i++) {
  const rows = await store.read('runs');
  const current = rows.find((r) => r.id === run.id);
  if (current?.state === 'completed' || current?.state === 'failed') break;
  await new Promise((r) => setTimeout(r, 25));
}

const verification = await runtime.verifyRun(run.id);
if (!verification.ok || verification.releaseState !== 'approved') {
  console.error('CI_VERIFY_RUN_FAILED', JSON.stringify(verification));
  process.exit(1);
}
console.log('CI_VERIFY_RUN_OK', verification.runId, verification.releaseState);
