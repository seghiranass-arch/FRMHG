import Image from "next/image";
import Link from "next/link";
import { PageWrapper } from "../../../components/layout/page-wrapper";
import { Card } from "../../../components/ui/card";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getPlayer(id: string) {
  try {
    const response = await fetch(`${API_URL}/public/sport/players/${id}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function JoueurPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const player: {
    id: string;
    firstName: string;
    lastName: string;
    nationality: string | null;
    club: { id: string; name: string; acronym: string | null; logoDocumentId: string | null } | null;
    photoDocumentId: string | null;
    stats: { matchesPlayed: number; goals: number; assists: number; points: number };
  } | null = await getPlayer(id);

  if (!player) {
    return (
      <PageWrapper title="Joueur introuvable" subtitle="" useGradient={false}>
        <main>
          <Card>
            <div className="text-sm text-black/70">Ce joueur n’existe pas.</div>
          </Card>
        </main>
      </PageWrapper>
    );
  }

  const photoUrl = player.photoDocumentId ? `/api/documents/view?id=${player.photoDocumentId}` : null;

  return (
    <PageWrapper
      title={`${player.firstName} ${player.lastName}`}
      subtitle="Profil public du joueur"
      useGradient={false}
    >
      <main className="space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-black/5">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={`${player.firstName} ${player.lastName}`}
                  width={64}
                  height={64}
                  className="h-16 w-16 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center text-sm font-semibold text-black/50">
                  {player.firstName[0]}
                  {player.lastName[0]}
                </div>
              )}
            </div>
            <div>
              <div className="font-display text-2xl font-bold">
                {player.firstName} {player.lastName}
              </div>
              <div className="text-sm text-black/60">
                {player.nationality || "—"}{" "}
                {player.club ? (
                  <>
                    •{" "}
                    <Link className="font-semibold hover:underline" href={`/clubs/${player.club.id}`}>
                      {player.club.acronym || player.club.name}
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div className="text-sm font-semibold text-black/80">Statistiques</div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div className="rounded-xl bg-black/5 px-4 py-3">
                <div className="text-xs font-semibold text-black/50">MJ</div>
                <div className="mt-1 text-2xl font-bold">{player.stats.matchesPlayed}</div>
              </div>
              <div className="rounded-xl bg-black/5 px-4 py-3">
                <div className="text-xs font-semibold text-black/50">B</div>
                <div className="mt-1 text-2xl font-bold">{player.stats.goals}</div>
              </div>
              <div className="rounded-xl bg-black/5 px-4 py-3">
                <div className="text-xs font-semibold text-black/50">A</div>
                <div className="mt-1 text-2xl font-bold">{player.stats.assists}</div>
              </div>
              <div className="rounded-xl bg-black/5 px-4 py-3">
                <div className="text-xs font-semibold text-black/50">PTS</div>
                <div className="mt-1 text-2xl font-bold">{player.stats.points}</div>
              </div>
            </div>

            <div className="pt-2">
              <Link className="text-sm font-semibold text-brand-primary hover:underline" href="/classements">
                Voir les classements
              </Link>
            </div>
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
}
