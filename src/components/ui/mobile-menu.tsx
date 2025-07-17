
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface MobileMenuProps {
  navLinks: Array<{
    to: string;
    label: string;
    show: boolean;
  }>;
}

export function MobileMenu({ navLinks }: MobileMenuProps) {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Navigation</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          {navLinks
            .filter(link => link.show)
            .map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={`block px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  isActive(link.to)
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
