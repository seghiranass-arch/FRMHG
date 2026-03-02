import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { SeasonsList } from "./seasons-list";
import { PageHeader } from "../../../../components/dashboard/page-header";

type Season = {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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
    "http://localhost:3001";
  const normalizedPath = rawApiUrl.startsWith("/") ? rawApiUrl : `/${rawApiUrl}`;
  return rawApiUrl.startsWith("http")
    ? rawApiUrl
    : `${protocol}://${host}${normalizedPath}`;
}

async function getSeasons(): Promise<Season[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const apiUrl = await getApiUrl();
    const res = await fetch(`${apiUrl}/licensing/seasons`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data || []).map((s: any) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      startDate: s.start_date ?? s.startDate,
      endDate: s.end_date ?? s.endDate,
      isActive: s.is_active ?? s.isActive,
      createdAt: s.created_at ?? s.createdAt,
      updatedAt: s.updated_at ?? s.updatedAt,
    }));
  } catch (e) {
    console.error("Error fetching seasons:", e);
    return [];
  }
}

async function createSeason(formData: FormData) {
  "use server";
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const isActive = formData.get("isActive") === "true";

  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/licensing/seasons`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ code, name, startDate, endDate, isActive }),
  });

  revalidatePath("/modules/admin/seasons");
}

async function updateSeasonFields(id: string, formData: FormData) {
  "use server";
  const code = formData.get("code") as string;
  const name = formData.get("name") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const isActive = formData.get("isActive") === "true";

  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/licensing/seasons/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ code, name, startDate, endDate, isActive }),
  });

  revalidatePath("/modules/admin/seasons");
}

async function toggleSeasonStatus(id: string, isActive: boolean) {
  "use server";
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/licensing/seasons/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ isActive }),
  });

  revalidatePath("/modules/admin/seasons");
}

async function deleteSeason(id: string) {
  "use server";
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/licensing/seasons/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
  });

  revalidatePath("/modules/admin/seasons");
}

export default async function SeasonsPage() {
  const seasons = await getSeasons();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestion des Saisons" 
        subtitle="Créez et pilotez les saisons sportives de la fédération"
        user={null as any}
        usePlainStyle={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm h-fit">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouvelle saison</h3>
          <form action={createSeason} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
              <input
                name="code"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ex: 2025"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                name="name"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ex: Saison 2025/2026"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
              <input
                name="startDate"
                type="date"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date de fin</label>
              <input
                name="endDate"
                type="date"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
              <select
                name="isActive"
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                defaultValue="false"
              >
                <option value="false">Inactive</option>
                <option value="true">Active</option>
              </select>
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors shadow-sm"
            >
              Créer la saison
            </button>
          </form>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <SeasonsList 
            seasons={seasons}
            onToggleStatus={toggleSeasonStatus}
            onEdit={updateSeasonFields}
            onDelete={deleteSeason}
          />
        </div>
      </div>
    </div>
  );
}
