import { useState, useEffect, useCallback } from 'react';
import { useGoogleSheets, GoogleSpreadsheet, SheetInfo } from './useGoogleSheets';
import { toast } from './use-toast';
import { useAuth } from './useAuth';
import { useMarketingData } from './useMarketingData';
import { useUpsertFinancialRow } from './useFinancialTracking';
import { useAddProfitRow } from './useProfitTracking';
import { useSalesLeads } from './useSalesLeads';
import { useAdSpendingData } from './useAdSpendingData';
import { useSalesData } from './useSalesData';

export function useGoogleSheetsImport() {
  const { listSpreadsheets, getSheetInfo, readSheetData, integration, checkIntegration } = useGoogleSheets();
  const { user } = useAuth();
  const { addEntry: addMarketingEntry } = useMarketingData();
  const { mutateAsync: upsertFinancialRow } = useUpsertFinancialRow();
  const { mutateAsync: addProfitRow } = useAddProfitRow();
  const { createLead } = useSalesLeads();
  const { importData: importAdSpendingData } = useAdSpendingData();
  const { importData: importSalesData } = useSalesData();
  
  const [spreadsheets, setSpreadsheets] = useState<GoogleSpreadsheet[]>([]);
  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<string>('');
  const [sheetInfo, setSheetInfo] = useState<SheetInfo | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<string>('');
  const [range, setRange] = useState<string>('A1:Z1000');
  const [module, setModule] = useState<string>('sales');
  const [autoSync, setAutoSync] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [importedData, setImportedData] = useState<any[][] | null>(null);
  const [skipEmptyRows, setSkipEmptyRows] = useState<boolean>(true);

  const loadSpreadsheets = useCallback(async () => {
    if (!integration) {
      console.log('No integration found, skipping spreadsheet loading');
      return;
    }

    try {
      setLoading(true);
      console.log('Loading spreadsheets...');
      const sheets = await listSpreadsheets();
      console.log('Spreadsheets loaded:', sheets);
      setSpreadsheets(sheets);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      console.error('Error loading spreadsheets:', error);
      toast({
        title: "Erreur de chargement des Google Sheets",
        description: `Détail: ${errorMessage}. Votre connexion Google pourrait avoir expiré. Essayez de vous déconnecter et de vous reconnecter.`,
        variant: "destructive",
        duration: 9000
      });
    } finally {
      setLoading(false);
    }
  }, [listSpreadsheets, integration]);

  const loadSheetInfo = useCallback(async () => {
    if (!selectedSpreadsheet || !integration) return;
    try {
      setLoading(true);
      const info = await getSheetInfo(selectedSpreadsheet);
      setSheetInfo(info);
      if (info && info.sheets.length > 0) {
        setSelectedSheet(info.sheets[0].properties.title);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
      toast({
        title: "Erreur lors du chargement des informations de la feuille",
        description: `Détail: ${errorMessage}`,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [getSheetInfo, selectedSpreadsheet, integration]);

  // Vérifier l'intégration quand l'utilisateur se connecte
  useEffect(() => {
    if (user) {
      console.log('User authenticated, checking integration...');
      checkIntegration();
    }
  }, [user, checkIntegration]);

  // Charger les feuilles seulement quand l'intégration est confirmée
  useEffect(() => {
    if (user && integration) {
      console.log('Integration found, loading spreadsheets...');
      loadSpreadsheets();
    }
  }, [user, integration, loadSpreadsheets]);

  useEffect(() => {
    if (user && integration && selectedSpreadsheet) {
      loadSheetInfo();
    }
  }, [user, integration, selectedSpreadsheet, loadSheetInfo]);

  const processImportData = async (values: any[][]) => {
    console.log(`Previewing ${values.length} rows:`, values);
    setImportedData(values);
  };

  const clearPreviewData = () => {
    setImportedData(null);
  };

  // Fonction pour normaliser les colonnes de statut
  const normalizeStatusColumn = (header: string): string => {
    const normalized = header.toLowerCase().trim().replace(/\s+/g, '_');
    
    // Mapping pour les statuts de confirmation
    if (normalized.includes('confirm') && normalized.includes('status')) {
      return 'confirmation_status';
    }
    if (normalized.includes('confirm') && normalized.includes('note')) {
      return 'confirmation_note';
    }
    if (normalized === 'confirmation' || normalized === 'statut_de_confirmation') {
      return 'confirmation_status';
    }
    
    // Mapping pour les statuts de livraison
    if (normalized.includes('deliver') && normalized.includes('status')) {
      return 'delivery_status';
    }
    if (normalized.includes('deliver') && normalized.includes('note')) {
      return 'delivery_note';
    }
    if (normalized === 'livraison' || normalized === 'delivery' || normalized === 'statut_de_livraison') {
      return 'delivery_status';
    }
    if (normalized === 'note_de_livraison' || normalized === 'delivery_note') {
      return 'delivery_note';
    }
    
    return normalized;
  };

  const saveImportedData = async () => {
    if (!importedData || !module || !user) {
      toast({ title: "Erreur", description: "Aucune donnée à sauvegarder ou module non sélectionné.", variant: "destructive" });
      return;
    }

    setIsSaving(true);
    const rawHeaders = importedData[0];
    const headers = rawHeaders.map(h => normalizeStatusColumn(typeof h === 'string' ? h : ''));
    const dataRows = importedData.slice(1);
    let successCount = 0;
    let errorCount = 0;
    let skippedCount = 0;
    let firstErrorMessage = '';

    for (const [index, row] of dataRows.entries()) {
      if (row.every(cell => cell === null || cell === '' || cell === undefined)) {
        if (skipEmptyRows) {
          skippedCount++;
          continue;
        }
      }
      
      try {
        const rowData: { [key: string]: any } = Object.fromEntries(headers.map((key, i) => [key, row[i] || '']));
        
        switch (module) {
          case 'sales':
            const criticalSalesFields = ['date'];
            const missingSalesFields = criticalSalesFields.filter(col => !rowData[col] || rowData[col] === '');
            
            if (missingSalesFields.length > 0) {
              console.warn(`Ligne ${index + 2} ignorée - champs critiques manquants: ${missingSalesFields.join(', ')}`);
              skippedCount++;
              continue;
            }

            // Mapper les données avec préservation des statuts réels
            const salesRow = {
              'ID Externe de la Commande': rowData['id_externe_de_la_commande'] || rowData['external_order_id'] || '',
              'Date': rowData['date'] || new Date().toISOString().split('T')[0],
              'Canal de Vente': rowData['canal_de_vente'] || rowData['sales_channel'] || '',
              'Numéro de Suivi': rowData['numéro_de_suivi'] || rowData['tracking_number'] || '',
              'Client': rowData['client'] || rowData['customer'] || '',
              'Produit(s)': rowData['produit(s)'] || rowData['products'] || '',
              'Prix': parseFloat(rowData['prix'] || rowData['price'] || '0') || 0,
              'Méthode de Paiement': rowData['méthode_de_paiement'] || rowData['payment_method'] || '',
              'Acompte': parseFloat(rowData['acompte'] || rowData['deposit'] || '0') || 0,
              'Expédition Client': rowData['expédition_client'] || rowData['customer_shipping'] || '',
              'Téléphone': rowData['téléphone'] || rowData['phone'] || '',
              'Adresse': rowData['adresse'] || rowData['address'] || '',
              'Ville': rowData['ville'] || rowData['city'] || '',
              'Notes': rowData['notes'] || '',
              // Préserver les statuts réels du fichier source
              'Statut de Confirmation': rowData['confirmation_status'] || rowData['statut_de_confirmation'] || rowData['confirmation'] || '',
              'Note de Confirmation': rowData['confirmation_note'] || rowData['note_de_confirmation'] || '',
              'Livreur': rowData['livreur'] || rowData['delivery_agent'] || '',
              'Statut de Livraison': rowData['delivery_status'] || rowData['statut_de_livraison'] || rowData['livraison'] || rowData['delivery'] || '',
              'Note de Livraison': rowData['delivery_note'] || rowData['note_de_livraison'] || ''
            };

            console.log('Importing sales row with statuses:', {
              confirmation: salesRow['Statut de Confirmation'],
              delivery: salesRow['Statut de Livraison']
            });

            await importSalesData([salesRow]);
            successCount++;
            break;

          case 'ad-spending':
            const adData = {
              'Début des rapports': rowData['début_des_rapports'] || rowData['date'] || new Date().toISOString().split('T')[0],
              'Nom du compte': rowData['nom_du_compte'] || rowData['account_name'] || '',
              'Nom de la campagne': rowData['nom_de_la_campagne'] || rowData['campaign_name'] || '',
              'Couverture': rowData['couverture'] || rowData['reach'] || 0,
              'Impressions': rowData['impressions'] || 0,
              'Répétition': rowData['répétition'] || rowData['frequency'] || 0,
              'Devise': rowData['devise'] || rowData['currency'] || 'USD',
              'CPM (Coût pour 1 000 impressions)': rowData['cpm_(coût_pour_1_000_impressions)'] || rowData['cpm'] || 0,
              'Hold Rate (réel)': rowData['hold_rate_(réel)'] || rowData['hold_rate'] || 0,
              'LP-Rate': rowData['lp-rate'] || rowData['lp_rate'] || 0,
              'Clics sur un lien': rowData['clics_sur_un_lien'] || rowData['link_clicks'] || 0,
              'Hock rate': rowData['hock_rate'] || rowData['hook_rate'] || 0,
              'CPC (coût par clic sur un lien)': rowData['cpc_(coût_par_clic_sur_un_lien)'] || rowData['cpc'] || 0,
              'Montant dépensé (USD)': rowData['montant_dépensé_(usd)'] || rowData['amount_spent'] || 0,
              'Prospects': rowData['prospects'] || rowData['leads'] || 0,
              'Coût par prospect': rowData['coût_par_prospect'] || rowData['cost_per_lead'] || 0,
              'Vues de page de destination': rowData['vues_de_page_de_destination'] || rowData['landing_page_views'] || 0,
              'Coût par vue de page de destination': rowData['coût_par_vue_de_page_de_destination'] || rowData['cost_per_landing_page_view'] || 0,
              'Diffusion de l\'ensemble de publicités': rowData['diffusion_de_l\'ensemble_de_publicités'] || rowData['ad_set_delivery'] || '',
              'Fin des rapports': rowData['fin_des_rapports'] || rowData['report_end'] || ''
            };

            await importAdSpendingData([adData]);
            successCount++;
            break;

          case 'marketing':
            const requiredMarketingCols = ['date', 'spend_usd', 'leads', 'deliveries', 'margin_per_order'];
            const missingMarketingCols = requiredMarketingCols.filter(col => !Object.prototype.hasOwnProperty.call(rowData, col) || rowData[col] === null || rowData[col] === '');
            
            if (missingMarketingCols.length > 0) {
              throw new Error(`Colonnes manquantes ou vides : ${missingMarketingCols.join(', ')}.`);
            }
            
            await addMarketingEntry({
              date: rowData.date,
              spend_usd: parseFloat(rowData.spend_usd),
              leads: parseInt(rowData.leads, 10),
              deliveries: parseInt(rowData.deliveries, 10),
              margin_per_order: parseFloat(rowData.margin_per_order)
            });
            successCount++;
            break;
            
          case 'financial':
            const requiredFinancialCols = ['date', 'exchange_rate', 'amount_received_usd'];
            const missingFinancialCols = requiredFinancialCols.filter(col => !Object.prototype.hasOwnProperty.call(rowData, col) || rowData[col] === null || rowData[col] === '');

            if (missingFinancialCols.length > 0) {
              throw new Error(`Colonnes manquantes ou vides : ${missingFinancialCols.join(', ')}.`);
            }

            await upsertFinancialRow({
              user_id: user.id,
              date: rowData.date,
              exchange_rate: parseFloat(rowData.exchange_rate),
              amount_received_usd: parseFloat(rowData.amount_received_usd),
            });
            successCount++;
            break;

          case 'profits':
            const requiredProfitCols = ['date', 'cpd_category', 'quantity', 'product_name'];
            const missingProfitCols = requiredProfitCols.filter(col => !Object.prototype.hasOwnProperty.call(rowData, col) || rowData[col] === null || rowData[col] === '');
            
            if (missingProfitCols.length > 0) {
              throw new Error(`Colonnes manquantes ou vides : ${missingProfitCols.join(', ')}.`);
            }

            const quantity = parseInt(rowData.quantity, 10);
            const cpd = parseFloat(rowData.cpd_category);
            await addProfitRow({
              user_id: user.id,
              date: rowData.date,
              cpd_category: cpd,
              quantity: quantity,
              product_name: rowData.product_name,
              commission_total: quantity * cpd,
            });
            successCount++;
            break;

          default:
            throw new Error("Module de destination non supporté.");
        }
      } catch (e) {
        if (!firstErrorMessage && e instanceof Error) {
          firstErrorMessage = e.message;
        }
        console.error("Erreur lors de la sauvegarde de la ligne:", row, e);
        errorCount++;
      }
    }

    setIsSaving(false);

    let toastDescription = `${successCount} lignes sauvegardées.`;
    if (skippedCount > 0) {
      toastDescription += ` ${skippedCount} lignes ignorées.`;
    }
    if (errorCount > 0) {
      toastDescription += ` ${errorCount} lignes en erreur.`;
      if (firstErrorMessage) {
        toastDescription += ` Première erreur : ${firstErrorMessage}`;
      }
    }

    toast({
      title: "Import terminé",
      description: toastDescription,
      variant: errorCount > 0 ? "destructive" : "default",
      duration: 9000
    });
    
    if (errorCount === 0) {
      setImportedData(null);
    }
  };

  const handleImport = async () => {
    if (!selectedSpreadsheet || !selectedSheet) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une feuille",
        variant: "destructive"
      });
      return;
    }

    if (!integration) {
      toast({
        title: "Erreur",
        description: "Votre connexion Google a expiré. Veuillez vous reconnecter.",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setImportedData(null);
      const fullRange = `${selectedSheet}!${range}`;
      const data = await readSheetData(selectedSpreadsheet, fullRange);
      
      if (!data.values || data.values.length === 0) {
        toast({
          title: "Aucune données",
          description: "Aucune donnée trouvée dans la plage spécifiée",
        });
        setLoading(false);
        return;
      }

      await processImportData(data.values);
      
      toast({
        title: "Prévisualisation prête",
        description: `${data.values.length -1} lignes de données prêtes à être importées.`
      });

    } catch (error) {
      toast({
        title: "Erreur d'import",
        description: error instanceof Error ? error.message : "Erreur inconnue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    spreadsheets,
    selectedSpreadsheet,
    setSelectedSpreadsheet,
    sheetInfo,
    selectedSheet,
    setSelectedSheet,
    range,
    setRange,
    module,
    setModule,
    autoSync,
    setAutoSync,
    skipEmptyRows,
    setSkipEmptyRows,
    loading: loading || isSaving,
    loadSpreadsheets,
    handleImport,
    importedData,
    saveImportedData,
    clearPreviewData,
  };
}
