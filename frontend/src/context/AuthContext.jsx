import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

/**
 * Proveedor de Autenticación (AuthProvider)
 * Maneja el login del administrador y la persistencia del token.
 */
export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Verificar si hay un token guardado
        const token = localStorage.getItem('token');
        if (token) {
            verifyToken(token);
        } else {
            setLoading(false);
        }
    }, []);

    const verifyToken = async (token) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${baseUrl}/auth/verify`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUser(data.user);
            } else {
                localStorage.removeItem('token');
            }
        } catch (error) {
            console.error('Error verificando token:', error);
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${baseUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            }
            const errorData = await response.json();
            return { success: false, message: errorData.message || 'Error al iniciar sesión' };
        } catch (error) {
            console.error('Error in login:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    const register = async (email, password, name) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            console.log('Intentando registro en:', `${baseUrl}/auth/register`);
            const response = await fetch(`${baseUrl}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('token', data.token);
                setUser(data.user);
                return { success: true, user: data.user };
            }
            const errorData = await response.json();
            return { success: false, message: errorData.message || 'Error al registrarse' };
        } catch (error) {
            console.error('Error in register:', error);
            return { success: false, message: 'Error de conexión' };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth debe usarse dentro de un AuthProvider');
    }
    return context;
};
