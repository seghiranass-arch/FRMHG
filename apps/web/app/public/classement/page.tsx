import Link from "next/link";

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

export default async function ClassementPage() {
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
  }> = await getActiveStandings();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center md:text-left mb-8">
        <h1 className="font-display text-3xl font-bold text-gray-900 drop-shadow-sm md:text-4xl">
          Classement
        </h1>
        <p className="mt-2 text-base text-gray-600 font-medium">
          Suivez le classement en temps réel des compétitions actives.
        </p>
      </div>

      {data.length === 0 ? (
        <div className="relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-white to-gray-50 p-12 text-center shadow-[0_8px_30px_rgb(0,0,0,0.06)] ring-1 ring-black/5">
          <div className="text-lg font-medium text-gray-500">Aucune compétition en cours pour le moment.</div>
        </div>
      ) : (
        data.map(({ competition, standings }) => (
          <div key={competition.id} className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/80 backdrop-blur-md p-6 shadow-[0_4px_20px_-2px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.03]">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <div className="font-display text-2xl font-bold text-gray-800">{competition.name}</div>
                <div className="text-sm font-medium text-gray-500 mt-1">Saison {competition.season}</div>
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-100 shadow-sm">
                En cours
              </span>
            </div>

            {standings.length === 0 ? (
              <div className="rounded-xl bg-gray-50/50 p-6 text-center text-sm text-gray-500 border border-dashed border-gray-200">
                Aucun match validé pour cette compétition.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse">
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
                        <th className="px-4 py-3 text-center text-xs font-bold uppercase tracking-wider text-gray-700 bg-gray-50/50 border-l border-gray-100">PTS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {standings.map((row, idx) => (
                        <tr key={row.clubId} className={`group hover:bg-gray-50/50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'}`}>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-800">
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shadow-inner ${
                                idx === 0 ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                idx === 1 ? 'bg-gray-100 text-gray-700 border-gray-200' :
                                idx === 2 ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                'bg-gray-50 text-gray-400 border-gray-100'
                              }`}>
                                {idx + 1}
                              </span>
                              {row.clubName}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.gp}</td>
                          <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.w}</td>
                          <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.l}</td>
                          <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.ot}</td>
                          <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.gf}</td>
                          <td className="px-3 py-3 text-center text-sm font-medium text-gray-600 border-l border-gray-50">{row.ga}</td>
                          <td className="px-3 py-3 text-center text-sm font-bold border-l border-gray-50">
                            <span className={`inline-flex items-center justify-center min-w-[2rem] px-1.5 py-0.5 rounded-md text-xs border shadow-sm ${
                              row.gd > 0 
                                ? "bg-green-50 text-green-700 border-green-100" 
                                : row.gd < 0
                                  ? "bg-red-50 text-red-700 border-red-100"
                                  : "bg-gray-50 text-gray-600 border-gray-100"
                            }`}>
                              {row.gd > 0 ? "+" : ""}
                              {row.gd}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center text-sm font-bold text-brand-700 bg-brand-50/20 border-l border-brand-50 group-hover:bg-brand-100/30 transition-colors shadow-[inset_1px_0_0_rgba(0,0,0,0.02)]">
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
        ))
      )}
    </div>
  );
}
