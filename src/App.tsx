import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { SecurityWrapper } from "@/components/security/SecurityWrapper";
import { RequireAuth } from "./components/RequireAuth";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import MicroservicesPage from "./pages/MicroservicesPage";
import Marketing from "./pages/Marketing";
import MarketingWithAutoData from "./pages/MarketingWithAutoData";
import Products from "./pages/Products";
import DomainNames from "./pages/DomainNames";
import Profits from "./pages/Profits";
import Sales from "./pages/Sales";
import Finances from "./pages/Finances";
import Settings from "./pages/Settings";
import Archives from "./pages/Archives";
import AdSpending from "./pages/AdSpending";
import CountryDashboard from "./pages/CountryDashboard";
import AIInsights from "./pages/AIInsights";
import Compare from "./pages/Compare";
import CampaignCalendar from "./pages/CampaignCalendar";
import Alertes from "./pages/Alertes";
import NotFound from "./pages/NotFound";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import MetaAdsIntegration from "./pages/MetaAdsIntegration";
import MetaAdsCallback from "./pages/meta-ads/Callback";
import SuggestionsIA from "./pages/SuggestionsIA";
import Insights from "./pages/Insights";
import Admin from "./pages/Admin";
import SecuritySettings from "./pages/SecuritySettings";
import Subscription from "./pages/Subscription";
import GoogleSheets from "./pages/GoogleSheets";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <SecurityWrapper>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/google-auth-callback" element={<GoogleAuthCallback />} />
              <Route path="/auth/callback/google" element={<GoogleAuthCallback />} />
              <Route path="/auth/callback/meta" element={<MetaAdsCallback />} />
              <Route path="/meta-ads/callback" element={<MetaAdsCallback />} />
              <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
              <Route path="/microservices" element={<RequireAuth><MicroservicesPage /></RequireAuth>} />
              <Route path="/marketing" element={<RequireAuth><Marketing /></RequireAuth>} />
              <Route path="/marketing-with-auto-data" element={<RequireAuth><MarketingWithAutoData /></RequireAuth>} />
              <Route path="/products" element={<RequireAuth><Products /></RequireAuth>} />
              <Route path="/domain-names" element={<RequireAuth><DomainNames /></RequireAuth>} />
              <Route path="/profits" element={<RequireAuth><Profits /></RequireAuth>} />
              <Route path="/sales" element={<RequireAuth><Sales /></RequireAuth>} />
              <Route path="/finances" element={<RequireAuth><Finances /></RequireAuth>} />
              <Route path="/ad-spending" element={<RequireAuth><AdSpending /></RequireAuth>} />
              <Route path="/country-dashboard" element={<RequireAuth><CountryDashboard /></RequireAuth>} />
              <Route path="/ai-insights" element={<RequireAuth><AIInsights /></RequireAuth>} />
              <Route path="/compare" element={<RequireAuth><Compare /></RequireAuth>} />
              <Route path="/campaign-calendar" element={<RequireAuth><CampaignCalendar /></RequireAuth>} />
              <Route path="/alertes" element={<RequireAuth><Alertes /></RequireAuth>} />
              <Route path="/settings" element={<RequireAuth><Settings /></RequireAuth>} />
              <Route path="/archives" element={<RequireAuth><Archives /></RequireAuth>} />
              <Route path="/meta-ads" element={<RequireAuth><MetaAdsIntegration /></RequireAuth>} />
              <Route path="/suggestions-ia" element={<RequireAuth><SuggestionsIA /></RequireAuth>} />
              <Route path="/insights" element={<RequireAuth><Insights /></RequireAuth>} />
              <Route path="/admin" element={<RequireAuth><Admin /></RequireAuth>} />
              <Route path="/security" element={<RequireAuth><SecuritySettings /></RequireAuth>} />
              <Route path="/subscription" element={<RequireAuth><Subscription /></RequireAuth>} />
              <Route path="/google-sheets" element={<RequireAuth><GoogleSheets /></RequireAuth>} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </BrowserRouter>
        </SecurityWrapper>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
