import React from 'react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { useAdminStats } from '@/hooks/useAdminStats';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, Shield, AlertCircle, DollarSign, TrendingUp, Package, Target } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import { format } from 'date-fns';

const Admin = () => {
  const { user } = useAuth();
  
  const { data: isAdmin, isLoading: checkingAdmin, error: adminError } = useAdminCheck();
  const { data: stats, isLoading: loadingStats, error: statsError } = useAdminStats();

  console.log('Admin page - isAdmin:', isAdmin, 'checkingAdmin:', checkingAdmin, 'adminError:', adminError);
  console.log('Admin page - stats:', stats, 'loadingStats:', loadingStats, 'statsError:', statsError);

  // Afficher le loading pendant la vérification admin
  if (checkingAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <main className="py-12 px-6 max-w-7xl mx-auto">
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <Shield className="h-8 w-8 text-purple-600" />
              <div>
                <Skeleton className="h-8 w-64 mb-2" />
                <Skeleton className="h-4 w-96" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Afficher l'erreur s'il y en a une lors de la vérification admin
  if (adminError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
        <Header />
        <main className="py-12 px-6 max-w-7xl mx-auto">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Erreur de vérification admin</h1>
            <p className="text-gray-600">{adminError.message}</p>
          </div>
        </main>
      </div>
    );
  }

  // Rediriger si l'utilisateur n'est pas admin
  if (isAdmin === false) {
    console.log('Redirecting to dashboard - user is not admin');
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      <Header />
      <main className="py-12 px-6 max-w-7xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              🛡️ Dashboard Admin
            </h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de la plateforme et gestion des utilisateurs
            </p>
          </div>
        </div>

        {statsError ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Erreur de chargement des statistiques
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">{statsError.message}</p>
              <p className="text-sm text-gray-500 mt-2">
                Vérifiez que vous avez les permissions nécessaires et que la base de données est accessible.
              </p>
            </CardContent>
          </Card>
        ) : loadingStats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : (
          <>
            {/* Stats principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs totaux</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats?.totalUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Inscrits sur la plateforme
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Utilisateurs actifs</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats?.totalUsers ? ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1) : 0}% du total
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenus totaux</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats?.totalRevenue || 0} DH</div>
                  <p className="text-xs text-muted-foreground">
                    Commissions générées
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Livraisons</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats?.totalDeliveries || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total livraisons
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Dépenses marketing</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{stats?.totalExpenses || 0}$</div>
                  <p className="text-xs text-muted-foreground">
                    Total investi
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Leads générés</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats?.totalLeads || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Total prospects
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Liste des utilisateurs récents */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Utilisateurs récents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stats?.recentUsers && stats.recentUsers.length > 0 ? (
                      stats.recentUsers.map((user, index) => (
                        <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <Users className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-medium">{user.email}</p>
                              <p className="text-sm text-gray-500">
                                {user.created_at ? format(new Date(user.created_at), 'dd/MM/yyyy') : 'Date inconnue'}
                              </p>
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                              {user.status === 'active' ? 'Actif' : 'Inactif'}
                            </Badge>
                            <span className="text-xs text-gray-500">{user.subscription_tier}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-gray-500 text-center py-4">Aucun utilisateur trouvé</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Résumé des profits récents */}
              <Card>
                <CardHeader>
                  <CardTitle>Profits récents</CardTitle>
                </CardHeader>
                <CardContent>
                  {stats?.profitData && stats.profitData.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Produit</TableHead>
                          <TableHead>Quantité</TableHead>
                          <TableHead>Commission</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {stats.profitData.slice(0, 5).map((profit, index) => (
                          <TableRow key={index}>
                            <TableCell>{format(new Date(profit.date), 'dd/MM')}</TableCell>
                            <TableCell className="truncate max-w-24">{profit.product_name}</TableCell>
                            <TableCell>{profit.quantity}</TableCell>
                            <TableCell className="text-green-600">{profit.commission_total} DH</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-gray-500 text-center py-4">Aucun profit enregistré</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default Admin;
