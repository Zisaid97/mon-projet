
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useProductRevenue } from '@/hooks/useProductRevenue';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

export function ProductRevenuePieChart() {
  const { data, isLoading, error } = useProductRevenue();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Répartition par produit</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Répartition par produit</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-red-500">
                Erreur lors du chargement des données.
            </CardContent>
        </Card>
    )
  }

  if (!data || data.length === 0) {
      return (
        <Card>
            <CardHeader>
                <CardTitle>Répartition par produit</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-gray-500">
                Pas de données de revenus ce mois-ci.
            </CardContent>
        </Card>
      );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-sm bg-background border rounded-lg shadow-sm">
          <p className="font-bold">{`${payload[0].name}`}</p>
          <p style={{ color: payload[0].payload.fill }}>
            {`Revenu : ${Number(payload[0].value).toFixed(2)} DH`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Répartition par produit</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend iconSize={10} wrapperStyle={{ fontSize: '14px', overflowY: 'auto', maxHeight: '100px' }} />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

