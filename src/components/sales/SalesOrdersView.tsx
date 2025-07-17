
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSalesOrders } from "@/hooks/useSalesOrders";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { TrendingUp, Package, MapPin } from "lucide-react";

export function SalesOrdersView() {
  const { data: salesOrders, isLoading } = useSalesOrders();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>💰 CA Livraisons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalCA = salesOrders?.reduce((sum, order) => sum + order.total_amount_mad, 0) || 0;
  const totalQty = salesOrders?.reduce((sum, order) => sum + order.qty, 0) || 0;

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">CA Total Livraisons</p>
                <p className="text-2xl font-bold text-green-600">{totalCA.toFixed(0)} DH</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Livraisons</p>
                <p className="text-2xl font-bold text-blue-600">{totalQty}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm font-medium text-gray-600">Moyenne par commande</p>
                <p className="text-2xl font-bold text-purple-600">
                  {totalQty > 0 ? (totalCA / totalQty).toFixed(0) : 0} DH
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Orders List */}
      <Card>
        <CardHeader>
          <CardTitle>📋 Historique des Livraisons</CardTitle>
        </CardHeader>
        <CardContent>
          {salesOrders?.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Aucune livraison enregistrée</p>
              <p className="text-sm text-gray-500">
                Les livraisons apparaîtront ici automatiquement depuis le module Profits
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {salesOrders?.slice(0, 10).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{order.product_name}</span>
                      <Badge variant="outline">Qty: {order.qty}</Badge>
                      {order.city && <Badge variant="secondary">{order.city}</Badge>}
                    </div>
                    <p className="text-sm text-gray-600">
                      {format(new Date(order.confirmed_at), "dd MMM yyyy", { locale: fr })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{order.total_amount_mad.toFixed(0)} DH</p>
                    <Badge variant="outline" className="text-green-600">
                      {order.status}
                    </Badge>
                  </div>
                </div>
              ))}
              
              {(salesOrders?.length || 0) > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-gray-500">
                    ... et {(salesOrders?.length || 0) - 10} autres livraisons
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
