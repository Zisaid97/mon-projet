
export interface MarketingResults {
  // Métriques principales
  cpl: number; // Cost Per Lead en USD
  cpd: number; // Cost Per Delivery en USD
  deliveryRate: number; // Taux de livraison en %
  grossProfit: number; // Bénéfice brut en USD
  netProfit: number; // Bénéfice net en USD
  
  // Versions MAD
  cplMAD: number;
  cpdMAD: number;
  grossProfitMAD: number;
  netProfitMAD: number;
  
  // Indicateurs de performance
  cplStatus: 'good' | 'bad';
  cpdStatus: 'good' | 'bad';
  deliveryRateStatus: 'good' | 'bad';
  netProfitStatus: 'good' | 'bad';
}

export interface MonthlyResume {
  totalSpend: number;
  totalSpendMAD: number;
  totalLeads: number;
  totalDeliveries: number;
  totalGrossProfit: number;
  totalGrossProfitMAD: number;
  totalNetProfit: number;
  totalNetProfitMAD: number;
  
  // Moyennes
  avgCPL: number;
  avgCPLMAD: number;
  avgCPD: number;
  avgCPDMAD: number;
  avgDeliveryRate: number;
  
  // Statuts des moyennes
  avgCPLStatus: 'good' | 'bad';
  avgCPDStatus: 'good' | 'bad';
  avgDeliveryRateStatus: 'good' | 'bad';
  totalNetProfitStatus: 'good' | 'bad';
}

// Seuils de performance
const PERFORMANCE_THRESHOLDS = {
  CPL_GOOD: 1.5, // CPL < 1.5$ = bon (ajusté)
  CPD_GOOD: 15.0, // CPD < 15$ = bon (ajusté)
  DELIVERY_RATE_GOOD: 8.0 // Taux de livraison > 8% = bon (ajusté)
};

export function calculateResults(
  spendMAD: number | "",
  leads: number | "",
  deliveries: number | "",
  marginPerOrderMAD: number | "",
  exchangeRate: number
): MarketingResults {
  // Conversion des entrées
  const spend = typeof spendMAD === "number" ? spendMAD / exchangeRate : 0;
  const leadsNum = typeof leads === "number" ? leads : 0;
  const deliveriesNum = typeof deliveries === "number" ? deliveries : 0;
  // CORRECTION : La marge est maintenant directement en DH (pas de conversion)
  const marginPerOrderDH = typeof marginPerOrderMAD === "number" ? marginPerOrderMAD : 0;
  
  // Calculs des métriques principales
  const cpl = leadsNum > 0 ? spend / leadsNum : 0;
  const cpd = deliveriesNum > 0 ? spend / deliveriesNum : 0;
  const deliveryRate = leadsNum > 0 ? (deliveriesNum / leadsNum) * 100 : 0;
  
  // CORRECTION : Revenus et profits avec marge en DH
  const totalRevenueDH = deliveriesNum * marginPerOrderDH; // Marge en DH × Livraisons
  const totalRevenueUSD = totalRevenueDH / exchangeRate;
  const grossProfit = totalRevenueUSD; // Revenus bruts en USD
  const netProfit = grossProfit - spend; // Profit net = revenus - dépenses (USD)
  
  // Versions MAD
  const cplMAD = cpl * exchangeRate;
  const cpdMAD = cpd * exchangeRate;
  const grossProfitMAD = totalRevenueDH; // Déjà en DH
  const netProfitMAD = netProfit * exchangeRate;
  
  // Évaluation des performances
  const cplStatus: 'good' | 'bad' = cpl < PERFORMANCE_THRESHOLDS.CPL_GOOD ? 'good' : 'bad';
  const cpdStatus: 'good' | 'bad' = cpd < PERFORMANCE_THRESHOLDS.CPD_GOOD ? 'good' : 'bad';
  const deliveryRateStatus: 'good' | 'bad' = deliveryRate > PERFORMANCE_THRESHOLDS.DELIVERY_RATE_GOOD ? 'good' : 'bad';
  const netProfitStatus: 'good' | 'bad' = netProfit > 0 ? 'good' : 'bad';
  
  return {
    cpl,
    cpd,
    deliveryRate,
    grossProfit,
    netProfit,
    cplMAD,
    cpdMAD,
    grossProfitMAD,
    netProfitMAD,
    cplStatus,
    cpdStatus,
    deliveryRateStatus,
    netProfitStatus
  };
}

