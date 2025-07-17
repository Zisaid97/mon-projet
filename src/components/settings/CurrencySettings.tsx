
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { DollarSign } from 'lucide-react';

export function CurrencySettings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Devise
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="primary-currency">Devise principale</Label>
          <Select defaultValue="mad">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mad">MAD (Dirham marocain)</SelectItem>
              <SelectItem value="usd">USD (Dollar américain)</SelectItem>
              <SelectItem value="eur">EUR (Euro)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="decimal-places">Nombre de décimales</Label>
          <Select defaultValue="2">
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0</SelectItem>
              <SelectItem value="1">1</SelectItem>
              <SelectItem value="2">2</SelectItem>
              <SelectItem value="3">3</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
