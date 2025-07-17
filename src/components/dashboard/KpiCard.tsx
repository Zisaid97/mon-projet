
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface KpiCardProps {
  title: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  isLoading?: boolean;
}

export function KpiCard({ title, value, subValue, icon, isLoading }: KpiCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600 dark:text-slate-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <>
            <Skeleton className="h-8 w-3/4 mb-2" />
            {subValue && <Skeleton className="h-4 w-1/2" />}
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {subValue && <p className="text-xs text-gray-500 dark:text-slate-400">{subValue}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
