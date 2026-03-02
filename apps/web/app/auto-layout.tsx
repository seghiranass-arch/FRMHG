"use client";

import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PageHeader } from "../components/dashboard/page-header";
import type { AuthUser } from "../lib/auth";

// Route configuration for automatic headers
interface RouteConfig {
  title: string;
  subtitle: string;
  showBackButton?: boolean;
  backHref?: string;
}

// Define headers for each route
const ROUTE_HEADERS: Record<string, RouteConfig> = {
  // Dashboard routes
  "/dashboard": {
    title: "Tableau de Bord",
    subtitle: "Sélectionnez votre espace de travail"
  },
  "/dashboard/federation": {
    title: "Tableau de Bord Fédéral",
    subtitle: "Bienvenue dans votre centre de gestion fédérale"
  },
  "/dashboard/federation/clubs": {
    title: "Gestion des Clubs",
    subtitle: "Gérez les clubs affiliés à la fédération"
  },
  "/dashboard/federation/clubs/new": {
    title: "Nouveau Club",
    subtitle: "Créer un nouveau club affilié",
    showBackButton: true,
    backHref: "/dashboard/federation/clubs"
  },
  "/dashboard/club": {
    title: "Tableau de Bord Club",
    subtitle: "Gérez votre club et vos membres"
  },
  "/dashboard/national": {
    title: "Direction Technique Nationale",
    subtitle: "Sélections et compétitions nationales"
  },
  
  // Module routes
  "/modules/membres": {
    title: "Gestion des Équipes",
    subtitle: "Équipes et membres affectés"
  },
  "/modules/clubs": {
    title: "Gestion des Clubs",
    subtitle: "Administration des clubs affiliés"
  },
  "/modules/sport": {
    title: "Module Sportif",
    subtitle: "Compétitions, matchs et résultats"
  },
  "/modules/finance": {
    title: "Gestion Financière",
    subtitle: "Paiements, cotisations et comptabilité"
  },
  "/modules/materiel": {
    title: "Gestion du Matériel",
    subtitle: "Inventaire complet du matériel de la fédération et des clubs"
  },
  "/modules/medical": {
    title: "Module Médical",
    subtitle: "Suivi médical et certificats"
  },
  "/modules/communication": {
    title: "Communication",
    subtitle: "Notifications et annonces"
  },
  "/modules/paiements": {
    title: "Paiements",
    subtitle: "Virement + reçu : pending_receipt → pending_review → approved/rejected"
  },
  "/modules/licences": {
    title: "Gestion des Licences",
    subtitle: "Approuver les licences en attente et gérer les renouvellements"
  },
  
  // Admin routes
  "/modules/admin": {
    title: "Administration",
    subtitle: "Configuration et paramètres système"
  },
  "/modules/admin/disciplines": {
    title: "Disciplines",
    subtitle: "Gestion des disciplines sportives",
    showBackButton: true,
    backHref: "/modules/admin"
  },
  "/modules/admin/categories": {
    title: "Catégories",
    subtitle: "Gestion des catégories d'âge",
    showBackButton: true,
    backHref: "/modules/admin"
  },
  "/modules/admin/subscriptions": {
    title: "Abonnements",
    subtitle: "Gestion des types d'abonnements",
    showBackButton: true,
    backHref: "/modules/admin"
  },
  "/modules/admin/audit": {
    title: "Journal d'Audit",
    subtitle: "Historique des actions système",
    showBackButton: true,
    backHref: "/modules/admin"
  },
};

// Find the best matching route config
function findRouteConfig(pathname: string): RouteConfig | null {
  // First try exact match
  if (ROUTE_HEADERS[pathname]) {
    return ROUTE_HEADERS[pathname];
  }
  
  // Check for dynamic routes (e.g., /dashboard/federation/clubs/[id])
  // Try to match parent routes
  const segments = pathname.split('/').filter(Boolean);
  while (segments.length > 0) {
    const testPath = '/' + segments.join('/');
    if (ROUTE_HEADERS[testPath]) {
      return ROUTE_HEADERS[testPath];
    }
    segments.pop();
  }
  
  return null;
}

interface AutoLayoutProps {
  children: ReactNode;
  user: AuthUser;
  // Allow pages to override the automatic header
  customTitle?: string;
  customSubtitle?: string;
  hideHeader?: boolean;
}

export function AutoLayout({ 
  children, 
  user,
  customTitle,
  customSubtitle,
  hideHeader = false 
}: AutoLayoutProps) {
  const pathname = usePathname();
  const routeConfig = findRouteConfig(pathname);
  
  // Don't show header if explicitly hidden, if it's a detail page with [id], or if page provides its own header
  const isDetailPage = pathname.match(/\/\[a-f0-9-\]\{36\}\$/i) || pathname.match(/\/\d+\$/);
  // Check if these are pages which provide their own headers
  const hasCustomHeader = [
    '/modules/licences', 
    '/modules/materiel', 
    '/modules/paiements',
    '/modules/sport/competition',
    '/modules/admin/disciplines',
    '/modules/admin/seasons',
    '/modules/admin/categories',
    '/modules/admin/subscriptions',
    '/modules/admin/audit',
    '/modules/communication',
    '/modules/admin',
    '/dashboard/club'
  ].includes(pathname);
  const shouldShowHeader = !hideHeader && routeConfig && !isDetailPage && !hasCustomHeader;
  
  // Use custom values if provided, otherwise use route config
  const title = customTitle || routeConfig?.title || "FRMHG";
  const subtitle = customSubtitle || routeConfig?.subtitle || "Plateforme de gestion";
  
  return (
    <div className="space-y-6">
      {shouldShowHeader && (
        <PageHeader
          title={title}
          subtitle={subtitle}
          user={user}
          showBackButton={routeConfig?.showBackButton}
          backHref={routeConfig?.backHref}
          usePlainStyle={false}
        />
      )}
      {children}
    </div>
  );
}

// Export route headers for external use
export { ROUTE_HEADERS, findRouteConfig };
export type { RouteConfig };
