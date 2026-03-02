import { headers } from 'next/headers';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { User, Shield, GraduationCap, Trophy, Target, Activity } from 'lucide-react';
import { getServerUser } from '../../../lib/server-auth';

async function getPlayers() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  try {
    const res = await fetch(`${protocol}://${host}/api/public/sport/players`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch players');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching players:', error);
    return [];
  }
}

function getCountryCode(nationality: string | null): string {
  if (!nationality) return 'xx';
  const n = nationality.toLowerCase().trim();
  if (n === 'maroc' || n === 'marocaine' || n === 'morocco') return 'ma';
  if (n === 'france' || n === 'française' || n === 'french') return 'fr';
  if (n === 'canada' || n === 'canadienne') return 'ca';
  if (n === 'usa' || n === 'américaine' || n === 'american' || n === 'us') return 'us';
  if (n === 'suisse' || n === 'swiss') return 'ch';
  if (n === 'belgique' || n === 'belge') return 'be';
  if (n === 'allemagne' || n === 'german') return 'de';
  if (n === 'espagne' || n === 'spanish') return 'es';
  if (n === 'italie' || n === 'italian') return 'it';
  if (n.length === 2) return n;
  return 'xx';
}

export default async function JoueursPage() {
  const players = await getPlayers();
  const user = await getServerUser();
  const isClubAdmin = user?.roles?.includes("club_admin");
  const scopedPlayers = isClubAdmin && user?.orgId
    ? players.filter((player: any) => player.clubId === user.orgId)
    : players;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center md:text-left mb-8">
        <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight">
          Joueurs
        </h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Liste des joueurs licenciés de la Fédération Royale Marocaine de Hockey sur Glace.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {scopedPlayers.map((player: any) => (
          <div 
            key={player.id}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-xl hover:-translate-y-1 hover:ring-gray-300"
          >
            {/* Header Background */}
            <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100" />
            
            <div className="flex flex-col flex-1 p-6 pt-0">
              {/* Photo */}
              <div className="-mt-12 mb-4 self-center">
                <div className="relative h-24 w-24 rounded-full border-4 border-white shadow-md bg-white flex items-center justify-center overflow-hidden ring-1 ring-gray-100">
                  {player.photoDocumentId ? (
                    <Image 
                      src={`/api/documents/view?id=${player.photoDocumentId}`} 
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <User className="h-10 w-10 text-gray-300" />
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 leading-tight mb-1">
                  {player.firstName} {player.lastName}
                </h3>
                
                <div className="flex flex-col items-center gap-2 mt-2">
                  {/* Club & Nationality */}
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    {player.clubName && (
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100">
                        {player.clubLogoId ? (
                          <div className="relative h-4 w-4">
                             <Image 
                               src={`/api/documents/view?id=${player.clubLogoId}`} 
                               alt="Club Logo"
                               fill
                               className="object-contain"
                             />
                          </div>
                        ) : (
                          <Shield className="h-3.5 w-3.5 text-gray-400" />
                        )}
                        <span className="font-medium text-xs">{player.clubName}</span>
                      </div>
                    )}
                    
                    {player.nationality && (
                      <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-full border border-gray-100" title={player.nationality}>
                        <div className="relative h-3 w-4 overflow-hidden rounded-[2px] shadow-sm">
                          <Image
                            src={`https://flagcdn.com/w20/${getCountryCode(player.nationality)}.png`}
                            alt={player.nationality}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <span className="font-medium text-xs uppercase">{getCountryCode(player.nationality)}</span>
                      </div>
                    )}
                  </div>

                  {/* Badges */}
                  <div className="flex flex-wrap justify-center gap-2 mt-1">
                    <Badge variant="outline" className="border-gray-200 text-gray-700 bg-gray-50 text-xs font-normal">
                      #{player.jerseyNumber || '-'} | {player.position}
                    </Badge>
                    
                    {player.isHockeySchool && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100 text-xs gap-1">
                        <GraduationCap className="h-3 w-3" />
                        École de Hockey
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="mt-auto grid grid-cols-4 gap-2 py-4 border-t border-gray-100">
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1" title="Matchs Joués">MJ</div>
                  <div className="font-bold text-gray-900">{player.gamesPlayed || 0}</div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1" title="Buts">Buts</div>
                  <div className="font-bold text-gray-900">{player.goals || 0}</div>
                </div>
                <div className="text-center border-l border-gray-100">
                  <div className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1" title="Assists">Ass</div>
                  <div className="font-bold text-gray-900">{player.assists || 0}</div>
                </div>
                <div className="text-center border-l border-gray-100 bg-gray-50/50 rounded-r-lg -my-2 py-2 flex flex-col justify-center">
                  <div className="text-[10px] uppercase tracking-wider text-gray-900 font-bold mb-1" title="Points">Pts</div>
                  <div className="font-bold text-brand-600">{(player.goals || 0) + (player.assists || 0)}</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
