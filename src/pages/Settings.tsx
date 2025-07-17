import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { Header } from "@/components/layout/Header";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { DisplaySettings } from "@/components/settings/DisplaySettings";
import { CurrencySettings } from "@/components/settings/CurrencySettings";
import { ThemeSettings } from "@/components/settings/ThemeSettings";
import { GoogleSheetsIntegration } from "@/components/google-sheets/GoogleSheetsIntegration";
import { MetaAdsIntegration } from "@/components/meta-ads/MetaAdsIntegration";
import GoogleAuthCallback from "./GoogleAuthCallback";

export default function Settings() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabsContainerRef = useRef<HTMLDivElement>(null);
  const isTabClick = useRef(false);

  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "profile");

  useEffect(() => {
    const tabFromUrl = searchParams.get("tab");
    if (tabFromUrl && tabFromUrl !== activeTab) {
      setActiveTab(tabFromUrl);
    }
    
    if (tabFromUrl && !isTabClick.current) {
        setTimeout(() => {
            tabsContainerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    }
    
    isTabClick.current = false;
  }, [searchParams, activeTab]);

  const handleTabChange = (tab: string) => {
    isTabClick.current = true;
    setActiveTab(tab);
    setSearchParams({ tab }, { replace: true });
  };

  return (
    <div className="bg-gray-50 dark:bg-slate-900 min-h-screen transition-colors">
      <Header />
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">⚙️ Paramètres</h1>
          <p className="text-gray-700 dark:text-gray-300">Gérez vos préférences et intégrations</p>
        </div>

        <div ref={tabsContainerRef}>
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-6 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600">
              <TabsTrigger 
                value="profile"
                className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                Profil
              </TabsTrigger>
              <TabsTrigger 
                value="display"
                className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                Affichage
              </TabsTrigger>
              <TabsTrigger 
                value="currency"
                className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                Devise
              </TabsTrigger>
              <TabsTrigger 
                value="theme"
                className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                Thème
              </TabsTrigger>
              <TabsTrigger 
                value="integrations"
                className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                Google Sheets
              </TabsTrigger>
              <TabsTrigger 
                value="meta-ads"
                className="text-gray-700 dark:text-gray-300 data-[state=active]:bg-gray-100 dark:data-[state=active]:bg-slate-700 data-[state=active]:text-gray-900 dark:data-[state=active]:text-gray-100"
              >
                Meta Ads
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <ProfileSettings />
            </TabsContent>

            <TabsContent value="display">
              <DisplaySettings />
            </TabsContent>

            <TabsContent value="currency">
              <CurrencySettings />
            </TabsContent>

            <TabsContent value="theme">
              <ThemeSettings />
            </TabsContent>

            <TabsContent value="integrations">
              <GoogleSheetsIntegration />
            </TabsContent>

            <TabsContent value="meta-ads">
              <MetaAdsIntegration />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
