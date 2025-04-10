import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext.tsx";

export const ProtectedRoute = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};