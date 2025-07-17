
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { securityEventAggregator } from '@/utils/enhancedAuthUtils';
import { validateSecurityHeaders } from '@/utils/security/securityHeaders';
import { useAuth } from '@/hooks/useAuth';

interface SecurityAlert {
  id: string;
  type: 'critical' | 'warning' | 'info';
  message: string;
  timestamp: Date;
  resolved: boolean;
}

export function SecurityMonitoring() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [securityScore, setSecurityScore] = useState(0);
  const [headerValidation, setHeaderValidation] = useState<{
    valid: boolean;
    issues: string[];
    recommendations: string[];
  } | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Calculate security score based on various factors
  const calculateSecurityScore = () => {
    let score = 100;
    const eventSummary = securityEventAggregator.getEventSummary(user?.id);
    
    // Deduct points for security events
    if (eventSummary.XSS_ATTEMPT_DETECTED) score -= 10;
    if (eventSummary.RATE_LIMIT_EXCEEDED) score -= 5;
    if (eventSummary.INVALID_INPUT_PATTERN) score -= 3;
    if (eventSummary.UNAUTHORIZED_ACCESS_ATTEMPT) score -= 15;
    
    // Header validation impact
    if (headerValidation && !headerValidation.valid) {
      score -= headerValidation.issues.length * 5;
    }
    
    return Math.max(0, score);
  };

  // Generate security alerts based on events
  const generateAlerts = () => {
    const eventSummary = securityEventAggregator.getEventSummary(user?.id);
    const newAlerts: SecurityAlert[] = [];

    if (eventSummary.XSS_ATTEMPT_DETECTED > 0) {
      newAlerts.push({
        id: 'xss-alert',
        type: 'critical',
        message: `${eventSummary.XSS_ATTEMPT_DETECTED} tentatives XSS détectées`,
        timestamp: new Date(),
        resolved: false
      });
    }

    if (eventSummary.RATE_LIMIT_EXCEEDED > 5) {
      newAlerts.push({
        id: 'rate-limit-alert',
        type: 'warning',
        message: 'Violations répétées des limites de taux',
        timestamp: new Date(),
        resolved: false
      });
    }

    if (headerValidation && headerValidation.issues.length > 0) {
      newAlerts.push({
        id: 'headers-alert',
        type: 'warning',
        message: `${headerValidation.issues.length} problèmes de headers de sécurité`,
        timestamp: new Date(),
        resolved: false
      });
    }

    setAlerts(newAlerts);
  };

  // Validate security headers
  const validateHeaders = async () => {
    setIsValidating(true);
    try {
      const validation = await validateSecurityHeaders(window.location.origin);
      setHeaderValidation(validation);
    } catch (error) {
      console.error('Header validation failed:', error);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    validateHeaders();
    const interval = setInterval(() => {
      generateAlerts();
      setSecurityScore(calculateSecurityScore());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, [user, headerValidation]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-5 w-5 text-green-600" />;
    if (score >= 70) return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
    return <AlertTriangle className="h-5 w-5 text-red-600" />;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Tableau de Bord de Sécurité</CardTitle>
          </div>
          <Button
            onClick={validateHeaders}
            disabled={isValidating}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            {getScoreIcon(securityScore)}
            <div>
              <div className="text-2xl font-bold">
                <span className={getScoreColor(securityScore)}>
                  {securityScore}/100
                </span>
              </div>
              <p className="text-sm text-gray-600">Score de Sécurité</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {alerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <span>Alertes de Sécurité</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <Alert key={alert.id} className="border-l-4 border-l-red-500">
                <AlertDescription className="flex items-center justify-between">
                  <div>
                    <Badge 
                      variant={alert.type === 'critical' ? 'destructive' : 'secondary'}
                      className="mr-2"
                    >
                      {alert.type.toUpperCase()}
                    </Badge>
                    {alert.message}
                  </div>
                  <span className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString()}
                  </span>
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}

      {headerValidation && (
        <Card>
          <CardHeader>
            <CardTitle>Validation des Headers de Sécurité</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {headerValidation.valid ? (
                <div className="flex items-center space-x-2 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>Tous les headers de sécurité sont configurés</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {headerValidation.issues.map((issue, index) => (
                    <div key={index} className="flex items-center space-x-2 text-red-600">
                      <AlertTriangle className="h-4 w-4" />
                      <span>{issue}</span>
                    </div>
                  ))}
                </div>
              )}
              
              {headerValidation.recommendations.length > 0 && (
                <div className="mt-3">
                  <p className="font-semibold text-sm mb-2">Recommandations :</p>
                  {headerValidation.recommendations.map((rec, index) => (
                    <div key={index} className="text-sm text-yellow-600">
                      • {rec}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
