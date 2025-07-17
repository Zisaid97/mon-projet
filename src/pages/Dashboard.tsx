import { Header } from "@/components/layout/Header";
import { useAuth } from "@/hooks/useAuth";
import { RefactoredDashboard } from "@/components/dashboard/RefactoredDashboard";
import OrganizationMembers from "@/components/organizations/OrganizationMembers";
import OrganizationActivityLog from "@/components/organizations/OrganizationActivityLog";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { useMonthInitializer } from "@/hooks/useMonthInitializer";

const Dashboard = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  // Initialize month from URL
  useMonthInitializer();

  // Force un rafraîchissement des organisations au chargement pour être sûr que le rôle est à jour
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({ queryKey: ["organizations", user.id] });
    }
  }, [user?.id, queryClient]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <Header />
      <main className="max-w-7xl mx-auto py-8 px-4">
        {/* Hero Section */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <span className="text-white text-xl font-bold">📊</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 via-indigo-900 to-purple-900 bg-clip-text text-transparent">
                Dashboard Centralisé
              </h1>
              <p className="text-gray-600 mt-1 text-lg">
                Toutes vos données marketing centralisées avec analyses avancées
              </p>
            </div>
          </div>
          
          {/* Quick Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Revenus du mois</p>
                  <p className="text-2xl font-bold text-green-600">€12,450</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <span className="text-green-600 text-xl">💰</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Campagnes actives</p>
                  <p className="text-2xl font-bold text-blue-600">24</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <span className="text-blue-600 text-xl">🚀</span>
                </div>
              </div>
            </div>
            
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200/50 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">Taux de conversion</p>
                  <p className="text-2xl font-bold text-purple-600">3.2%</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <span className="text-purple-600 text-xl">📈</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Dashboard refactorisé */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200/50 mb-10">
          <RefactoredDashboard />
        </div>
        
        {/* Section de gestion des membres */}
        <section className="space-y-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200/50">
            <OrganizationMembers />
          </div>
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl p-8 shadow-lg border border-gray-200/50">
            <OrganizationActivityLog />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Dashboard;
