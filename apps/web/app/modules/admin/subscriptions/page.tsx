import { cookies, headers } from "next/headers";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { SubscriptionsList } from "./subscriptions-list";
import { PageHeader } from "../../../../components/dashboard/page-header";

type SubscriptionType = {
  id: string;
  name: string;
  description: string | null;
  amount_cents: number;
  currency: string;
  duration_months: number | null;
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

async function getSubscriptionTypes(): Promise<SubscriptionType[]> {
  const token = await getAuthToken();
  if (!token) return [];
  
  try {
    const apiUrl = await getApiUrl();
    const res = await fetch(`${apiUrl}/settings/subscriptions`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Error fetching subscriptions:", e);
    return [];
  }
}

async function createSubscriptionType(formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const duration = formData.get("duration") ? parseInt(formData.get("duration") as string) : null;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/subscriptions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      name, 
      description, 
      amount_cents: Math.round(amount * 100),
      duration_months: duration 
    }),
  });
  
  revalidatePath("/modules/admin/subscriptions");
}

async function updateSubscriptionType(formData: FormData) {
  "use server";
  const id = formData.get("id") as string;
  const is_active = formData.get("is_active") === "true";
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/subscriptions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ is_active }),
  });
  
  revalidatePath("/modules/admin/subscriptions");
}

async function updateSubscriptionFields(id: string, formData: FormData) {
  "use server";
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const amount = parseFloat(formData.get("amount") as string);
  const duration = formData.get("duration") ? parseInt(formData.get("duration") as string) : null;
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/subscriptions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ 
      name, 
      description, 
      amount_cents: Math.round(amount * 100),
      duration_months: duration 
    }),
  });
  
  revalidatePath("/modules/admin/subscriptions");
}

async function toggleSubscriptionStatus(id: string, is_active: boolean) {
  "use server";
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/subscriptions/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
    body: JSON.stringify({ is_active }),
  });
  
  revalidatePath("/modules/admin/subscriptions");
}

async function deleteSubscriptionType(id: string) {
  "use server";
  
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  if (!token) return;

  const apiUrl = await getApiUrl();
  await fetch(`${apiUrl}/settings/subscriptions/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      "authorization": `Bearer ${token}`,
    },
  });
  
  revalidatePath("/modules/admin/subscriptions");
}

export default async function SubscriptionsPage() {
  const subscriptions = await getSubscriptionTypes();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestion des Abonnements" 
        subtitle="Configurez les types d'abonnement et leurs tarifs."
        user={null as any}
        usePlainStyle={false}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire d'ajout */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-theme-sm h-fit">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Nouveau type d'abonnement</h3>
          <form action={createSubscriptionType} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input
                name="name"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ex: Abonnement Annuel"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Montant (MAD)</label>
              <input
                name="amount"
                type="number"
                step="0.01"
                required
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ex: 1500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Durée (mois)</label>
              <input
                name="duration"
                type="number"
                className="w-full h-11 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Ex: 12 (laisser vide pour illimité)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                rows={2}
                className="w-full rounded-lg border border-gray-200 p-3 text-sm outline-none focus:ring-2 focus:ring-brand-500/20"
                placeholder="Description du forfait..."
              />
            </div>
            <button
              type="submit"
              className="w-full h-11 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors shadow-sm"
            >
              Créer le type d'abonnement
            </button>
          </form>
        </div>

        {/* Liste des types d'abonnement */}
        <div className="lg:col-span-2 space-y-4">
          <SubscriptionsList 
            subscriptions={subscriptions}
            onToggleStatus={toggleSubscriptionStatus}
            onEdit={updateSubscriptionFields}
            onDelete={deleteSubscriptionType}
          />
        </div>
      </div>
    </div>
  );
}
