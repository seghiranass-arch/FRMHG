import { MedicalPanel } from "../../../components/medical/medical-panel";
import { PageHeader } from "../../../components/dashboard/page-header";
import { requireAuth } from "../../../lib/server-auth";

type VisitRow = {
  id: string;
  member_id: string;
  visit_date: string;
  kind: string;
  status: string;
  first_name: string;
  last_name: string;
};

type InjuryRow = {
  id: string;
  member_id: string;
  occurred_on?: string | null;
  body_part?: string | null;
  severity: string;
  status: string;
  first_name: string;
  last_name: string;
};

async function getVisits(): Promise<VisitRow[]> {
  const res = await fetch("http://localhost:3000/api/medical/visits", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

async function getInjuries(): Promise<InjuryRow[]> {
  const res = await fetch("http://localhost:3000/api/medical/injuries", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function MedicalModule() {
  const me = await requireAuth();
  const [visits, injuries] = await Promise.all([getVisits(), getInjuries()]);
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Médical"
        subtitle="Accès restreint + audit renforcé"
        user={me}
        usePlainStyle={false}
      />

      <MedicalPanel initialVisits={visits} initialInjuries={injuries} />
    </div>
  );
}



