
import { Header } from "@/components/layout/Header";
import { GoogleSheetsIntegration } from "@/components/google-sheets/GoogleSheetsIntegration";
import { useAuth } from "@/hooks/useAuth";
import { FileSpreadsheet } from "lucide-react";

export default function GoogleSheets() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* En-tête de page professionnel */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg">
              <FileSpreadsheet className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Intégration Google Sheets
              </h1>
              <p className="text-gray-600 mt-1">
                Synchronisez vos données avec Google Sheets
              </p>
            </div>
          </div>
        </div>

        {/* Composant d'intégration */}
        <GoogleSheetsIntegration />
      </main>
    </div>
  );
}
