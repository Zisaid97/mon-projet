
import { useState } from "react";
import { Link } from "react-router-dom";
import { MoreHorizontal, Globe, Brain, BarChart3, Calendar, Archive, Settings, Wallet, ShoppingCart, DollarSign, Zap, Target, MapPin, GitCompare, Bell, PiggyBank } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const dashboardItems = [
    { label: 'Dashboard', href: '/dashboard', icon: BarChart3 },
  ];

  const analysisItems = [
    { label: 'Ventes', href: '/sales', icon: ShoppingCart },
    { label: 'Finances', href: '/finances', icon: PiggyBank },
    { label: 'Dépenses Pub', href: '/ad-spending', icon: Target },
    { label: 'Comparer', href: '/compare', icon: GitCompare },
  ];

  const toolsItems = [
    { label: 'Marketing Auto', href: '/marketing-with-auto-data', icon: Zap },
    { label: 'Pays', href: '/country-dashboard', icon: MapPin },
    { label: 'Insights IA', href: '/ai-insights', icon: Brain },
    { label: 'Calendrier', href: '/campaign-calendar', icon: Calendar },
    { label: 'Alertes', href: '/alertes', icon: Bell },
  ];

  const systemItems = [
    { label: 'Archives', href: '/archives', icon: Archive },
  ];

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800">
          <MoreHorizontal className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-lg"
      >
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Tableau de bord
        </DropdownMenuLabel>
        {dashboardItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Analyse & Rapports
        </DropdownMenuLabel>
        {analysisItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Outils Avancés
        </DropdownMenuLabel>
        {toolsItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuLabel className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Système
        </DropdownMenuLabel>
        {systemItems.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link
              to={item.href}
              className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 cursor-pointer"
              onClick={() => setIsOpen(false)}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
