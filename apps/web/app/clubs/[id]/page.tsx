import Image from "next/image";
import Link from "next/link";
import { PageWrapper } from "../../../components/layout/page-wrapper";
import { Card } from "../../../components/ui/card";

const API_URL = process.env.API_URL || "http://localhost:3001";

async function getClub(id: string) {
  try {
    const response = await fetch(`${API_URL}/public/sport/clubs/${id}`, { cache: "no-store" });
    if (!response.ok) return null;
    return response.json();
  } catch {
    return null;
  }
}

export default async function ClubPublicPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const club: {
    id: string;
    name: string;
    acronym: string | null;
    logoDocumentId: string | null;
    competitions: Array<{ id: string; name: string; season: string }>;
  } | null = await getClub(id);

  if (!club) {
    return (
      <PageWrapper title="Club introuvable" subtitle="" useGradient={false}>
        <main>
          <Card>
            <div className="text-sm text-black/70">Ce club n’existe pas.</div>
          </Card>
        </main>
      </PageWrapper>
    );
  }

  const logoUrl = club.logoDocumentId ? `/api/documents/view?id=${club.logoDocumentId}` : null;

  return (
    <PageWrapper title={club.name} subtitle="Profil public du club" useGradient={false}>
      <main className="space-y-6">
        <Card>
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 overflow-hidden rounded-2xl bg-black/5">
              {logoUrl ? (
                <Image src={logoUrl} alt={club.name} width={64} height={64} className="h-16 w-16 object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center text-sm font-semibold text-black/50">
                  {club.acronym || "CLUB"}
                </div>
              )}
            </div>
            <div>
              <div className="font-display text-2xl font-bold">{club.name}</div>
              <div className="text-sm text-black/60">{club.acronym}</div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="space-y-3">
            <div className="text-sm font-semibold text-black/80">Compétitions en cours</div>
            {club.competitions.length === 0 ? (
              <div className="text-sm text-black/60">Aucune compétition en cours.</div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                {club.competitions.map((c) => (
                  <Link
                    key={c.id}
                    className="rounded-xl border border-black/10 bg-white/60 px-4 py-3 hover:bg-white"
                    href="/classements"
                  >
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-black/60">Saison {c.season}</div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </Card>
      </main>
    </PageWrapper>
  );
}
