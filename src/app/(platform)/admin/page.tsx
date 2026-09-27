import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { canAccessAdmin } from "@/lib/admin";
import { AdminPanel } from "./AdminPanel";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!canAccessAdmin(user)) redirect("/");
  return <AdminPanel />;
}