export function calculateMonthlyResume(
  monthData: any[],
  exchangeRate: number
): MonthlyResume {
  if (monthData.length === 0) {
    return {
      totalSpend: 0,
      totalSpendMAD: 0,
      totalLeads: 0,
      totalDeliveries: 0,
      totalGrossProfit: 0,
      totalGrossProfitMAD: 0,
      totalNetProfit: 0,
      totalNetProfitMAD: 0,
      avgCPL: 0,
      avgCPLMAD: 0,
      avgCPD: 0,
      avgCPDMAD: 0,
      avgDeliveryRate: 0,
      avgCPLStatus: 'bad',
      avgCPDStatus: 'bad',
      avgDeliveryRateStatus: 'bad',
      totalNetProfitStatus: 'bad'
    };
  }
  
  // Calculs des totaux
  const totalSpend = monthData.reduce((sum, item) => sum + item.spend_usd, 0);
  const totalSpendMAD = totalSpend * exchangeRate;
  const totalLeads = monthData.reduce((sum, item) => sum + item.leads, 0);
  const totalDeliveries = monthData.reduce((sum, item) => sum + item.deliveries, 0);
  
  // CORRECTION : Calcul des bénéfices totaux avec marge directe en DH
  const totalGrossProfitMAD = monthData.reduce((sum, item) => {
    // margin_per_order est maintenant directement en DH
    const marginDH = item.margin_per_order;
    return sum + (item.deliveries * marginDH);
  }, 0);
  const totalGrossProfit = totalGrossProfitMAD / exchangeRate;
  
  // Profit net total = revenus - dépenses
  const totalNetProfitMAD = totalGrossProfitMAD - totalSpendMAD;
  const totalNetProfit = totalNetProfitMAD / exchangeRate;
  
  // Calcul des moyennes
  const avgCPL = totalLeads > 0 ? totalSpend / totalLeads : 0;
  const avgCPLMAD = avgCPL * exchangeRate;
  const avgCPD = totalDeliveries > 0 ? totalSpend / totalDeliveries : 0;
  const avgCPDMAD = avgCPD * exchangeRate;
  const avgDeliveryRate = totalLeads > 0 ? (totalDeliveries / totalLeads) * 100 : 0;
  
  // Évaluation des performances moyennes
  const avgCPLStatus: 'good' | 'bad' = avgCPL < PERFORMANCE_THRESHOLDS.CPL_GOOD ? 'good' : 'bad';
  const avgCPDStatus: 'good' | 'bad' = avgCPD < PERFORMANCE_THRESHOLDS.CPD_GOOD ? 'good' : 'bad';
  const avgDeliveryRateStatus: 'good' | 'bad' = avgDeliveryRate > PERFORMANCE_THRESHOLDS.DELIVERY_RATE_GOOD ? 'good' : 'bad';
  const totalNetProfitStatus: 'good' | 'bad' = totalNetProfit > 0 ? 'good' : 'bad';
  
  return {
    totalSpend,
    totalSpendMAD,
    totalLeads,
    totalDeliveries,
    totalGrossProfit,
    totalGrossProfitMAD,
    totalNetProfit,
    totalNetProfitMAD,
    avgCPL,
    avgCPLMAD,
    avgCPD,
    avgCPDMAD,
    avgDeliveryRate,
    avgCPLStatus,
    avgCPDStatus,
    avgDeliveryRateStatus,
    totalNetProfitStatus
  };
}
