"use client";

import * as React from "react";
import { DataTable, TableActions } from "./data-table";
import { ResponsiveCardView, useResponsiveTable } from "./responsive-table";

interface UnifiedTableProps<T> {
  data: T[];
  columns: Array<{
    key: keyof T | string;
    title: string;
    render?: (value: any, row: T, index: number) => React.ReactNode;
    sortable?: boolean;
    width?: string;
    className?: string;
  }>;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: (row: T) => void;
    variant?: "primary" | "secondary" | "danger" | "ghost";
    condition?: (row: T) => boolean;
  }>;
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

export function UnifiedTable<T extends Record<string, any>>({
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
}: UnifiedTableProps<T>) {
  const { isMobile } = useResponsiveTable();

  if (isMobile) {
    return (
      <ResponsiveCardView
        data={data}
        columns={columns}
        actions={actions}
        title={title}
        onRowClick={onRowClick}
        className={containerClassName}
        emptyState={emptyState}
      />
    );
  }

  return (
    <DataTable
      data={data}
      columns={columns}
      actions={actions}
      title={title}
      subtitle={subtitle}
      searchable={searchable}
      filterable={filterable}
      downloadable={downloadable}
      refreshable={refreshable}
      onRefresh={onRefresh}
      loading={loading}
      emptyState={emptyState}
      className={className}
      containerClassName={containerClassName}
      onRowClick={onRowClick}
      sortable={sortable}
      defaultSort={defaultSort}
    />
  );
}

// Export predefined actions for convenience
export { TableActions };

// Export types for external use
export type { UnifiedTableProps };