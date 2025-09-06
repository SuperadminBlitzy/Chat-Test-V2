import React, { useState, useMemo, useCallback } from 'react'; // react@18.2.0
import { 
  useReactTable, 
  getCoreRowModel, 
  getPaginationRowModel, 
  getSortedRowModel, 
  getFilteredRowModel, 
  flexRender,
  SortingState,
  ColumnFiltersState,
  VisibilityState,
  RowSelectionState,
  PaginationState,
  ColumnDef,
  Table,
  Row,
  Column,
  FilterFn
} from '@tanstack/react-table'; // @tanstack/react-table@8.10.7
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa'; // react-icons@4.12.0

// Internal component imports
import { Pagination } from './Pagination';
import { Loading } from './Loading';
import { EmptyState } from './EmptyState';
import { StatusBadge } from './StatusBadge';
import { Input } from './Input';
import { Button } from './Button';
import { usePagination } from '../../hooks/usePagination';
import { cn } from '../../lib/utils';

/**
 * Interface defining the structure of a column definition for the DataTable
 * 
 * This interface extends the base ColumnDef from TanStack Table with additional
 * properties specific to the financial services platform requirements.
 */
export interface DataTableColumnDef<TData, TValue = unknown> extends ColumnDef<TData, TValue> {
  /** Unique identifier for the column */
  accessorKey?: keyof TData;
  /** Display header text for the column */
  header: string;
  /** Optional cell renderer function for custom formatting */
  cell?: ({ row, getValue }: { row: Row<TData>; getValue: () => TValue }) => React.ReactNode;
  /** Whether this column can be sorted */
  enableSorting?: boolean;
  /** Whether this column can be hidden */
  enableHiding?: boolean;
  /** Whether this column supports filtering */
  enableColumnFilter?: boolean;
  /** Custom filter function for the column */
  filterFn?: FilterFn<TData>;
  /** Column width (CSS value) */
  size?: number;
  /** Minimum column width */
  minSize?: number;
  /** Maximum column width */
  maxSize?: number;
}

/**
 * Bulk action definition interface for row operations
 */
export interface BulkAction<TData = unknown> {
  /** Unique identifier for the action */
  id: string;
  /** Display label for the action */
  label: string;
  /** Icon name for the action button */
  icon?: string;
  /** Callback function executed when action is triggered */
  onAction: (selectedRows: Row<TData>[]) => void;
  /** Whether the action is destructive (uses danger styling) */
  destructive?: boolean;
  /** Whether the action is currently disabled */
  disabled?: boolean;
}

/**
 * Props interface for the DataTable component
 * 
 * Defines comprehensive configuration options for the reusable data table component
 * supporting the Customer Dashboard, Advisor Workbench, Compliance Control Center,
 * and Risk Management Console requirements.
 */
export interface DataTableProps<TData> {
  /** Array of data to display in the table */
  data: TData[];
  /** Column definitions for table structure and rendering */
  columns: DataTableColumnDef<TData>[];
  /** Whether data is currently loading */
  isLoading?: boolean;
  /** Loading message to display during data fetch */
  loadingMessage?: string;
  /** Whether to show pagination controls */
  enablePagination?: boolean;
  /** Whether to enable bulk row selection */
  enableBulkActions?: boolean;
  /** Array of available bulk actions */
  bulkActions?: BulkAction<TData>[];
  /** Whether to show global filter input */
  enableGlobalFilter?: boolean;
  /** Placeholder text for global filter input */
  globalFilterPlaceholder?: string;
  /** Whether to enable column sorting */
  enableSorting?: boolean;
  /** Whether to show column visibility controls */
  enableColumnVisibility?: boolean;
  /** Initial page size for pagination */
  initialPageSize?: number;
  /** Available page size options */
  pageSizeOptions?: number[];
  /** Custom empty state configuration */
  emptyState?: {
    title?: string;
    message?: string;
    actionText?: string;
    onActionClick?: () => void;
    iconName?: 'analytics' | 'compliance' | 'dashboard' | 'notification' | 'settings' | 'transactions' | 'user';
  };
  /** Custom CSS class name */
  className?: string;
  /** Callback for row selection changes */
  onRowSelectionChange?: (selectedRows: Row<TData>[]) => void;
  /** Callback for sorting changes */
  onSortingChange?: (sorting: SortingState) => void;
  /** Callback for pagination changes */
  onPaginationChange?: (pagination: PaginationState) => void;
  /** Custom row click handler */
  onRowClick?: (row: Row<TData>) => void;
  /** Whether rows are clickable */
  enableRowClick?: boolean;
  /** Test ID for automated testing */
  'data-testid'?: string;
}

