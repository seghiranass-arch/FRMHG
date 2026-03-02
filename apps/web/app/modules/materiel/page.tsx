import Link from "next/link";
import { cookies, headers } from "next/headers";
import { EquipmentPanel } from "../../../components/equipment/equipment-panel";
import { EquipmentMovementsPanel } from "../../../components/equipment/equipment-movements-panel";
import { PageHeader } from "../../../components/dashboard/page-header";
import { requireAuth } from "../../../lib/server-auth";

type EquipmentItem = {
  id: string;
  name: string;
  reference: string | null;
  description: string | null;
  quantity: number;
  min_quantity: number;
  condition: string;
  owner_org_name: string | null;
  photo_document_id: string | null;
  created_at: string;
};

type LowStockAlert = {
  id: string;
  name: string;
  reference: string | null;
  quantity: number;
  min_quantity: number;
  owner_org_name: string | null;
};

type EquipmentMovement = {
  id: string;
  equipment_id: string;
  equipment_name: string;
  equipment_reference: string | null;
  from_org_id: string | null;
  from_org_name: string | null;
  to_org_id: string | null;
  to_org_name: string | null;
  movement_type: 'transfer' | 'loan' | 'repair' | 'disposal';
  quantity: number;
  reason: string;
  status: 'pending' | 'approved' | 'completed' | 'cancelled';
  requested_by: string;
  approved_by: string | null;
  requested_at: string;
  approved_at: string | null;
  completed_at: string | null;
};

type MovementHistory = {
  id: string;
  movement_id: string;
  action: 'created' | 'approved' | 'completed' | 'cancelled';
  performed_by: string;
  notes: string | null;
  created_at: string;
  movement_status: 'pending' | 'approved' | 'completed' | 'cancelled';
  equipment_id: string;
  equipment_name: string;
  equipment_reference: string | null;
  equipment_photo_document_id?: string | null;
  from_org_id: string | null;
  from_org_name: string | null;
  to_org_id: string | null;
  to_org_name: string | null;
  movement_type: 'transfer' | 'loan' | 'repair' | 'disposal';
  quantity: number;
  reason: string;
  requested_by: string;
  requested_at: string;
  completed_at: string | null;
};

type Organization = {
  id: string;
  name: string;
  acronym: string | null;
};

type MaterielFetchResult = {
  items: EquipmentItem[];
  organizations: Organization[];
  movements: EquipmentMovement[];
  movementHistory: MovementHistory[];
};

async function getMaterielData(): Promise<MaterielFetchResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token")?.value;
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

  const [itemsRes, orgsRes, movementsRes, historyRes] = await Promise.all([
    fetch(`${apiUrl}/equipment/items`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    }),
    fetch(`${apiUrl}/orgs`, { cache: "no-store" }),
    fetch(`${apiUrl}/equipment/movements`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    }),
    fetch(`${apiUrl}/equipment/movements/history`, {
      headers: {
        "Authorization": token ? `Bearer ${token}` : "",
      },
      cache: "no-store",
    }),
  ]);

  const items: EquipmentItem[] = itemsRes.ok ? await itemsRes.json() : [];
  const organizations: Organization[] = orgsRes.ok ? await orgsRes.json() : [];
  const movements: EquipmentMovement[] = movementsRes.ok ? await movementsRes.json() : [];
  const movementHistory: MovementHistory[] = historyRes.ok ? await historyRes.json() : [];

  return { items, organizations, movements, movementHistory };
}

export default async function MaterielPage({ searchParams }: { searchParams?: Promise<{ created?: string }> }) {
  const me = await requireAuth();
  const resolvedSearchParams = await searchParams;
  const { items, organizations, movements, movementHistory } = await getMaterielData();
  const canManageMovements = !me.roles.includes("club_admin");
  const lowStockAlerts: LowStockAlert[] = items
    .filter(item => item.min_quantity > 0 && item.quantity <= item.min_quantity)
    .map(item => ({
      id: item.id,
      name: item.name,
      reference: item.reference,
      quantity: item.quantity,
      min_quantity: item.min_quantity,
      owner_org_name: item.owner_org_name,
    }));

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Gestion du Matériel" 
        subtitle="Inventaire complet du matériel de la fédération et des clubs"
        user={me}
        usePlainStyle={false}
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Aperçu</h2>
          <p className="text-sm text-gray-500">Suivi des stocks, catégories et mouvements</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/modules/materiel/nouvel-article"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-theme-sm hover:bg-brand-600"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nouvel article
          </Link>
        </div>
      </div>

      {resolvedSearchParams?.created === "1" && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
          Article créé avec succès.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Total articles</span>
            <span className="rounded-full bg-brand-50 p-2 text-brand-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold text-gray-900">{items.length}</div>
          <div className="text-xs text-gray-500">Articles enregistrés</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Stock faible</span>
            <span className="rounded-full bg-orange-50 p-2 text-orange-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold text-gray-900">{lowStockAlerts.length}</div>
          <div className="text-xs text-gray-500">Alertes actives</div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>Mouvements</span>
            <span className="rounded-full bg-blue-50 p-2 text-blue-600">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            </span>
          </div>
          <div className="mt-3 text-2xl font-semibold text-gray-900">{movements.length}</div>
          <div className="text-xs text-gray-500">Demandes suivies</div>
        </div>

      </div>

      {items.length === 0 && movements.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-6 text-center shadow-theme-sm">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-500">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5" />
            </svg>
          </div>
          <h3 className="mt-3 text-base font-semibold text-gray-900">Aucune donnée disponible</h3>
          <p className="mt-1 text-sm text-gray-500">
            Connectez les sources d'inventaire ou ajoutez un premier article pour activer le suivi.
          </p>
        </div>
      )}

      {lowStockAlerts.length > 0 && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50 p-5 shadow-theme-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-orange-800">Alertes stock faible</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockAlerts.slice(0, 6).map(alert => (
              <div key={alert.id} className="bg-white rounded-xl border border-orange-200 p-3">
                <div className="font-medium text-gray-800">{alert.name}</div>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-xs font-semibold text-red-600">
                    {alert.quantity} / {alert.min_quantity}
                  </span>
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ width: `${Math.min(100, (alert.quantity / alert.min_quantity) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {lowStockAlerts.length > 6 && (
            <div className="mt-3 text-center">
              <span className="text-sm text-orange-700">
                +{lowStockAlerts.length - 6} autres alertes
              </span>
            </div>
          )}
        </div>
      )}

      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-900">Inventaire</h2>
          <p className="text-sm text-gray-500">Suivez la disponibilité et l'état des équipements</p>
        </div>
        <EquipmentPanel
          initialItems={items}
          organizations={organizations}
          canManageMovements={canManageMovements}
        />
      </div>

      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold text-gray-900">Mouvements</h2>
          <p className="text-sm text-gray-500">Historique des transferts, prêts et réparations</p>
        </div>
        <EquipmentMovementsPanel 
          initialMovements={movements} 
          initialHistory={movementHistory}
          canManageMovements={canManageMovements}
        />
      </div>
    </div>
  );
}
