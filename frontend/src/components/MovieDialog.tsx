// src/components/MovieDialog.tsx
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { useReservations } from "@/context/ReservationContext";
import { format } from "date-fns";

interface MovieDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    movie: {
        id: number;
        title: string;
        posterUrl?: string;
        description?: string;
    };
}

const MovieDialog: React.FC<MovieDialogProps> = ({
                                                     open,
                                                     onOpenChange,
                                                     movie
                                                 }) => {
    // Récupérer le contexte de réservation
    const { reservations, cancelReservation, createReservation, isLoading } = useReservations();

    // État pour vérifier si une réservation existe déjà pour ce film
    const [existingReservation, setExistingReservation] = useState<number | null>(null);

    // État pour l'affichage du dialogue de confirmation
    const [showConfirmation, setShowConfirmation] = useState(false);

    // Dates fictives pour les créneaux disponibles
    const today = new Date();
    const availableDates = [
        today,
        new Date(today.getTime() + 24 * 60 * 60 * 1000), // demain
        new Date(today.getTime() + 48 * 60 * 60 * 1000), // après-demain
    ];

    // Créneaux horaires disponibles
    const timeSlots = ["10:00", "12:30", "14:00", "16:30", "18:00", "20:30"];

    // État pour stocker la date et l'heure sélectionnées
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(today);
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null);

    useEffect(() => {
        if (reservations.length > 0 && movie) {
            const reservation = reservations.find(r => r.movieId === movie.id);
            if (reservation) {
                setExistingReservation(reservation.id);
            } else {
                setExistingReservation(null);
            }
        }
    }, [reservations, movie]);

    // Gérer l'annulation de la réservation
    const handleCancelReservation = async () => {
        if (existingReservation) {
            try {
                await cancelReservation(existingReservation);
                setShowConfirmation(false);
                setExistingReservation(null);
            } catch (error) {
                console.error("Erreur lors de l'annulation de la réservation:", error);
            }
        }
    };

    // Gérer la création d'une nouvelle réservation
    const handleReservation = async () => {
        if (selectedDate && selectedTime) {
            // Combinaison de la date et de l'heure
            const [hours, minutes] = selectedTime.split(':').map(Number);
            const reservationDate = new Date(selectedDate);
            reservationDate.setHours(hours, minutes);

            try {
                await createReservation({
                    movieId: movie.id,
                    dateHeure: reservationDate.toISOString()
                });
                // Réinitialiser les sélections après succès
                setSelectedTime(null);
                onOpenChange(false);
            } catch (error) {
                console.error("Erreur lors de la création de la réservation:", error);
            }
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">{movie.title}</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="w-full aspect-[2/3] overflow-hidden rounded-lg">
                        {movie.posterUrl ? (
                            <img
                                src={movie.posterUrl}
                                alt={movie.title}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="flex items-center justify-center w-full h-full bg-gray-200">
                                <span className="text-gray-400">Image non disponible</span>
                            </div>
                        )}
                    </div>

                    <div>
                        <DialogDescription className="text-foreground">
                            {movie.description || "Description non disponible"}
                        </DialogDescription>
                    </div>
                </div>

                {/* Affichage conditionnel basé sur l'existence d'une réservation */}
                {existingReservation ? (
                    <div className="mt-6 border-t pt-6">
                        {showConfirmation ? (
                            <div className="bg-amber-50 p-4 rounded-md border border-amber-200">
                                <h3 className="font-semibold text-amber-800 mb-2">Confirmer la suppression</h3>
                                <p className="text-amber-700 mb-4">Êtes-vous sûr de vouloir supprimer votre réservation pour ce film ?</p>
                                <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                                        Non
                                    </Button>
                                    <Button variant="destructive" onClick={handleCancelReservation} disabled={isLoading}>
                                        {isLoading ? "Suppression..." : "Oui, supprimer"}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                                <h3 className="font-semibold text-blue-800 mb-2">Vous avez déjà une réservation pour ce film</h3>
                                <p className="text-blue-700 mb-4">Voulez-vous la supprimer ?</p>
                                <div className="flex justify-end">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowConfirmation(true)}
                                    >
                                        Supprimer ma réservation
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="mt-6 border-t pt-6">
                        <h3 className="font-semibold mb-4">Sélectionnez une date :</h3>
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={setSelectedDate}
                            className="rounded-md border mx-auto"
                            disabled={(date) => {
                                // Désactiver toutes les dates sauf celles disponibles
                                return !availableDates.some(
                                    (availableDate) =>
                                        availableDate.getDate() === date.getDate() &&
                                        availableDate.getMonth() === date.getMonth() &&
                                        availableDate.getFullYear() === date.getFullYear()
                                );
                            }}
                        />

                        {selectedDate && (
                            <div className="mt-4">
                                <h3 className="font-semibold mb-2">Créneaux disponibles :</h3>
                                <div className="grid grid-cols-3 gap-3">
                                    {timeSlots.map((time) => (
                                        <Button
                                            key={time}
                                            variant={selectedTime === time ? "default" : "outline"}
                                            onClick={() => setSelectedTime(time)}
                                            className="text-center"
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedDate && selectedTime && (
                            <div className="mt-6">
                                <DialogFooter>
                                    <Button
                                        onClick={handleReservation}
                                        disabled={isLoading}
                                    >
                                        {isLoading
                                            ? "Réservation en cours..."
                                            : `Réserver pour le ${format(selectedDate, 'dd/MM/yyyy')} à ${selectedTime}`
                                        }
                                    </Button>
                                </DialogFooter>
                            </div>
                        )}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default MovieDialog;