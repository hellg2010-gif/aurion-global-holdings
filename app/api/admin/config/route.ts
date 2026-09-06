import { NextResponse } from "next/server";
import { createAdminAuditLogger } from "@/lib/audit-events";
import { getAdminAuthContext } from "@/lib/admin-auth";
import {
  getAdminConfigPolicyError,
  validateAdminConfigInput,
} from "@/lib/admin-config-validation";

export async function GET() {
  const auth = await getAdminAuthContext();

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.isAdmin || !auth.supabase) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { data, error } = await auth.supabase
    .from("admin_config_records")
    .select(
      "id, config_type, name, category, description, enabled, risk_level, approval_status, requires_credentials, updated_at",
    )
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "Unable to load records." }, { status: 500 });
  }

  return NextResponse.json({ records: data });
}

export async function POST(request: Request) {
  const auth = await getAdminAuthContext();

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.isAdmin || !auth.supabase) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = validateAdminConfigInput(await request.json().catch(() => null));
  if (!payload.ok) {
    return NextResponse.json({ error: payload.errors.join(" ") }, { status: 400 });
  }

  const policyError = getAdminConfigPolicyError(
    payload.data,
    payload.data.confirmHighRisk,
  );
  if (policyError) {
    return NextResponse.json({ error: policyError }, { status: 400 });
  }

  const { data, error } = await auth.supabase
    .from("admin_config_records")
    .insert({
      config_type: payload.data.configType,
      name: payload.data.name,
      category: payload.data.category,
      description: payload.data.description,
      enabled: payload.data.enabled,
      risk_level: payload.data.riskLevel,
      approval_status: payload.data.approvalStatus,
      requires_credentials: payload.data.requiresCredentials,
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Unable to save record." }, { status: 500 });
  }

  const audit = createAdminAuditLogger(auth.supabase, auth.userId);
  await audit.log({
    action: "config.created",
    targetType: "admin_config_record",
    targetId: data.id,
  });

  return NextResponse.json({ id: data.id }, { status: 201 });
}
