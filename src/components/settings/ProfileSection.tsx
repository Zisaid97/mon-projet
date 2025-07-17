
import { User, LogOut } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/useAuth";
import { useTranslation } from "@/utils/i18n";

interface ProfileSectionProps {
  language: 'fr' | 'en' | 'ar';
}

export function ProfileSection({ language }: ProfileSectionProps) {
  const { user, logout } = useAuth();
  const { t } = useTranslation(language);

  const handleLogout = () => {
    logout();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="w-5 h-5" />
          {t.settings.profile.title}
        </CardTitle>
        <CardDescription>{t.settings.profile.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">{t.settings.profile.email}</Label>
          <Input
            id="email"
            type="email"
            value={user?.email || ''}
            disabled
            className="bg-gray-50 dark:bg-slate-800"
          />
        </div>

        <Button
          variant="outline"
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
        >
          <LogOut className="w-4 h-4" />
          {t.settings.profile.logout}
        </Button>
      </CardContent>
    </Card>
  );
}
