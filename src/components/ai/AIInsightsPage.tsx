import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIInsights, useGenerateAIInsights } from "@/hooks/useAIInsights";
import { Brain, RefreshCw, Download, Lightbulb, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AIInsightsPage() {
  const { data: insights = [], isLoading } = useAIInsights();
  const generateInsightsMutation = useGenerateAIInsights();

  const handleGenerateInsights = () => {
    generateInsightsMutation.mutate({});
  };

  const formatInsightContent = (content: string) => {
    // Split content into sections and format
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      if (section.includes(':')) {
        const [title, ...contentParts] = section.split(':');
        const content = contentParts.join(':').trim();
        
        if (title.includes('scaler') || title.includes('SCALER')) {
          return (
            <div key={index} className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-green-600 flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                {title}
              </h3>
              <div className="space-y-2">
                {content.split('\n').filter(line => line.trim()).map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{line.replace(/^[•-]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
        
        if (title.includes('optimisation') || title.includes('OPTIMISATION')) {
          return (
            <div key={index} className="mb-6">
              <h3 className="font-semibold text-lg mb-3 text-orange-600 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                {title}
              </h3>
              <div className="space-y-2">
                {content.split('\n').filter(line => line.trim()).map((line, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{line.replace(/^[•-]\s*/, '')}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        }
      }
      
      return (
        <div key={index} className="mb-4">
          <p className="text-gray-700 leading-relaxed">{section}</p>
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <h1 className="text-2xl font-bold">🧠 Insights IA</h1>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter PDF
          </Button>
          <Button 
            onClick={handleGenerateInsights}
            disabled={generateInsightsMutation.isPending}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${generateInsightsMutation.isPending ? 'animate-spin' : ''}`} />
            Générer Insights
          </Button>
        </div>
      </div>

      {/* Description */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-6 w-6 text-purple-600 mt-1" />
            <div>
              <h3 className="font-semibold text-purple-900 mb-2">Analyse intelligente automatisée</h3>
              <p className="text-purple-700 text-sm">
                Notre IA analyse vos données marketing pour identifier les opportunités de croissance, 
                les produits à scaler, et les optimisations à effectuer.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading state for generation */}
      {generateInsightsMutation.isPending && (
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-3">
              <RefreshCw className="h-6 w-6 animate-spin text-purple-600" />
              <span className="text-purple-700">Génération d'insights en cours...</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {insights.length === 0 && !generateInsightsMutation.isPending ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun insight généré
              </h3>
              <p className="text-gray-500 mb-6">
                Cliquez sur "Générer Insights" pour obtenir une analyse IA de vos performances
              </p>
              <Button 
                onClick={handleGenerateInsights}
                disabled={generateInsightsMutation.isPending}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Générer mes premiers insights
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {insights.map((insight) => (
            <Card key={insight.id} className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    Insights IA - Analyse Stratégique
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {insight.insights_type}
                    </Badge>
                    <span className="text-xs text-gray-500">
                      {format(new Date(insight.generated_at), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                    </span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  {formatInsightContent(insight.content)}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
