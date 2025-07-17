
import React, { ReactNode, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface RequireAuthProps {
  children: ReactNode;
  requiredRole?: string;
}

export function RequireAuth({ children, requiredRole }: RequireAuthProps) {
  const { user, hydrated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (hydrated && !user) {
      navigate("/auth");
    }
  }, [hydrated, user, navigate]);

  // Show loading while checking auth state
  if (!hydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Redirect to auth if not authenticated
  if (!user) {
    return null;
  }

  // Check role if required (admin check)
  if (requiredRole && requiredRole === "admin") {
    // Only allow specific admin user for beta microservices
    if (user.id !== "c9633306-4f46-4c05-9065-d9c8c8d29903") {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Accès restreint</h2>
            <p className="text-muted-foreground">Cette fonctionnalité est en cours de développement.</p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
