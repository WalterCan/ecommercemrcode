import React from 'react';
import { useToast } from '../../context/ToastContext';

/**
 * ToastContainer
 * Renderiza la lista de notificaciones activas con estilo holístico y animaciones.
 */
const ToastContainer = () => {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 max-w-sm w-full sm:w-80">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`
                        relative overflow-hidden rounded-2xl shadow-2xl p-4 flex items-start gap-3 
                        animate-slide-in-right transform transition-all duration-500
                        ${toast.type === 'error' ? 'bg-terracotta text-white' :
                            toast.type === 'warning' ? 'bg-orange-500 text-white' :
                                'bg-moss text-white'}
                    `}
                >
                    {/* Icono dinámico según tipo */}
                    <div className="flex-shrink-0 mt-0.5">
                        {toast.type === 'error' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        ) : toast.type === 'warning' ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>

                    {/* Mensaje */}
                    <div className="flex-1">
                        <p className="text-sm font-medium leading-tight">{toast.message}</p>
                    </div>

                    {/* Botón Cerrar */}
                    <button
                        onClick={() => removeToast(toast.id)}
                        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>

                    {/* Barra de progreso de auto-eliminación */}
                    <div
                        className="absolute bottom-0 left-0 h-1 bg-white/20 transition-all duration-linear"
                        style={{
                            width: '100%',
                            animation: `toast-progress ${toast.duration}ms linear forwards`
                        }}
                    />
                </div>
            ))}

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slide-in-right {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes toast-progress {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}} />
        </div>
    );
};

export default ToastContainer;
