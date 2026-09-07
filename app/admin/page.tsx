import { redirect } from "next/navigation";
import AdminConsole from "./AdminConsole";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAdminAuthContext } from "@/lib/admin-auth";
import { maskEmail } from "@/lib/email";

export default async function AdminPage() {
  const auth = await getAdminAuthContext();

  if (!auth.userId) {
    redirect("/admin/login?next=/admin");
  }

  if (!auth.isAdmin) {
    redirect("/admin/login?reason=unauthorized");
  }

  if (!auth.supabase) {
    redirect("/admin/login");
  }

  const { data: records } = await auth.supabase
    .from("admin_config_records")
    .select(
      "id, config_type, name, category, description, enabled, risk_level, approval_status, requires_credentials, updated_at",
    )
    .order("updated_at", { ascending: false });

  async function logoutAction() {
    "use server";
    const supabase = await createServerSupabaseClient();
    await supabase?.auth.signOut();
    redirect("/admin/login");
  }

  return (
    <>
      <form action={logoutAction} className="fixed right-4 top-20 z-50">
        <button
          type="submit"
          className="rounded-full border border-white/15 bg-[#0f1423]/90 px-4 py-2 text-xs text-white/80"
        >
          Secure logout
        </button>
      </form>
      <AdminConsole
        initialRecords={records ?? []}
        maskedEmail={auth.email ? maskEmail(auth.email) : null}
      />
    </>
  );
}
