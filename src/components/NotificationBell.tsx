
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

export function NotificationBell() {
  const { notifications, isLoading } = useNotifications();
  // Compte les notifications non lues
  const unreadCount = notifications.filter((n) => n.status === "unread").length;

  return (
    <button
      type="button"
      className="relative rounded-full p-2 bg-purple-50 dark:bg-slate-700 hover:bg-purple-100 dark:hover:bg-slate-600 transition-colors"
      title="Notifications"
      // TODO: OnClick: ouvrir popover ou panneau latéral notifications
    >
      <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
      {unreadCount > 0 && (
        <span className={cn(
          "absolute -top-1 -right-1 flex items-center justify-center px-1.5 text-xs font-bold rounded-full bg-red-600 text-white",
          unreadCount > 9 && "text-[10px]"
        )}>
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
      <span className="sr-only">Ouvrir les notifications</span>
    </button>
  );
}
