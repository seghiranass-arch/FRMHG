"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

import { 
  GridIcon, 
  ChevronDownIcon, 
  HorizontaLDots, 
  DashboardIcon, 
  UsersIcon, 
  LicenseIcon, 
  PaymentIcon, 
  EquipmentIcon, 
  CompetitionIcon, 
  MedicalIcon, 
  FinanceIcon, 
  SettingsIcon, 
  CommunicationIcon, 
  AuditIcon,
  CalenderIcon
} from "./icons";
import { useSidebar } from "./sidebar-context";
import type { AuthUser } from "../../lib/auth";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; badge?: "new" | "pro"; icon?: React.ReactNode }[];
  roles?: string[]; // Roles that can see this item
  hideFromRoles?: string[]; // Roles that should NOT see this item
};

// Menu configuration by role groups
const getMenuItems = (userRoles: string[]): NavItem[] => {
  // Core menu items (visible to all authenticated users)
  // Admin dashboard route differs by role
  let dashboardPath = "/";
  if (userRoles.includes("federation_admin")) {
    dashboardPath = "/dashboard/federation";
  }
  if (userRoles.includes("club_admin")) {
    dashboardPath = "/dashboard/club";
  }

  const coreItems: NavItem[] = [
    {
      icon: <DashboardIcon />,
      name: "Tableau de bord",
      path: dashboardPath
    },
    {
      icon: <CalenderIcon />,
      name: "Calendrier",
      path: "/modules/calendrier"
    }
  ];

  // Federation Admin specific items
  const federationItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Administration",
      subItems: [
        { name: "Clubs", path: "/dashboard/federation/clubs", icon: <GridIcon /> },
        { name: "Joueurs", path: "/modules/membres", icon: <UsersIcon /> },
        { name: "Licences", path: "/modules/licences", icon: <LicenseIcon /> },
        { name: "Paiements", path: "/modules/paiements", icon: <PaymentIcon /> },
        { name: "Matériel", path: "/modules/materiel", icon: <EquipmentIcon /> },
        { name: "Compétitions", path: "/modules/sport/competition", icon: <CompetitionIcon /> }
      ],
      roles: ["federation_admin"]
    },
    {
      icon: <SettingsIcon />,
      name: "Configuration",
      subItems: [
        { name: "Disciplines", path: "/modules/admin/disciplines", icon: <SettingsIcon /> },
        { name: "Saisons", path: "/modules/admin/seasons", icon: <SettingsIcon /> },
        { name: "Abonnements", path: "/modules/admin/subscriptions", icon: <SettingsIcon /> },
        { name: "Utilisateurs", path: "/modules/admin", icon: <UsersIcon /> }
      ],
      roles: ["federation_admin"]
    }
  ];

  // Club Admin specific items
  const clubItems: NavItem[] = [
    {
      icon: <GridIcon />,
      name: "Gestion Club",
      subItems: [
        { name: "Joueurs", path: "/modules/membres", icon: <UsersIcon /> },
        { name: "Licences", path: "/modules/licences", icon: <LicenseIcon /> },
        { name: "Matériel", path: "/modules/materiel", icon: <EquipmentIcon /> },
        { name: "Compétitions", path: "/modules/sportif", icon: <CompetitionIcon /> }
      ],
      roles: ["club_admin"]
    }
  ];

  // Finance specific items
  const financeItems: NavItem[] = [
    {
      icon: <FinanceIcon />,
      name: "Finances",
      subItems: [
        { name: "Paiements", path: "/modules/paiements", icon: <PaymentIcon /> },
        { name: "Rapports", path: "/modules/finance", icon: <FinanceIcon /> }
      ],
      roles: ["finance"]
    }
  ];

  // Medical specific items
  const medicalItems: NavItem[] = [
    {
      icon: <MedicalIcon />,
      name: "Médical",
      subItems: [
        { name: "Visites médicales", path: "/modules/medical", icon: <MedicalIcon /> },
        { name: "Blessures", path: "/modules/medical/blessures", icon: <MedicalIcon /> }
      ],
      roles: ["medecin"]
    }
  ];

  // Sports/DTN specific items
  const sportsItems: NavItem[] = [
    {
      icon: <CompetitionIcon />,
      name: "Sports",
      subItems: [
        { name: "Compétitions", path: "/modules/sport/competition", icon: <CompetitionIcon /> },
        { name: "Équipes", path: "/modules/sportif/equipes", icon: <UsersIcon /> },
        { name: "Matchs", path: "/modules/sportif/matchs", icon: <CompetitionIcon /> }
      ],
      roles: ["dtn", "arbitre"]
    }
  ];

  // Stock/Gestionnaire Matériel specific items
  const stockItems: NavItem[] = [
    {
      icon: <EquipmentIcon />,
      name: "Matériel",
      subItems: [
        { name: "Inventaire", path: "/modules/materiel", icon: <EquipmentIcon /> },
        { name: "Mouvements", path: "/modules/materiel/mouvements", icon: <EquipmentIcon /> },
        { name: "Affectations", path: "/modules/materiel/affectations", icon: <EquipmentIcon /> }
      ],
      roles: ["stock"]
    }
  ];

  // Combine all applicable items based on user roles
  let menuItems = [...coreItems];
  
  if (userRoles.includes("federation_admin")) {
    menuItems = [...menuItems, ...federationItems];
  }
  
  if (userRoles.includes("club_admin")) {
    menuItems = [...menuItems, ...clubItems];
  }
  
  if (userRoles.includes("finance")) {
    menuItems = [...menuItems, ...financeItems];
  }
  
  if (userRoles.includes("medecin")) {
    menuItems = [...menuItems, ...medicalItems];
  }
  
  if (userRoles.includes("dtn") || userRoles.includes("arbitre")) {
    menuItems = [...menuItems, ...sportsItems];
  }
  
  if (userRoles.includes("stock")) {
    menuItems = [...menuItems, ...stockItems];
  }

  return menuItems;
};

