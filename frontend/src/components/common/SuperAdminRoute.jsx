import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente de ruta protegida para Super Admin
 * Solo permite acceso a usuarios con role='super_admin'
 */
const SuperAdminRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-600">Verificando permisos...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (user.role !== 'super_admin') {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center px-4">
                <div className="max-w-md text-center">
                    <div className="text-6xl mb-4">⛔</div>
                    <h1 className="text-2xl font-bold text-slate-800 mb-2">Acceso Denegado</h1>
                    <p className="text-slate-600 mb-6">
                        Solo Super Administradores pueden acceder a esta sección.
                    </p>
                    <a href="/" className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors inline-block">
                        Volver al Inicio
                    </a>
                </div>
            </div>
        );
    }

    return children;
};

export default SuperAdminRoute;
