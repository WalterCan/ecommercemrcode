import React from 'react';

/**
 * Componente de Loading reutilizable con diseño holístico
 */
const LoadingSpinner = ({ fullScreen = false, text = 'Cargando...' }) => {
    const SpinnerContent = () => (
        <div className="flex flex-col items-center justify-center p-8">
            <div className="relative w-16 h-16 mb-4">
                <div className="absolute inset-0 border-4 border-earth/20 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-earth border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-4 bg-earth/10 rounded-full animate-pulse"></div>
            </div>
            <p className="text-earth font-serif text-lg animate-pulse">{text}</p>
        </div>
    );

    if (fullScreen) {
        return (
            <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <SpinnerContent />
            </div>
        );
    }

    return <SpinnerContent />;
};

export default LoadingSpinner;
