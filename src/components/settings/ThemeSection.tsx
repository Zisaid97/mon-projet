
import { Sun, Moon, Monitor } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserSettings } from "@/hooks/useUserSettings";
import { useTranslation } from "@/utils/i18n";

interface ThemeSectionProps {
  settings: UserSettings | null;
  onUpdate: (settings: Partial<UserSettings>) => void;
  language: 'fr' | 'en' | 'ar';
}

export function ThemeSection({ settings, onUpdate, language }: ThemeSectionProps) {
  const { t } = useTranslation(language);

  const themes = [
    { value: 'light', label: t.settings.theme.light, icon: Sun },
    { value: 'dark', label: t.settings.theme.dark, icon: Moon },
    { value: 'system', label: t.settings.theme.system, icon: Monitor },
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sun className="w-5 h-5" />
          {t.settings.theme.title}
        </CardTitle>
        <CardDescription>{t.settings.theme.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {themes.map(({ value, label, icon: Icon }) => (
            <Button
              key={value}
              variant={settings?.theme === value ? "default" : "outline"}
              onClick={() => onUpdate({ theme: value })}
              className="flex items-center gap-2"
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
