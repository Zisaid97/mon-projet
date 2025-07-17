
# Dashboard Refactorisé - Documentation

## Vue d'ensemble

Le Dashboard a été complètement refactorisé pour centraliser toutes les sources de données et offrir des filtres dynamiques avec des analyses graphiques avancées.

## Architecture

### 1. Vue matérialisée `monthly_kpis`

Centralise toutes les données de performance mensuelle :
- **Sources** : `marketing_performance`, `profit_tracking`, `monthly_bonus`
- **Rafraîchissement** : Quotidien à 2h du matin (cron job)
- **Index** : `(user_id, period)` pour des performances optimales

### 2. Fonctions RPC

#### `get_monthly_kpis(target_month text)`
- Récupère les KPIs consolidés pour un mois donné
- Sécurisé par RLS (auth.uid())
- Retourne : revenus, dépenses, leads, livraisons, bonus, ROI, etc.

#### `filtered_stats(filters jsonb)`
- Analyse des données avec filtres dynamiques
- Filtres supportés : dates, produits, villes, canaux
- Retourne : données par produit, par ville, évolution temporelle

### 3. Store Zustand `filtersStore`

Gestion globale des filtres avec persistance localStorage :
```typescript
interface Filters {
  start: Date | null;
  end: Date | null;
  productIds: string[];
  cities: string[];
  channels: string[];
}
```

### 4. Composants

- **RefactoredDashboard** : Dashboard principal avec KPIs centralisés
- **DashboardFilters** : Interface de filtrage dynamique
- **StatsModal** : Analyses graphiques avec Chart.js
- **KpiCard** : Cartes KPI réutilisables

## Utilisation

### Hook principal
```typescript
const { data: kpis, isLoading } = useMonthlyKPIs('2024-01-01');
```

### Filtres dynamiques
```typescript
const { filters, setFilters, hasActiveFilters } = useFiltersStore();
```

### Analyses filtrées
```typescript
const { data: stats } = useFilteredStats(filters);
```

## Sécurité

- Toutes les requêtes utilisent RLS avec `auth.uid()`
- Fonctions `SECURITY DEFINER` pour les performances
- Validation des paramètres d'entrée

## Performance

- Vue matérialisée pour les calculs lourds
- Index optimisés sur les colonnes critiques
- Cache des requêtes avec React Query
- Rafraîchissement automatique quotidien
