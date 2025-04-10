// src/contexts/ReservationContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Définition des interfaces pour les réservations
export interface Reservation {
    id: number;
    movieId: number;
    dateHeure: Date;
    userId: number;
}

export interface CreateReservationDto {
    movieId: number;
    dateHeure: string;
}

// Interface pour le contexte des réservations
interface ReservationContextType {
    reservations: Reservation[];
    isLoading: boolean;
    error: string | null;
    createReservation: (data: CreateReservationDto) => Promise<Reservation>;
    getUserReservations: () => Promise<void>;
    cancelReservation: (id: number) => Promise<void>;
}

const ReservationContext = createContext<ReservationContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface ReservationProviderProps {
    children: ReactNode;
}

export const useReservations = (): ReservationContextType => {
    const context = useContext(ReservationContext);
    if (!context) {
        throw new Error('useReservations doit être utilisé à l\'intérieur d\'un ReservationProvider');
    }
    return context;
};

export const ReservationProvider: React.FC<ReservationProviderProps> = ({ children }) => {
    // États
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [isLoadingReserv, setIsLoadingReserv] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Récupération du contexte d'authentification
    const { token } = useAuth();

    // Création de l'instance axios avec le token d'authentification
    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });

    // Récupération des réservations de l'utilisateur
    const getUserReservations = async (): Promise<void> => {
        setIsLoadingReserv(true);
        setError(null);

        try {
            const response = await api.get<Reservation[]>('/reservations');
            // Conversion des dates string en objets Date
            const reservationsWithDateObjects = response.data.map(res => ({
                ...res,
                dateHeure: new Date(res.dateHeure)
            }));
            setReservations(reservationsWithDateObjects);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Erreur lors du chargement des réservations');
            } else {
                setError('Une erreur inattendue est survenue');
            }
        } finally {
            setIsLoadingReserv(false);
        }
    };

    // Création d'une réservation
    const createReservation = async (data: CreateReservationDto): Promise<Reservation> => {
        setIsLoadingReserv(true);
        setError(null);

        try {
            const response = await api.post<Reservation>('/reservations', data);
            // Actualiser la liste des réservations après en avoir ajouté une nouvelle
            await getUserReservations();
            return response.data;
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                const errorMessage = err.response.data.message || 'Impossible de créer la réservation';
                alert(
                    errorMessage)
                setError(errorMessage);
                throw new Error(errorMessage);
            } else {
                setError('Une erreur inattendue est survenue');
                throw new Error('Une erreur inattendue est survenue');
            }
        } finally {
            setIsLoadingReserv(false);
        }
    };

    // Annulation d'une réservation
    const cancelReservation = async (id: number): Promise<void> => {
        setIsLoadingReserv(true);
        setError(null);

        try {
            await api.delete(`/reservations/${id}`);
            // Mettre à jour la liste des réservations en retirant celle qui a été annulée
            setReservations(prevReservations =>
                prevReservations.filter(reservation => reservation.id !== id)
            );
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Impossible d\'annuler la réservation');
            } else {
                setError('Une erreur inattendue est survenue');
            }
            throw err;
        } finally {
            setIsLoadingReserv(false);
        }
    };

    // Chargement initial des réservations
    useEffect(() => {
        if (token) {
            getUserReservations();
        }
    }, [token]);

    // Valeur du contexte
    const contextValue: ReservationContextType = {
        reservations,
        isLoading: isLoadingReserv,
        error,
        createReservation,
        getUserReservations,
        cancelReservation
    };

    return (
        <ReservationContext.Provider value={contextValue}>
            {children}
        </ReservationContext.Provider>
    );
};

export default ReservationContext;