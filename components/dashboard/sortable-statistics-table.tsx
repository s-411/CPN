'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { ArrowUpDown, Plus, Edit, Trash2, AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import Link from 'next/link';
import { type GirlStatistics } from '@/lib/db/overview-queries';
import { useConfirmationDialog } from './confirmation-dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export type SortColumn = keyof GirlStatistics;
export type SortDirection = 'asc' | 'desc';

export interface SortableStatisticsTableProps {
  girls: GirlStatistics[];
  initialSortColumn?: SortColumn;
  initialSortDirection?: SortDirection;
  onEdit?: (girlId: number) => void;
  onDelete?: (girlId: number) => void;
  className?: string;
  showActions?: boolean;
  showAddData?: boolean;
}

interface TableColumn {
  key: SortColumn;
  label: string;
  sortable: boolean;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const TABLE_COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true, align: 'left' },
  { key: 'rating', label: 'Rating', sortable: true, align: 'center' },
  { key: 'totalNuts', label: 'Nuts', sortable: true, align: 'center' },
  { key: 'totalSpent', label: 'Total Spent', sortable: true, align: 'right' },
  { key: 'costPerNut', label: 'Cost Per Nut', sortable: true, align: 'right' },
  { key: 'totalTime', label: 'Total Time', sortable: true, align: 'right' },
  { key: 'timePerNut', label: 'Time Per Nut', sortable: true, align: 'right' },
  { key: 'costPerHour', label: 'Cost Per Hour', sortable: true, align: 'right' },
];

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

function formatTime(minutes: number): string {
  if (minutes === 0) return '0m';
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (hours > 0) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  return `${minutes}m`;
}

function formatTimePerNut(minutes: number): string {
  if (minutes === 0) return '0 mins';
  return `${Math.round(minutes)} mins`;
}

function formatRating(rating: number): string {
  return rating.toFixed(1);
}

const EmptyState: React.FC<{ onAddGirl?: () => void }> = ({ onAddGirl }) => (
  <div className="text-center py-12 text-gray-500">
    <div className="max-w-sm mx-auto">
      <h3 className="text-lg font-medium text-gray-900 mb-2">No girls tracked yet</h3>
      <p className="text-sm text-gray-500 mb-6">
        Start by adding your first girl profile to see your statistics here.
      </p>
      <Button asChild>
        <Link href="/add-girl" onClick={onAddGirl}>
          Add Girl
        </Link>
      </Button>
    </div>
  </div>
);

const LoadingSkeleton: React.FC = () => (
  <div className="space-y-3">
    <div className="h-6 bg-gray-200 rounded mb-4 w-48 animate-pulse" />
    {[...Array(5)].map((_, i) => (
      <div key={i} className="flex space-x-4">
        {[...Array(10)].map((_, j) => (
          <div key={j} className="h-4 bg-gray-200 rounded flex-1 animate-pulse" />
        ))}
      </div>
    ))}
  </div>
);

