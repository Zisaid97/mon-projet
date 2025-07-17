import { Header } from "@/components/layout/Header";
import { MicroservicesHub } from "@/components/microservices/MicroservicesHub";
import { RequireAuth } from "@/components/RequireAuth";

const MicroservicesPage = () => {
  return (
    <RequireAuth requiredRole="admin">
      <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
        <Header />
        <main className="max-w-7xl mx-auto py-10 px-4">
          <MicroservicesHub />
        </main>
      </div>
    </RequireAuth>
  );
};

export default MicroservicesPage;