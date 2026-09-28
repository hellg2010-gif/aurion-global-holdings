import { NextRequest, NextResponse } from "next/server";

/**
 * Local Eng stub for Architecture OpenAPI 0.1 (ADR-0003 Accepted).
 * Contract prefix is /hub/v0.1 — NOT /v0. Contract servers are .com + localhost only.
 * Full HUB API is CONTRACT until export-portal SOR clears; only /health is live here.
 */

const PHASE = "hub-phase1-intermediary" as const;

function pathSegments(params: { path?: string[] }) {
  return params.path ?? [];
}

export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const segments = pathSegments(await ctx.params);
  if (segments.length === 0 || (segments.length === 1 && segments[0] === "health")) {
    return NextResponse.json({ status: "ok", phase: PHASE });
  }
  return NextResponse.json(
    {
      error: "not_implemented",
      message:
        "HUB /hub/v0.1 stub: only GET /health is implemented locally. See Architecture OpenAPI 0.1 (ADR-0003).",
      path: `/hub/v0.1/${segments.join("/")}`,
    },
    { status: 501 },
  );
}

export async function POST(
  _req: NextRequest,
  ctx: { params: Promise<{ path?: string[] }> },
) {
  const segments = pathSegments(await ctx.params);
  return NextResponse.json(
    {
      error: "not_implemented",
      message:
        "HUB /hub/v0.1 stub: mutating routes are contract-only until export-portal SOR clears (ADR-0003).",
      path: `/hub/v0.1/${segments.join("/")}`,
    },
    { status: 501 },
  );
}