export const SortableStatisticsTable: React.FC<SortableStatisticsTableProps> = ({
  girls,
  initialSortColumn = 'name',
  initialSortDirection = 'asc',
  onEdit,
  onDelete,
  className = '',
  showActions = true,
  showAddData = true,
}) => {
  const [sortColumn, setSortColumn] = useState<SortColumn>(initialSortColumn);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);
  const [error, setError] = useState<string | null>(null);
  const { showConfirmation, ConfirmationDialogComponent } = useConfirmationDialog();

  const dismissError = useCallback(() => {
    setError(null);
  }, []);

  const sortedGirls = useMemo(() => {
    if (!girls.length) return [];
    
    return [...girls].sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle string sorting
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const comparison = aValue.localeCompare(bValue);
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      // Handle numeric sorting
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        const comparison = aValue - bValue;
        return sortDirection === 'asc' ? comparison : -comparison;
      }

      return 0;
    });
  }, [girls, sortColumn, sortDirection]);

  const handleSort = useCallback((column: SortColumn) => {
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortColumn(column);
    setSortDirection(newDirection);
  }, [sortColumn, sortDirection]);

  const getSortIcon = useCallback((column: SortColumn) => {
    if (sortColumn !== column) {
      return <ArrowUpDown className="h-4 w-4 text-cpn-gray" />;
    }
    return (
      <ArrowUpDown 
        className={`h-4 w-4 text-cpn-yellow transition-transform ${
          sortDirection === 'desc' ? 'rotate-180' : ''
        }`} 
      />
    );
  }, [sortColumn, sortDirection]);

  const handleEdit = useCallback(async (girlId: number) => {
    try {
      setError(null);
      if (onEdit) {
        await onEdit(girlId);
      } else {
        // Default edit behavior
        window.location.href = `/add-girl?edit=${girlId}`;
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to edit girl profile. Please try again.';
      setError(errorMessage);
      console.error('Error editing girl:', error);
    }
  }, [onEdit]);

  const handleDelete = useCallback((girlId: number, girlName: string) => {
    showConfirmation({
      title: `Delete ${girlName}?`,
      message: `Are you sure you want to delete ${girlName}? This action cannot be undone and all associated data will be permanently removed.`,
      variant: 'destructive',
      confirmText: 'Delete',
      cancelText: 'Cancel',
      onConfirm: async () => {
        try {
          setError(null);
          if (onDelete) {
            await onDelete(girlId);
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : `Failed to delete ${girlName}. Please try again.`;
          setError(errorMessage);
          console.error('Error deleting girl:', error);
          throw error; // Re-throw to keep dialog open on error
        }
      },
    });
  }, [showConfirmation, onDelete]);

  const renderCellValue = useCallback((girl: GirlStatistics, column: SortColumn) => {
    switch (column) {
      case 'name':
        return <span className="font-medium text-gray-900">{girl.name}</span>;
      case 'rating':
        return formatRating(girl.rating);
      case 'totalNuts':
        return girl.totalNuts.toLocaleString();
      case 'totalSpent':
        return formatCurrency(girl.totalSpent);
      case 'costPerNut':
        return formatCurrency(girl.costPerNut);
      case 'totalTime':
        return formatTime(girl.totalTime);
      case 'timePerNut':
        return formatTimePerNut(girl.timePerNut);
      case 'costPerHour':
        return formatCurrency(girl.costPerHour);
      default:
        return String(girl[column]);
    }
  }, []);

  if (!girls.length) {
    return (
      <div className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}>
        <div className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Girl Statistics</h2>
          
          {error && (
            <Alert variant="destructive" className="mb-4 relative">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="pr-8">{error}</AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissError}
                className="absolute right-2 top-2 h-6 w-6 p-0"
                aria-label="Dismiss error"
              >
                <X className="h-3 w-3" />
              </Button>
            </Alert>
          )}
          
          <EmptyState />
        </div>
        <ConfirmationDialogComponent />
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow border border-gray-200 ${className}`}>
      <div className="p-4 sm:p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Girl Statistics</h2>
        
        {error && (
          <Alert variant="destructive" className="mb-4 relative">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="pr-8">{error}</AlertDescription>
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissError}
              className="absolute right-2 top-2 h-6 w-6 p-0 hover:bg-red-100"
              aria-label="Dismiss error"
            >
              <X className="h-3 w-3" />
            </Button>
          </Alert>
        )}
        
        <div className="overflow-x-auto min-w-full">
          <Table className="min-w-full" role="table" aria-label="Girl Statistics Table">
            <TableHeader>
              <TableRow className="hover:bg-gray-50/50">
                {TABLE_COLUMNS.map((column) => (
                  <TableHead
                    key={column.key}
                    className={`
                      ${column.sortable ? 'cursor-pointer hover:bg-gray-50 select-none' : ''}
                      ${column.align === 'center' ? 'text-center' : ''}
                      ${column.align === 'right' ? 'text-right' : ''}
                      font-medium text-gray-700
                    `}
                    role={column.sortable ? 'button' : undefined}
                    tabIndex={column.sortable ? 0 : undefined}
                    onClick={column.sortable ? () => handleSort(column.key) : undefined}
                    onKeyDown={column.sortable ? (e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSort(column.key);
                      }
                    } : undefined}
                    aria-sort={
                      sortColumn === column.key
                        ? sortDirection === 'asc' ? 'ascending' : 'descending'
                        : undefined
                    }
                  >
                    <div className="flex items-center space-x-1">
                      <span>{column.label}</span>
                      {column.sortable && getSortIcon(column.key)}
                    </div>
                  </TableHead>
                ))}
                {showAddData && <TableHead className="text-center">Add Data</TableHead>}
                {showActions && <TableHead className="text-center">Actions</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedGirls.map((girl) => (
                <TableRow 
                  key={girl.id} 
                  className="hover:bg-gray-50/50 transition-colors"
                >
                  {TABLE_COLUMNS.map((column) => (
                    <TableCell
                      key={column.key}
                      className={`
                        ${column.align === 'center' ? 'text-center' : ''}
                        ${column.align === 'right' ? 'text-right' : ''}
                        py-3
                      `}
                    >
                      {renderCellValue(girl, column.key)}
                    </TableCell>
                  ))}
                  
                  {showAddData && (
                    <TableCell className="text-center py-3">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="min-h-[44px] min-w-[44px] px-3 flex items-center touch-manipulation"
                        asChild
                      >
                        <Link href={`/data-entry?girl=${girl.id}`}>
                          <span>Add Data</span>
                        </Link>
                      </Button>
                    </TableCell>
                  )}
                  
                  {showActions && (
                    <TableCell className="text-center py-3">
                      <div className="flex items-center justify-center space-x-1">
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="min-h-[44px] min-w-[44px] p-2 touch-manipulation"
                          aria-label={`Edit ${girl.name}`}
                          onClick={() => handleEdit(girl.id)}
                        >
                          Edit
                        </Button>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          className="min-h-[44px] min-w-[44px] p-2 touch-manipulation"
                          aria-label={`Delete ${girl.name}`}
                          onClick={() => handleDelete(girl.id, girl.name)}
                        >
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer with Statistics Summary */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap items-center justify-between text-sm text-gray-500">
            <div>
              Showing {sortedGirls.length} {sortedGirls.length === 1 ? 'girl' : 'girls'}
            </div>
            <div className="flex space-x-4 mt-2 sm:mt-0">
              <span>
                Total Spent: {formatCurrency(
                  sortedGirls.reduce((sum, girl) => sum + girl.totalSpent, 0)
                )}
              </span>
              <span>
                Total Nuts: {sortedGirls.reduce((sum, girl) => sum + girl.totalNuts, 0).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
      <ConfirmationDialogComponent />
    </div>
  );
};

export default SortableStatisticsTable;