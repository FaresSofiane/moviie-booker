// src/components/ProtectedRoute.tsx
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext.tsx";

export const ProtectedRoute = () => {
  const { user } = useAuth();

  // Si l'utilisateur n'est pas connecté, rediriger vers login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Sinon, rendre les enfants de cette route
  return <Outlet />;
};