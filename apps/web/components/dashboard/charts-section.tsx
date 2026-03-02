"use client";

import React from "react";
import { motion } from "framer-motion";
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area
} from "recharts";

interface ChartData {
  clubs: {
    total_clubs: string;
    active_clubs: string;
    pending_clubs: string;
    suspended_clubs: string;
    financially_approved: string;
    financially_pending: string;
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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-lg">
        <p className="font-medium text-gray-900">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const ChartsSection: React.FC<{ data: ChartData }> = ({ data }) => {
  // Process data for charts
  const regionData = data.clubsByRegion.map(item => ({
    name: item.region.split('-')[0], // Shorten region names
    total: item.count,
    active: item.active_count
  }));

  const activityData = data.recentActivity.map(item => ({
    date: new Date(item.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
    Clubs: item.new_clubs,
    Members: item.new_members,
    Payments: item.new_payments
  }));

  const seasonData = data.seasonalTrends.map(item => ({
    name: item.season_name,
    Licenses: item.licenses_count,
    Members: item.unique_members
  }));

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Clubs by Region - Bar Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Clubs par Région</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={regionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="total" fill="#3b82f6" name="Total Clubs" radius={[4, 4, 0, 0]} />
              <Bar dataKey="active" fill="#10b981" name="Active Clubs" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Recent Activity - Area Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Activité Récente (30 jours)</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Clubs" 
                stackId="1" 
                stroke="#3b82f6" 
                fill="#3b82f6" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Members" 
                stackId="1" 
                stroke="#10b981" 
                fill="#10b981" 
                fillOpacity={0.6}
              />
              <Area 
                type="monotone" 
                dataKey="Payments" 
                stackId="1" 
                stroke="#f59e0b" 
                fill="#f59e0b" 
                fillOpacity={0.6}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Seasonal Trends - Line Chart */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Tendances Saisonnieres</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={seasonData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="name" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="Licenses" fill="#8b5cf6" name="Licenses" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Members" fill="#06b6d4" name="Unique Members" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Clubs Distribution - Pie Chart */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="rounded-2xl border border-gray-200 bg-white p-6 shadow-lg"
      >
        <h3 className="mb-4 text-lg font-semibold text-gray-900">Distribution des Statuts des Clubs</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Active', value: data.clubsByRegion.reduce((sum, item) => sum + item.active_count, 0) },
                  { name: 'Pending', value: parseInt(data.clubs.pending_clubs) },
                  { name: 'Suspended', value: parseInt(data.clubs.suspended_clubs) }
                ]}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${percent ? (percent * 100).toFixed(0) : '0'}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {['Active', 'Pending', 'Suspended'].map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    </div>
  );
};