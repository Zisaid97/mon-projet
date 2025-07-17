
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useSimpleGoogleSheets } from '@/hooks/useSimpleGoogleSheets';
import { GoogleSheetsImport } from './GoogleSheetsImport';
import { GoogleSheetsExport } from './GoogleSheetsExport';
import { GoogleSheetsConfig } from './GoogleSheetsConfig';
import { ConnectionGuideModal } from './ConnectionGuideModal';
import { User, LogOut, FileSpreadsheet, AlertCircle, HelpCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

export function GoogleSheetsIntegration() {
  const { 
    loading, 
    integration, 
    connectToGoogle, 
    disconnectFromGoogle, 
    refreshIntegration 
  } = useSimpleGoogleSheets();

  const [showGuide, setShowGuide] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const handleConnectWithGuide = async () => {
    setConnectionError(null);
    try {
      await connectToGoogle();
    } catch (error: any) {
      console.error('Connection error:', error);
      setConnectionError(error.message || 'Erreur de connexion inconnue');
      setShowGuide(true);
    }
  };

  const handleForceRefresh = () => {
    refreshIntegration();
  };

  if (!integration) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
               <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5" />
                Intégration Google Sheets
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForceRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Connectez votre compte Google pour importer et exporter vos données vers Google Sheets.
                <br />
                <strong>Important:</strong> Vous devrez autoriser l'accès à vos feuilles Google lors de la connexion.
                <br />
                <strong>Note:</strong> Si la connexion semble réussir mais n'apparaît pas ici, cliquez sur "Actualiser" ci-dessus.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleConnectWithGuide} 
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter à Google Sheets'
                )}
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => setShowGuide(true)}
                className="flex items-center gap-2"
              >
                <HelpCircle className="h-4 w-4" />
                Guide d'aide
              </Button>
            </div>

            {connectionError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Erreur de connexion:</strong> {connectionError}
                  <br />
                  <Button 
                    variant="link" 
                    className="p-0 h-auto text-red-600 hover:text-red-800"
                    onClick={() => setShowGuide(true)}
                  >
                    Voir le guide de dépannage →
                  </Button>
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <ConnectionGuideModal
          open={showGuide}
          onOpenChange={setShowGuide}
          errorType={connectionError || undefined}
          onRetryConnection={() => {
            setShowGuide(false);
            setTimeout(handleConnectWithGuide, 500);
          }}
        />
      </>
    );
  }

  return (
    <div>
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" />
              Google Sheets
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Connecté
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-gray-500" />
              <div>
                <p className="font-medium">{integration.google_name}</p>
                <p className="text-sm text-gray-600">{integration.google_email}</p>
                <p className="text-xs text-gray-500">
                  Connecté le {new Date(integration.connected_at).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleForceRefresh}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Actualiser
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowGuide(true)}
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Aide
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={disconnectFromGoogle}
                disabled={loading}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Déconnecter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>


      {/* Tabs for different operations */}
      <Tabs defaultValue="import" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="import">📥 Import</TabsTrigger>
          <TabsTrigger value="export">📤 Export</TabsTrigger>
          <TabsTrigger value="config">⚙️ Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="import">
          <GoogleSheetsImport />
        </TabsContent>

        <TabsContent value="export">
          <GoogleSheetsExport />
        </TabsContent>

        <TabsContent value="config">
          <GoogleSheetsConfig />
        </TabsContent>
      </Tabs>

      <ConnectionGuideModal
        open={showGuide}
        onOpenChange={setShowGuide}
        errorType={connectionError || undefined}
        onRetryConnection={() => {
          setShowGuide(false);
          setTimeout(handleConnectWithGuide, 500);
        }}
      />
    </div>
  );
}
