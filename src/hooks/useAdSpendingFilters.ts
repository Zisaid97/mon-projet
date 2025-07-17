
import { useState, useMemo } from 'react';
import { AdSpendingData } from '@/hooks/useAdSpendingData';

export const useAdSpendingFilters = (data: AdSpendingData[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [filterAccount, setFilterAccount] = useState('all');
  const [filterCampaign, setFilterCampaign] = useState('all');

  // Memoize the unique values to prevent unnecessary re-renders
  const { uniqueAccounts, uniqueCampaigns } = useMemo(() => {
    const accounts = [...new Set(data.map(row => row.account_name))]
      .filter(account => account && account.trim() !== '')
      .sort();
    
    const campaigns = [...new Set(data.map(row => row.campaign_name))]
      .filter(campaign => campaign && campaign.trim() !== '')
      .sort();
    
    return {
      uniqueAccounts: accounts,
      uniqueCampaigns: campaigns
    };
  }, [data]);

  // Memoize filtered data to prevent unnecessary re-renders
  const filteredData = useMemo(() => {
    return data
      .filter(row => {
        const matchesSearch = searchTerm === '' || 
          row.campaign_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          row.account_name.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesAccount = filterAccount === 'all' || row.account_name === filterAccount;
        const matchesCampaign = filterCampaign === 'all' || row.campaign_name === filterCampaign;
        
        return matchesSearch && matchesAccount && matchesCampaign;
      })
      .sort((a, b) => {
        const aVal = a[sortField as keyof typeof a];
        const bVal = b[sortField as keyof typeof b];
        
        if (sortDirection === 'asc') {
          return aVal > bVal ? 1 : -1;
        } else {
          return aVal < bVal ? 1 : -1;
        }
      });
  }, [data, searchTerm, filterAccount, filterCampaign, sortField, sortDirection]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return {
    searchTerm,
    setSearchTerm,
    sortField,
    sortDirection,
    filterAccount,
    setFilterAccount,
    filterCampaign,
    setFilterCampaign,
    uniqueAccounts,
    uniqueCampaigns,
    filteredData,
    handleSort
  };
};
