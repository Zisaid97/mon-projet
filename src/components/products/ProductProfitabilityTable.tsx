
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useProductProfitability } from "@/hooks/useProductProfitability";
import { Download, TrendingUp, TrendingDown } from "lucide-react";

interface ProductProfitabilityTableProps {
  startDate?: Date;
  endDate?: Date;
}

export function ProductProfitabilityTable({ startDate, endDate }: ProductProfitabilityTableProps) {
  const { data: products, isLoading } = useProductProfitability(startDate, endDate);

  const handleExportPDF = () => {
    // TODO: Implement PDF export with @react-pdf/renderer
    console.log('Export PDF requested for top products');
  };

  const handleExportCSV = () => {
    if (!products || products.length === 0) return;

    const csvContent = [
      ['Produit', 'Livraisons', 'CA (DH)', 'Dépenses (DH)', 'Profit Net (DH)', 'ROI (%)'],
      ...products.map(p => [
        p.product_name,
        p.total_deliveries.toString(),
        p.total_revenue.toFixed(2),
        p.total_spend.toFixed(2),
        p.profit_net.toFixed(2),
        p.roi_percent.toFixed(2)
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ROI_detaille_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>📈 Top Produits par Rentabilité</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          📈 Top Produits par Rentabilité
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV}>
              <Download className="h-4 w-4 mr-2" />
              CSV ROI détaillé
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF}>
              <Download className="h-4 w-4 mr-2" />
              PDF TOP
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {products?.length === 0 ? (
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">Aucun produit trouvé</p>
            <p className="text-sm text-gray-500">
              Les données de rentabilité apparaîtront ici une fois les livraisons enregistrées
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {products?.map((product, index) => (
              <div key={product.product_name} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="font-medium">{product.product_name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">{product.total_deliveries} livraisons</Badge>
                      <span className="text-sm text-gray-600">
                        CA: {product.total_revenue.toFixed(0)} DH
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 mb-1">
                    {product.profit_net >= 0 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className={`font-bold ${product.profit_net >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {product.profit_net.toFixed(0)} DH
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    ROI: <span className={product.roi_percent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {product.roi_percent.toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
