
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useNetProfitEvolution } from '@/hooks/useNetProfitEvolution';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function NetProfitChart() {
  const { data, isLoading, error } = useNetProfitEvolution();

  if (isLoading) {
    return (
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Évolution du profit net</CardTitle>
        </CardHeader>
        <CardContent className="h-64">
          <Skeleton className="w-full h-full" />
        </CardContent>
      </Card>
    );
  }
  
  if (error) {
    return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Évolution du profit net</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-red-500">
                Erreur lors du chargement des données.
            </CardContent>
        </Card>
    )
  }

  if (!data || data.length === 0) {
      return (
        <Card className="lg:col-span-2">
            <CardHeader>
                <CardTitle>Évolution du profit net</CardTitle>
            </CardHeader>
            <CardContent className="h-64 flex items-center justify-center text-gray-500">
                Pas de données pour ce mois.
            </CardContent>
        </Card>
      );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-2 text-sm bg-background border rounded-lg shadow-sm">
          <p className="font-bold">{`Date : ${label}`}</p>
          <p style={{ color: payload[0].color }}>
            {`${payload[0].name} : ${Number(payload[0].value).toFixed(2)} DH`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle>Évolution du profit net</CardTitle>
      </CardHeader>
      <CardContent className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value} DH`} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '14px' }} />
            <Bar dataKey="Profit Net (DH)" fill="#22c55e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
