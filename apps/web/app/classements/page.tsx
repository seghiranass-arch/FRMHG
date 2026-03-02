import Link from "next/link";
import { PageWrapper } from "../../components/layout/page-wrapper";
import { Card } from "../../components/ui/card";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getActiveStandings() {
  try {
    const response = await fetch(`${API_URL}/public/sport/competitions/active/standings`, {
      cache: "no-store",
    });
    if (!response.ok) return [];
    return response.json();
  } catch {
    return [];
  }
}

export default async function ClassementsPage() {
  const data: Array<{
    competition: { id: string; name: string; season: string };
    standings: Array<{
      clubId: string;
      clubName: string;
      gp: number;
      w: number;
      l: number;
      ot: number;
      pts: number;
      gf: number;
      ga: number;
      gd: number;
    }>;
    leaderboard: Array<{
      playerId: string;
      playerName: string;
      clubName: string;
      matchesPlayed: number;
      goals: number;
      assists: number;
      points: number;
    }>;
  }> = await getActiveStandings();

  return (
    <PageWrapper
      title="Classements"
      subtitle="Compétitions en cours — clubs et joueurs"
      useGradient={false}
    >
      <main className="space-y-8">
        {data.length === 0 ? (
          <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-white to-gray-50 p-8 shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5 text-center">
            <div className="text-sm font-medium text-gray-500">Aucune compétition en cours.</div>
          </div>
        ) : (
          data.map(({ competition, standings, leaderboard }) => (
            <div key={competition.id} className="relative overflow-hidden rounded-2xl border border-white/60 bg-gradient-to-b from-white to-gray-50/50 p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03]">
              <div className="space-y-8">
                <div className="flex items-baseline justify-between border-b border-gray-100 pb-4">
                  <div>
                    <div className="font-display text-2xl font-bold text-gray-800 drop-shadow-sm">{competition.name}</div>
                    <div className="text-sm font-medium text-gray-500 mt-1">Saison {competition.season}</div>
                  </div>
                  <div className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100 shadow-sm">
                    En cours
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                    <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Classement clubs</div>
                  </div>
                  
                  {standings.length === 0 ? (
                    <div className="rounded-xl bg-gray-50/50 p-6 text-center text-sm text-gray-500 border border-dashed border-gray-200">Aucun match validé.</div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse">
                          <thead>
                            <tr className="bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200">
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 shadow-[inset_0_-1px_0_rgba(0,0,0,0.02)]">Club</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">MJ</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">V</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">D</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">OT</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">BP</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">BC</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">Diff</th>
                              <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50/50 border-l border-blue-100">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {standings.map((row, idx) => (
                              <tr key={row.clubId} className={`group hover:bg-blue-50/30 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                  <Link className="hover:text-blue-600 transition-colors flex items-center gap-2" href={`/clubs/${row.clubId}`}>
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold border border-gray-200 shadow-inner">
                                      {idx + 1}
                                    </span>
                                    {row.clubName}
                                  </Link>
                                </td>
                                <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.gp}</td>
                                <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.w}</td>
                                <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.l}</td>
                                <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.ot}</td>
                                <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.gf}</td>
                                <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.ga}</td>
                                <td className="px-3 py-3 text-center text-sm font-bold border-l border-gray-50">
                                  <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded-md text-xs border shadow-sm ${
                                    row.gd >= 0 
                                      ? "bg-green-50 text-green-700 border-green-100" 
                                      : "bg-red-50 text-red-700 border-red-100"
                                  }`}>
                                    {row.gd >= 0 ? "+" : ""}
                                    {row.gd}
                                  </span>
                                </td>
                                <td className="px-4 py-3 text-center text-sm font-bold text-blue-700 bg-blue-50/30 border-l border-blue-50 group-hover:bg-blue-100/30 transition-colors shadow-[inset_1px_0_0_rgba(0,0,0,0.02)]">
                                  {row.pts}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-2">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-1 rounded-full bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.5)]"></div>
                    <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">Classement joueurs</div>
                  </div>
                  
                  {leaderboard.length === 0 ? (
                    <div className="rounded-xl bg-gray-50/50 p-6 text-center text-sm text-gray-500 border border-dashed border-gray-200">Aucune statistique validée.</div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[900px] border-collapse">
                          <thead>
                            <tr className="bg-gradient-to-b from-gray-50 to-gray-100 border-b border-gray-200">
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 shadow-[inset_0_-1px_0_rgba(0,0,0,0.02)]">Joueur</th>
                              <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">Club</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-500 border-l border-gray-100">MJ</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50/30 border-l border-blue-100">B</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-green-600 bg-green-50/30 border-l border-green-100">A</th>
                              <th className="px-3 py-3 text-center text-xs font-bold uppercase tracking-wider text-purple-600 bg-purple-50/50 border-l border-purple-100">PTS</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100">
                            {leaderboard.map((row, idx) => (
                              <tr key={row.playerId} className={`group hover:bg-purple-50/20 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                                <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                                  <Link className="hover:text-purple-600 transition-colors flex items-center gap-2" href={`/joueurs/${row.playerId}`}>
                                    <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 font-bold border border-gray-200 shadow-inner">
                                      {idx + 1}
                                    </span>
                                    {row.playerName}
                                  </Link>
                                </td>
                                <td className="px-4 py-3 text-sm text-gray-600 border-l border-gray-50">{row.clubName}</td>
                                <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.matchesPlayed}</td>
                                <td className="px-3 py-3 text-center text-sm font-bold text-blue-700 bg-blue-50/10 border-l border-blue-50">
                                  {row.goals}
                                </td>
                                <td className="px-3 py-3 text-center text-sm font-bold text-green-700 bg-green-50/10 border-l border-green-50">
                                  {row.assists}
                                </td>
                                <td className="px-3 py-3 text-center text-sm font-bold text-purple-700 bg-purple-50/30 border-l border-purple-100 shadow-[inset_1px_0_0_rgba(0,0,0,0.02)]">
                                  {row.points}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </main>
    </PageWrapper>
  );
}
