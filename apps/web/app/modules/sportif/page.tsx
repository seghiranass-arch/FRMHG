import { cookies } from "next/headers";
import { requireAuth } from "../../../lib/server-auth";
import { ClubSportDashboard } from "./club-sport-dashboard";
import { PageHeader } from "../../../components/dashboard/page-header";

const API_URL = process.env.API_URL || "http://localhost:3001";
const COOKIE_NAME = "frmhg_token";

async function fetchWithAuth<T>(endpoint: string, fallback: T): Promise<T> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      headers: token ? { Cookie: `${COOKIE_NAME}=${token}` } : {},
      cache: "no-store",
    });
    if (!response.ok) return fallback;
    return response.json();
  } catch {
    return fallback;
  }
}

async function getClubProfile(orgId: string) {
  try {
    const res = await fetch(`${API_URL}/public/sport/clubs/${orgId}`, { cache: "no-store" });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getActiveStandings() {
  try {
    const res = await fetch(`${API_URL}/public/sport/competitions/active/standings`, { cache: "no-store" });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function SportifPage() {
  const me = await requireAuth();
  
  if (!me.orgId) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-amber-50 p-4 text-amber-800 border border-amber-200">
          Vous devez être rattaché à un club pour accéder à cette page.
        </div>
      </div>
    );
  }

  const [clubProfile, activeStandings] = await Promise.all([
    getClubProfile(me.orgId),
    getActiveStandings(),
  ]);

  if (!clubProfile) {
    return (
      <div className="p-8">
        <div className="rounded-xl bg-red-50 p-4 text-red-800 border border-red-200">
          Impossible de charger les données du club.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <PageHeader 
        title="Gestion Sportive"
        subtitle={`Compétitions et résultats pour ${clubProfile.name}`}
        user={me}
        usePlainStyle={false}
      />
      
      <ClubSportDashboard 
        club={clubProfile} 
        standings={activeStandings} 
      />
    </div>
  );
}
