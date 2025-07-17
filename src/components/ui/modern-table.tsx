import React from 'react';
import { ChevronUp, ChevronDown, Search, Filter, MoreHorizontal } from 'lucide-react';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (value: any, row: any) => React.ReactNode;
}

interface ModernTableProps {
  columns: Column[];
  data: any[];
  loading?: boolean;
  searchable?: boolean;
  filterable?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
  };
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  onRowClick?: (row: any) => void;
  emptyMessage?: string;
  className?: string;
}

export const ModernTable: React.FC<ModernTableProps> = ({
  columns,
  data,
  loading = false,
  searchable = false,
  filterable = false,
  pagination,
  onSort,
  onRowClick,
  emptyMessage = "Aucune donnée disponible",
  className = ""
}) => {
  const [sortKey, setSortKey] = React.useState<string>('');
  const [sortDirection, setSortDirection] = React.useState<'asc' | 'desc'>('asc');
  const [searchTerm, setSearchTerm] = React.useState('');

  const handleSort = (key: string) => {
    if (!onSort) return;
    
    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort(key, newDirection);
  };

  const getSortIcon = (key: string) => {
    if (sortKey !== key) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="h-4 w-4 text-indigo-600" /> : 
      <ChevronDown className="h-4 w-4 text-indigo-600" />;
  };

  const getAlignmentClass = (align?: string) => {
    switch (align) {
      case 'center':
        return 'text-center';
      case 'right':
        return 'text-right';
      default:
        return 'text-left';
    }
  };

  const LoadingSkeleton = () => (
    <div className="animate-pulse">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="border-b border-gray-200">
          <div className="px-6 py-4 flex space-x-4">
            {columns.map((_, j) => (
              <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-200/50 overflow-hidden ${className}`}>
      {/* Header avec recherche et filtres */}
      {(searchable || filterable) && (
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            {searchable && (
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
            )}
            {filterable && (
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
                <Filter className="h-4 w-4" />
                <span>Filtres</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50/80">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider ${getAlignmentClass(column.align)} ${column.sortable ? 'cursor-pointer hover:bg-gray-100 transition-colors' : ''}`}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center space-x-1">
                    <span>{column.label}</span>
                    {column.sortable && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              <th className="px-6 py-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={columns.length + 1}>
                  <LoadingSkeleton />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length + 1} className="px-6 py-12 text-center text-gray-500">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={index}
                  className={`hover:bg-gray-50 transition-colors ${onRowClick ? 'cursor-pointer' : ''}`}
                  onClick={() => onRowClick && onRowClick(row)}
                >
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-6 py-4 text-sm text-gray-900 ${getAlignmentClass(column.align)}`}
                    >
                      {column.render ? column.render(row[column.key], row) : row[column.key]}
                    </td>
                  ))}
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Page {pagination.currentPage} sur {pagination.totalPages}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Précédent
              </button>
              {[...Array(Math.min(5, pagination.totalPages))].map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    onClick={() => pagination.onPageChange(page)}
                    className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                      page === pagination.currentPage
                        ? 'bg-indigo-600 text-white'
                        : 'border border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              <button
                onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Suivant
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Composant pour les badges de statut
export const StatusBadge: React.FC<{
  status: 'active' | 'inactive' | 'pending' | 'success' | 'error' | 'warning';
  children: React.ReactNode;
}> = ({ status, children }) => {
  const getStatusClasses = () => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'success':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusClasses()}`}>
      {children}
    </span>
  );
};
