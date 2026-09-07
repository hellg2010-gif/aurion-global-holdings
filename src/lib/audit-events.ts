import type { SupabaseClient } from "@supabase/supabase-js";

export type AdminAuditAction =
  | "config.created"
  | "config.updated"
  | "config.deleted"
  | "config.enabled_toggled";

export type AdminAuditEventInput = {
  action: AdminAuditAction;
  targetType: "admin_config_record";
  targetId: string;
  metadata?: Record<string, unknown>;
};

export function createAdminAuditLogger(
  supabase: SupabaseClient,
  actorUserId: string,
) {
  return {
    async log(event: AdminAuditEventInput) {
      await supabase.from("admin_audit_events").insert({
        actor_user_id: actorUserId,
        action: event.action,
        target_type: event.targetType,
        target_id: event.targetId,
        metadata: event.metadata ?? {},
      });
    },
  };
}
