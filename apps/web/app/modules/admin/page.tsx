import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { CreateUserForm } from "./create-user-form";
import { PageHeader } from "../../../components/dashboard/page-header";

type IamUser = {
  id: string;
  email: string;
  displayName: string;
  orgId: string | null;
  orgName?: string | null;
  isActive: boolean;
  roles: string[];
};

type Club = {
  id: string;
  name: string;
  acronym: string;
  status: string;
};

type PermissionItem = {
  key: string;
  label: string;
  description?: string;
  group: string;
};

const PERMISSION_CATALOG: PermissionItem[] = [
  { key: "iam.users.read", label: "Voir utilisateurs", group: "IAM" },
  { key: "iam.users.write", label: "Gérer utilisateurs", group: "IAM" },
  { key: "iam.roles.read", label: "Voir rôles", group: "IAM" },
  { key: "iam.roles.write", label: "Gérer rôles", group: "IAM" },
  { key: "iam.permissions.write", label: "Gérer permissions", group: "IAM" },
  { key: "orgs.read", label: "Voir clubs", group: "Organisations" },
  { key: "orgs.write", label: "Gérer clubs", group: "Organisations" },
  { key: "members.read", label: "Voir membres", group: "Membres" },
  { key: "members.write", label: "Gérer membres", group: "Membres" },
  { key: "licences.read", label: "Voir licences", group: "Licences" },
  { key: "licences.approve", label: "Approuver licences", group: "Licences" },
  { key: "payments.read", label: "Voir paiements", group: "Paiements" },
  { key: "payments.approve", label: "Valider paiements", group: "Paiements" },
  { key: "equipment.read", label: "Voir matériel", group: "Matériel" },
  { key: "equipment.write", label: "Gérer matériel", group: "Matériel" },
  { key: "medical.read", label: "Voir dossiers médicaux", group: "Médical" },
  { key: "medical.write", label: "Gérer dossiers médicaux", group: "Médical" },
  { key: "sport.read", label: "Voir module sportif", group: "Sport" },
  { key: "sport.write", label: "Gérer module sportif", group: "Sport" },
  { key: "settings.write", label: "Gérer paramètres", group: "Paramètres" },
  { key: "audit.read", label: "Voir audit", group: "Audit" }
];

// Définition des rôles avec leurs descriptions
const ROLE_INFO: Record<string, { label: string; description: string; color: string }> = {
  federation_admin: {
    label: "Admin Fédération",
    description: "Accès complet à toute la plateforme",
    color: "bg-red-100 text-red-800"
  },
  club_admin: {
    label: "Admin Club",
    description: "Gestion d'un club spécifique (effectif, licences, paiements)",
    color: "bg-blue-100 text-blue-800"
  },
  dtn: {
    label: "DTN",
    description: "Direction Technique Nationale (sélections, stages, convocations)",
    color: "bg-purple-100 text-purple-800"
  },
  finance: {
    label: "Finance",
    description: "Gestion financière (paiements, cotisations, exports comptables)",
    color: "bg-green-100 text-green-800"
  },
  stock: {
    label: "Stock",
    description: "Gestion des stocks (équipements, matériel)",
    color: "bg-yellow-100 text-yellow-800"
  },
  medecin: {
    label: "Médecin",
    description: "Personnel médical (visites, blessures, rapports)",
    color: "bg-pink-100 text-pink-800"
  },
  arbitre: {
    label: "Arbitre",
    description: "Arbitres (matchs, feuilles de match)",
    color: "bg-orange-100 text-orange-800"
  }
};

const ROLE_PERMISSION_PRESETS: Record<string, string[]> = {
  federation_admin: PERMISSION_CATALOG.map(p => p.key),
  club_admin: [
    "orgs.read",
    "members.read",
    "members.write",
    "licences.read",
    "payments.read",
    "sport.read"
  ],
  dtn: ["members.read", "sport.read"],
  finance: ["payments.read"],
  stock: ["equipment.read", "equipment.write"],
  medecin: ["medical.read", "medical.write"],
  arbitre: ["sport.read"]
};

