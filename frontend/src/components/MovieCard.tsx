// src/components/MovieCard.tsx
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import MovieDialog from "@/components/MovieDialog";

interface MovieCardProps {
    id: number;
    title: string;
    posterUrl?: string;
    description?: string;
}

const MovieCard: React.FC<MovieCardProps> = ({ id, title, posterUrl, description }) => {
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    return (
        <>
            <Card
                className="h-full overflow-hidden transition-transform hover:scale-105 cursor-pointer"
                onClick={() => setIsDialogOpen(true)}
            >
                <div className="relative aspect-[2/3] w-full overflow-hidden">
                    {posterUrl ? (
                        <img
                            src={posterUrl}
                            alt={title}
                            className="object-cover w-full h-full"
                        />
                    ) : (
                        <div className="flex items-center justify-center w-full h-full bg-gray-200">
                            <span className="text-gray-400">Image non disponible</span>
                        </div>
                    )}
                </div>
                <CardHeader className="p-4">
                    <CardTitle className="text-center text-base truncate">{title}</CardTitle>
                </CardHeader>
            </Card>

            <MovieDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                movie={{ id, title, posterUrl, description }}
            />
        </>
    );
};

export default MovieCard;