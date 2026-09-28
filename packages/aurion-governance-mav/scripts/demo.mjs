import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { JsonStore, Runtime, GOVERNANCE_MAV, compilePlan } from '../index.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataDir = path.join(__dirname, '..', '.data');

const store = new JsonStore(dataDir);
const runtime = new Runtime(store);
await runtime.init();

const objective = 'Verify multi-agent export-hub release under AI governance';
const actor = { id: 'demo-builder' };

const preview = compilePlan({
  objective,
  workflowId: GOVERNANCE_MAV,
  domain: 'governance'
});

const run = await runtime.createRun(
  { objective, workflowId: GOVERNANCE_MAV, domain: 'governance' },
  actor
);

// Wait for async execute to finish
for (let i = 0; i < 50; i++) {
  const rows = await store.read('runs');
  const current = rows.find((r) => r.id === run.id);
  if (current?.state === 'completed' || current?.state === 'failed') break;
  await new Promise((r) => setTimeout(r, 50));
}

const rows = await store.read('runs');
const completed = rows.find((r) => r.id === run.id);
const verification = await runtime.verifyRun(run.id);
const status = await runtime.status();
const audit = await runtime.audit.verify();
const review = await runtime.requestGovernanceReview(run.id, actor);

console.log('=== AURION Governance MAV Demo (v2) ===');
console.log('workflowId:', GOVERNANCE_MAV);
console.log('runId:', completed?.id);
console.log('state:', completed?.state);
console.log('releaseState (pre-verify→post):', run.releaseState, '→', verification.releaseState);
console.log('commands:', completed?.plan?.commands?.length);
console.log('has AI_GOVERNANCE:', completed?.plan?.commands?.includes('AI_GOVERNANCE'));
console.log('has AGENTVERIFICATION:', completed?.plan?.commands?.includes('AGENTVERIFICATION'));
console.log('has FINALVERIFICATION:', completed?.plan?.commands?.includes('FINALVERIFICATION'));
console.log('has MULTIAGENT:', completed?.plan?.commands?.includes('MULTIAGENT'));
console.log('compiledCommands:', completed?.plan?.commands?.join(','));
console.log('audit.verify:', JSON.stringify(audit));
console.log('verifyRun:', JSON.stringify(verification));
console.log('status:', JSON.stringify(status));
console.log('governanceReviewApproval:', review.id, review.resourceType, review.status);
console.log('previewSchema:', preview.schema);
console.log('DEMO_OK', completed?.state === 'completed' && verification.ok);
