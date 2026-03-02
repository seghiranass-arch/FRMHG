"use client";

import { ReactNode } from "react";
import { PageHeader } from "../dashboard/page-header";

// Placeholder user - will be replaced with real auth
const placeholderUser = {
  id: "placeholder-user",
  email: "",
  displayName: "Utilisateur",
  roles: ["user"]
};

interface PageWrapperProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  showBackButton?: boolean;
  backHref?: string;
  useGradient?: boolean;
  className?: string;
}

export function PageWrapper({
  children,
  title = "FRMHG Plateforme",
  subtitle = "Fédération Royale Marocaine de Hockey sur Glace",
  showBackButton = false,
  backHref = "/",
  useGradient = true,
  className = ""
}: PageWrapperProps) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="container-x py-8">
        <PageHeader 
          title={title}
          subtitle={subtitle}
          user={placeholderUser}
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

// Convenience wrappers for common page types
export function DashboardPage({ children, title, subtitle }: Omit<PageWrapperProps, 'useGradient'>) {
  return (
    <PageWrapper 
      title={title} 
      subtitle={subtitle} 
      useGradient={true}
    >
      {children}
    </PageWrapper>
  );
}

export function ModulePage({ children, title, subtitle }: Omit<PageWrapperProps, 'useGradient'>) {
  return (
    <PageWrapper 
      title={title} 
      subtitle={subtitle || "Gestion et administration"} 
      useGradient={true}
    >
      {children}
    </PageWrapper>
  );
}

export function AdminPage({ children, title, subtitle }: Omit<PageWrapperProps, 'useGradient'>) {
  return (
    <PageWrapper 
      title={title} 
      subtitle={subtitle || "Administration système"} 
      useGradient={true}
    >
      {children}
    </PageWrapper>
  );
}