const othersItems: NavItem[] = [
  {
    icon: <GridIcon />,
    name: "Autres Modules",
    subItems: [
      { name: "Communication", path: "/modules/communication", icon: <CommunicationIcon /> },
      { name: "Audit", path: "/modules/admin/audit", icon: <AuditIcon /> }
    ]
  }
];

export function AppSidebar({ user }: { user?: AuthUser }) {
  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const pathname = usePathname();
  
  // Get user roles or default to empty array
  const userRoles = user?.roles || [];
  
  // Memoize menu items to prevent re-renders
  const navItems = React.useMemo(() => getMenuItems(userRoles), [userRoles]);

  const [openSubmenu, setOpenSubmenu] = React.useState<{ type: "main" | "others"; index: number } | null>(
    null
  );
  const subMenuRefs = React.useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = React.useCallback((path: string) => path === pathname, [pathname]);

  React.useEffect(() => {
    let submenuMatched = false;
    (["main", "others"] as const).forEach((menuType) => {
      const items = menuType === "main" ? navItems : othersItems;
      items.forEach((nav, index) => {
        nav.subItems?.forEach((sub) => {
          if (isActive(sub.path)) {
            setOpenSubmenu({ type: menuType, index });
            submenuMatched = true;
          }
        });
      });
    });
    if (!submenuMatched) setOpenSubmenu(null);
  }, [pathname, isActive, navItems]); // Added navItems to dependencies

  const handleSubmenuToggle = (index: number, menuType: "main" | "others") => {
    setOpenSubmenu((prev) => {
      if (prev && prev.type === menuType && prev.index === index) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const widthClass = isExpanded || isMobileOpen ? "w-[290px]" : isHovered ? "w-[290px]" : "w-[90px]";

  const showText = isExpanded || isHovered || isMobileOpen;

  const renderMenuItems = (items: NavItem[], menuType: "main" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group cursor-pointer ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-600"
                  : "menu-item-inactive"
              } ${!isExpanded && !isHovered ? "lg:justify-center" : "lg:justify-start"}`}
            >
              <span
                className={`${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {showText && <span className="menu-item-text">{nav.name}</span>}
              {showText && (
                <ChevronDownIcon
                  className={`ml-auto h-5 w-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType && openSubmenu?.index === index ? "rotate-180 text-brand-500" : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                href={nav.path}
                className={`menu-item group ${isActive(nav.path) ? "bg-gradient-to-r from-brand-600 to-brand-700 text-white border-brand-600" : "menu-item-inactive"}`}
              >
                <span className={`${isActive(nav.path) ? "text-white" : "menu-item-icon-inactive"}`}>
                  {nav.icon}
                </span>
                {showText && <span className={`menu-item-text ${isActive(nav.path) ? "text-white" : ""}`}>{nav.name}</span>}
              </Link>
            )
          )}

          {nav.subItems && showText && (
            <div
              ref={(el) => {
                const key = `${menuType}-${index}`;
                subMenuRefs.current[key] = el;
              }}
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "500px"
                    : "0px"
              }}
            >
              <ul className="ml-9 mt-2 space-y-1">
                {nav.subItems?.filter(Boolean).map((sub) => (
                  sub && sub.name && sub.path ? (
                    <li key={sub.name}>
                      <Link
                        href={sub.path}
                        className={`menu-dropdown-item flex items-center gap-2 ${
                          isActive(sub.path) ? "bg-gradient-to-r from-brand-600/10 to-brand-700/10 text-brand-700 border-l-2 border-brand-500" : "menu-dropdown-item-inactive"
                        }`}
                      >
                        {sub.icon && <span className="flex-shrink-0">{sub.icon}</span>}
                        <span className="flex-grow">{sub.name}</span>
                        {sub.badge ? (
                          <span
                            className={`ml-auto menu-dropdown-badge ${
                              isActive(sub.path) ? "menu-dropdown-badge-active" : "menu-dropdown-badge-inactive"
                            }`}
                          >
                            {sub.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ) : null
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed left-0 top-0 z-50 mt-16 flex h-screen flex-col border-r border-gray-200 bg-white text-gray-900 transition-all duration-300 ease-in-out lg:mt-0 ${widthClass} ${
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      } lg:translate-x-0 overflow-hidden`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src="/arena.jpg"
          alt="Arena Background"
          fill
          className="object-cover opacity-[0.08]"
          sizes="(max-width: 768px) 100vw, 300px"
          priority
        />
      </div>

      {/* Content Wrapper */}
      <div className="relative z-10 flex flex-col h-full px-5">
      <div className={`flex py-8 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <Link href="/">
          {showText ? (
            <div className="flex items-center gap-4">
              <div className="flex-shrink-0">
                <img
                  src="/logo_frmhg.png"
                  alt="FRMHG"
                  width={80}
                  height={80}
                  className="h-20 w-20 object-contain"
                />
              </div>
              <div className="leading-tight">
                <div className="font-display text-xl font-bold text-brand-600">FRMHG</div>
                <div className="text-sm text-gray-500">Plateforme</div>
                {user && (
                  <div className="mt-2">
                    {userRoles.map((role: string) => {
                      const roleLabels: Record<string, string> = {
                        "federation_admin": "Admin Fédération",
                        "club_admin": "Admin Club",
                        "dtn": "DTN",
                        "finance": "Finance",
                        "stock": "Matériel",
                        "medecin": "Médecin",
                        "arbitre": "Arbitre"
                      };
                      return (
                        <span 
                          key={role} 
                          className="inline-block px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs font-medium mr-2"
                        >
                          {roleLabels[role] || role}
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-shrink-0">
              <img 
                src="/logo_frmhg.png" 
                alt="FRMHG" 
                width={48} 
                height={48} 
                className="h-12 w-12 object-contain" 
              />
            </div>
          )}
        </Link>
      </div>

      <div className="no-scrollbar flex flex-col overflow-y-auto duration-300 ease-linear flex-1">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showText ? "Menu Principal" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(navItems, "main")}
            </div>

            <div>
              <h2
                className={`mb-4 flex text-xs uppercase leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
                }`}
              >
                {showText ? "Autres" : <HorizontaLDots />}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
      </div>
      
      {/* Footer statique avec logo Sportify */}
      <div className={`pt-6 pb-6 border-t border-gray-200 ${!isExpanded && !isHovered ? "lg:justify-center" : "justify-start"}`}>
        <a 
          href="https://sportify.ma" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex flex-col items-center hover:opacity-80 transition-opacity"
        >
          {showText && (
            <span className="text-xs text-gray-500 mb-2">
              Made by: <span className="font-medium text-brand-600">Sportify</span>
            </span>
          )}
          <Image
            src="/logo-sportify.png"
            alt="Sportify"
            width={96}
            height={96}
            className="h-24 w-24 object-contain"
            priority
          />
        </a>
      </div>
      </div>
    </aside>
  );
}
