
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  TrendingUp, 
  Package, 
  Globe,
  DollarSign,
  Settings,
  Menu,
  X,
  BarChart3,
  Sparkles
} from 'lucide-react';
import { UserMenu } from '../UserMenu';
import { Button } from '@/components/ui/button';
import { NotificationBell } from '../NotificationBell';
import { MoreMenu } from './MoreMenu';

interface NavLink {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

const navLinks: NavLink[] = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Marketing", href: "/marketing", icon: TrendingUp },
  { name: "Profits", href: "/profits", icon: DollarSign },
  { name: "Produits", href: "/products", icon: Package },
  { name: "Domaines", href: "/domain-names", icon: Globe },
  { name: "Paramètres", href: "/settings", icon: Settings }
];

export const Header: React.FC = () => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 py-4 px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Logo et Titre */}
      <Link to="/dashboard" className="flex items-center group">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              TrackProfit
            </span>
            <span className="text-xs text-gray-500 font-medium">Marketing Hub</span>
          </div>
        </div>
      </Link>

      {/* Navigation (Desktop) */}
      <nav className="hidden md:flex items-center space-x-2">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.href;
          return (
            <Link
              key={link.name}
              to={link.href}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl font-medium transition-all duration-200 ${
                isActive 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/80'
              }`}
            >
              <link.icon className={`h-4 w-4 ${isActive ? 'text-white' : ''}`} />
              <span className="text-sm">{link.name}</span>
            </Link>
          );
        })}
        <div className="ml-2">
          <MoreMenu />
        </div>
      </nav>

      {/* Actions (Desktop) */}
      <div className="hidden md:flex items-center space-x-3">
        <div className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <NotificationBell />
        </div>
        <div className="border-l border-gray-200 pl-3">
          <UserMenu />
        </div>
      </div>

      {/* Mobile Menu Button */}
      <div className="md:hidden">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleMobileMenu}
          className="hover:bg-gray-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          <span className="sr-only">Toggle menu</span>
        </Button>
      </div>

      {/* Mobile Menu (Overlay) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-white/95 backdrop-blur-md z-50 md:hidden">
          <div className="flex flex-col h-full">
            {/* Mobile Menu Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <Link to="/dashboard" className="flex items-center group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                      TrackProfit
                    </span>
                    <span className="text-xs text-gray-500 font-medium">Marketing Hub</span>
                  </div>
                </div>
              </Link>
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
                <X className="h-6 w-6" />
                <span className="sr-only">Close menu</span>
              </Button>
            </div>

            {/* Mobile Menu Links */}
            <nav className="flex-1 p-6 space-y-2">
              {navLinks.map((link) => {
                const isActive = location.pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    to={link.href}
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <link.icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-500'}`} />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
              <div className="pt-4">
                <MoreMenu />
              </div>
            </nav>

            {/* Mobile Menu Actions */}
            <div className="p-6 border-t border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <NotificationBell />
                <UserMenu />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
