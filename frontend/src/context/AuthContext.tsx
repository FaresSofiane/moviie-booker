import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

interface User {
    id: string;
    email: string;
    username: string;
}

interface AuthData {
    user: User | null;
    accessToken: string | null;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (username: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/';
const JWT_COOKIE_NAME = import.meta.env.VITE_JWT_COOKIE_NAME || 'auth_token';
const COOKIE_SECURE = import.meta.env.MODE === 'production';

interface AuthProviderProps {
    children: ReactNode;
}

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth doit être utilisé à l\'intérieur d\'un AuthProvider');
    }
    return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [authData, setAuthData] = useState<AuthData>({
        user: null,
        accessToken: null,
    });
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const api = axios.create({
        baseURL: API_URL,
        headers: {
            'Content-Type': 'application/json',
        },
    });


    const setCookieWithJwtExpiry = (token: string): void => {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            const expiresIn = payload.exp ? new Date(payload.exp * 1000) : new Date(Date.now() + 24 * 60 * 60 * 1000);

            Cookies.set(JWT_COOKIE_NAME, token, {
                expires: expiresIn,
                sameSite: 'strict',
                secure: COOKIE_SECURE
            });
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            Cookies.set(JWT_COOKIE_NAME, token, {
                expires: 1,
                sameSite: 'strict',
                secure: COOKIE_SECURE
            });
        }
    };

    useEffect(() => {
        const initAuth = async (): Promise<void> => {
            const token = Cookies.get(JWT_COOKIE_NAME);

            console.log("Retrieving token from cookies:", token);
            if (token) {
                try {
                    const response = await api.get('/auth/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    console.log("Response from profile endpoint:", response.data);

                    if (response.data && response.data.username && response.data.email) {
                        setAuthData({
                            user: response.data,
                            accessToken: token
                        });
                    } else {
                        Cookies.remove(JWT_COOKIE_NAME);
                    }
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                } catch (error) {
                    console.error("Error retrieving user profile:", error);
                    Cookies.remove(JWT_COOKIE_NAME);
                }
            }

            setIsLoading(false);
        };

        initAuth();
    }, []);

    const login = async (email: string, password: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await api.post('/auth/login', { email, password });

            const { access_token, user } = response.data;

            setCookieWithJwtExpiry(access_token);

            setAuthData({
                user,
                accessToken: access_token
            });
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Erreur de connexion');
            } else {
                setError('Une erreur inattendue est survenue');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string, username: string): Promise<void> => {
        setIsLoading(true);
        setError(null);

        try {
            await api.post('/auth/register', {
                username,
                email,
                password
            });

            await login(email, password);
        } catch (err) {
            if (axios.isAxiosError(err) && err.response) {
                setError(err.response.data.message || 'Erreur d\'inscription');
            } else {
                setError('Une erreur inattendue est survenue');
            }
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = (): void => {
        Cookies.remove(JWT_COOKIE_NAME);

        setAuthData({
            user: null,
            accessToken: null
        });
    };

    useEffect(() => {
        const requestInterceptor = api.interceptors.request.use(
            (config) => {
                if (authData.accessToken) {
                    config.headers['Authorization'] = `Bearer ${authData.accessToken}`;
                }
                return config;
            },
            (error) => Promise.reject(error)
        );

        return () => {
            api.interceptors.request.eject(requestInterceptor);
        };
    }, [authData.accessToken]);

    const contextValue: AuthContextType = {
        user: authData.user,
        token: authData.accessToken,
        isAuthenticated: !!authData.user,
        isLoading,
        login,
        register,
        logout,
        error
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;