async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get("frmhg_token")?.value;
}

async function getApiUrl() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  const rawApiUrl =
    process.env.API_INTERNAL_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_URL ??
    process.env.API_URL ??
    "http://localhost:3001";
  const normalizedPath = rawApiUrl.startsWith("/") ? rawApiUrl : `/${rawApiUrl}`;
  return rawApiUrl.startsWith("http")
    ? rawApiUrl
    : `${protocol}://${host}${normalizedPath}`;
}

async function getWebBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host") || "localhost:3000";
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

async function getUsers(includeInactive = true): Promise<IamUser[]> {
  const token = await getAuthToken();
  if (!token) return [];
  const baseUrl = await getWebBaseUrl();
  
  try {
    const res = await fetch(`${baseUrl}/api/iam/users?includeInactive=${includeInactive}`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Error fetching users:", e);
    return [];
  }
}

async function getRoles(): Promise<string[]> {
  const token = await getAuthToken();
  if (!token) return [];
  const baseUrl = await getWebBaseUrl();
  
  try {
    const res = await fetch(`${baseUrl}/api/iam/roles`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Error fetching roles:", e);
    return [];
  }
}

async function getPermissions(): Promise<string[]> {
  const token = await getAuthToken();
  if (!token) return PERMISSION_CATALOG.map(p => p.key);
  const baseUrl = await getWebBaseUrl();
  
  try {
    const res = await fetch(`${baseUrl}/api/iam/permissions`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return PERMISSION_CATALOG.map(p => p.key);
    return res.json();
  } catch (e) {
    console.error("Error fetching permissions:", e);
    return PERMISSION_CATALOG.map(p => p.key);
  }
}

function buildPermissionGroups(permissionKeys: string[]) {
  const groups = new Map<string, { label: string; permissions: { key: string; label: string; description?: string }[] }>();
  permissionKeys.forEach((key) => {
    const info = PERMISSION_CATALOG.find(p => p.key === key) ?? {
      key,
      label: key,
      group: "Autres"
    };
    if (!groups.has(info.group)) {
      groups.set(info.group, { label: info.group, permissions: [] });
    }
    groups.get(info.group)!.permissions.push({
      key: info.key,
      label: info.label,
      description: info.description
    });
  });
  return Array.from(groups.values());
}

async function getClubs(): Promise<Club[]> {
  const token = await getAuthToken();
  const baseUrl = await getWebBaseUrl();
  const authHeaders: HeadersInit = token ? { authorization: `Bearer ${token}` } : {};
  
  try {
    const res = await fetch(`${baseUrl}/api/orgs`, {
      headers: authHeaders,
      cache: "no-store"
    });
    if (!res.ok) return [];
    const data = await res.json();
    const clubsOnly = data.filter((org: any) => String(org.type || "").toLowerCase() === "club");
    if (clubsOnly.length > 0) return clubsOnly;
    if (data.length > 0) return data;
  } catch (e) {
    console.error("Error fetching clubs:", e);
  }

  try {
    const apiUrl = await getApiUrl();
    const res = await fetch(`${apiUrl}/orgs`, {
      headers: authHeaders,
      cache: "no-store"
    });
    if (res.ok) {
      const data = await res.json();
      const clubsOnly = data.filter((org: any) => String(org.type || "").toLowerCase() === "club");
      if (clubsOnly.length > 0) return clubsOnly;
      if (data.length > 0) return data;
    }
  } catch (e) {
    console.error("Error fetching clubs:", e);
  }

  try {
    const res = await fetch(`${baseUrl}/api/public/sport/clubs`, {
      cache: "no-store"
    });
    if (!res.ok) return [];
    return await res.json();
  } catch (e) {
    console.error("Error fetching clubs:", e);
    return [];
  }
}

type CreateUserState = { ok: boolean; message: string };

async function createUser(prevState: CreateUserState, formData: FormData): Promise<CreateUserState> {
  "use server";
  
  const { cookies } = await import("next/headers");
  const { revalidatePath } = await import("next/cache");
  
  const email = formData.get("email") as string;
  const displayName = formData.get("displayName") as string;
  const password = formData.get("password") as string;
  const orgId = formData.get("orgId") as string;
  const rolesStr = formData.get("roles") as string;
  const roles = rolesStr ? rolesStr.split(",").filter(Boolean) : [];
  const permissionsStr = formData.get("permissions") as string;
  const permissions = permissionsStr ? permissionsStr.split(",").filter(Boolean) : [];
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return { ok: false, message: "Session expirée. Veuillez vous reconnecter." };
  if (roles.includes("club_admin") && !orgId) {
    return { ok: false, message: "Un club doit être sélectionné pour le rôle Admin Club." };
  }

  const baseUrl = await getWebBaseUrl();
  try {
    const res = await fetch(`${baseUrl}/api/iam/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ 
        email, 
        displayName, 
        password,
        orgId: orgId || undefined,
        roles,
        permissions
      }),
    });
    if (!res.ok) {
      const errorText = await res.text();
      return { ok: false, message: errorText || "Erreur lors de la création de l’utilisateur." };
    }
    const created = await res.json().catch(() => null);
    if (orgId && roles.includes("club_admin") && (!created || !created.orgId)) {
      await fetch(`${baseUrl}/api/iam/users/${created?.id ?? ""}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          orgId,
          roles,
          displayName,
        }),
      });
    }
    revalidatePath("/modules/admin");
    return { ok: true, message: "Utilisateur créé avec succès." };
  } catch (e) {
    return { ok: false, message: "Erreur lors de la création de l’utilisateur." };
  }
}

