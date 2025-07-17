
import { Moon, Sun, Monitor } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTheme } from "@/hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    console.log('ThemeToggle: Changing theme to', newTheme);
    setTheme(newTheme);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className="bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-600 hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200"
        >
          <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Basculer le thème</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        className="bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-600 z-50"
      >
        <DropdownMenuItem 
          onClick={() => handleThemeChange("light")}
          className="hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-slate-700"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>Clair</span>
          {theme === 'light' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("dark")}
          className="hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-slate-700"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>Sombre</span>
          {theme === 'dark' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => handleThemeChange("system")}
          className="hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-200 focus:bg-gray-100 dark:focus:bg-slate-700"
        >
          <Monitor className="mr-2 h-4 w-4" />
          <span>Système</span>
          {theme === 'system' && <span className="ml-auto">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
