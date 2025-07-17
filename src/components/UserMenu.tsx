
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';
import { Settings, Bell, Archive, LogOut, User, FileSpreadsheet } from 'lucide-react';

export const UserMenu = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const userInitials = user.email ? user.email.substring(0, 2).toUpperCase() : 'US';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <div className="flex items-center justify-start gap-2 p-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col space-y-1 leading-none">
            <p className="font-medium text-sm">{user.email}</p>
            <p className="w-[200px] truncate text-xs text-muted-foreground">
              Compte actif
            </p>
          </div>
        </div>
        <DropdownMenuSeparator />
        
        <DropdownMenuItem asChild>
          <Link to="/settings" className="cursor-pointer">
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/settings?tab=integrations" className="cursor-pointer">
            <FileSpreadsheet className="mr-2 h-4 w-4" />
            <span>Google Sheets</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/alertes" className="cursor-pointer">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/suggestions-ia" className="cursor-pointer">
            <User className="mr-2 h-4 w-4" />
            <span>Suggestions IA</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuItem asChild>
          <Link to="/archives" className="cursor-pointer">
            <Archive className="mr-2 h-4 w-4" />
            <span>Archives</span>
          </Link>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="cursor-pointer text-red-600 focus:text-red-600"
          onClick={logout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
