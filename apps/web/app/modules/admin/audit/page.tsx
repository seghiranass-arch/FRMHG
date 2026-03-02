import { cookies, headers } from "next/headers";
import { PageHeader } from "../../../../components/dashboard/page-header";

type AuditLog = {
  id: string;
  userId: string;
  userEmail: string;
  action: string;
  resourceType: string;
  resourceId: string;
  details: string;
  ipAddress: string;
  userAgent: string;
  timestamp: string;
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

async function getAuditLogs(): Promise<AuditLog[]> {
  const token = await getAuthToken();
  if (!token) return [];

  try {
    const apiUrl = await getApiUrl();
    const res = await fetch(`${apiUrl}/audit/logs`, {
      headers: { authorization: `Bearer ${token}` },
      cache: "no-store"
    });
    if (!res.ok) return [];
    return res.json();
  } catch (e) {
    console.error("Error fetching audit logs:", e);
    return [];
  }
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  CREATE: { label: "Création", color: "bg-green-100 text-green-800" },
  UPDATE: { label: "Modification", color: "bg-blue-100 text-blue-800" },
  DELETE: { label: "Suppression", color: "bg-red-100 text-red-800" },
  LOGIN: { label: "Connexion", color: "bg-purple-100 text-purple-800" },
  LOGOUT: { label: "Déconnexion", color: "bg-gray-100 text-gray-800" },
  VIEW: { label: "Consultation", color: "bg-yellow-100 text-yellow-800" },
};

const RESOURCE_LABELS: Record<string, string> = {
  USER: "Utilisateur",
  CLUB: "Club",
  MEMBER: "Membre",
  LICENSE: "Licence",
  PAYMENT: "Paiement",
  EQUIPMENT: "Matériel",
  DOCUMENT: "Document",
};

export default async function AuditModule() {
  const auditLogs = await getAuditLogs();

  return (
    <div className="space-y-8">
      <PageHeader 
        title="Journal d'Audit"
        subtitle="Historique des actions et modifications"
        user={null as any}
        usePlainStyle={false}
      />

      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Activité récente</h2>
          <div className="flex gap-2">
            <button className="inline-flex items-center px-4 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Exporter
            </button>
            <button className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualiser
            </button>
          </div>
        </div>

        {auditLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500 font-medium">Aucune activité enregistrée</p>
            <p className="text-sm text-gray-400 mt-1">Les actions des utilisateurs apparaîtront ici</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Utilisateur</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ressource</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Détails</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-semibold text-sm">
                          {log.userEmail.charAt(0).toUpperCase()}
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-gray-900">{log.userEmail}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full ${ACTION_LABELS[log.action]?.color || 'bg-gray-100 text-gray-800'}`}>
                        {ACTION_LABELS[log.action]?.label || log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {RESOURCE_LABELS[log.resourceType] || log.resourceType}
                        </p>
                        <p className="text-xs text-gray-500">#{log.resourceId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-600 max-w-xs truncate" title={log.details}>
                        {log.details || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(log.timestamp).toLocaleString("fr-FR")}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}