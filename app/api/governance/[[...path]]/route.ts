import { NextRequest, NextResponse } from 'next/server';
import {
  actorFromRequest,
  getGovernanceRuntime,
  governanceEnabled,
} from '../../../../lib/governance-runtime.mjs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteCtx = { params: Promise<{ path?: string[] }> };

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { 'X-Aurion-Governance': 'mav-2.1.0' },
  });
}

function err(e: unknown, fallback = 500) {
  const status = typeof (e as { status?: number })?.status === 'number'
    ? (e as { status: number }).status
    : fallback;
  const message = e instanceof Error ? e.message : 'Internal error';
  return json({ ok: false, error: message }, status);
}

async function ensureEnabled() {
  if (!governanceEnabled()) {
    return json(
      { ok: false, error: 'Governance API disabled (AURION_GOVERNANCE_ENABLED)' },
      503,
    );
  }
  return null;
}

/** GET /api/governance → status; GET /api/governance/runs/:id → run */
export async function GET(req: NextRequest, ctx: RouteCtx) {
  const blocked = await ensureEnabled();
  if (blocked) return blocked;
  try {
    const { path = [] } = await ctx.params;
    const rt = await getGovernanceRuntime();
    if (path.length === 0) {
      return json(await rt.status());
    }
    if (path[0] === 'catalog') {
      const {
        WORKFLOWS,
        MODE_FAMILIES,
        ALL_MODES,
        CONNECTORS,
        CONNECTOR_POLICY,
        ENGINE_PIPELINE,
        MASTER_STACKS,
        SKILL_FAMILIES,
        CATALOG_VERSION,
        WORKFLOW_PROFILES,
      } = await import('../../../../packages/aurion-governance-mav/catalog.v2.mjs');
      return json({
        ok: true,
        catalogVersion: CATALOG_VERSION,
        workflows: WORKFLOWS,
        modeFamilies: MODE_FAMILIES,
        modeCount: ALL_MODES.length,
        connectors: CONNECTORS,
        connectorPolicy: CONNECTOR_POLICY,
        enginePipeline: ENGINE_PIPELINE,
        masterStacks: MASTER_STACKS,
        skillFamilies: SKILL_FAMILIES,
        workflowProfiles: WORKFLOW_PROFILES,
      });
    }
    if (path[0] === 'runs' && path.length === 2) {
      const runs = await rt.store.read('runs');
      const run = runs.find((r: { id: string }) => r.id === path[1]);
      if (!run) return json({ ok: false, error: 'Run not found' }, 404);
      return json({ ok: true, run });
    }
    return json({ ok: false, error: 'Not found' }, 404);
  } catch (e) {
    return err(e);
  }
}

/**
 * POST /api/governance/runs
 * POST /api/governance/runs/:id/verify
 * POST /api/governance/runs/:id/review
 * POST /api/governance/approvals/:id/decide
 */
export async function POST(req: NextRequest, ctx: RouteCtx) {
  const blocked = await ensureEnabled();
  if (blocked) return blocked;
  try {
    const { path = [] } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const actor = actorFromRequest(req, body);
    const rt = await getGovernanceRuntime();

    if (path.length === 1 && path[0] === 'runs') {
      const run = await rt.createRun(
        {
          objective: String(body.objective || 'Governance verification'),
          workflowId: body.workflowId || 'governance-multi-agent-verification',
          modes: Array.isArray(body.modes) ? body.modes : [],
          domain: body.domain || 'governance',
        },
        actor,
      );
      return json({ ok: true, run }, 201);
    }

    if (path[0] === 'runs' && path.length === 3 && path[2] === 'verify') {
      const report = await rt.verifyRun(path[1]);
      return json({ ok: report.ok, report });
    }

    if (path[0] === 'runs' && path.length === 3 && path[2] === 'review') {
      const approval = await rt.requestGovernanceReview(path[1], actor);
      return json({ ok: true, approval }, 201);
    }

    if (path[0] === 'approvals' && path.length === 3 && path[2] === 'decide') {
      const decision = body.decision === 'approved' || body.decision === 'rejected'
        ? body.decision
        : null;
      if (!decision) {
        return json({ ok: false, error: 'decision must be approved or rejected' }, 400);
      }
      const approval = await rt.decideApproval(path[1], decision, actor);
      return json({ ok: true, approval });
    }

    return json({ ok: false, error: 'Not found' }, 404);
  } catch (e) {
    return err(e);
  }
}
