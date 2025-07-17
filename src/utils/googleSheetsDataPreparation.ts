
export const prepareMarketingData = (marketingData: any[], exchangeRate: number) => {
  if (!marketingData || !exchangeRate) return [];
  
  const headers = [
    'Date', 'Dépenses (USD)', 'Dépenses (MAD)', 'Leads', 'Livraisons',
    'Taux de livraison (%)', 'CPL (MAD)', 'CPD (MAD)', 'Revenus (MAD)', 'Profit Net (MAD)'
  ];
  
  const rows = marketingData.map(item => {
    const spendMAD = item.spend_usd * exchangeRate;
    const deliveryRate = item.leads > 0 ? (item.deliveries / item.leads) * 100 : 0;
    const cpl = item.leads > 0 ? spendMAD / item.leads : 0;
    const cpd = item.deliveries > 0 ? spendMAD / item.deliveries : 0;
    const revenue = item.deliveries * 150; // 150 DH par livraison
    const netProfit = revenue - spendMAD;

    return [
      item.date,
      item.spend_usd,
      spendMAD.toFixed(2),
      item.leads,
      item.deliveries,
      deliveryRate.toFixed(1),
      cpl.toFixed(2),
      cpd.toFixed(2),
      revenue.toFixed(2),
      netProfit.toFixed(2)
    ];
  });

  return [headers, ...rows];
};

export const prepareFinancialData = (financialData: any[]) => {
  if (!financialData) return [];
  
  const headers = [
    'Date', 'Taux de change', 'Montant reçu (USD)', 'Montant reçu (MAD)'
  ];
  
  const rows = financialData.map(item => [
    item.date,
    item.exchange_rate,
    item.amount_received_usd,
    item.amount_received_mad
  ]);

  return [headers, ...rows];
};

export const prepareProfitData = (profitData: any[]) => {
  if (!profitData) return [];
  
  const headers = [
    'Date', 'Catégorie CPD', 'Nom du produit', 'Quantité', 'Commission totale'
  ];
  
  const rows = profitData.map(item => [
    item.date,
    item.cpd_category,
    item.product_name,
    item.quantity,
    item.commission_total
  ]);

  return [headers, ...rows];
};

export const prepareAdSpendingData = (adSpendingData: any[]) => {
  if (!adSpendingData) return [];
  
  const headers = [
    'Date', 'Nom du compte', 'Nom de la campagne', 'Couverture', 'Impressions', 
    'Répétition', 'Devise', 'CPM', 'Hold Rate', 'LP Rate', 'Clics sur un lien',
    'Hook Rate', 'CPC', 'Montant dépensé', 'Prospects', 'Coût par prospect',
    'Vues de page de destination', 'Coût par vue de page de destination',
    'Diffusion de l\'ensemble de publicités', 'Début des rapports', 'Fin des rapports'
  ];
  
  const rows = adSpendingData.map(item => [
    item.date,
    item.account_name,
    item.campaign_name,
    item.reach,
    item.impressions,
    item.frequency,
    item.currency,
    item.cpm,
    item.hold_rate,
    item.lp_rate,
    item.link_clicks,
    item.hook_rate,
    item.cpc,
    item.amount_spent,
    item.leads,
    item.cost_per_lead,
    item.landing_page_views,
    item.cost_per_landing_page_view,
    item.ad_set_delivery,
    item.report_start,
    item.report_end
  ]);

  return [headers, ...rows];
};
