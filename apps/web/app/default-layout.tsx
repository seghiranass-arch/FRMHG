import { ReactNode } from "react";
import { PageHeader } from "../components/dashboard/page-header";
import { requireAuth } from "../lib/server-auth";

interface DefaultLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  useGradient?: boolean;
}

export default async function DefaultLayout({
  children,
  title = "FRMHG Plateforme",
  subtitle = "Fédération Royale Marocaine de Hockey sur Glace",
  showBackButton = false,
  backHref = "/",
  useGradient = true
}: DefaultLayoutProps) {
  const user = await requireAuth();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-x py-8">
        <PageHeader 
          title={title}
          subtitle={subtitle}
          user={user}
          showBackButton={showBackButton}
          backHref={backHref}
          usePlainStyle={!useGradient}
        />
        
        <div className="mt-8">
          {children}
        </div>
      </div>
    </div>
  );
}