
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavLinkProps {
  href: string;
  active: boolean;
  icon: LucideIcon;
  label: string;
}

export function NavLink({ href, active, icon: Icon, label }: NavLinkProps) {
  return (
    <Link
      to={href}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105",
        active
          ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 shadow-sm"
          : "text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-slate-800"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="hidden md:inline">{label}</span>
    </Link>
  );
}
