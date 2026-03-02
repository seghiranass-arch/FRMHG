import { AdminShell } from "../../components/tailadmin/admin-shell";
import { AutoLayout } from "../auto-layout";
import { requireAuth } from "../../lib/server-auth";

export default async function ProfileLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAuth();
  return (
    <AdminShell user={user}>
      <AutoLayout user={user}>
        {children}
      </AutoLayout>
    </AdminShell>
  );
}
