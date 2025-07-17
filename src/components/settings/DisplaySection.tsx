
import { Eye } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { UserSettings } from "@/hooks/useUserSettings";
import { useTranslation } from "@/utils/i18n";

interface DisplaySectionProps {
  settings: UserSettings | null;
  onUpdate: (settings: Partial<UserSettings>) => void;
  language: 'fr' | 'en' | 'ar';
}

export function DisplaySection({ settings, onUpdate, language }: DisplaySectionProps) {
  const { t } = useTranslation(language);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          {t.settings.display.title}
        </CardTitle>
        <CardDescription>{t.settings.display.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <Label htmlFor="dual-amounts" className="text-sm font-medium">
            {t.settings.display.dualAmounts}
          </Label>
          <Switch
            id="dual-amounts"
            checked={settings?.show_dual_amounts || false}
            onCheckedChange={(checked) => onUpdate({ show_dual_amounts: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="margin-percentages" className="text-sm font-medium">
            {t.settings.display.marginPercentages}
          </Label>
          <Switch
            id="margin-percentages"
            checked={settings?.show_margin_percentages ?? true}
            onCheckedChange={(checked) => onUpdate({ show_margin_percentages: checked })}
          />
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="round-numbers" className="text-sm font-medium">
            {t.settings.display.roundNumbers}
          </Label>
          <Switch
            id="round-numbers"
            checked={settings?.round_numbers ?? true}
            onCheckedChange={(checked) => onUpdate({ round_numbers: checked })}
          />
        </div>

        <div className="space-y-2">
          <Label className="text-sm font-medium">{t.settings.display.decimalPlaces}</Label>
          <Select
            value={String(settings?.decimal_places || 2)}
            onValueChange={(value) => onUpdate({ decimal_places: Number(value) })}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">0 décimales</SelectItem>
              <SelectItem value="2">2 décimales</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
