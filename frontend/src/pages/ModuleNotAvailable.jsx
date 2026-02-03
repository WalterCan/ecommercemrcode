import { Link, useLocation } from 'react-router-dom';

const ModuleNotAvailable = () => {
    const location = useLocation();
    const moduleName = location.state?.moduleName || 'esta funcionalidad';
    const from = location.state?.from?.pathname || '/perfil';

    return (
        <div className="min-h-screen bg-paper flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                {/* Icono */}
                <div className="mb-6">
                    <div className="text-8xl mb-4">🔒</div>
                </div>

                {/* Título */}
                <h1 className="text-3xl font-bold text-slate-800 mb-4">
                    Módulo No Disponible
                </h1>

                {/* Mensaje */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                    <p className="text-slate-700 mb-2">
                        No tienes acceso a <strong>{moduleName}</strong>.
                    </p>
                    <p className="text-sm text-slate-600">
                        Este módulo no está habilitado para tu cuenta.
                    </p>
                </div>

                {/* Información adicional */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-slate-700">
                        💡 <strong>¿Necesitas acceso?</strong>
                    </p>
                    <p className="text-sm text-slate-600 mt-1">
                        Contacta al administrador del sistema para solicitar la habilitación de este módulo.
                    </p>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                        to="/perfil"
                        className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-medium"
                    >
                        Ir a Mi Perfil
                    </Link>
                    <Link
                        to="/"
                        className="px-6 py-3 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors font-medium"
                    >
                        Volver al Inicio
                    </Link>
                </div>

                {/* Enlace de contacto */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                    <p className="text-sm text-slate-500">
                        ¿Tienes dudas? <a href="/contacto" className="text-primary hover:underline">Contáctanos</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ModuleNotAvailable;
