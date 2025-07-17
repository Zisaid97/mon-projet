
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { useFilteredStats } from "@/hooks/useFilteredStats";
import { useFiltersStore } from "@/stores/filtersStore";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface StatsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function StatsModal({ open, onOpenChange }: StatsModalProps) {
  const { filters } = useFiltersStore();
  const { data: stats, isLoading } = useFilteredStats(filters);

  const chartConfig = {
    revenue: {
      label: "Revenus",
      color: "hsl(var(--chart-1))",
    },
    quantity: {
      label: "Quantité",
      color: "hsl(var(--chart-2))",
    },
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analyse des données</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>📊 Analyse des données</DialogTitle>
        </DialogHeader>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Livraisons & CA par produit */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Livraisons & CA par produit</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.deliveries || []}>
                    <XAxis dataKey="product" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="qty" fill="var(--color-quantity)" name="Quantité" />
                    <Bar dataKey="revenue_mad" fill="var(--color-revenue)" name="CA (MAD)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Répartition CA par ville */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Répartition CA par ville</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats?.revenueByCity || []}
                      dataKey="amount_mad"
                      nameKey="city"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ city, percent }) => `${city} (${(percent * 100).toFixed(0)}%)`}
                    >
                      {(stats?.revenueByCity || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent />} />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Livraisons par jour */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="text-base">Évolution des livraisons</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats?.deliveriesDaily || []}>
                    <XAxis dataKey="day" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="qty" fill="var(--color-quantity)" name="Livraisons" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}
