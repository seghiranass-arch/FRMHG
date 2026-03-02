import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { LicenseCard } from "../../../../components/members/license-card";
import { getServerUser } from "../../../../lib/server-auth";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getMemberData(id: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token");
  const apiUrl = process.env.API_URL || "http://localhost:3001";

  const res = await fetch(`${apiUrl}/members/${id}`, {
    headers: {
      Cookie: token ? `frmhg_token=${token.value}` : "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

async function getClubData(clubId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token");
  const apiUrl = process.env.API_URL || "http://localhost:3001";

  const res = await fetch(`${apiUrl}/orgs/${clubId}`, {
    headers: {
      Cookie: token ? `frmhg_token=${token.value}` : "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  return res.json();
}

async function getLatestSubscription(memberId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token");
  const apiUrl = process.env.API_URL || "http://localhost:3001";

  const res = await fetch(`${apiUrl}/members/${memberId}/subscriptions`, {
    headers: {
      Cookie: token ? `frmhg_token=${token.value}` : "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

async function getSeasons() {
  const cookieStore = await cookies();
  const token = cookieStore.get("frmhg_token");
  const apiUrl = process.env.API_URL || "http://localhost:3001";

  const res = await fetch(`${apiUrl}/licensing/seasons`, {
    headers: {
      Cookie: token ? `frmhg_token=${token.value}` : "",
    },
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  return res.json();
}

export default async function PrintLicensePage({ params }: PageProps) {
  const { id } = await params;
  const user = await getServerUser();

  if (!user) {
    redirect("/");
  }

  const member = await getMemberData(id);
  if (!member) {
    return <div>Membre introuvable</div>;
  }

  const subscriptions = await getLatestSubscription(id);
  const seasons = await getSeasons();
  
  const isAdherent =
    member.memberStatus === "adherent" ||
    (!member.assignedClubId && member.memberStatus !== "club_player");
    
  const latestSubscription = subscriptions.length > 0 ? subscriptions[0] : null;
  
  const getSeasonName = (seasonId?: string) => {
    if (!seasonId) return "—";
    const season = seasons.find((s: any) => s.id === seasonId);
    return season?.name || "—";
  };
  
  const getSeasonPeriod = (seasonId?: string) => {
    if (!seasonId) return "";
    const season = seasons.find((s: any) => s.id === seasonId);
    if (!season?.startDate || !season?.endDate) return "";
    return `${new Date(season.startDate).getFullYear()} - ${new Date(season.endDate).getFullYear()}`;
  };

  const activeSeason = seasons.find((s: any) => s.isActive);
  
  const seasonName = isAdherent 
    ? getSeasonName(latestSubscription?.seasonId || member.seasonId)
    : getSeasonName(activeSeason?.id || member.licenseSeason);
    
  const seasonPeriod = isAdherent
    ? getSeasonPeriod(latestSubscription?.seasonId || member.seasonId)
    : getSeasonPeriod(activeSeason?.id || member.licenseSeason);

  const assignedClubId = member.assignedClubId || member.orgId;
  let clubLogoUrl = null;
  
  if (assignedClubId) {
    const club = await getClubData(assignedClubId);
    if (club?.logoDocumentId) {
      clubLogoUrl = `/api/documents/view?id=${club.logoDocumentId}`;
    }
  }

  const getPhotoUrl = () => {
    const photoId = member.profilePhotoId || 
      member.documents?.find((doc: any) => doc.type === "photo")?.id;
    if (!photoId) return null;
    return `/api/documents/view?id=${photoId}`;
  };

  const getQrCodeUrl = () => {
    const code = member.memberNumber || member.licenseNumber;
    if (code) {
      return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(code)}`;
    }
    return null;
  };
  
  const getDisciplineName = (d: any) => {
     if (!d) return "—";
     if (typeof d === "string") return d;
     return d.name || "—";
  };

  // Dimensions
  // ID-1 standard: 85.60 x 53.98 mm
  // We want to render at a higher "virtual" resolution to match the design proportions
  // A width of ~420px provides a good balance between content density and readability,
  // closely matching how the card appears in the profile view column.
  const DESIGN_WIDTH_PX = 420;
  const ASPECT_RATIO = 85.6 / 53.98; // ~1.5857
  const DESIGN_HEIGHT_PX = DESIGN_WIDTH_PX / ASPECT_RATIO;
  
  // Calculate scale factor to fit into 85.6mm (approx 323.5px at 96dpi)
  // 1mm = 3.7795px
  const TARGET_WIDTH_PX = 85.6 * 3.7795;
  const SCALE_FACTOR = TARGET_WIDTH_PX / DESIGN_WIDTH_PX;

  return (
    <div className="flex items-center justify-center min-h-screen bg-white p-0 m-0">
      <style>{`
        @page {
          size: 85.6mm 53.98mm;
          margin: 0;
        }
        body {
          margin: 0;
          padding: 0;
          overflow: hidden;
        }
      `}</style>
      
      {/* Container matching physical dimensions */}
      <div 
        style={{ 
          width: "85.6mm", 
          height: "53.98mm", 
          position: "relative",
          overflow: "hidden" 
        }}
      >
        {/* Scaled content wrapper */}
        <div
          style={{
            width: `${DESIGN_WIDTH_PX}px`,
            height: `${DESIGN_HEIGHT_PX}px`,
            transform: `scale(${SCALE_FACTOR})`,
            transformOrigin: "top left",
          }}
        >
          <LicenseCard
            member={member}
            licenseStatus={member.licenseStatus || "DRAFT"}
            photoUrl={getPhotoUrl()}
            qrCodeUrl={getQrCodeUrl()}
            clubLogoUrl={clubLogoUrl}
            isAdherent={isAdherent}
            seasonName={seasonName}
          seasonPeriod=""
          disciplineName={getDisciplineName(member.discipline)}
            className="w-full h-full rounded-none shadow-none"
          />
        </div>
      </div>
    </div>
  );
}
