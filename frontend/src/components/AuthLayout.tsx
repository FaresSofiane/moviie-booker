// src/components/AuthLayout.tsx
import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";

export const AuthLayout = () => {
    const { user } = useAuth();

    // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
    if (user) {
        return <Navigate to="/" replace />;
    }

    // Sinon, afficher les pages d'authentification
    return <Outlet />;
};