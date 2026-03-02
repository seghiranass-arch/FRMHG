import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { getServerUser } from "../../../lib/server-auth";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getMatches() {
  try {
    const response = await fetch(`${API_URL}/public/sport/matches`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function ResultatsPage() {
  const matches = await getMatches();
  const user = await getServerUser();
  const isClubAdmin = user?.roles?.includes("club_admin");
  const scopedMatches = isClubAdmin && user?.orgId
    ? matches.filter((match: any) => match.homeTeamId === user.orgId || match.awayTeamId === user.orgId)
    : matches;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center md:text-left mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 drop-shadow-sm md:text-4xl">
          Résultats
        </h1>
        <p className="mt-2 text-base text-gray-600 font-medium">
          Scores et détails des matchs récents.
        </p>
      </div>

      {scopedMatches.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-white to-gray-50 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5">
          <div className="text-lg font-medium text-gray-500">
            {isClubAdmin ? "Aucun match trouvé pour votre club." : "Aucun match trouvé."}
          </div>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {scopedMatches.map((match: any) => (
            <div 
              key={match.id}
              className="group relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-sm p-5 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gray-400 to-gray-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                  {match.competitionName}
                </span>
                <span className="text-xs font-medium text-gray-400">
                  {format(new Date(match.date), "d MMM yyyy", { locale: fr })}
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                {/* Home Team */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                    {/* Logo placeholder */}
                    {match.homeTeamAcronym?.substring(0, 2) || "H"}
                  </div>
                  <div className="text-sm font-bold text-gray-900 text-center leading-tight">
                    {match.homeTeam}
                  </div>
                </div>

                {/* Score */}
                <div className="flex flex-col items-center gap-1 min-w-[60px]">
                  {match.status === 'completed' ? (
                    <div className="text-3xl font-display font-bold text-gray-900 tracking-tight">
                      {match.homeScore} - {match.awayScore}
                    </div>
                  ) : (
                    <div className="text-xl font-display font-bold text-gray-400 tracking-tight">
                      VS
                    </div>
                  )}
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    match.status === 'completed' ? 'bg-green-100 text-green-700' :
                    match.status === 'live' ? 'bg-red-100 text-red-700 animate-pulse' :
                    'bg-gray-100 text-gray-500'
                  }`}>
                    {match.status === 'completed' ? 'Terminé' :
                     match.status === 'live' ? 'En cours' :
                     format(new Date(match.date), "HH:mm")}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div className="h-12 w-12 rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center text-xs font-bold text-gray-400 overflow-hidden">
                    {/* Logo placeholder */}
                    {match.awayTeamAcronym?.substring(0, 2) || "A"}
                  </div>
                  <div className="text-sm font-bold text-gray-900 text-center leading-tight">
                    {match.awayTeam}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
