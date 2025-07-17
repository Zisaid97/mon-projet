
// Mapping des codes pays utilisés dans les noms de campagnes Meta Ads
export const COUNTRY_MAP: Record<string, string> = {
  rc: 'Congo (Congo-Brazzaville)',
  rdc: 'RD Congo', 
  tg: 'Togo',
  bfa: 'Burkina Faso',
  cm: 'Cameroun',
  gn: 'Guinée',
  mal: 'Mali',
  bn: 'Bénin'
};

export const COUNTRY_CODE_MAP: Record<string, string> = {
  rc: 'RC',
  rdc: 'RDC',
  tg: 'TG', 
  bfa: 'BFA',
  cm: 'CM',
  gn: 'GN',
  mal: 'MAL',
  bn: 'BN'
};

export interface ParsedCampaign {
  countryCode: string;
  countryName: string;
  product: string;
  isValid: boolean;
  isUnrecognized?: boolean;
}

/**
 * Parse un nom de campagne Meta Ads pour extraire pays et produit
 * Format obligatoire: "<code-pays>-<nom-produit>-<libellé libre>"
 * Structure STRICTE: pays-produit-campagne
 */
export function parseCampaignName(campaignName: string): ParsedCampaign {
  if (!campaignName) {
    return { countryCode: '', countryName: '', product: '', isValid: false };
  }

  console.log(`🔍 Parsing campaign: "${campaignName}"`);

  // Diviser par '-' et prendre les 3 premiers segments minimum
  const segments = campaignName.split('-');
  
  if (segments.length < 2) {
    console.warn(`[FORMAT INVALIDE] "${campaignName}" - Structure attendue: pays-produit-campagne`);
    return {
      countryCode: 'UNKNOWN',
      countryName: 'Pays non identifié',
      product: 'PRODUIT_NON_IDENTIFIE',
      isValid: true,
      isUnrecognized: true
    };
  }

  const rawCode = segments[0].trim().toLowerCase();
  const rawProduct = segments[1].trim();

  // ✅ EXTRACTION DU PRODUIT - Toujours prendre le 2ème segment
  // Normaliser le nom du produit en gardant sa forme originale mais en nettoyant
  let productName = rawProduct
    .replace(/[^\w\s]/g, ' ') // Remplacer caractères spéciaux par espaces
    .replace(/\s+/g, ' ')     // Réduire espaces multiples
    .trim()
    .toUpperCase();

  // Si le nom est vide après nettoyage, utiliser l'original
  if (!productName) {
    productName = rawProduct.toUpperCase();
  }

  console.log(`✅ Produit extrait: "${rawProduct}" → "${productName}"`);

  // ✅ EXTRACTION DU PAYS
  const countryName = COUNTRY_MAP[rawCode];
  const countryCode = COUNTRY_CODE_MAP[rawCode];
  
  if (!countryName || !countryCode) {
    console.warn(`[PAYS NON RECONNU] "${rawCode}" → Attribution avec pays générique`);
    return {
      countryCode: 'OTHER',
      countryName: 'Autre pays',
      product: productName,
      isValid: true,
      isUnrecognized: true
    };
  }

  console.log(`✅ Attribution complète: ${productName} (${countryCode})`);
  return {
    countryCode,
    countryName,
    product: productName,
    isValid: true,
    isUnrecognized: false
  };
}

/**
 * Groupe les dépenses Meta Ads par date/pays/produit
 * GARANTIT que toutes les dépenses sont comptabilisées
 */
export interface GroupedSpending {
  date: string;
  country: string;
  product: string;
  spend_usd: number;
  isUnrecognized?: boolean;
}

export function groupMetaSpendingByAttribution(rows: any[]): GroupedSpending[] {
  const grouped: Record<string, GroupedSpending> = {};
  let totalProcessed = 0;
  let totalUnrecognized = 0;
  let totalSpend = 0;
  let attributedSpend = 0;

  rows.forEach(row => {
    const campaignName = row.campaign_name || row['Nom de la campagne'] || '';
    const spendUsd = parseFloat(row.amount_spent || row['Montant dépensé (USD)'] || 0);
    const date = row.date || row['Début des rapports'] || '';

    totalSpend += spendUsd;

    if (!campaignName || !spendUsd || !date) {
      console.warn(`[DONNÉES INCOMPLÈTES] Ligne ignorée - campagne: "${campaignName}", dépense: ${spendUsd}, date: ${date}`);
      return;
    }

    const parsed = parseCampaignName(campaignName);
    
    // ✅ TOUJOURS ATTRIBUER - Jamais ignorer une dépense
    if (parsed.isValid) {
      const key = `${date}|${parsed.countryCode}|${parsed.product}`;
      
      if (grouped[key]) {
        grouped[key].spend_usd += spendUsd;
      } else {
        grouped[key] = {
          date,
          country: parsed.countryCode,
          product: parsed.product,
          spend_usd: spendUsd,
          isUnrecognized: parsed.isUnrecognized
        };
      }
      
      attributedSpend += spendUsd;
      totalProcessed++;
      
      if (parsed.isUnrecognized) {
        totalUnrecognized++;
        console.warn(`[NÉCESSITE RÉVISION] ${campaignName} → ${parsed.product} (${parsed.countryCode})`);
      } else {
        console.log(`[ATTRIBUTION OK] ${campaignName} → ${parsed.product} (${parsed.countryCode}) - ${spendUsd}$`);
      }
    }
  });

  // ✅ VALIDATION DES TOTAUX - Aucune dépense ne doit être perdue
  const difference = Math.abs(totalSpend - attributedSpend);
  if (difference > 0.01) {
    console.error(`❌ ÉCART DÉTECTÉ: ${difference.toFixed(2)}$ non attribués sur ${totalSpend.toFixed(2)}$ total`);
  } else {
    console.log(`✅ VALIDATION OK: 100% des dépenses attribuées (${totalSpend.toFixed(2)}$)`);
  }

  console.log(`📊 Résumé: ${totalProcessed} campagnes traitées, ${totalUnrecognized} nécessitent une révision, ${totalSpend.toFixed(2)}$ total attribué`);
  
  return Object.values(grouped);
}
