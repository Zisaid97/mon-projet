
import { useCallback } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ExportData {
  date: string;
  spend_mad: number;
  spend_usd: number;
  leads: number;
  deliveries: number;
  delivery_rate: number;
  cpl: number;
  cpd: number;
  revenue: number;
  net_profit: number;
}

export function useExport() {
  const exportToCSV = useCallback((data: ExportData[], filename: string) => {
    const headers = [
      'Date',
      'Dépenses MAD',
      'Dépenses USD',
      'Leads',
      'Livraisons',
      'Taux de livraison (%)',
      'CPL (MAD)',
      'CPD (MAD)',
      'Chiffre d\'affaires (MAD)',
      'Bénéfice net (MAD)'
    ];

    const csvContent = [
      headers.join(','),
      ...data.map(row => [
        format(new Date(row.date), 'dd/MM/yyyy', { locale: fr }),
        row.spend_mad.toFixed(2),
        row.spend_usd.toFixed(2),
        row.leads,
        row.deliveries,
        row.delivery_rate.toFixed(1),
        row.cpl.toFixed(2),
        row.cpd.toFixed(2),
        row.revenue.toFixed(2),
        row.net_profit.toFixed(2)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${format(new Date(), 'yyyy-MM')}.csv`;
    link.click();
  }, []);

  const exportToPDF = useCallback(async (data: ExportData[], filename: string) => {
    // Pour simplifier, on crée un contenu HTML formaté qui peut être imprimé
    const htmlContent = `
      <html>
        <head>
          <title>Rapport Marketing - ${format(new Date(), 'MMMM yyyy', { locale: fr })}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: right; }
            th { background-color: #f2f2f2; }
            .header { text-align: center; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Rapport Marketing</h1>
            <h2>${format(new Date(), 'MMMM yyyy', { locale: fr })}</h2>
          </div>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Dépenses MAD</th>
                <th>Leads</th>
                <th>Livraisons</th>
                <th>Taux (%)</th>
                <th>CPL</th>
                <th>CPD</th>
                <th>CA</th>
                <th>Bénéfice</th>
              </tr>
            </thead>
            <tbody>
              ${data.map(row => `
                <tr>
                  <td>${format(new Date(row.date), 'dd/MM/yyyy', { locale: fr })}</td>
                  <td>${row.spend_mad.toFixed(2)} DH</td>
                  <td>${row.leads}</td>
                  <td>${row.deliveries}</td>
                  <td>${row.delivery_rate.toFixed(1)}%</td>
                  <td>${row.cpl.toFixed(2)} DH</td>
                  <td>${row.cpd.toFixed(2)} DH</td>
                  <td>${row.revenue.toFixed(2)} DH</td>
                  <td style="color: ${row.net_profit >= 0 ? 'green' : 'red'}">${row.net_profit.toFixed(2)} DH</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
      </html>
    `;

    const newWindow = window.open('', '_blank');
    if (newWindow) {
      newWindow.document.write(htmlContent);
      newWindow.document.close();
      newWindow.print();
    }
  }, []);

  return { exportToCSV, exportToPDF };
}
