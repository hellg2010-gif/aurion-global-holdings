import path from 'node:path';
import { JsonStore, Runtime } from '../packages/aurion-governance-mav/index.mjs';

const globalForGov = globalThis;

function dataDir() {
  return process.env.AURION_DATA_DIR || path.join(process.cwd(), '.data', 'governance');
}

/**
 * Governance API is OFF unless explicitly enabled.
 * Set AURION_GOVERNANCE_ENABLED to "1", "true", or "yes" to expose /api/governance.
 */
export function governanceEnabled() {
  const v = process.env.AURION_GOVERNANCE_ENABLED;
  if (v === undefined || v === '') return false;
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

/**
 * Parse server-side token → actorId map.
 * Prefer AURION_GOVERNANCE_AUTH_TOKENS JSON: {"tokenA":"alice","tokenB":"bob"}
 * Fallback: AURION_GOVERNANCE_AUTH_TOKEN + optional AURION_GOVERNANCE_ACTOR_ID
 */
export function authTokenActorMap() {
  const multi = process.env.AURION_GOVERNANCE_AUTH_TOKENS;
  if (multi && String(multi).trim()) {
    try {
      const parsed = JSON.parse(multi);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        const out = {};
        for (const [token, actorId] of Object.entries(parsed)) {
          if (token && actorId != null && String(actorId).trim()) {
            out[String(token)] = String(actorId).trim();
          }
        }
        if (Object.keys(out).length) return out;
      }
    } catch {
      // fall through to single-token config
    }
  }
  const single = process.env.AURION_GOVERNANCE_AUTH_TOKEN;
  if (single && String(single).trim()) {
    const actorId = String(
      process.env.AURION_GOVERNANCE_ACTOR_ID || 'governance-operator',
    ).trim();
    return { [String(single).trim()]: actorId };
  }
  return null;
}

function extractAuthToken(req) {
  const auth = req?.headers?.get?.('authorization') || '';
  const m = String(auth).match(/^Bearer\s+(\S+)/i);
  if (m) return m[1].trim();
  const alt =
    req?.headers?.get?.('x-aurion-auth') ||
    req?.headers?.get?.('x-aurion-governance-token') ||
    '';
  return String(alt).trim();
}

function unauthorized(message) {
  const err = new Error(message);
  err.status = 401;
  return err;
}

/**
 * Resolve actor identity for governance requests.
 *
 * Client-supplied body.actorId / x-aurion-actor / x-actor-id are NEVER trusted
 * for paths that feed create / review / decide (maker≠checker). Identity comes
 * only from a server-configured auth token mapped to an actor id.
 *
 * @param {Request} req
 * @param {object} [_body] ignored for identity — kept for call-site compat
 * @param {{ requireAuth?: boolean }} [opts]
 * @returns {{ id: string, authenticated: boolean }}
 */
export function actorFromRequest(req, _body = {}, opts = {}) {
  const requireAuth = opts.requireAuth !== false;
  const token = extractAuthToken(req);
  const map = authTokenActorMap();

  if (token && map && map[token]) {
    return { id: map[token], authenticated: true };
  }

  if (requireAuth) {
    if (!map) {
      throw unauthorized(
        'Unauthorized: governance auth not configured (set AURION_GOVERNANCE_AUTH_TOKEN or AURION_GOVERNANCE_AUTH_TOKENS)',
      );
    }
    throw unauthorized(
      'Unauthorized: valid Bearer / x-aurion-auth governance token required (client actorId headers are ignored)',
    );
  }

  // Non-sensitive paths only — never bind identity from client actor headers/body
  return { id: 'anonymous', authenticated: false };
}
