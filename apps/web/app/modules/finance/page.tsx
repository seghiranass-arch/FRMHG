import { FinancePanel } from "../../../components/finance/finance-panel";
import { PageHeader } from "../../../components/dashboard/page-header";
import { requireAuth } from "../../../lib/server-auth";

type Summary = {
  total: number;
  pending_receipt: number;
  pending_review: number;
  approved: number;
  rejected: number;
  approved_amount_cents: number;
};

type PaymentRow = {
  id: string;
  amount_cents: number;
  currency: string;
  status: string;
  org_name: string;
  created_at: string;
};

async function getSummary(): Promise<Summary | null> {
  const res = await fetch("http://localhost:3000/api/finance/summary", { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

async function getPayments(): Promise<PaymentRow[]> {
  const res = await fetch("http://localhost:3000/api/payments", { cache: "no-store" });
  if (!res.ok) return [];
  return res.json();
}

export default async function FinanceModule() {
  const me = await requireAuth();
  const [summary, payments] = await Promise.all([getSummary(), getPayments()]);
  return (
    <div className="space-y-8">
      <PageHeader 
        title="Finance"
        subtitle="KPIs + exports comptables (MVP)"
        user={me}
        usePlainStyle={false}
      />

      <FinancePanel summary={summary} payments={payments} />
    </div>
  );
}







