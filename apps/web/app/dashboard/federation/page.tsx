"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { KpiCards } from "../../../components/dashboard/kpi-cards";
import { ChartsSection } from "../../../components/dashboard/charts-section";
import { QuickActions } from "../../../components/dashboard/quick-actions";
import { BarChart3, Users, CreditCard, Calendar } from "lucide-react";

interface DashboardData {
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
  clubsByRegion: Array<{
    region: string;
    count: number;
    active_count: number;
  }>;
  recentActivity: Array<{
    date: string;
    new_clubs: number;
    new_members: number;
    new_payments: number;
  }>;
  seasonalTrends: Array<{
    season_name: string;
    licenses_count: number;
    unique_members: number;
  }>;
}

// Mock data for demonstration
// Empty data structure for error handling
const EMPTY_DASHBOARD_DATA: DashboardData = {
  clubs: {
    total_clubs: "0",
    active_clubs: "0",
    pending_clubs: "0",
    suspended_clubs: "0",
    financially_approved: "0",
    financially_pending: "0"
  },
  members: {
    total_members: "0",
    active_licenses: "0",
    pending_licenses: "0",
    draft_licenses: "0"
  },
  payments: {
    total_payments: "0",
    approved_payments: "0",
    pending_review_payments: "0",
    rejected_payments: "0",
    approved_amount_cents: "0",
    pending_amount_cents: "0"
  },
  clubsByRegion: [],
  recentActivity: [],
  seasonalTrends: []
};

export default function FederationDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [useMockData, setUseMockData] = useState(false);

  // Mock user for dev mode
  const user = {
    displayName: "Admin (Dev)",
    roles: ["federation_admin"]
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch real data from API
        const response = await fetch('http://localhost:3001/orgs/stats');
        
        if (response.ok) {
          const apiData = await response.json();
          setData(apiData);
          setUseMockData(false);
        } else {
          // API not available, use mock data
          console.warn('API not available, using mock data');
          setData(EMPTY_DASHBOARD_DATA);
          setUseMockData(true);
        }
      } catch (err) {
        // Network error, use mock data
        console.error('Error fetching dashboard data:', err);
        setData(EMPTY_DASHBOARD_DATA);
        setUseMockData(true);
        setError('Could not connect to data service');
      } finally {
        setLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement du tableau de bord...</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">Aucune donnée disponible</h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>Les statistiques du tableau de bord n'ont pas pu être chargées.</p>
              {error && <p className="mt-1">Error: {error}</p>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* KPI Cards Section */}
      <section>
        <KpiCards data={data} />
      </section>

      {/* Charts Section */}
      <section>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Analyses et Perspectives</h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <BarChart3 className="h-4 w-4" />
            <span>{useMockData ? 'Données de démonstration' : 'Données en direct'}</span>
          </div>
        </div>
        <ChartsSection data={data} />
      </section>

      {/* Quick Actions Section */}
      <section>
        <QuickActions />
      </section>

      {/* Recent Updates Section */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Mises à jour récentes</h2>
          <button className="text-sm font-medium text-blue-600 hover:text-blue-800">
            Tout voir
          </button>
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-start space-x-3 rounded-lg p-3 hover:bg-gray-50">
            <div className="rounded-full bg-blue-100 p-2">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Nouvelle inscription de club en attente d'approbation
              </p>
              <p className="text-xs text-gray-500">Il y a 2 minutes</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg p-3 hover:bg-gray-50">
            <div className="rounded-full bg-emerald-100 p-2">
              <CreditCard className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Paiement approuvé pour Club Athlétique
              </p>
              <p className="text-xs text-gray-500">Il y a 15 minutes</p>
            </div>
          </div>
          <div className="flex items-start space-x-3 rounded-lg p-3 hover:bg-gray-50">
            <div className="rounded-full bg-amber-100 p-2">
              <Calendar className="h-4 w-4 text-amber-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Nouvelles demandes de licences soumises
              </p>
              <p className="text-xs text-gray-500">Il y a 1 heure</p>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}


