"use client";

import * as React from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2, 
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from "lucide-react";

interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  sortable?: boolean;
  width?: string;
  className?: string;
}

interface Action<T> {
  label: string;
  icon?: React.ReactNode;
  onClick: (row: T) => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  condition?: (row: T) => boolean;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  title?: string;
  subtitle?: string;
  searchable?: boolean;
  filterable?: boolean;
  downloadable?: boolean;
  refreshable?: boolean;
  onRefresh?: () => void;
  loading?: boolean;
  emptyState?: {
    title: string;
    description: string;
    icon?: React.ReactNode;
  };
  className?: string;
  containerClassName?: string;
  onRowClick?: (row: T) => void;
  sortable?: boolean;
  defaultSort?: {
    key: keyof T | string;
    direction: "asc" | "desc";
  };
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  actions = [],
  title,
  subtitle,
  searchable = false,
  filterable = false,
  downloadable = false,
  refreshable = false,
  onRefresh,
  loading = false,
  emptyState,
  className = "",
  containerClassName = "",
  onRowClick,
  sortable = true,
  defaultSort
}: DataTableProps<T>) {
  // Helper function - moved to top to avoid hoisting issues
  const getNestedValue = (obj: any, key: string | keyof T): any => {
    if (typeof key === "string" && key.includes(".")) {
      return key.split(".").reduce((o, k) => o?.[k], obj);
    }
    return obj[key as keyof typeof obj];
  };

  const [sortConfig, setSortConfig] = React.useState(defaultSort);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [filteredData, setFilteredData] = React.useState<T[]>(data);

  // Handle sorting
  const sortedData = React.useMemo(() => {
    if (!sortConfig) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      const aValue = getNestedValue(a, sortConfig.key);
      const bValue = getNestedValue(b, sortConfig.key);
      
      if (aValue < bValue) {
        return sortConfig.direction === "asc" ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  }, [filteredData, sortConfig]);

  // Handle search/filtering
  React.useEffect(() => {
    if (!searchTerm) {
      setFilteredData(data);
      return;
    }

    const filtered = data.filter(row => {
      return Object.values(row).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
    setFilteredData(filtered);
  }, [data, searchTerm]);

  const handleSort = (key: keyof T | string) => {
    if (!sortable) return;
    
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === "asc" ? "desc" : "asc"
    }));
  };

  const renderCell = (column: Column<T>, row: T, index: number) => {
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
      <div className="flex items-center gap-1">
        {visibleActions.slice(0, 2).map((action, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation();
              action.onClick(row);
            }}
            className={`p-2 rounded-lg transition-all duration-200 ${
              action.variant === "danger"
                ? "text-red-600 hover:bg-red-50 hover:text-red-700"
                : action.variant === "primary"
                ? "text-brand-600 hover:bg-brand-50 hover:text-brand-700"
                : action.variant === "secondary"
                ? "text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                : "text-gray-500 hover:bg-gray-100 hover:text-gray-700"
            }`}
            title={action.label}
          >
            {action.icon || <MoreHorizontal className="w-4 h-4" />}
          </button>
        ))}
        
        {visibleActions.length > 2 && (
          <div className="relative group">
            <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-all">
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

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { bg: string; text: string; label: string }> = {
      active: { bg: "bg-green-100", text: "text-green-800", label: "Actif" },
      pending: { bg: "bg-yellow-100", text: "text-yellow-800", label: "En attente" },
      suspended: { bg: "bg-orange-100", text: "text-orange-800", label: "Suspendu" },
      archived: { bg: "bg-gray-100", text: "text-gray-800", label: "Archivé" },
      approved: { bg: "bg-green-100", text: "text-green-800", label: "Approuvé" },
      rejected: { bg: "bg-red-100", text: "text-red-800", label: "Rejeté" },
      draft: { bg: "bg-gray-100", text: "text-gray-800", label: "Brouillon" },
    };

    const statusInfo = statusMap[status] || { 
      bg: "bg-gray-100", 
      text: "text-gray-800", 
      label: status 
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}>
        {statusInfo.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={`rounded-2xl border border-gray-200 bg-white p-8 shadow-theme-sm ${containerClassName}`}>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
          <span className="ml-3 text-gray-600">Chargement...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-2xl border border-gray-200 bg-white shadow-theme-sm ${containerClassName}`}>
      {/* Header */}
      {(title || subtitle || searchable || filterable || downloadable || refreshable) && (
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              {title && (
                <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              )}
              {subtitle && (
                <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
              )}
              {!subtitle && (
                <p className="text-sm text-gray-500 mt-1">
                  {sortedData.length} élément{sortedData.length > 1 ? 's' : ''}
                </p>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {searchable && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent text-sm w-full sm:w-64"
                  />
                </div>
              )}
              
              {filterable && (
                <button className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all">
                  <Filter className="w-4 h-4" />
                </button>
              )}
              
              {downloadable && (
                <button className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all">
                  <Download className="w-4 h-4" />
                </button>
              )}
              
              {refreshable && onRefresh && (
                <button 
                  onClick={onRefresh}
                  className="p-2 text-gray-500 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-all"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="">
        <table className={`w-full ${className}`}>
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.key)}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable && sortable ? "cursor-pointer hover:text-gray-700" : ""
                  } ${column.className || ""}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-1">
                    {column.title}
                    {column.sortable && sortable && sortConfig?.key === column.key && (
                      <>
                        {sortConfig.direction === "asc" ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </>
                    )}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.length === 0 ? (
              <tr>
                <td 
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)} 
                  className="px-6 py-12 text-center"
                >
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
                </td>
              </tr>
            ) : (
              sortedData.map((row, index) => (
                <tr 
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${
                    onRowClick ? "cursor-pointer" : ""
                  }`}
                  onClick={() => onRowClick?.(row)}
                >
                  {columns.map((column) => (
                    <td 
                      key={String(column.key)} 
                      className="px-6 py-4 whitespace-nowrap text-sm"
                    >
                      {renderCell(column, row, index)}
                    </td>
                  ))}
                  {actions.length > 0 && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {renderActions(row)}
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Predefined action buttons
export const TableActions = {
  view: (onClick: () => void) => ({
    label: "Voir",
    icon: <Eye className="w-4 h-4" />,
    onClick,
    variant: "primary" as const
  }),
  
  edit: (onClick: () => void) => ({
    label: "Modifier",
    icon: <Edit className="w-4 h-4" />,
    onClick,
    variant: "secondary" as const
  }),
  
  delete: (onClick: () => void) => ({
    label: "Supprimer",
    icon: <Trash2 className="w-4 h-4" />,
    onClick,
    variant: "danger" as const
  }),
  
  add: (onClick: () => void) => ({
    label: "Ajouter",
    icon: <Plus className="w-4 h-4" />,
    onClick,
    variant: "primary" as const
  })
};