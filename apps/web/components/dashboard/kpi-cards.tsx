"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Users, CreditCard, Trophy, MapPin } from "lucide-react";

interface KpiCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color: string;
}

interface KpiData {
  clubs: {
    total_clubs: string;
    active_clubs: string;
    pending_clubs: string;
    suspended_clubs: string;
    financially_approved: string;
    financially_pending: string;
  };
  members: {
    total_members: string;
    active_licenses: string;
    pending_licenses: string;
    draft_licenses: string;
  };
  payments: {
    total_payments: string;
    approved_payments: string;
    pending_review_payments: string;
    rejected_payments: string;
    approved_amount_cents: string;
    pending_amount_cents: string;
  };
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, icon, trend, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`rounded-2xl border border-gray-200 bg-white p-6 shadow-lg hover:shadow-xl transition-all duration-300 ${color}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className="mt-2 flex items-center">
              {trend.isPositive ? (
                <TrendingUp className="h-4 w-4 text-green-500" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-500" />
              )}
              <span className={`ml-1 text-sm font-medium ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                {trend.value > 0 ? '+' : ''}{trend.value}%
              </span>
              <span className="ml-1 text-xs text-gray-500">vs mois dernier</span>
            </div>
          )}
        </div>
        <div className="rounded-full bg-gray-100 p-3">
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

export const KpiCards: React.FC<{ data: KpiData }> = ({ data }) => {
  const kpiItems = [
    {
      title: "Total Clubs",
      value: data.clubs.total_clubs,
      icon: <MapPin className="h-6 w-6 text-blue-600" />,
      color: "hover:border-blue-300",
      trend: { value: 12, isPositive: true }
    },
    {
      title: "Membres Actifs",
      value: data.members.total_members,
      icon: <Users className="h-6 w-6 text-emerald-600" />,
      color: "hover:border-emerald-300",
      trend: { value: 8, isPositive: true }
    },
    {
      title: "Paiements Approuvés",
      value: `${(parseInt(data.payments.approved_amount_cents) / 100).toFixed(0)} MAD`,
      icon: <CreditCard className="h-6 w-6 text-amber-600" />,
      color: "hover:border-amber-300",
      trend: { value: 15, isPositive: true }
    },
    {
      title: "Licences Actives",
      value: data.members.active_licenses,
      icon: <Trophy className="h-6 w-6 text-purple-600" />,
      color: "hover:border-purple-300",
      trend: { value: 5, isPositive: true }
    }
  ];

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {kpiItems.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          <KpiCard
            title={item.title}
            value={item.value}
            icon={item.icon}
            trend={item.trend}
            color={item.color}
          />
        </motion.div>
      ))}
    </div>
  );
};