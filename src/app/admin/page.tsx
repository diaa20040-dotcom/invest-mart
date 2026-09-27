import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { AdminPanel } from "./AdminPanel";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user?.isAdmin) redirect("/");
  return <AdminPanel />;
}
