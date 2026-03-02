"use client";

import * as React from "react";
import { 
  ChevronLeft, 
  ChevronRight, 
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

interface ResponsiveCardProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T | string;
    title: string;
    render?: (value: any, row: T, index: number) => React.ReactNode;
  }>;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    condition?: (row: T) => boolean;
  }>;
  title?: string;
  onRowClick?: (row: T) => void;
  className?: string;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
}

export function ResponsiveCardView<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  title,
  onRowClick,
  className = "",
  emptyState
}: ResponsiveCardProps<T>) {
  const [currentPage, setCurrentPage] = React.useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(data.length / itemsPerPage);
  
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentData = data.slice(startIndex, endIndex);

  const getNestedValue = (obj: any, key: string | keyof T): any => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((o, k) => o?.[k], obj);
    }
    return obj[key as keyof typeof obj];
  };

  const renderField = (column: typeof columns[0], row: T, index: number) => {
    const value = getNestedValue(row, column.key);
    
    if (column.render) {
      return column.render(value, row, index);
    }
    
    if (value === null || value === undefined) {
      return <span className="text-gray-400">—</span>;
    }
    
    if (typeof value === "boolean") {
      return (
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          value 
            ? "bg-green-100 text-green-800" 
            : "bg-gray-100 text-gray-800"
        }`}>
          {value ? "Oui" : "Non"}
        </span>
      );
    }
    
    if (value instanceof Date) {
      return (
        <span className="text-gray-600">
          {value.toLocaleDateString("fr-FR")}
        </span>
      );
    }
    
    return (
      <span className="text-gray-700">
        {String(value)}
      </span>
    );
  };

  const renderActions = (row: T) => {
    const visibleActions = actions.filter(action => 
      !action.condition || action.condition(row)
    );

    if (visibleActions.length === 0) return null;

    return (
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 mt-3">
        {visibleActions.slice(0, 2).map((action, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              action.variant === "danger"
                ? "bg-red-50 text-red-700 hover:bg-red-100"
                : action.variant === "primary"
                ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
                : action.variant === "secondary"
                ? "bg-blue-50 text-blue-700 hover:bg-blue-100"
                : "bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            {action.icon}
            <span className="truncate">{action.label}</span>
          </button>
        ))}
        
        {visibleActions.length > 2 && (
          <div className="relative group">
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-all">
              <MoreHorizontal className="w-4 h-4" />
            </button>
            <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
              {visibleActions.slice(2).map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick(row);
                  }}
                  className={`w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 ${
                    action.variant === "danger"
                      ? "text-red-600 hover:text-red-700"
                      : action.variant === "primary"
                      ? "text-brand-600 hover:text-brand-700"
                      : "text-gray-700"
                  }`}
                >
                  {action.icon}
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (data.length === 0) {
    return (
      <div className={`bg-white rounded-2xl border border-gray-200 p-8 text-center shadow-theme-sm ${className}`}>
        <div className="flex flex-col items-center">
          {emptyState?.icon || (
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          )}
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {emptyState?.title || "Aucune donnée"}
          </h3>
          <p className="text-gray-500">
            {emptyState?.description || "Il n'y a aucun élément à afficher pour le moment."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header */}
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <p className="text-sm text-gray-500 mt-1">
            {data.length} élément{data.length > 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Cards */}
      <div className="space-y-4">
        {currentData.map((row, index) => (
          <div 
            key={startIndex + index}
            className={`bg-white rounded-xl border border-gray-200 p-5 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
              onRowClick ? "hover:border-brand-200" : ""
            }`}
            onClick={() => onRowClick?.(row)}
          >
            <div className="space-y-3">
              {columns.map((column, colIndex) => (
                <div key={String(column.key)} className="flex items-start">
                  <div className="w-32 flex-shrink-0">
                    <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                      {column.title}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    {renderField(column, row, startIndex + index)}
                  </div>
                </div>
              ))}
              
              {actions.length > 0 && renderActions(row)}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            Précédent
          </button>
          
          <div className="text-sm text-gray-500">
            Page {currentPage} sur {totalPages}
          </div>
          
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Suivant
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

// Hook to detect screen size and switch between table and card views
export function useResponsiveTable() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  return { isMobile };
}