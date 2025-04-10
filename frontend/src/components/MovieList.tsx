import React, { useEffect } from 'react';
import { useMovies } from '@/context/MoviesContext';
import MovieCard from '@/components/MovieCard';
import LoadingSpinner from '@/components/LoadingSpinner';

const MovieList: React.FC = () => {
    const { movies, isLoading, error, fetchMovies } = useMovies();

    useEffect(() => {
        if ((!movies || !movies || movies.length === 0) && !isLoading && !error) {
            fetchMovies().catch(err => {
                console.error("Erreur lors du chargement des films:", err);
            });
        }
    }, [movies, isLoading, error, fetchMovies]);

    if (isLoading) {
        return <LoadingSpinner />;
    }

    if (error) {
        return <div className="text-center text-red-500">{error}</div>;
    }

    if (!movies || !movies || movies.length === 0) {
        return <div className="text-center">Aucun film trouvé</div>;
    }

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {movies.map((movie) => (
                <MovieCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl}
                    description={movie.overview}
                />
            ))}
        </div>
    );
};

export default MovieList;