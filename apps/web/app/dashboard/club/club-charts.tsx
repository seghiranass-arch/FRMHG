"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Users, FileText } from "lucide-react";

const ICON_MAP = {
  users: Users,
  "file-text": FileText,
};

type DataItem = {
  name: string;
  value: number;
  color: string;
};

export function MemberDistributionChart({ 
  data, 
  title,
  iconName
}: { 
  data: DataItem[];
  title: string;
  iconName?: keyof typeof ICON_MAP;
}) {
  const Icon = iconName ? ICON_MAP[iconName] : null;

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-sm">
        <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            {Icon && <Icon className="h-5 w-5 text-gray-400" />}
            {title}
          </h3>
        </div>
        <div className="flex h-[300px] w-full items-center justify-center bg-gray-50 text-gray-400 rounded-b-2xl">
          Pas de données disponibles
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-white shadow-theme-sm">
      <div className="border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          {Icon && <Icon className="h-5 w-5 text-gray-400" />}
          {title}
        </h3>
      </div>
      <div className="p-6">
        <div className="h-[250px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
