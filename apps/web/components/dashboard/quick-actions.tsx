"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { 
  Users, CreditCard, Trophy, MapPin, Calendar, FileText, 
  Shield, Stethoscope, Settings, Plus, CheckCircle, Eye
} from "lucide-react";

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  href: string;
  color: string;
  isNew?: boolean;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, href, color, isNew }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      whileTap={{ scale: 0.98 }}
      className="group relative"
    >
      <Link 
        href={href}
        className={`block rounded-2xl border border-gray-200 bg-white p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${color} group-hover:border-opacity-50`}
      >
        {isNew && (
          <div className="absolute -top-2 -right-2 rounded-full bg-red-500 px-2 py-1 text-xs font-bold text-white">
NOUVEAU
          </div>
        )}
        <div className="flex items-start space-x-4">
          <div className="rounded-xl bg-gray-100 p-3 group-hover:bg-opacity-80 transition-colors">
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 group-hover:text-gray-700 transition-colors">
              {title}
            </h3>
            <p className="mt-1 text-sm text-gray-600">
              {description}
            </p>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export const QuickActions: React.FC = () => {
  const actions = [
    {
      title: "Gérer les Clubs",
      description: "Voir, valider et gérer les clubs affiliés",
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      href: "/dashboard/federation/clubs",
      color: "hover:border-blue-300"
    },
    {
      title: "Validation des Paiements",
      description: "Examiner et approuver les paiements en attente",
      icon: <CreditCard className="h-6 w-6 text-emerald-600" />,
      href: "/modules/paiements",
      color: "hover:border-emerald-300",
      isNew: true
    },
    {
      title: "Gestion des Licences",
      description: "Gérer les saisons, catégories et licences",
      icon: <Trophy className="h-6 w-6 text-amber-600" />,
      href: "/modules/licences",
      color: "hover:border-amber-300"
    },
    {
      title: "Gestion des Équipes",
      description: "Voir les équipes et les membres affectés",
      icon: <Users className="h-6 w-6 text-purple-600" />,
      href: "/modules/membres",
      color: "hover:border-purple-300"
    },
    {
      title: "Gestion Sportive",
      description: "Compétitions, matchs et classements",
      icon: <Calendar className="h-6 w-6 text-red-600" />,
      href: "/modules/sportif",
      color: "hover:border-red-300"
    },
    {
      title: "Dossiers Médicaux",
      description: "Voir les fichiers médicaux et consultations",
      icon: <Stethoscope className="h-6 w-6 text-teal-600" />,
      href: "/modules/medical",
      color: "hover:border-teal-300"
    },
    {
      title: "Inventaire du Matériel",
      description: "Gérer le matériel et équipements sportifs",
      icon: <Shield className="h-6 w-6 text-indigo-600" />,
      href: "/modules/materiel",
      color: "hover:border-indigo-300"
    },
    {
      title: "Communication",
      description: "Envoyer des annonces et gérer les newsletters",
      icon: <FileText className="h-6 w-6 text-pink-600" />,
      href: "/modules/communication",
      color: "hover:border-pink-300"
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Actions Rapides</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <CheckCircle className="h-4 w-4" />
          <span>{actions.length} actions disponibles</span>
        </div>
      </div>
      
      <div className="grid gap-5 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <ActionCard
              title={action.title}
              description={action.description}
              icon={action.icon}
              href={action.href}
              color={action.color}
              isNew={action.isNew}
            />
          </motion.div>
        ))}
      </div>
      
      <div className="rounded-2xl border border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 p-6">
        <div className="flex items-start space-x-4">
          <div className="rounded-xl bg-blue-100 p-3">
            <Settings className="h-6 w-6 text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900">Administration Système</h3>
            <p className="mt-1 text-sm text-gray-600">
              Gérer les utilisateurs, rôles et paramètres système
            </p>
            <div className="mt-4 flex space-x-3">
              <Link 
                href="/modules/iam" 
                className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="mr-2 h-4 w-4" />
                Gestion des Utilisateurs
              </Link>
              <Link 
                href="/modules/settings" 
                className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Eye className="mr-2 h-4 w-4" />
                Voir les Paramètres
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
