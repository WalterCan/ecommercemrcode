import { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Componente de ruta protegida por módulo
 * Verifica que el usuario tenga el módulo habilitado antes de permitir acceso
 */
const ModuleRoute = ({ children, moduleCode, moduleName }) => {
    const { user, loading: authLoading } = useAuth();
    const [hasAccess, setHasAccess] = useState(null);
    const [checking, setChecking] = useState(true);
    const location = useLocation();

    useEffect(() => {
        checkModuleAccess();
    }, [user, moduleCode]);

    const checkModuleAccess = async () => {
        // Si no hay usuario, no tiene acceso
        if (!user) {
            setHasAccess(false);
            setChecking(false);
            return;
        }

        // Super Admin siempre tiene acceso
        if (user.role === 'super_admin') {
            setHasAccess(true);
            setChecking(false);
            return;
        }

        // Clientes siempre tienen acceso a modulo de turnos (appointments)
        if (user.role === 'customer' && moduleCode === 'appointments') {
            setHasAccess(true);
            setChecking(false);
            return;
        }

        // Verificar si el usuario tiene el módulo habilitado
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');

            const res = await fetch(`${baseUrl}/module-management/my-modules`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const modules = await res.json();
                const hasModule = modules.some(m => m.code === moduleCode);
                setHasAccess(hasModule);
            } else {
                setHasAccess(false);
            }
        } catch (error) {
            console.error('Error checking module access:', error);
            setHasAccess(false);
        } finally {
            setChecking(false);
        }
    };

    // Mostrar loading mientras se verifica autenticación o módulo
    if (authLoading || checking) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-slate-600">Verificando acceso...</p>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Si no tiene acceso al módulo, redirigir a página de módulo no disponible
    if (!hasAccess) {
        return (
            <Navigate
                to="/modulo-no-disponible"
                state={{ moduleName: moduleName || moduleCode, from: location }}
                replace
            />
        );
    }

    // Usuario tiene acceso, mostrar contenido
    return children;
};

export default ModuleRoute;
