
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/hooks/useTheme';
import { Palette, Sun, Moon, Monitor } from 'lucide-react';

export function ThemeSettings() {
  const { theme, setTheme } = useTheme();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Thème
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <Button
            variant={theme === 'light' ? 'default' : 'outline'}
            onClick={() => setTheme('light')}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Sun className="h-6 w-6" />
            Clair
          </Button>
          <Button
            variant={theme === 'dark' ? 'default' : 'outline'}
            onClick={() => setTheme('dark')}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Moon className="h-6 w-6" />
            Sombre
          </Button>
          <Button
            variant={theme === 'system' ? 'default' : 'outline'}
            onClick={() => setTheme('system')}
            className="flex flex-col items-center gap-2 h-auto py-4"
          >
            <Monitor className="h-6 w-6" />
            Système
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
