import { headers } from 'next/headers';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Globe, Facebook, Twitter, Instagram, MapPin, Calendar } from 'lucide-react';
import { getServerUser } from '../../../lib/server-auth';

async function getClubs() {
  const headersList = await headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  try {
    const res = await fetch(`${protocol}://${host}/api/public/sport/clubs`, {
      cache: 'no-store',
    });
    
    if (!res.ok) {
      throw new Error('Failed to fetch clubs');
    }
    
    return res.json();
  } catch (error) {
    console.error('Error fetching clubs:', error);
    return [];
  }
}

export default async function ClubsPage() {
  const clubs = await getClubs();
  const user = await getServerUser();
  const isClubAdmin = user?.roles?.includes("club_admin");
  const scopedClubs = isClubAdmin && user?.orgId
    ? clubs.filter((club: any) => club.id === user.orgId)
    : clubs;

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center md:text-left mb-8">
        <h1 className="font-display text-4xl font-bold text-gray-900 tracking-tight">
          Clubs
        </h1>
        <p className="mt-2 text-lg text-gray-600 max-w-2xl">
          Découvrez les clubs affiliés à la Fédération Royale Marocaine de Hockey sur Glace.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {scopedClubs.map((club: any) => (
          <div 
            key={club.id}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-gray-200 transition-all hover:shadow-xl hover:-translate-y-1 hover:ring-gray-300"
          >
            {/* Header Background */}
            <div className="h-24 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-100" />
            
            <div className="flex flex-col flex-1 p-6 pt-0">
              {/* Logo */}
              <div className="-mt-12 mb-4 self-center">
                <div className="relative h-24 w-24 rounded-2xl bg-white p-1 shadow-lg ring-1 ring-gray-100 flex items-center justify-center overflow-hidden">
                  {club.logoDocumentId ? (
                    <Image 
                      src={`/api/documents/view?id=${club.logoDocumentId}`} 
                      alt={club.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-gray-300">
                      {club.acronym?.substring(0, 2) || club.name.substring(0, 2)}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div className="text-center mb-6">
                <h3 className="font-bold text-xl text-gray-900 leading-tight mb-2 group-hover:text-brand-600 transition-colors">
                  {club.name}
                </h3>
                {club.acronym && (
                  <Badge variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200">
                    {club.acronym}
                  </Badge>
                )}
              </div>

              {/* Details */}
              <div className="space-y-3 mt-auto border-t border-gray-100 pt-6">
                {club.city && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="font-medium">{club.city}</span>
                  </div>
                )}
                {club.foundedYear && (
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-50 text-gray-500">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <span className="font-medium">Fondé en {club.foundedYear}</span>
                  </div>
                )}
              </div>

              {/* Social Links */}
              {(club.website || club.facebook || club.twitter || club.instagram) && (
                <div className="mt-6 flex items-center justify-center gap-4 pt-4 border-t border-gray-100">
                  {club.website && (
                    <a 
                      href={club.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-brand-600 transition-colors transform hover:scale-110"
                      title="Site web"
                    >
                      <Globe className="h-5 w-5" />
                    </a>
                  )}
                  {club.facebook && (
                    <a 
                      href={club.facebook} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-blue-600 transition-colors transform hover:scale-110"
                      title="Facebook"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {club.twitter && (
                    <a 
                      href={club.twitter} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-sky-500 transition-colors transform hover:scale-110"
                      title="Twitter"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {club.instagram && (
                    <a 
                      href={club.instagram} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-pink-600 transition-colors transform hover:scale-110"
                      title="Instagram"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
