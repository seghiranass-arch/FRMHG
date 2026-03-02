"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import type { AuthUser } from "../../lib/auth";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  user: AuthUser;
  showBackButton?: boolean;
  backHref?: string;
  stats?: Array<{
    label: string;
    value: string | number;
  }>;
  // Gradient header is now the default style for all pages
  usePlainStyle?: boolean;
}

export const PageHeader: React.FC<PageHeaderProps> = ({ 
  title, 
  subtitle, 
  user, 
  showBackButton = false, 
  backHref = "/", 
  stats,
  usePlainStyle = false
}) => {
  const useGradient = !usePlainStyle;
  const headerClasses = useGradient 
    ? "rounded-2xl bg-gradient-to-r from-brand-600 to-brand-700 p-8 text-white"
    : "rounded-2xl bg-white border border-gray-200 p-8";

  const textClasses = useGradient ? "text-white" : "text-gray-900";
  const subtitleClasses = useGradient ? "text-brand-200" : "text-gray-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={headerClasses}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Link 
                href={backHref}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  useGradient 
                    ? "text-brand-200 hover:bg-brand-500/20" 
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ArrowLeft className="h-4 w-4" />
                Retour
              </Link>
            )}
            <div>
              <h1 className={`text-3xl font-bold ${textClasses}`}>{title}</h1>
              {subtitle && (
                <p className={`mt-2 ${subtitleClasses}`}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {stats && stats.length > 0 && (
            <div className="mt-6 hidden sm:block">
              <div className="flex space-x-6">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className={`text-2xl font-bold ${textClasses}`}>{stat.value}</div>
                    <div className={`text-sm ${subtitleClasses}`}>{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="hidden sm:block">
          <div className="flex items-center justify-center">
            <Image
              src="/logo-blanc.png"
              alt="FRMHG"
              width={80}
              height={80}
              className="h-20 w-20 object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
};