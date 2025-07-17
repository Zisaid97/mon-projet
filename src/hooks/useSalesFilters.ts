
import { useState, useMemo } from 'react';
import { SalesData, SalesFilters } from '@/types/sales';

export const useSalesFilters = (data: SalesData[]) => {
  const [filters, setFilters] = useState<SalesFilters>({
    city: 'all',
    confirmationStatus: 'all',
    deliveryStatus: 'all',
    stockStatus: 'all',
    salesChannel: 'all',
    product: 'all',
    agent: 'all',
    dateFrom: new Date().toISOString().split('T')[0],
    dateTo: new Date().toISOString().split('T')[0],
    searchTerm: ''
  });

  const [sortField, setSortField] = useState<keyof SalesData>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Extract unique values for filters, including actual status values
  const uniqueValues = useMemo(() => ({
    cities: [...new Set(data.map(item => item.city).filter(Boolean))],
    confirmationStatuses: [...new Set(data.map(item => item.confirmation_status).filter(Boolean))],
    deliveryStatuses: [...new Set(data.map(item => item.delivery_status).filter(Boolean))],
    salesChannels: [...new Set(data.map(item => item.sales_channel).filter(Boolean))],
    products: [...new Set(data.map(item => item.products).filter(Boolean))],
    agents: [...new Set(data.map(item => item.delivery_agent).filter(Boolean))]
  }), [data]);

  // Apply filters
  const filteredData = useMemo(() => {
    let filtered = data.filter(item => {
      const matchesCity = filters.city === 'all' || item.city === filters.city;
      
      // Improved status filtering - handle exact matches and empty/null values
      const matchesConfirmation = filters.confirmationStatus === 'all' || 
        (filters.confirmationStatus === 'Non renseigné' && (!item.confirmation_status || item.confirmation_status.trim() === '')) ||
        item.confirmation_status === filters.confirmationStatus;
        
      const matchesDelivery = filters.deliveryStatus === 'all' || 
        (filters.deliveryStatus === 'Non renseigné' && (!item.delivery_status || item.delivery_status.trim() === '')) ||
        item.delivery_status === filters.deliveryStatus;
        
      const matchesChannel = filters.salesChannel === 'all' || item.sales_channel === filters.salesChannel;
      const matchesProduct = filters.product === 'all' || item.products.includes(filters.product);
      const matchesAgent = filters.agent === 'all' || item.delivery_agent === filters.agent;
      
      const itemDate = new Date(item.date);
      const fromDate = new Date(filters.dateFrom);
      const toDate = new Date(filters.dateTo);
      const matchesDateRange = itemDate >= fromDate && itemDate <= toDate;

      // Extended search across all columns
      const matchesSearch = filters.searchTerm === '' || 
        (item.external_order_id?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.sales_channel?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.tracking_number?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.customer?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.products?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.payment_method?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.customer_shipping?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.phone?.includes(filters.searchTerm) || false) ||
        (item.address?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.city?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.notes?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.confirmation_status?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.confirmation_note?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.delivery_agent?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.delivery_status?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase()) ||
        (item.delivery_note?.toLowerCase() || '').includes(filters.searchTerm.toLowerCase());

      return matchesCity && matchesConfirmation && matchesDelivery && 
             matchesChannel && matchesProduct && matchesAgent && 
             matchesDateRange && matchesSearch;
    });

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const direction = sortDirection === 'asc' ? 1 : -1;
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return aValue.localeCompare(bValue) * direction;
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }
      return 0;
    });

    return filtered;
  }, [data, filters, sortField, sortDirection]);

  const handleSort = (field: keyof SalesData) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const updateFilter = (key: keyof SalesFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const resetFilters = () => {
    setFilters({
      city: 'all',
      confirmationStatus: 'all',
      deliveryStatus: 'all',
      stockStatus: 'all',
      salesChannel: 'all',
      product: 'all',
      agent: 'all',
      dateFrom: new Date().toISOString().split('T')[0],
      dateTo: new Date().toISOString().split('T')[0],
      searchTerm: ''
    });
  };

  return {
    filters,
    filteredData,
    uniqueValues,
    sortField,
    sortDirection,
    updateFilter,
    handleSort,
    resetFilters
  };
};
