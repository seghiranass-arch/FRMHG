import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { PaymentsPanel } from "../../../components/payments/payments-panel";
import { PageHeader } from "../../../components/dashboard/page-header";
import { requireAuth } from "../../../lib/server-auth";

type SchoolPayment = {
  id: string;
  memberId: string;
  memberName: string;
  licenseNumber?: string | null;
  seasonId?: string | null;
  amountCents: number;
  currency: string;
  subscriptionStatus: string;
  startDate: string;
  endDate: string;
  subscriptionName?: string | null;
  orgName?: string | null;
  payments: {
    id: string;
    amountCents: number;
    currency: string;
    status: string;
    paidAt?: string | null;
    method?: string | null;
    reference?: string | null;
    createdAt: string;
  }[];
};

type Season = {
  id: string;
  code: string;
  name: string;
  isActive?: boolean;
  startDate?: string;
  endDate?: string;
};

type FetchResult<T> = {
  data: T;
  error: string | null;
};

async function getSchoolPayments(): Promise<FetchResult<SchoolPayment[]>> {
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
  try {
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
    const apiUrl = rawApiUrl.startsWith("http")
      ? rawApiUrl
      : `${protocol}://${host}${normalizedPath}`;
    const res = await fetch(`${apiUrl}/members/school-payments`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401) {
        throw new Error("UNAUTHORIZED");
      }
      const text = await res.text();
      return { data: [], error: text || `Erreur ${res.status}` };
    }

    return { data: await res.json(), error: null };
  } catch {
    return { data: [], error: "Impossible de charger les paiements" };
  }
}

async function getSeasons(): Promise<Season[]> {
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
  const apiUrl = rawApiUrl.startsWith("http")
    ? rawApiUrl
    : `${protocol}://${host}${normalizedPath}`;
  const res = await fetch(`${apiUrl}/licensing/seasons`, { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function PaiementsModule() {
  const me = await requireAuth();
  if (me.roles.includes("club_admin")) {
    redirect("/dashboard/club");
  }
  const [paymentsResult, seasons] = await Promise.all([
    getSchoolPayments(),
    getSeasons(),
  ]);

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Paiements École de Hockey"
        subtitle="Suivi des paiements adhérents avec séparation par saison"
        user={me}
        usePlainStyle={false}
      />

      {paymentsResult.error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="text-sm text-red-800 font-medium">Erreur: {paymentsResult.error}</p>
        </div>
      )}

      <PaymentsPanel initial={paymentsResult.data} seasons={seasons} />
    </div>
  );
}
