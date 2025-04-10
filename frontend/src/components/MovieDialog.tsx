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
import { useReservations } from "@/context/ReservationContext";
import { format } from "date-fns";
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Styles de base

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

    // Date d'aujourd'hui (minimum pour la sélection)
    const today = new Date();

    // Créneaux horaires disponibles
    const timeSlots = ["10:00", "12:30", "14:00", "16:30", "18:00", "20:30"];

    // État pour stocker la date et l'heure sélectionnées
    const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(today);
    const [selectedTime, setSelectedTime] = React.useState<string | null>(null);

    // Fonction pour gérer le changement de date
    const handleDateChange = (date: Date | Date[]) => {
        // Si c'est un tableau, prenez la première date
        // Si c'est une seule date, utilisez-la directement
        setSelectedDate(Array.isArray(date) ? date[0] : date);
    };

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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                    {/* Affichage de l'image du film */}
                    <div className="flex flex-col space-y-4">
                        {movie.posterUrl && (
                            <div className="aspect-[2/3] w-full overflow-hidden rounded-lg">
                                <img
                                    src={movie.posterUrl}
                                    alt={movie.title}
                                    className="object-cover w-full h-full"
                                />
                            </div>
                        )}

                        {/* Description du film */}
                        {movie.description && (
                            <div className="text-sm text-gray-600">
                                {movie.description}
                            </div>
                        )}
                    </div>

                    {/* Section de réservation */}
                    <div className="flex flex-col space-y-4">
                        {existingReservation ? (
                            /* Afficher la confirmation d'annulation si on a déjà réservé */
                            <>
                                <div className="bg-green-50 text-green-700 p-4 rounded-md">
                                    <p className="font-medium">Vous avez déjà réservé ce film</p>
                                </div>

                                {showConfirmation ? (
                                    <div className="bg-red-50 text-red-700 p-4 rounded-md">
                                        <p>Êtes-vous sûr de vouloir annuler votre réservation ?</p>
                                        <div className="flex space-x-2 mt-3">
                                            <Button variant="destructive" onClick={handleCancelReservation} disabled={isLoading}>
                                                {isLoading ? "Annulation..." : "Confirmer l'annulation"}
                                            </Button>
                                            <Button variant="outline" onClick={() => setShowConfirmation(false)}>
                                                Retour
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <Button variant="outline" onClick={() => setShowConfirmation(true)}>
                                        Annuler ma réservation
                                    </Button>
                                )}
                            </>
                        ) : (
                            /* Afficher le formulaire de réservation */
                            <>
                                <h3 className="text-lg font-semibold">Sélectionnez une date</h3>

                                {/* Calendrier avec react-calendar */}
                                <div className="my-4">
                                    <Calendar
                                        onChange={handleDateChange}
                                        value={selectedDate}
                                        minDate={today}
                                        className="rounded-md border shadow-md p-2 bg-white w-full"
                                        tileClassName={({ date }) => {
                                            // Date actuelle (pour comparaison)
                                            const currentDate = new Date();
                                            // Si la date est dans le futur, elle est sélectionnable
                                            return date >= currentDate ?
                                                'hover:bg-blue-200 rounded-md' :
                                                'text-gray-400'
                                        }}
                                    />
                                </div>

                                {/* Information sur la date sélectionnée */}
                                {selectedDate && (
                                    <div className="text-sm font-medium text-blue-600">
                                        Date sélectionnée: {format(selectedDate, 'dd/MM/yyyy')}
                                    </div>
                                )}

                                {/* Sélection de l'horaire */}
                                <div className="space-y-2">
                                    <h3 className="text-lg font-semibold">Choisissez un horaire</h3>
                                    <div className="grid grid-cols-3 gap-2">
                                        {timeSlots.map((time) => (
                                            <button
                                                key={time}
                                                className={`py-2 px-3 rounded-md border transition-colors ${
                                                    selectedTime === time
                                                        ? "bg-primary text-primary-foreground"
                                                        : "hover:bg-slate-100"
                                                }`}
                                                onClick={() => setSelectedTime(time)}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Bouton de réservation */}
                                <Button
                                    className="mt-4"
                                    onClick={handleReservation}
                                    disabled={!selectedDate || !selectedTime || isLoading}
                                >
                                    {isLoading ? "Réservation en cours..." : "Réserver"}
                                </Button>
                            </>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Fermer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MovieDialog;