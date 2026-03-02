import { Suspense } from "react";
import { getEvents, getMatches, getUsers } from "./actions";
import { requireAuth } from "../../../lib/server-auth";
import { CalendarManager } from "./calendar-manager";
import { PageHeader } from "../../../components/dashboard/page-header";

export default async function CalendrierPage() {
  const user = await requireAuth();
  const isAdmin = user.roles?.some(role => 
    ['admin', 'superadmin', 'federation_admin'].includes(role)
  ) ?? false;

  const [events, matches, users] = await Promise.all([
    getEvents(),
    getMatches(),
    isAdmin ? getUsers() : Promise.resolve([])
  ]);

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Calendrier" 
        subtitle="Gérez et consultez les événements et matchs de la plateforme."
        user={user}
      />

      <Suspense fallback={<div>Chargement du calendrier...</div>}>
        <CalendarManager 
          initialEvents={events} 
          initialMatches={matches}
          users={users}
          currentUser={user}
          isAdmin={isAdmin}
        />
      </Suspense>
    </div>
  );
}
