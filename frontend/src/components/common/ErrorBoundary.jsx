import React, { Component } from 'react';
import { Link } from 'react-router-dom';

/**
 * Error Boundary para capturar errores de renderizado
 * Muestra una UI de fallback en lugar de romper toda la app
 */
class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        console.error('Uncaught error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-paper p-4">
                    <div className="max-w-xl w-full bg-white rounded-xl shadow-xl p-8 text-center">
                        <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>

                        <h1 className="text-3xl font-serif text-slate-800 mb-4">
                            Algo salió mal
                        </h1>

                        <p className="text-slate-600 mb-6">
                            Lo sentimos, ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
                        </p>

                        <div className="bg-slate-50 p-4 rounded-lg text-left overflow-auto max-h-48 mb-6 text-sm font-mono text-slate-700">
                            {this.state.error && this.state.error.toString()}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-earth text-white rounded-lg hover:bg-earth-dark transition-colors"
                            >
                                Recargar Página
                            </button>
                            <a
                                href="/"
                                className="px-6 py-2 border border-earth text-earth rounded-lg hover:bg-earth-light/10 transition-colors"
                            >
                                Volver al Inicio
                            </a>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
