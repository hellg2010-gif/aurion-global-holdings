import { redirect } from "next/navigation";
import AdminLoginForm from "./AdminLoginForm";
import { getAdminAuthContext } from "@/lib/admin-auth";

export default async function AdminLoginPage() {
  const auth = await getAdminAuthContext();

  if (auth.userId && auth.isAdmin) {
    redirect("/admin");
  }

  return <AdminLoginForm />;
}
