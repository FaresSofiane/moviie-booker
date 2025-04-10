import {BrowserRouter, Navigate, Route, Routes} from "react-router";
import Index from "@/screens";
import Login from "@/screens/auth/login.tsx";
import Register from "@/screens/auth/register.tsx";
import {AuthLayout} from "@/components/AuthLayout.tsx";
import {ProtectedRoute} from "@/components/ProtectedRoute.tsx";
import {MoviesProvider} from "@/context/MoviesContext.tsx";
import {ReservationProvider} from "@/context/ReservationContext.tsx";

export default function App() {
    return (
        <>
            <MoviesProvider>
                <ReservationProvider>
            <BrowserRouter>
                <Routes>
                    <Route element={<AuthLayout />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                    </Route>
                    <Route element={<ProtectedRoute />}>

                        <Route path="/" element={

                                    <Index />


                        } />
                        {/* Ajoutez ici d'autres routes protégées */}
                    </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />


                </Routes>
            </BrowserRouter>
                </ReservationProvider>
            </MoviesProvider>
        </>

    );
}