/**
 * DataTable Component
 * 
 * A comprehensive, reusable data table component that provides advanced functionality
 * for displaying, sorting, filtering, and paginating data across the unified financial
 * services platform. Built using @tanstack/react-table for performance and flexibility.
 * 
 * This component addresses the following functional requirements:
 * - F-013: Customer Dashboard - Display customer transactions and account data
 * - F-014: Advisor Workbench - Show client portfolios and task queues
 * - F-015: Compliance Control Center - Present regulatory updates and audit trails
 * - F-016: Risk Management Console - Display risk assessments and fraud alerts
 * - Audit Trail Management - Complete audit trails for compliance activities
 * 
 * Key Features:
 * - Generic TypeScript support for type-safe data handling
 * - Advanced sorting with visual indicators
 * - Global filtering with real-time search
 * - Configurable pagination with multiple page size options
 * - Bulk row selection and actions
 * - Custom cell rendering with StatusBadge integration
 * - Loading states with enterprise-grade UX
 * - Empty state handling with actionable guidance
 * - Responsive design for all screen sizes
 * - Accessibility compliance (WCAG 2.1 AA)
 * - Performance optimized with React.useMemo and useCallback
 * 
 * @param props - DataTable component configuration
 * @returns JSX.Element representing the complete data table interface
 */
