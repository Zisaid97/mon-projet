import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAIInsights, useGenerateAIInsights } from "@/hooks/useAIInsights";
import { Brain, RefreshCw, Download, Lightbulb } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export function AIInsights() {
  const { data: insights, isLoading } = useAIInsights();
  const generateInsightsMutation = useGenerateAIInsights();

  const handleGenerateInsights = () => {
    generateInsightsMutation.mutate({});
  };

  const formatInsightContent = (content: string) => {
    // Parse the content to format it nicely
    const sections = content.split('\n\n');
    return sections.map((section, index) => {
      if (section.startsWith('**') && section.endsWith('**')) {
        return (
          <h3 key={index} className="font-semibold text-lg mb-2 text-blue-600">
            {section.replace(/\*\*/g, '')}
          </h3>
        );
      }
      if (section.startsWith('•') || section.startsWith('-')) {
        const items = section.split('\n').filter(item => item.trim());
        return (
          <ul key={index} className="list-disc list-inside space-y-1 mb-4">
            {items.map((item, itemIndex) => (
              <li key={itemIndex} className="text-gray-700">
                {item.replace(/^[•-]\s*/, '')}
              </li>
            ))}
          </ul>
        );
      }
      return (
        <p key={index} className="text-gray-700 mb-4 leading-relaxed">
          {section}
        </p>
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
          <h1 className="text-2xl font-bold">🧠 Insights AI</h1>
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

      {/* Insights */}
      {insights && insights.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Brain className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Aucun insight généré
              </h3>
              <p className="text-gray-500 mb-6">
                Cliquez sur "Générer Insights" pour obtenir une analyse AI de vos performances
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
          {insights?.map((insight) => (
            <Card key={insight.id} className="border-l-4 border-l-purple-500">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-purple-600" />
                    Insights AI
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
    </div>
  );
}
