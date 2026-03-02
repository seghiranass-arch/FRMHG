"use client";

import { useState } from "react";
import { 
  Trophy, 
  Calendar, 
  Activity, 
  Users, 
  MapPin, 
  Clock,
  ChevronRight
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

type Tab = "overview" | "matches" | "standings" | "players";

export function ClubSportDashboard({ club, standings }: { club: any, standings: any[] }) {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  // Filter standings relevant to the club
  const clubStandings = standings.filter(s => 
    club.competitions?.some((c: any) => c.id === s.competition.id)
  );

  // Filter player stats for club players
  // We check if the player's club name matches the current club's name or acronym
  const clubPlayers = standings.flatMap(s => 
    s.leaderboard.filter((p: any) => 
      p.clubName === club.name || p.clubName === club.acronym
    ).map((p: any) => ({ ...p, competitionName: s.competition.name }))
  );

  // Aggregate player stats across competitions if needed, or list them per competition
  // For now, let's list them all, maybe sorted by points

  return (
    <div className="space-y-6">
      {/* Tabs Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          {[
            { id: "overview", name: "Vue d'ensemble", icon: Trophy },
            { id: "matches", name: "Matchs & Résultats", icon: Calendar },
            { id: "standings", name: "Classements", icon: Activity },
            { id: "players", name: "Statistiques Joueurs", icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-brand-500 text-brand-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              <tab.icon
                className={`-ml-0.5 mr-2 h-5 w-5 ${
                  activeTab === tab.id ? "text-brand-500" : "text-gray-400 group-hover:text-gray-500"
                }`}
                aria-hidden="true"
              />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === "overview" && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {club.competitions?.length > 0 ? (
              club.competitions.map((comp: any) => (
                <div key={comp.id} className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-6 shadow-theme-sm hover:shadow-md transition-all">
                  <div className="flex items-center justify-between mb-4">
                    <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
                      <Trophy className="h-6 w-6" />
                    </div>
                    {comp.status === 'active' ? (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                        En cours
                      </span>
                    ) : comp.status === 'upcoming' ? (
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
                        À venir
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-gray-50 px-2.5 py-0.5 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-600/20">
                        Terminée
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{comp.name}</h3>
                  <p className="text-sm text-gray-500 mb-4">Saison {comp.season}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span>Du {new Date(comp.startDate).toLocaleDateString()} au {new Date(comp.endDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <Trophy className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-semibold text-gray-900">Aucune compétition</h3>
                <p className="mt-1 text-sm text-gray-500">Le club ne participe à aucune compétition active pour le moment.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === "matches" && (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Upcoming Matches */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-500" />
                Prochains Matchs
              </h3>
              <div className="space-y-4">
                {club.upcomingMatches?.length > 0 ? (
                  club.upcomingMatches.map((match: any) => (
                    <MatchCard key={match.id} match={match} type="upcoming" clubName={club.name} clubAcronym={club.acronym} />
                  ))
                ) : (
                  <EmptyState message="Aucun match programmé" />
                )}
              </div>
            </div>

            {/* Recent Results */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-gray-500" />
                Derniers Résultats
              </h3>
              <div className="space-y-4">
                {club.recentResults?.length > 0 ? (
                  club.recentResults.map((match: any) => (
                    <MatchCard key={match.id} match={match} type="result" clubName={club.name} clubAcronym={club.acronym} />
                  ))
                ) : (
                  <EmptyState message="Aucun résultat récent" />
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "standings" && (
          <div className="space-y-8">
            {clubStandings.length > 0 ? (
              clubStandings.map((standing: any) => (
                <div key={standing.competition.id} className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-theme-sm">
                  <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-amber-500" />
                      {standing.competition.name}
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-50 text-gray-500 font-medium">
                        <tr>
                          <th className="px-6 py-3 w-12 text-center">#</th>
                          <th className="px-6 py-3">Équipe</th>
                          <th className="px-6 py-3 text-center">MJ</th>
                          <th className="px-6 py-3 text-center">V</th>
                          <th className="px-6 py-3 text-center">D</th>
                          <th className="px-6 py-3 text-center">Prol.</th>
                          <th className="px-6 py-3 text-center">BP</th>
                          <th className="px-6 py-3 text-center">BC</th>
                          <th className="px-6 py-3 text-center font-bold">Pts</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {standing.standings.map((row: any, index: number) => {
                          const isMyClub = row.clubName === club.name || row.clubName === club.acronym;
                          return (
                            <tr key={row.clubId} className={`hover:bg-gray-50 transition-colors ${
                              isMyClub ? "bg-brand-50/30" : ""
                            }`}>
                              <td className="px-6 py-4 text-center font-medium text-gray-500">
                                {index + 1}
                              </td>
                              <td className="px-6 py-4 font-medium text-gray-900">
                                {row.clubName}
                                {isMyClub && <span className="ml-2 inline-flex items-center rounded-md bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-700">Vous</span>}
                              </td>
                              <td className="px-6 py-4 text-center text-gray-600">{row.gp}</td>
                              <td className="px-6 py-4 text-center text-green-600">{row.w}</td>
                              <td className="px-6 py-4 text-center text-red-600">{row.l}</td>
                              <td className="px-6 py-4 text-center text-gray-600">{row.ot}</td>
                              <td className="px-6 py-4 text-center text-gray-600">{row.gf}</td>
                              <td className="px-6 py-4 text-center text-gray-600">{row.ga}</td>
                              <td className="px-6 py-4 text-center font-bold text-gray-900">{row.pts}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))
            ) : (
              <EmptyState message="Aucun classement disponible pour vos compétitions" />
            )}
          </div>
        )}

        {activeTab === "players" && (
          <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-theme-sm">
            <div className="border-b border-gray-100 px-6 py-4">
              <h3 className="font-semibold text-gray-900">Statistiques des Joueurs</h3>
            </div>
            {clubPlayers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-500 font-medium">
                    <tr>
                      <th className="px-6 py-3">Joueur</th>
                      <th className="px-6 py-3">Compétition</th>
                      <th className="px-6 py-3 text-center">Matchs</th>
                      <th className="px-6 py-3 text-center">Buts</th>
                      <th className="px-6 py-3 text-center">Passes</th>
                      <th className="px-6 py-3 text-center font-bold">Points</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {clubPlayers.sort((a: any, b: any) => b.points - a.points).map((player: any, index: number) => (
                      <tr key={`${player.playerId}-${index}`} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-gray-900">
                          {player.playerName}
                        </td>
                        <td className="px-6 py-4 text-gray-500">
                          {player.competitionName}
                        </td>
                        <td className="px-6 py-4 text-center text-gray-600">{player.matchesPlayed}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{player.goals}</td>
                        <td className="px-6 py-4 text-center text-gray-600">{player.assists}</td>
                        <td className="px-6 py-4 text-center font-bold text-brand-600">{player.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Users className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-gray-500">Aucune statistique disponible pour les joueurs du club</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function MatchCard({ match, type, clubName, clubAcronym }: { match: any, type: "upcoming" | "result", clubName: string, clubAcronym?: string }) {
  const isHome = match.homeTeam === clubName || match.homeTeam === clubAcronym;
  const isWin = type === "result" && (
    (isHome && (match.homeScore || 0) > (match.awayScore || 0)) ||
    (!isHome && (match.awayScore || 0) > (match.homeScore || 0))
  );
  const isDraw = type === "result" && match.homeScore === match.awayScore;

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-3 text-xs text-gray-500">
        <span className="font-medium text-brand-600 bg-brand-50 px-2 py-0.5 rounded-full">
          {match.competitionName}
        </span>
        <div className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          {new Date(match.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex-1 flex flex-col items-end gap-1">
          <span className={`font-semibold truncate max-w-[120px] ${match.homeTeam === clubName || match.homeTeam === clubAcronym ? "text-gray-900" : "text-gray-600"}`}>
            {match.homeTeam}
          </span>
          {match.homeLogo ? (
            <div className="relative h-8 w-8">
               <Image src={`/api/documents/view?id=${match.homeLogo}`} alt={match.homeTeam} fill className="object-contain" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
              {match.homeTeam.substring(0, 1)}
            </div>
          )}
        </div>

        <div className="mx-4 flex flex-col items-center">
          {type === "upcoming" ? (
            <span className="text-sm font-bold text-gray-400">VS</span>
          ) : (
            <div className="flex items-center gap-2 bg-gray-50 px-3 py-1 rounded-lg border border-gray-100">
              <span className={`text-lg font-bold ${(match.homeScore || 0) > (match.awayScore || 0) ? "text-gray-900" : "text-gray-500"}`}>
                {match.homeScore}
              </span>
              <span className="text-gray-300">-</span>
              <span className={`text-lg font-bold ${(match.awayScore || 0) > (match.homeScore || 0) ? "text-gray-900" : "text-gray-500"}`}>
                {match.awayScore}
              </span>
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col items-start gap-1">
          <span className={`font-semibold truncate max-w-[120px] ${match.awayTeam === clubName || match.awayTeam === clubAcronym ? "text-gray-900" : "text-gray-600"}`}>
            {match.awayTeam}
          </span>
          {match.awayLogo ? (
            <div className="relative h-8 w-8">
               <Image src={`/api/documents/view?id=${match.awayLogo}`} alt={match.awayTeam} fill className="object-contain" />
            </div>
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-500">
              {match.awayTeam.substring(0, 1)}
            </div>
          )}
        </div>
      </div>

      {match.venue && (
        <div className="mt-3 flex items-center justify-center gap-1 text-xs text-gray-400 border-t border-gray-50 pt-2">
          <MapPin className="h-3 w-3" />
          {match.venue}
        </div>
      )}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center bg-gray-50/50">
      <p className="text-sm text-gray-500">{message}</p>
    </div>
  );
}
