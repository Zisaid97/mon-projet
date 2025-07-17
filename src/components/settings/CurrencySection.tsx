
import { DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSettings } from "@/hooks/useUserSettings";
import { useTranslation } from "@/utils/i18n";

interface CurrencySectionProps {
  settings: UserSettings | null;
  onUpdate: (settings: Partial<UserSettings>) => void;
  language: 'fr' | 'en' | 'ar';
}

export function CurrencySection({ settings, onUpdate, language }: CurrencySectionProps) {
  const { t } = useTranslation(language);

  const currencies = [
    { value: 'MAD', label: 'MAD (Dirham)' },
    { value: 'USD', label: '$ USD' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          {t.settings.currency.title}
        </CardTitle>
        <CardDescription>{t.settings.currency.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={settings?.currency || 'MAD'}
          onValueChange={(value: string) => onUpdate({ currency: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {currencies.map(({ value, label }) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}
