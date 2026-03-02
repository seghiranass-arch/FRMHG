"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { LoginCard } from "../components/login-card";

export default function Page() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gray-900">
      {/* Background Image Layer - Arena */}
      <div className="absolute inset-0 z-0">
        <motion.div
          initial={{ scale: 1 }}
          animate={{ scale: 1.1 }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            repeatType: "reverse", 
            ease: "easeInOut" 
          }}
          className="relative w-full h-full"
        >
          <Image
            src="/arena.jpg"
            alt="Arena Background"
            fill
            className="object-cover"
            priority
          />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-900/60 via-brand-900/40 to-brand-900/80 backdrop-blur-[2px]" />
      </div>

      {/* Glassmorphism Navigation */}
      <nav className="absolute top-0 left-0 right-0 z-50 flex flex-col md:flex-row items-center justify-between px-6 py-6 md:px-10 gap-4">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 drop-shadow-lg">
            <Image 
              src="/logo_frmhg.png" 
              alt="Logo FRMHG" 
              fill
              className="object-contain"
            />
          </div>
          <div className="hidden md:block">
            <div className="font-display text-lg font-bold text-white leading-tight">FRMHG</div>
            <div className="text-xs font-medium text-gray-300">Portail de gestion</div>
          </div>
        </div>
        
        <div className="flex flex-wrap justify-center items-center gap-2">
          {[
            { label: "Classement", href: "/public/classement" },
            { label: "Résultats", href: "/public/resultats" },
            { label: "Clubs", href: "/public/clubs" },
            { label: "Joueurs", href: "/public/joueurs" },
          ].map((item) => (
            <Link 
              key={item.label}
              href={item.href}
              className="group relative overflow-hidden rounded-xl bg-white/40 px-4 py-2 shadow-sm ring-1 ring-black/5 backdrop-blur-md transition-all hover:bg-white/80 hover:shadow-md active:scale-95"
            >
              <span className="text-sm font-bold text-gray-700 group-hover:text-brand-600 transition-colors">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex min-h-screen w-full flex-col items-center justify-center px-4 py-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-lg"
        >
          <div className="mb-10 text-center">
            <h1 className="font-display text-4xl font-bold text-white drop-shadow-lg md:text-5xl lg:text-6xl tracking-tight">
              Bienvenue
            </h1>
            <p className="mt-4 text-lg text-gray-200 font-medium md:text-xl">
              Connectez-vous pour accéder à votre espace
            </p>
          </div>
          
          <div className="relative transform scale-105">
            {/* Decorative elements behind the card */}
            <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-brand-500/20 to-brand-secondary/20 blur-sm" />
            
            {/* Login Card Component */}
            <LoginCard />
          </div>

          <div className="mt-12 text-center">
            <p className="text-sm font-medium text-gray-400">
              © {new Date().getFullYear()} FRMHG — Fédération Royale Marocaine de Hockey sur Glace
            </p>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

