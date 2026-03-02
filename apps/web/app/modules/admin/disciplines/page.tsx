import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { DisciplinesList } from "./disciplines-list";
import { PageHeader } from "../../../../components/dashboard/page-header";

type Discipline = {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
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

async function getDisciplines(): Promise<Discipline[]> {
  const token = await getAuthToken();
  if (!token) return [];
  
  try {
    const apiUrl = await getApiUrl();
    const res = await fetch(`${apiUrl}/settings/disciplines`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Error fetching disciplines:", e);
    return [];
  }
}

async function createDiscipline(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/disciplines`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });
  
  revalidatePath("/modules/admin/disciplines");
}

async function updateDiscipline(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/disciplines/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ is_active }),
  });
  
  revalidatePath("/modules/admin/disciplines");
}

async function updateDisciplineFields(id: string, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/disciplines/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ name, description }),
  });
  
  revalidatePath("/modules/admin/disciplines");
}

async function toggleDisciplineStatus(id: string, is_active: boolean) {
  "use server";
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/disciplines/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ is_active }),
  });
  
  revalidatePath("/modules/admin/disciplines");
}

async function deleteDiscipline(id: string) {
  "use server";
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/disciplines/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
  });

  revalidatePath("/modules/admin/disciplines");
}

export default async function DisciplinesPage() {
  const disciplines = await getDisciplines();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestion des Disciplines" 
        subtitle="Configurez les sports pratiqués au sein de la fédération"
        user={null as any}
        usePlainStyle={false}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm h-fit">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une discipline</h3>
          <form action={createDiscipline} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la discipline</label>
              <input
                name="name"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ex: Roller Hockey"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={3}
                className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Brève description..."
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors shadow-sm"
            >
              Créer la discipline
            </button>
          </form>
        </div>

        {/* Liste des disciplines */}
        <div className="lg:col-span-2 space-y-4">
          <DisciplinesList 
            disciplines={disciplines} 
            onToggleStatus={toggleDisciplineStatus}
            onEdit={updateDisciplineFields}
            onDelete={deleteDiscipline}
          />
        </div>
      </div>
    </div>
  );
}
