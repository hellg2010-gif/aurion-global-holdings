import { NextResponse } from "next/server";
import { createAdminAuditLogger } from "@/lib/audit-events";
import { getAdminAuthContext } from "@/lib/admin-auth";
import { validateAdminConfigUpdateInput } from "@/lib/admin-config-validation";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const auth = await getAdminAuthContext();

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.isAdmin || !auth.supabase) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const payload = validateAdminConfigUpdateInput(await request.json().catch(() => null));
  if (!payload.ok) {
    return NextResponse.json({ error: payload.errors.join(" ") }, { status: 400 });
  }

  const { id } = await context.params;

  const { data: existing, error: existingError } = await auth.supabase
    .from("admin_config_records")
    .select("id, enabled, risk_level")
    .eq("id", id)
    .single();

  if (existingError || !existing) {
    return NextResponse.json({ error: "Record not found." }, { status: 404 });
  }

  if (
    typeof payload.data.enabled === "boolean" &&
    payload.data.enabled !== existing.enabled &&
    existing.risk_level === "high" &&
    payload.data.confirmHighRisk !== true
  ) {
    return NextResponse.json(
      { error: "High-risk changes require confirmation." },
      { status: 400 },
    );
  }

  const updates: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (payload.data.configType) updates.config_type = payload.data.configType;
  if (payload.data.name) updates.name = payload.data.name;
  if (payload.data.category) updates.category = payload.data.category;
  if (payload.data.description) updates.description = payload.data.description;
  if (typeof payload.data.enabled === "boolean") updates.enabled = payload.data.enabled;
  if (payload.data.riskLevel) updates.risk_level = payload.data.riskLevel;
  if (payload.data.approvalStatus) updates.approval_status = payload.data.approvalStatus;
  if (typeof payload.data.requiresCredentials === "boolean") {
    updates.requires_credentials = payload.data.requiresCredentials;
  }

  const { error: updateError } = await auth.supabase
    .from("admin_config_records")
    .update(updates)
    .eq("id", id);

  if (updateError) {
    return NextResponse.json({ error: "Unable to update record." }, { status: 500 });
  }

  const audit = createAdminAuditLogger(auth.supabase, auth.userId);
  await audit.log({
    action:
      typeof payload.data.enabled === "boolean"
        ? "config.enabled_toggled"
        : "config.updated",
    targetType: "admin_config_record",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(_: Request, context: RouteContext) {
  const auth = await getAdminAuthContext();

  if (!auth.userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!auth.isAdmin || !auth.supabase) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;

  const { error } = await auth.supabase
    .from("admin_config_records")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: "Unable to delete record." }, { status: 500 });
  }

  const audit = createAdminAuditLogger(auth.supabase, auth.userId);
  await audit.log({
    action: "config.deleted",
    targetType: "admin_config_record",
    targetId: id,
  });

  return NextResponse.json({ ok: true });
}
