"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Classement", href: "/public/classement" },
  { label: "Résultats", href: "/public/resultats" },
  { label: "Clubs", href: "/public/clubs" },
  { label: "Joueurs", href: "/public/joueurs" },
];

export function PublicNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-white/70 backdrop-blur-md shadow-sm">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-12 w-12 drop-shadow-md transition-transform group-hover:scale-105">
            <Image 
              src="/logo_frmhg.png" 
              alt="Logo FRMHG" 
              fill
              className="object-contain"
            />
          </div>
          <div className="hidden md:block">
            <div className="font-display text-lg font-bold text-gray-900 leading-tight group-hover:text-brand-600 transition-colors">FRMHG</div>
            <div className="text-xs font-medium text-gray-500">Portail de gestion</div>
          </div>
        </Link>

        <div className="flex items-center gap-1 md:gap-2">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 ${
                  isActive
                    ? "text-brand-700 bg-brand-50 shadow-inner"
                    : "text-gray-600 hover:text-brand-600 hover:bg-white/50"
                }`}
              >
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-1/2 h-1 w-1/2 -translate-x-1/2 rounded-t-full bg-brand-500" />
                )}
              </Link>
            );
          })}
          
          <Link
            href="/"
            className="ml-4 hidden md:flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_10px_-2px_rgba(27,84,72,0.4)] transition-all hover:bg-brand-700 hover:shadow-[0_6px_15px_-3px_rgba(27,84,72,0.5)] active:scale-95"
          >
            <span>Connexion</span>
            <svg className="h-4 w-4 opacity-80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
          </Link>
        </div>
      </div>
    </nav>
  );
}
