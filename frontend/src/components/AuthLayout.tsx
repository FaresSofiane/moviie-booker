import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/context/AuthContext";

export const AuthLayout = () => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};