// Server action: Delete user
async function deleteUser(formData: FormData): Promise<void> {
  "use server";
  
  const { cookies } = await import("next/headers");
  const { revalidatePath } = await import("next/cache");
  
  const userId = formData.get("userId") as string;
  const hardDelete = formData.get("hardDelete") === "true";
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;
  
  const baseUrl = await getWebBaseUrl();
  await fetch(`${baseUrl}/api/iam/users/${userId}?hard=${hardDelete}`, {
    method: "DELETE",
    headers: { "authorization": `Bearer ${token}` },
  });
  
  revalidatePath("/modules/admin");
}

// Server action: Restore user
async function restoreUser(formData: FormData): Promise<void> {
  "use server";
  
  const { cookies } = await import("next/headers");
  const { revalidatePath } = await import("next/cache");
  
  const userId = formData.get("userId") as string;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;
  
  const baseUrl = await getWebBaseUrl();
  await fetch(`${baseUrl}/api/iam/users/${userId}/restore`, {
    method: "POST",
    headers: { "authorization": `Bearer ${token}` },
  });
  
  revalidatePath("/modules/admin");
}

// Server action: Reset password
async function resetPassword(formData: FormData): Promise<void> {
  "use server";
  
  const { cookies } = await import("next/headers");
  const { revalidatePath } = await import("next/cache");
  
  const userId = formData.get("userId") as string;
  const newPassword = formData.get("newPassword") as string;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;
  
  const apiUrl = process.env.API_INTERNAL_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://api:4000";
  
  const res = await fetch(`${apiUrl}/iam/users/${userId}/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ newPassword: newPassword || undefined }),
  });
  
  // Note: In a real app, you would show the generated password to the admin
  const data = await res.json();
  console.log("Password reset result:", data);
  
  revalidatePath("/modules/admin");
}

// Server action: Update user
async function updateUser(formData: FormData): Promise<void> {
  "use server";
  
  const { cookies } = await import("next/headers");
  const { revalidatePath } = await import("next/cache");
  
  const userId = formData.get("userId") as string;
  const displayName = formData.get("displayName") as string;
  const orgId = formData.get("orgId") as string;
  const rolesStr = formData.get("roles") as string;
  const roles = rolesStr ? rolesStr.split(",").filter(Boolean) : [];
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const baseUrl = await getWebBaseUrl();
  await fetch(`${baseUrl}/api/iam/users/${userId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      displayName,
      orgId: orgId || null,
      roles 
    }),
  });
  
  revalidatePath("/modules/admin");
}


