
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Calendar, Home, Inbox, Search, Settings, BellRing, Zap, TrendingUp, Bot } from "lucide-react";

const items = [
  { title: "Accueil", url: "/dashboard", icon: Home },
  { title: "Marketing", url: "/marketing", icon: TrendingUp },
  { title: "Marketing Auto", url: "/marketing-with-auto-data", icon: Bot },
  { title: "Campagnes", url: "/campagnes", icon: Calendar },
  { title: "Alertes intelligentes", url: "/alertes", icon: BellRing },
  { title: "Suggestions IA", url: "/suggestions-ia", icon: Zap },
  { title: "Paramètres", url: "/settings", icon: Settings },
];

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
