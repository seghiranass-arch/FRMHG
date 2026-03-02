import { requireAuth } from "../../../lib/server-auth";
import { PageHeader } from "../../../components/dashboard/page-header";

export default async function NationalDashboard() {
  const me = await requireAuth();
  
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Dashboard Sélection"
        subtitle={`Connecté : ${me.displayName}`}
        user={me}
        usePlainStyle={false}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { t: "Convocations & stages", d: "Listes, convocations, présences." },
          { t: "Planning", d: "Événements, entraînements, matches." },
          { t: "Sportif", d: "Matchs/événements, feuille de match." },
          { t: "Médical (selon droits)", d: "Accès restreint, audit consultations." }
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-theme-sm">
            <div className="text-lg font-semibold text-gray-800">{x.t}</div>
            <p className="mt-1 text-sm text-gray-500">{x.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}


