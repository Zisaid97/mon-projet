
import { Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserSettings } from "@/hooks/useUserSettings";
import { useTranslation } from "@/utils/i18n";

interface LanguageSectionProps {
  settings: UserSettings | null;
  onUpdate: (settings: Partial<UserSettings>) => void;
  language: 'fr' | 'en' | 'ar';
}

export function LanguageSection({ settings, onUpdate, language }: LanguageSectionProps) {
  const { t } = useTranslation(language);

  const languages = [
    { value: 'fr', label: 'Français 🇫🇷' },
    { value: 'en', label: 'English 🇬🇧' },
    { value: 'ar', label: 'العربية 🇲🇦' },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-5 h-5" />
          {t.settings.language.title}
        </CardTitle>
        <CardDescription>{t.settings.language.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={settings?.language || 'fr'}
          onValueChange={(value: string) => onUpdate({ language: value })}
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map(({ value, label }) => (
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
