
import { Header } from "@/components/layout/Header";
import AlertSettingsForm from "@/components/alertes/AlertSettingsForm";

export default function Alertes() {
  return (
    <div className="bg-background min-h-screen transition-colors">
      <Header />
      <main className="max-w-3xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-4 text-foreground">🧠 Alertes intelligentes</h1>
        <p className="mb-6 text-muted-foreground">
          Configurez vos seuils d'alerte pour être notifié dès qu'une anomalie critique est détectée sur vos campagnes ou produits.
        </p>
        <AlertSettingsForm />
      </main>
    </div>
  );
}
