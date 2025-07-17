
// Page d'accueil : si connecté → dashboard, sinon → auth

import { useAuth } from "@/hooks/useAuth";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!hydrated) return;
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth");
    }
  }, [user, hydrated, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      <div className="text-center space-y-6">
        {/* Logo animé */}
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl flex items-center justify-center shadow-2xl animate-pulse">
            <span className="text-white text-3xl font-bold">✨</span>
          </div>
        </div>
        
        {/* Titre */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            TrackProfit
          </h1>
          <p className="text-gray-600 text-lg font-medium">Marketing Hub</p>
        </div>
        
        {/* Animation de chargement */}
        <div className="flex items-center justify-center space-x-2 mt-8">
          <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
        </div>
        
        <p className="text-gray-500 text-lg mt-4">Chargement de votre espace...</p>
      </div>
    </div>
  );
};

export default Index;
