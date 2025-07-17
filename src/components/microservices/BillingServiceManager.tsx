import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CreditCard, DollarSign, TrendingUp } from 'lucide-react';

interface Subscription {
  id: string;
  plan_id: string;
  status: string;
  current_period_end: string;
  stripe_customer_id: string;
}

interface BillingOverview {
  totalRevenue: number;
  activeSubscriptions: number;
  churnRate: number;
  monthlyRecurringRevenue: number;
}

export const BillingServiceManager: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [overview, setOverview] = useState<BillingOverview>({
    totalRevenue: 0,
    activeSubscriptions: 0,
    churnRate: 0,
    monthlyRecurringRevenue: 0
  });
  const [selectedPlan, setSelectedPlan] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing-service', {
        body: { action: 'get_overview' }
      });

      if (error) throw error;

      if (data.success) {
        setOverview(data.data.overview);
        setSubscriptions(data.data.subscriptions || []);
      } else {
        // Configuration manquante - utiliser des données par défaut
        if (data.error === 'Stripe not configured') {
          setOverview({
            totalRevenue: 0,
            activeSubscriptions: 0,
            churnRate: 0,
            monthlyRecurringRevenue: 0
          });
          setSubscriptions([]);
          toast({
            title: "Configuration requise",
            description: "Configuration Stripe requise pour les fonctionnalités de facturation",
            variant: "default",
          });
        } else {
          toast({
            title: "Erreur",
            description: `Erreur: ${data.error}`,
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error('Error fetching billing data:', error);
      // Utiliser des données par défaut en cas d'erreur
      setOverview({
        totalRevenue: 0,
        activeSubscriptions: 0,
        churnRate: 0,
        monthlyRecurringRevenue: 0
      });
      setSubscriptions([]);
      toast({
        title: "Service en cours",
        description: "Service de facturation en cours de configuration",
        variant: "default",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSubscription = async () => {
    if (!customerEmail || !selectedPlan) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing-service', {
        body: {
          action: 'create_subscription',
          email: customerEmail,
          plan_id: selectedPlan
        }
      });

      if (error) throw error;

      toast({
        title: "Abonnement créé",
        description: "L'abonnement a été créé avec succès",
      });

      fetchBillingData();
      setCustomerEmail('');
      setSelectedPlan('');
    } catch (error) {
      console.error('Error creating subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'abonnement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancelSubscription = async (subscriptionId: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('billing-service', {
        body: {
          action: 'cancel_subscription',
          subscription_id: subscriptionId
        }
      });

      if (error) throw error;

      toast({
        title: "Abonnement annulé",
        description: "L'abonnement a été annulé",
      });

      fetchBillingData();
    } catch (error) {
      console.error('Error canceling subscription:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'abonnement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenus Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Abonnements Actifs</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeSubscriptions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.monthlyRecurringRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taux de Churn</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.churnRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Create Subscription */}
      <Card>
        <CardHeader>
          <CardTitle>Créer un Abonnement</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Email du client</Label>
              <Input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                placeholder="client@exemple.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="plan">Plan d'abonnement</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic - $9.99/mois</SelectItem>
                  <SelectItem value="pro">Pro - $29.99/mois</SelectItem>
                  <SelectItem value="enterprise">Enterprise - $99.99/mois</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={handleCreateSubscription} disabled={loading}>
            Créer l'abonnement
          </Button>
        </CardContent>
      </Card>

      {/* Subscriptions List */}
      <Card>
        <CardHeader>
          <CardTitle>Abonnements Actifs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">{subscription.plan_id}</p>
                  <p className="text-sm text-muted-foreground">
                    Statut: {subscription.status} | Fin: {new Date(subscription.current_period_end).toLocaleDateString()}
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleCancelSubscription(subscription.id)}
                  disabled={loading}
                >
                  Annuler
                </Button>
              </div>
            ))}
            {subscriptions.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                Aucun abonnement actif
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};