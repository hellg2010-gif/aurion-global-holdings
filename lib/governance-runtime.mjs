import path from 'node:path';
import { JsonStore, Runtime } from '../packages/aurion-governance-mav/index.mjs';

const globalForGov = globalThis;

function dataDir() {
  return process.env.AURION_DATA_DIR || path.join(process.cwd(), '.data', 'governance');
}

export function governanceEnabled() {
  const v = process.env.AURION_GOVERNANCE_ENABLED;
  if (v === undefined || v === '') return true;
  return v === '1' || v === 'true' || v === 'yes';
}

export async function getGovernanceRuntime() {
  if (!globalForGov.__aurionGovRuntime) {
    const store = new JsonStore(dataDir());
    const runtime = new Runtime(store);
    await runtime.init();
    globalForGov.__aurionGovRuntime = runtime;
  }
  return globalForGov.__aurionGovRuntime;
}

export function actorFromRequest(req, body = {}) {
  const header =
    req.headers.get('x-aurion-actor') ||
    req.headers.get('x-actor-id') ||
    '';
  const id = String(body.actorId || body.actor?.id || header || 'anonymous').trim() || 'anonymous';
  return { id };
}
