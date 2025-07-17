
import React from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Zap } from 'lucide-react';

const Subscription = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      <main className="py-12 px-6 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            📊 Plan d'abonnement
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Vous utilisez actuellement la version gratuite de la plateforme
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card className="bg-green-50 border-green-200">
            <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-green-500">
              Plan actuel
            </Badge>
            
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4 text-green-600">
                <Zap className="h-6 w-6" />
              </div>
              <CardTitle className="text-2xl">Gratuit</CardTitle>
              <div className="text-3xl font-bold text-gray-900">
                0€
                <span className="text-lg font-normal text-gray-500">/mois</span>
              </div>
              <p className="text-gray-600">Parfait pour débuter</p>
            </CardHeader>
            
            <CardContent>
              <ul className="space-y-3 mb-6">
                {[
                  'Suivi marketing basique',
                  'Export CSV limité',
                  'Historique 30 jours',
                  'Support communautaire'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-green-600" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>
              
              <div className="w-full bg-green-600 text-white px-4 py-2 rounded text-center">
                Plan actuel
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-600 mb-4">
            Profitez de toutes les fonctionnalités disponibles !
          </p>
        </div>
      </main>
    </div>
  );
};

export default Subscription;
