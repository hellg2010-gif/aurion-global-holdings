# AURION Governance: Multi-Agent Verification — Upgrade (v1 → v2)

## What changed

| Area | v1 | v2 |
|------|----|----|
| Package | core AURION runtime (`aurion.plan.v1`, version `1.0.0`) | `aurion-governance-mav` `2.0.0`, schema `aurion.plan.v2` |
| Workflow | no dedicated MAV workflow | `governance-multi-agent-verification` |
| Modes | AI council / multi-agent family only | + `VERIFICATIONLEDGER`, `AGENTCONSENSUS`, `AGENTDISSENT`, `GOVERNANCEGATE`, `RELEASEGATE` |
| Implications | `AI_COUNCIL`, `MULTIAGENT`, `FINALQA` | + `AGENTVERIFICATION`, `AI_GOVERNANCE`, `CONSENSUSMODE`, `GOVERNANCEGATE`, `RELEASEGATE` |
| Heuristics | security / production / compliance / export | + `/multi.?agent\|governance\|verification\|council/i` → `AI_GOVERNANCE` + `AGENTVERIFICATION` |
| Runtime API | createRun / approvals / status | + `verifyRun(runId)`, `requestGovernanceReview(runId, actor)` |
| basePath | `/jewelry/ai` | `/api/governance` (suggested) |

### New workflow profile commands

`AI_GOVERNANCE`, `MULTIAGENT`, `AGENTORCHESTRATION`, `AGENTVERIFICATION`, `AGENTCRITIC`, `AGENTJUDGE`, `AGENTREDTEAM`, `CROSSMODELVERIFY`, `CONSENSUSMODE`, `DISAGREEMENTMODE`, `AIQUALITYGATE`, `HUMANINTHELOOP`, `TRUTHMODE`, `FACTCHECK`, `SOURCECHECK`, `CONTRADICTIONCHECK`, `CLAIMAUDIT`, `FINALVERIFICATION`, `AUDITMODE`, `AUDITTRAIL`, `FINALQA`, `VERIFICATIONLEDGER`, `AGENTCONSENSUS`, `AGENTDISSENT`, `GOVERNANCEGATE`, `RELEASEGATE`

### Aliases added

- Workflow: `GOVERNANCE MULTI AGENT VERIFICATION`, `GOVERNANCE-MULTI-AGENT-VERIFICATION`, `MULTI AGENT VERIFICATION`
- Modes: `AGENT VERIFICATION`, `AI GOVERNANCE`, `MULTI AGENT`, `CROSS MODEL VERIFY`, `GOVERNANCE GATE`, `RELEASE GATE`, etc.

### Verification gate

`Runtime.verifyRun(runId)` checks:

1. Audit ledger chain validity
2. Evidence length ≥ 1
3. All claims `verified === true`

Only then may `releaseState` become `approved`.

`Runtime.requestGovernanceReview` opens a maker-checker approval with `resourceType: 'governance-verification'`.

## Local usage

```bash
cd /workspace/gov-mav
npm test
npm run demo
```

```js
import { Runtime, JsonStore, GOVERNANCE_MAV, compilePlan } from 'aurion-governance-mav';
```

## Plug into the Next.js host (host-agnostic / Cloudflare target)

ADR-0003 Accepted: production `aurionglobalholdings.com` is **not** claimed on Vercel. Prefer Cloudflare / owner-attached DNS. Optional `vercel.json` in this folder is rewrite/header config only — merge into the parent Next app config if useful; it does **not** mean `.com` runs on Vercel.

1. Copy this package into the app (e.g. `packages/aurion-governance-mav` or `lib/aurion-gov-mav`).
2. Suggested route basePath: **`/api/governance`** (matches `Runtime.status().basePath` and parent rewrite/header config).
3. Env vars (typical):
   - `AURION_DATA_DIR` — persistent volume / blob mount for JsonStore
   - `AURION_GOVERNANCE_ENABLED=true` — **required**; API is OFF when unset
   - `AURION_GOVERNANCE_AUTH_TOKEN` + optional `AURION_GOVERNANCE_ACTOR_ID` — single Bearer/token → actor map
   - `AURION_GOVERNANCE_AUTH_TOKENS` — JSON map `{"tokenA":"alice","tokenB":"bob"}` for maker≠checker
   - Mutating `/api/governance` POSTs require `Authorization: Bearer <token>` (or `x-aurion-auth`); client `actorId` / `x-aurion-actor` are ignored
   - `AI_GATEWAY_API_KEY` / `AI_GATEWAY_URL` — when wiring live multi-model verify (provider-neutral; no hardcoded vendor preview hosts)
4. Serverless/edge entry (future): thin handler that constructs `JsonStore` + `Runtime`, exposes `POST /api/governance/runs`, `POST /api/governance/runs/:id/verify`, `POST /api/governance/runs/:id/review`.
5. Deploy on the approved host for `aurionglobalholdings.com` (Cloudflare target); keep this package as ESM (`"type": "module"`).

HUB contract stubs use **`/hub/v0.1`** (not `/v0`) per Architecture OpenAPI 0.1.

## GitHub next steps (`hellg2010-gif/aurion-global-holdings`)

**Do not push until auth is ready.** When ready:

1. Branch: `feat/governance-multi-agent-verification`
2. Add package under e.g. `packages/aurion-governance-mav/` (or `lib/gov-mav/`)
3. Wire CI job: `node --test` for this package
4. Open PR describing v2 schema + verify/review APIs
5. After merge: document `/api/governance` in repo `MEMORY.md` / agent routing docs
6. Optional: extend `.agent/` reviewer agent to call `verifyRun` before release labels

## Compat notes

- `JsonStore` / `AuditLedger` file layout unchanged (`runs`, `approvals`, `audit`, …).
- Existing v1 plans remain readable; new compiles emit `aurion.plan.v2`.
- Baseline v1 sources kept as `catalog.mjs.v1.bak` / `core.mjs.v1.bak` for diffing.

## v2.1.0 — Master AI catalog rebuild (2026-09-27)

- Catalog version `2.1.0` with **551** modes, **42** workflows, **93** connectors.
- Added `ENGINE_PIPELINE` (10 Master AI engines), `MASTER_STACKS` (`default` / `aurion` / `mindset`), `SKILL_FAMILIES`, `CONNECTOR_POLICY` (do not assume connected).
- Governance workflow profile now includes `RELEASEGATE`.
- HTTP: `GET /api/governance/catalog` returns the full registry.
- Runtime `status().version` → `2.1.0`; header `X-Aurion-Governance: mav-2.1.0`.
