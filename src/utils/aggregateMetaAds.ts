import { parseCampaignName } from './countryMap';

export interface ProductCountrySpend {
  [product: string]: {
    [country: string]: number; // USD amount
  };
}

export interface AggregationResult {
  productMap: ProductCountrySpend;
  totalProductUsd: Record<string, number>;
  totalGlobalUsd: number;
  totalGlobalDh: number;
  exchangeRate: number;
}

export interface CoherenceCheck {
  isCoherent: boolean;
  calculatedTotal: number;
  fetchedTotal: number;
  mismatchPercentage: number;
  errorMessage?: string;
}

/**
 * Agrège les dépenses Meta Ads par produit et pays
 */
export function sumSpendPerProductCountry(
  rows: any[], 
  exchangeRate: number = 10.5
): AggregationResult {
  const productMap: ProductCountrySpend = {};
  const totalProductUsd: Record<string, number> = {};
  let totalGlobalUsd = 0;

  rows.forEach((row, index) => {
    const campaignName = row.campaign_name || row['Nom de la campagne'] || '';
    const spendUsd = parseFloat(row.amount_spent || row['Montant dépensé (USD)'] || 0);

    if (!campaignName || !spendUsd) {
      if (index < 3) console.log(`⚠️ Ligne ${index} ignorée - campagne: "${campaignName}", dépense: ${spendUsd}`);
      return;
    }

    const parsed = parseCampaignName(campaignName);
    if (!parsed.isValid) {
      if (index < 3) console.log(`❌ Campagne "${campaignName}" non reconnue:`, parsed);
      return;
    }

    if (index < 3) console.log(`✅ Campagne "${campaignName}" reconnue:`, parsed);

    const { product, countryCode } = parsed;

    // Initialiser le produit s'il n'existe pas
    if (!productMap[product]) {
      productMap[product] = {};
      totalProductUsd[product] = 0;
    }

    // Initialiser le pays pour ce produit s'il n'existe pas
    if (!productMap[product][countryCode]) {
      productMap[product][countryCode] = 0;
    }

    // Ajouter la dépense
    productMap[product][countryCode] += spendUsd;
    totalProductUsd[product] += spendUsd;
    totalGlobalUsd += spendUsd;
  });

  return {
    productMap,
    totalProductUsd,
    totalGlobalUsd,
    totalGlobalDh: totalGlobalUsd * exchangeRate,
    exchangeRate
  };
}

/**
 * Vérifie la cohérence entre le total calculé et le total attendu
 */
export function checkCoherence(
  calculatedTotal: number,
  fetchedTotal: number,
  tolerancePercent: number = 0.5
): CoherenceCheck {
  const difference = Math.abs(calculatedTotal - fetchedTotal);
  const mismatchPercentage = fetchedTotal > 0 ? (difference / fetchedTotal) * 100 : 0;
  const isCoherent = mismatchPercentage <= tolerancePercent;

  let errorMessage: string | undefined;
  if (!isCoherent) {
    errorMessage = `⚠️ Totaux incohérents : différence de ${mismatchPercentage.toFixed(2)}% (calculé: $${calculatedTotal.toFixed(2)}, attendu: $${fetchedTotal.toFixed(2)})`;
  }

  return {
    isCoherent,
    calculatedTotal,
    fetchedTotal,
    mismatchPercentage,
    errorMessage
  };
}

/**
 * Formate les données agrégées pour l'affichage
 */
export function formatProductCountryData(aggregation: AggregationResult) {
  const { productMap, totalProductUsd, exchangeRate } = aggregation;
  
  return Object.entries(productMap).map(([product, countries]) => ({
    product,
    countries: Object.entries(countries).map(([country, usdAmount]) => ({
      country,
      usdAmount,
      dhAmount: usdAmount * exchangeRate
    })),
    totalUsd: totalProductUsd[product],
    totalDh: totalProductUsd[product] * exchangeRate,
    countryCount: Object.keys(countries).length
  }));
}

/**
 * Prépare les données pour l'upsert en base
 */
export function prepareForDatabase(
  aggregation: AggregationResult,
  month: string, // Format: YYYY-MM-01
  userId: string
) {
  const { productMap, exchangeRate } = aggregation;
  const rows: Array<{
    user_id: string;
    month: string;
    product: string;
    country: string;
    spend_usd: number;
    spend_dh: number;
  }> = [];

  Object.entries(productMap).forEach(([product, countries]) => {
    Object.entries(countries).forEach(([country, usdAmount]) => {
      rows.push({
        user_id: userId,
        month,
        product,
        country,
        spend_usd: usdAmount,
        spend_dh: usdAmount * exchangeRate
      });
    });
  });

  return rows;
}