import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

// Interface pour la réponse API
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

// Interface pour les films tels que reçus de l'API
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

// Définition de l'interface Movie pour notre application
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


// Interface pour le contexte des films
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
    // États
    const [movies, setMovies] = useState<Movie[]>([]);
    const [isLoadingMovie, setIsLoadingMovie] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Récupération du contexte d'authentification
    const { token, isLoading } = useAuth();

    // Création de l'instance axios
    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });

    // Mise à jour de l'intercepteur lors des changements de token

    // Récupération de tous les films
    const fetchMovies = async (): Promise<void> => {
        setIsLoadingMovie(true);
        setError(null);

        try {
            const response = await api.get<MovieAPIResponse>('/movies');

            // Transformer les données de l'API en notre format Movie
            const transformedMovies: Movie[] = response.data.results.map(movieData => ({
                id: movieData.id,
                title: movieData.title,
                description: movieData.overview,
                releaseDate: new Date(movieData.release_date),
                // Vous devrez peut-être mapper les genre_ids vers des noms de genres
                genre: movieData.genre_ids.join(', '), // Temporaire, à améliorer
                director: 'Non disponible', // Cette donnée n'est pas présente dans l'API
                duration: 0, // Cette donnée n'est pas présente dans l'API
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

    // Chargement initial des données
    useEffect(() => {
        fetchMovies();
    }, [isLoading]);

    // Valeur du contexte
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