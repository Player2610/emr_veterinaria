'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  id: string;
  header: string;
  /** Accessor function or key name */
  accessorFn?: (row: T) => ReactNode;
  accessorKey?: keyof T;
  /** Enable client-side sorting */
  sortable?: boolean;
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  /** Key used to uniquely identify each row */
  rowKey: keyof T;
  isLoading?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  /** Search against all string-valued fields */
  onSearchChange?: (query: string) => void;
  searchValue?: string;
  /** Pagination */
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  totalRows?: number;
  pageSize?: number;
  className?: string;
  emptyMessage?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export function DataTable<T>({
  data,
  columns,
  rowKey,
  isLoading,
  searchable,
  searchPlaceholder = 'Buscar…',
  onSearchChange,
  searchValue = '',
  page = 1,
  totalPages = 1,
  onPageChange,
  totalRows,
  pageSize,
  className,
  emptyMessage = 'No hay resultados.',
}: DataTableProps<T>) {
  type SortDir = 'asc' | 'desc' | null;
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);

  const handleSort = (colId: string) => {
    if (sortCol !== colId) {
      setSortCol(colId);
      setSortDir('asc');
    } else if (sortDir === 'asc') {
      setSortDir('desc');
    } else {
      setSortCol(null);
      setSortDir(null);
    }
  };

  // Client-side sort (when no server-side sort provided)
  let displayData = [...data];
  if (sortCol && sortDir) {
    const col = columns.find((c) => c.id === sortCol);
    if (col?.accessorKey) {
      displayData.sort((a, b) => {
        const av = a[col.accessorKey!];
        const bv = b[col.accessorKey!];
        const aStr = String(av ?? '');
        const bStr = String(bv ?? '');
        return sortDir === 'asc'
          ? aStr.localeCompare(bStr)
          : bStr.localeCompare(aStr);
      });
    }
  }

  const SortIcon = ({ colId }: { colId: string }) => {
    if (sortCol !== colId) return <ChevronsUpDown className="ml-1 h-3.5 w-3.5 opacity-50" />;
    if (sortDir === 'asc') return <ChevronUp className="ml-1 h-3.5 w-3.5" />;
    return <ChevronDown className="ml-1 h-3.5 w-3.5" />;
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Search */}
      {searchable && (
        <div className="flex items-center gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="max-w-xs"
          />
          {totalRows !== undefined && pageSize !== undefined && (
            <span className="ml-auto text-xs text-muted-foreground">
              {totalRows} resultado{totalRows !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      )}

      {/* Table */}
      <div className="rounded-lg border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.id}
                  className={cn(col.headerClassName)}
                >
                  {col.sortable ? (
                    <button
                      onClick={() => handleSort(col.id)}
                      className="flex items-center font-medium hover:text-foreground"
                    >
                      {col.header}
                      <SortIcon colId={col.id} />
                    </button>
                  ) : (
                    col.header
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {columns.map((col) => (
                    <TableCell key={col.id}>
                      <div className="h-4 animate-pulse rounded bg-muted" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : displayData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-12 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              displayData.map((row) => (
                <TableRow key={String(row[rowKey])}>
                  {columns.map((col) => (
                    <TableCell key={col.id} className={col.className}>
                      {col.accessorFn
                        ? col.accessorFn(row)
                        : col.accessorKey
                          ? String(row[col.accessorKey] ?? '—')
                          : '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
