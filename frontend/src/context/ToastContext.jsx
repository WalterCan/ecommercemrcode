import React, { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext();

/**
 * ToastProvider
 * Provee un sistema de notificaciones elegantes y modernas.
 */
export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);
    const lastToastRef = React.useRef({ message: '', type: '', timestamp: 0 });

    const showToast = useCallback((message, type = 'success', duration = 4000) => {
        const now = Date.now();

        // Evitar duplicados idénticos en un margen de 500ms (útil para StrictMode y race conditions)
        if (
            lastToastRef.current.message === message &&
            lastToastRef.current.type === type &&
            now - lastToastRef.current.timestamp < 500
        ) {
            return null;
        }

        lastToastRef.current = { message, type, timestamp: now };

        const id = now;
        setToasts((prevToasts) => [...prevToasts, { id, message, type, duration }]);

        // Auto-eliminar después del tiempo especificado
        if (duration !== Infinity) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    }, []);

    const removeToast = useCallback((id) => {
        setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ toasts, showToast, removeToast }}>
            {children}
        </ToastContext.Provider>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast debe usarse dentro de un ToastProvider');
    }
    return context;
};
