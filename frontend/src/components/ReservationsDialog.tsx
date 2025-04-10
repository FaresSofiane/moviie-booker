import { useState } from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useReservations } from "@/context/ReservationContext";
import { useMovies } from "@/context/MoviesContext";
import { navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";

export function ReservationsDialog() {
    const [open, setOpen] = useState(false);
    const { reservations, isLoading, cancelReservation } = useReservations();
    const {movies} = useMovies();


    // Fonction sécurisée pour trouver le titre du film
    const getMovieTitle = (movieId: number) => {
        console.log(movies);
        if (!Array.isArray(movies)) {
            return `Film #${movieId}`;
        }

        const movie = movies.find(m => m.id === movieId);
        return movie ? movie.title : `Film #${movieId}`;
    };

    const handleCancel = async (id: number) => {
        try {
            await cancelReservation(id);
            toast.success("Réservation annulée avec succès");
        } catch (error) {
            toast.error("Erreur lors de l'annulation de la réservation");
            console.error("Erreur lors de l'annulation de la réservation", error);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" className={navigationMenuTriggerStyle()}>
                    Voir mes réservations
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>Mes réservations</DialogTitle>
                    <DialogDescription>
                        Voici la liste de vos réservations de films actuelles.
                    </DialogDescription>
                </DialogHeader>
                <div className="mt-4 space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {isLoading ? (
                        <p className="text-center py-4">Chargement en cours...</p>
                    ) : reservations.length === 0 ? (
                        <p className="text-center py-4">Vous n'avez aucune réservation.</p>
                    ) : (
                        <div className="space-y-4">
                            {reservations.map((reservation) => (
                                <div
                                    key={reservation.id}
                                    className="p-4 border rounded-md shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-medium text-lg">{getMovieTitle(reservation.movieId)}</p>
                                            <p className="text-sm text-gray-500">
                                                {format(new Date(reservation.dateHeure), "PPP 'à' HH'h'mm", {
                                                    locale: fr,
                                                })}
                                            </p>
                                        </div>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() => handleCancel(reservation.id)}
                                            className="ml-2 flex items-center gap-1"
                                        >
                                            <Trash2 size={16} />
                                            Annuler
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}