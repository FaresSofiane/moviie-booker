import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface MovieAPIResponse {
    dates: {
        maximum: string;
        minimum: string;
    };
    page: number;
    results: MovieAPI[];
    total_pages: number;
    total_results: number;
}

interface MovieAPI {
    id: number;
    title: string;
    overview: string;
    release_date: string;
    genre_ids: number[];
    poster_path?: string;
    vote_average?: number;
    original_language: string;
    original_title: string;
    backdrop_path?: string;
    adult: boolean;
    popularity: number;
    video: boolean;
    vote_count: number;
}

interface Movie {
    id: number;
    title: string;
    description: string;
    releaseDate: Date;
    genre: string;
    director: string;
    duration: number;
    posterUrl?: string;
    rating?: number;
    overview?: string
}


interface MoviesContextType {
    movies: Movie[];
    isLoading: boolean;
    error: string | null;
    fetchMovies: () => Promise<void>;
}

const MoviesContext = createContext<MoviesContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';

interface MoviesProviderProps {
    children: ReactNode;
}

export const useMovies = (): MoviesContextType => {
    const context = useContext(MoviesContext);
    if (!context) {
        throw new Error('useMovies doit être utilisé à l\'intérieur d\'un MoviesProvider');
    }
    return context;
};

export const MoviesProvider: React.FC<MoviesProviderProps> = ({ children }) => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoadingMovie, setIsLoadingMovie] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const { token, isLoading } = useAuth();

    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });

    const fetchMovies = async (): Promise<void> => {
        setIsLoadingMovie(true);
        setError(null);

        try {
            const response = await api.get<MovieAPIResponse>('/movies');

            const transformedMovies: Movie[] = response.data.results.map(movieData => ({
                id: movieData.id,
                title: movieData.title,
                description: movieData.overview,
                releaseDate: new Date(movieData.release_date),
                genre: movieData.genre_ids.join(', '),
                director: 'Non disponible',
                duration: 0,
                posterUrl: movieData.poster_path ? `https://image.tmdb.org/t/p/w500${movieData.poster_path}` : undefined,
                rating: movieData.vote_average,
            }));

            console.log("transformedMovies :", transformedMovies);

            setMovies(transformedMovies);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Erreur lors du chargement des films');
            } else {
                setError('Une erreur inattendue est survenue');
            }
        } finally {
            setIsLoadingMovie(false);
        }
    };

    useEffect(() => {
        fetchMovies();
    }, [isLoading]);

    const contextValue: MoviesContextType = {
        movies,
        isLoading: isLoadingMovie,
        error,
        fetchMovies
    };

    return (
        <MoviesContext.Provider value={contextValue}>
            {children}
        </MoviesContext.Provider>
    );
};

export default MoviesContext;