export default async function AdminModule() {
  const [users, roles, clubs, permissionKeys] = await Promise.all([
    getUsers(true),
    getRoles(),
    getClubs(),
    getPermissions()
  ]);
  
  const activeUsers = users.filter(u => u.isActive);
  const inactiveUsers = users.filter(u => !u.isActive);
  const permissionGroups = buildPermissionGroups(permissionKeys);
  const roleList = roles.length > 0 ? roles : Object.keys(ROLE_INFO);
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Admin (IAM)" 
        subtitle="Gestion des comptes, rôles et permissions."
        user={null as any}
        usePlainStyle={false}
      />

      {/* Rôles disponibles */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div className="text-lg font-semibold text-gray-800">Rôles disponibles</div>
        <p className="mt-1 text-sm text-gray-500">{roleList.length} rôles définis dans le système</p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {roleList.map((r) => {
            const info = ROLE_INFO[r] || { label: r, description: "", color: "bg-gray-100 text-gray-800" };
            return (
              <div key={r} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${info.color}`}>
                    {info.label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-gray-500">{info.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Créer un utilisateur */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div className="text-lg font-semibold text-gray-800">Créer un utilisateur</div>
        <p className="mt-1 text-sm text-gray-500">Ajouter un nouveau compte utilisateur</p>
        
        <CreateUserForm 
          roles={roleList}
          clubs={clubs.map(c => ({ id: c.id, name: c.name, acronym: c.acronym }))}
          roleInfo={ROLE_INFO}
          permissionGroups={permissionGroups}
          rolePermissionPresets={ROLE_PERMISSION_PRESETS}
          createUserAction={createUser}
        />
      </div>

      {/* Liste des utilisateurs actifs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-lg font-semibold text-gray-800">Utilisateurs actifs</div>
            <p className="mt-1 text-sm text-gray-500">{activeUsers.length} comptes actifs</p>
          </div>
        </div>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[900px] border-separate border-spacing-0">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                <th className="border-b border-gray-200 px-3 py-3">Email</th>
                <th className="border-b border-gray-200 px-3 py-3">Nom</th>
                <th className="border-b border-gray-200 px-3 py-3">Rôles</th>
                <th className="border-b border-gray-200 px-3 py-3">Club</th>
                <th className="border-b border-gray-200 px-3 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((u) => (
                <tr key={u.id} className="text-sm text-gray-700 hover:bg-gray-50">
                  <td className="border-b border-gray-100 px-3 py-3 font-medium text-gray-800">{u.email}</td>
                  <td className="border-b border-gray-100 px-3 py-3">{u.displayName}</td>
                  <td className="border-b border-gray-100 px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.roles.map((r) => {
                        const info = ROLE_INFO[r] || { label: r, color: "bg-gray-100 text-gray-700" };
                        return (
                          <span key={r} className={`rounded px-1.5 py-0.5 text-xs font-semibold ${info.color}`}>
                            {info.label}
                          </span>
                        );
                      })}
                    </div>
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3 text-xs text-gray-500">
                    {u.orgName ?? clubs.find(c => c.id === u.orgId)?.name ?? "—"}
                  </td>
                  <td className="border-b border-gray-100 px-3 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <details className="relative">
                        <summary className="list-none cursor-pointer p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                          </svg>
                        </summary>
                        <div className="absolute right-0 z-10 mt-2 w-64 rounded-xl border border-gray-200 bg-white p-3 shadow-lg">
                          <form action={resetPassword} className="space-y-2">
                            <input type="hidden" name="userId" value={u.id} />
                            <div className="text-xs font-semibold text-gray-700">Réinitialiser le mot de passe</div>
                            <input
                              type="text"
                              name="newPassword"
                              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                              placeholder="Laisser vide pour générer"
                            />
                            <button
                              type="submit"
                              className="w-full rounded-lg bg-brand-600 px-3 py-2 text-sm font-medium text-white hover:bg-brand-700"
                            >
                              Réinitialiser
                            </button>
                          </form>
                        </div>
                      </details>
                      
                      {/* Disable Account (Soft Delete) */}
                      <form action={deleteUser} className="inline">
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="hardDelete" value="false" />
                        <button 
                          type="submit"
                          title="Désactiver le compte"
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        </button>
                      </form>
                      
                      {/* Delete Permanently */}
                      <form action={deleteUser} className="inline">
                        <input type="hidden" name="userId" value={u.id} />
                        <input type="hidden" name="hardDelete" value="true" />
                        <button 
                          type="submit"
                          title="Supprimer définitivement"
                          className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Utilisateurs désactivés */}
      {inactiveUsers.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50/30 p-5 shadow-theme-sm">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold text-gray-800">Utilisateurs désactivés</div>
              <p className="mt-1 text-sm text-gray-500">{inactiveUsers.length} comptes désactivés</p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[800px] border-separate border-spacing-0">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                  <th className="border-b border-red-200 px-3 py-3">Email</th>
                  <th className="border-b border-red-200 px-3 py-3">Nom</th>
                  <th className="border-b border-red-200 px-3 py-3">Rôles</th>
                  <th className="border-b border-red-200 px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {inactiveUsers.map((u) => (
                  <tr key={u.id} className="text-sm text-gray-500">
                    <td className="border-b border-red-100 px-3 py-3 font-medium">{u.email}</td>
                    <td className="border-b border-red-100 px-3 py-3">{u.displayName}</td>
                    <td className="border-b border-red-100 px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.roles.map((r) => {
                          const info = ROLE_INFO[r] || { label: r };
                          return (
                            <span key={r} className="rounded px-1.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-500">
                              {info.label}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="border-b border-red-100 px-3 py-3">
                      <div className="flex items-center justify-end gap-1">
                        {/* Restore */}
                        <form action={restoreUser} className="inline">
                          <input type="hidden" name="userId" value={u.id} />
                          <button 
                            type="submit"
                            title="Réactiver le compte"
                            className="p-1.5 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </button>
                        </form>
                        
                        {/* Hard Delete */}
                        <form action={deleteUser} className="inline">
                          <input type="hidden" name="userId" value={u.id} />
                          <input type="hidden" name="hardDelete" value="true" />
                          <button 
                            type="submit"
                            title="Supprimer définitivement"
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-lg transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Section Clubs */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div className="flex items-center justify-between">
          <div className="text-lg font-semibold text-gray-800">Clubs enregistrés</div>
          <div className="text-sm text-gray-500">{clubs.length} clubs</div>
        </div>
        <p className="mt-1 text-sm text-gray-500">Liste des clubs disponibles pour l'affectation</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {clubs.map((club) => (
            <div key={club.id} className="rounded-xl border border-gray-100 bg-gray-50/50 p-3">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-800 text-sm">{club.name}</span>
                <span className="text-xs text-gray-500">{club.acronym}</span>
              </div>
              <div className="mt-2 flex items-center gap-2">
                <span className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
                  club.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {club.status === 'active' ? 'Actif' : 'En attente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Configuration Plateforme */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
        <div className="text-lg font-semibold text-gray-800">Configuration Plateforme</div>
        <p className="mt-1 text-sm text-gray-500">Gérez les paramètres globaux du système.</p>
        
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link 
            href="/modules/admin/disciplines"
            className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-brand-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-brand-50 text-brand-600 group-hover:bg-brand-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2h1.5a2.5 2.5 0 012.5 2.5V17m-5 3h6a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v11a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-800">Disciplines Sportives</div>
              <p className="text-xs text-gray-500">Hockey sur glace, Roller, etc.</p>
            </div>
          </Link>

          <Link 
            href="/modules/admin/subscriptions"
            className="group flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:border-brand-200 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-green-50 text-green-600 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <div className="font-semibold text-gray-800">Types d'Abonnement</div>
              <p className="text-xs text-gray-500">Tarifs, durées et forfaits.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