export function DataTable<TData>({
  data,
  columns,
  isLoading = false,
  loadingMessage = "Loading data...",
  enablePagination = true,
  enableBulkActions = false,
  bulkActions = [],
  enableGlobalFilter = true,
  globalFilterPlaceholder = "Search all columns...",
  enableSorting = true,
  enableColumnVisibility = false,
  initialPageSize = 10,
  pageSizeOptions = [5, 10, 20, 50, 100],
  emptyState,
  className,
  onRowSelectionChange,
  onSortingChange,
  onPaginationChange,
  onRowClick,
  enableRowClick = false,
  'data-testid': testId = 'data-table',
}: DataTableProps<TData>): JSX.Element {
  // State management for table functionality
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [globalFilter, setGlobalFilter] = useState<string>('');
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  // Memoized column definitions with selection column for bulk actions
  const tableColumns = useMemo<DataTableColumnDef<TData>[]>(() => {
    const cols: DataTableColumnDef<TData>[] = [];

    // Add selection column if bulk actions are enabled
    if (enableBulkActions) {
      cols.push({
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={table.getIsAllPageRowsSelected()}
            onChange={(event) => table.toggleAllPageRowsSelected(event.target.checked)}
            aria-label="Select all rows on this page"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            checked={row.getIsSelected()}
            onChange={(event) => row.toggleSelected(event.target.checked)}
            aria-label={`Select row ${row.index + 1}`}
          />
        ),
        enableSorting: false,
        enableHiding: false,
        size: 48,
      });
    }

    return [...cols, ...columns];
  }, [columns, enableBulkActions]);

  // Initialize the table instance with configuration
  const table = useReactTable({
    data,
    columns: tableColumns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
      pagination,
    },
    onSortingChange: (updaterOrValue) => {
      const newSorting = typeof updaterOrValue === 'function' 
        ? updaterOrValue(sorting) 
        : updaterOrValue;
      setSorting(newSorting);
      onSortingChange?.(newSorting);
    },
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: (updaterOrValue) => {
      const newSelection = typeof updaterOrValue === 'function' 
        ? updaterOrValue(rowSelection) 
        : updaterOrValue;
      setRowSelection(newSelection);
      if (onRowSelectionChange) {
        const selectedRows = table.getSelectedRowModel().rows;
        onRowSelectionChange(selectedRows);
      }
    },
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: (updaterOrValue) => {
      const newPagination = typeof updaterOrValue === 'function' 
        ? updaterOrValue(pagination) 
        : updaterOrValue;
      setPagination(newPagination);
      onPaginationChange?.(newPagination);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: enableGlobalFilter ? getFilteredRowModel() : undefined,
    enableRowSelection: enableBulkActions,
    enableMultiRowSelection: enableBulkActions,
    enableSorting,
    enableColumnFilters: enableGlobalFilter,
    globalFilterFn: 'includesString',
  });

  // Memoized selected rows for bulk actions
  const selectedRows = useMemo(() => 
    table.getSelectedRowModel().rows, 
    [table, rowSelection]
  );

  // Handle pagination page changes
  const handlePageChange = useCallback((page: number) => {
    table.setPageIndex(page - 1); // Convert to 0-based index
  }, [table]);

  // Handle row click events
  const handleRowClick = useCallback((row: Row<TData>) => {
    if (enableRowClick && onRowClick) {
      onRowClick(row);
    }
  }, [enableRowClick, onRowClick]);

  // Render sort icon based on column sort state
  const renderSortIcon = useCallback((column: Column<TData, unknown>) => {
    if (!column.getCanSort()) return null;

    const sortDirection = column.getIsSorted();
    
    if (sortDirection === 'asc') {
      return <FaSortUp className="ml-1 h-3 w-3" aria-hidden="true" />;
    }
    
    if (sortDirection === 'desc') {
      return <FaSortDown className="ml-1 h-3 w-3" aria-hidden="true" />;
    }
    
    return <FaSort className="ml-1 h-3 w-3 opacity-50" aria-hidden="true" />;
  }, []);

  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("w-full", className)} data-testid={`${testId}-loading`}>
        <div className="flex flex-col items-center justify-center py-12">
          <Loading size="lg" className="mb-4" />
          <p className="text-gray-600 text-sm">{loadingMessage}</p>
        </div>
      </div>
    );
  }

  // Show empty state when no data and not loading
  if (!data.length && !isLoading) {
    const defaultEmptyState = {
      title: "No data available",
      message: "There are no records to display at this time.",
      iconName: 'dashboard' as const,
    };

    const emptyStateConfig = { ...defaultEmptyState, ...emptyState };

    return (
      <div className={cn("w-full", className)} data-testid={`${testId}-empty`}>
        <EmptyState
          title={emptyStateConfig.title}
          message={emptyStateConfig.message}
          actionText={emptyStateConfig.actionText}
          onActionClick={emptyStateConfig.onActionClick}
          iconName={emptyStateConfig.iconName}
        />
      </div>
    );
  }

  return (
    <div className={cn("w-full space-y-4", className)} data-testid={testId}>
      {/* Table controls - Global filter and bulk actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Global filter input */}
        {enableGlobalFilter && (
          <div className="flex-1 max-w-sm">
            <Input
              type="text"
              placeholder={globalFilterPlaceholder}
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="w-full"
              iconName="search"
              iconPosition="left"
              aria-label="Search table data"
            />
          </div>
        )}

        {/* Bulk actions */}
        {enableBulkActions && selectedRows.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              {selectedRows.length} row{selectedRows.length !== 1 ? 's' : ''} selected
            </span>
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                variant={action.destructive ? 'danger' : 'secondary'}
                size="sm"
                onClick={() => action.onAction(selectedRows)}
                disabled={action.disabled}
                icon={action.icon}
                data-testid={`bulk-action-${action.id}`}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Main table */}
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full divide-y divide-gray-200">
            {/* Table header */}
            <thead className="bg-gray-50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={cn(
                        "px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider",
                        header.column.getCanSort() && "cursor-pointer select-none hover:bg-gray-100"
                      )}
                      style={{
                        width: header.getSize() !== 150 ? header.getSize() : undefined,
                      }}
                      onClick={header.column.getToggleSortingHandler()}
                      role={header.column.getCanSort() ? "button" : undefined}
                      tabIndex={header.column.getCanSort() ? 0 : undefined}
                      aria-sort={
                        header.column.getIsSorted()
                          ? header.column.getIsSorted() === 'asc'
                            ? 'ascending'
                            : 'descending'
                          : 'none'
                      }
                    >
                      <div className="flex items-center">
                        {header.isPlaceholder ? null : (
                          <>
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {enableSorting && renderSortIcon(header.column)}
                          </>
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            {/* Table body */}
            <tbody className="bg-white divide-y divide-gray-200">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className={cn(
                    "hover:bg-gray-50 transition-colors",
                    enableRowClick && "cursor-pointer",
                    row.getIsSelected() && "bg-blue-50"
                  )}
                  onClick={() => handleRowClick(row)}
                  data-testid={`table-row-${row.index}`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                      style={{
                        width: cell.column.getSize() !== 150 ? cell.column.getSize() : undefined,
                      }}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {enablePagination && table.getPageCount() > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </span>
            <select
              value={table.getState().pagination.pageSize}
              onChange={(e) => table.setPageSize(Number(e.target.value))}
              className="ml-2 rounded border border-gray-300 px-2 py-1 text-sm"
              aria-label="Rows per page"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size} rows
                </option>
              ))}
            </select>
          </div>
          
          <Pagination
            currentPage={table.getState().pagination.pageIndex + 1}
            totalCount={table.getFilteredRowModel().rows.length}
            pageSize={table.getState().pagination.pageSize}
            onPageChange={handlePageChange}
            siblingCount={1}
          />
        </div>
      )}
    </div>
  );
}

// Export the component and types
export default DataTable;
export type { DataTableProps, DataTableColumnDef, BulkAction };