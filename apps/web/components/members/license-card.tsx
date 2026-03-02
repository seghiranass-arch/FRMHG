import * as React from "react";

interface LicenseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  member: {
    id: string;
    firstName: string;
    lastName: string;
    memberNumber?: string | null;
    licenseNumber?: string | null;
    licenseStatus?: string | null;
    memberStatus?: string | null;
    assignedClubId?: string | null;
    orgId?: string | null;
    org_id?: string | null;
  };
  licenseStatus: string;
  photoUrl: string | null;
  qrCodeUrl: string | null;
  clubLogoUrl: string | null;
  isAdherent: boolean;
  seasonName: string;
  seasonPeriod: string;
  disciplineName: string;
}

export const LicenseCard = React.forwardRef<HTMLDivElement, LicenseCardProps>(
  (
    {
      member,
      licenseStatus,
      photoUrl,
      qrCodeUrl,
      clubLogoUrl,
      isAdherent,
      seasonName,
      seasonPeriod,
      disciplineName,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        data-license-card="true"
        className={`bg-gradient-to-br from-brand-900 via-brand-800 to-brand-950 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden aspect-[1.6/1] flex flex-col justify-between ${className || ""}`}
        {...props}
      >
        {/* Background pattern */}
        <div className="absolute top-0 right-0 p-4 opacity-5 rotate-12">
          <span className="text-9xl font-bold">FRMHG</span>
        </div>

        {/* Top Section: Logo & Header */}
        <div className="relative z-10 flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white rounded-lg p-1.5 shadow-inner">
              <img
                src="/logo_frmhg.png"
                alt="FRMHG"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-300">
                Fédération Royale Marocaine
              </p>
              <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-brand-300">
                de Hockey sur Glace
              </p>
            </div>
          </div>
          <div className="text-right flex flex-col items-end gap-2">
            <span
              className={`px-2 py-0.5 rounded text-[8px] font-black tracking-tighter ${
                licenseStatus === "active"
                  ? "bg-green-500 text-white"
                  : licenseStatus === "pending_approval" ||
                    licenseStatus === "pending"
                  ? "bg-orange-500 text-white"
                  : "bg-red-500 text-white"
              }`}
            >
              {licenseStatus === "pending_approval" ||
              licenseStatus === "pending"
                ? "ATTENTE APPROB."
                : (licenseStatus?.toUpperCase() || "DRAFT")}
            </span>
          </div>
        </div>

        {/* Middle Section: Member Info & QR */}
        <div className="relative z-10 flex items-center gap-4 mt-4">
          <div className="w-20 h-24 bg-white/10 rounded-lg border border-white/20 overflow-hidden flex-shrink-0">
            {photoUrl ? (
              <img
                src={photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white/30">
                <svg
                  className="w-10 h-10"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-brand-200 uppercase tracking-widest leading-none">
              {member.assignedClubId ? "Joueur" : "Adhérent"}
            </p>
            <p className="text-lg font-black truncate mt-1 leading-tight">
              {member.lastName?.toUpperCase()}
            </p>
            <p className="text-sm font-bold truncate text-white/90 leading-tight">
              {member.firstName}
            </p>
            {clubLogoUrl && (
              <div className="mt-1 w-6 h-6 bg-white rounded-md p-0.5 shadow-inner">
                <img
                  src={clubLogoUrl}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            <p className="text-[9px] font-mono text-brand-300 mt-2 bg-black/20 inline-block px-1.5 py-0.5 rounded">
              ID: {member.memberNumber || member.licenseNumber || "N/A"}
            </p>
          </div>
          <div className="w-16 h-16 bg-white rounded-lg p-1.5 flex-shrink-0 shadow-lg">
            {qrCodeUrl && (
              <img
                src={qrCodeUrl}
                alt="QR Code"
                crossOrigin="anonymous"
                className="w-full h-full"
              />
            )}
          </div>
        </div>

        {/* Bottom Section: Details */}
        <div className="relative z-10 grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-white/10">
          <div>
            <p className="text-[7px] uppercase text-brand-400 font-bold tracking-widest">
              {isAdherent ? "Saison payée" : "Saison licence"}
            </p>
            <p className="text-[10px] font-black">{seasonName}</p>
            <p className="text-[8px] text-brand-300 mt-1">{seasonPeriod}</p>
          </div>
          <div>
            <p className="text-[7px] uppercase text-brand-400 font-bold tracking-widest">
              Discipline
            </p>
            <p className="text-[10px] font-black truncate">{disciplineName}</p>
          </div>
        </div>
      </div>
    );
  }
);

LicenseCard.displayName = "LicenseCard";
