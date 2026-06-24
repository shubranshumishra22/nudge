'use client'

import { ArrowUpDown, ChevronLeft, ChevronRight, Inbox } from 'lucide-react'

export interface Column<T> {
  key: string
  label: string
  sortable?: boolean
  render?: (item: T) => React.ReactNode
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  onSort?: (key: string) => void
  sortKey?: string
  sortOrder?: 'asc' | 'desc'
}

export default function DataTable<T extends { id?: string | number }>({
  columns,
  data,
  loading = false,
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  onSort,
  sortKey,
  sortOrder
}: DataTableProps<T>) {
  return (
    <div className="w-full flex flex-col gap-4">
      <div 
        className="w-full overflow-hidden rounded-xl border-[1.5px]"
        style={{ borderColor: 'var(--sand-border)', backgroundColor: 'var(--surface)' }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr style={{ backgroundColor: 'var(--bg-subtle)' }}>
                {columns.map((col) => (
                  <th 
                    key={col.key} 
                    className="p-3 text-[11px] font-semibold uppercase tracking-wider select-none text-[var(--muted)]"
                  >
                    {col.sortable && onSort ? (
                      <button 
                        onClick={() => onSort(col.key)}
                        className="flex items-center gap-1 hover:text-[var(--ink)] transition-colors"
                      >
                        {col.label}
                        <ArrowUpDown size={12} className="opacity-60" />
                      </button>
                    ) : (
                      col.label
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Skeletons
                Array.from({ length: 5 }).map((_, rIndex) => (
                  <tr key={rIndex} className="border-b" style={{ borderColor: 'var(--sand-border)' }}>
                    {columns.map((col) => (
                      <td key={col.key} className="p-3.5">
                        <div className="h-4 w-3/4 rounded bg-[var(--bg-subtle)] animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.length === 0 ? (
                // Empty state
                <tr>
                  <td colSpan={columns.length} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Inbox size={32} className="text-[var(--muted)]" />
                      <span className="text-sm font-medium text-[var(--muted)]">No results found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                data.map((item, index) => (
                  <tr 
                    key={item.id || index} 
                    className="border-b transition-colors hover:bg-[var(--bg-subtle)]/30"
                    style={{ borderColor: 'var(--sand-border)' }}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="p-3.5 text-sm text-[var(--ink)]">
                        {col.render ? col.render(item) : (item as any)[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-between px-2">
          <span className="text-xs text-[var(--muted)] font-mono">
            Page {currentPage} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
              className="flex items-center justify-center p-2 rounded-lg border border-[var(--sand-border)] text-[var(--ink)] hover:bg-[var(--bg-subtle)] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
              className="flex items-center justify-center p-2 rounded-lg border border-[var(--sand-border)] text-[var(--ink)] hover:bg-[var(--bg-subtle)] disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
