import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

const AdminModulesMarketplace = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [modules, setModules] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchModules();
    }, []);

    const fetchModules = async () => {
        try {
            const token = localStorage.getItem('token');
            // Usar /api directamente para aprovechar el proxy de Vite y evitar problemas de CORS/Puertos
            const baseUrl = import.meta.env.VITE_API_URL || '/api';
            const response = await fetch(`${baseUrl}/modules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();

            if (response.ok) {
                setModules(data);
            } else {
                console.error('API Error:', data.error || response.statusText);
                showToast(data.message || 'No tienes permisos para ver el catálogo', 'error');
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
            showToast('Error de conexión con el servidor', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleRequestModule = (moduleName) => {
        const message = `Hola! Me gustaría solicitar información sobre el módulo: ${moduleName}`;
        const whatsappUrl = `https://wa.me/5491122334455?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    // Verificar si el módulo está habilitado para el usuario actual
    const isModuleEnabled = (moduleCode) => {
        if (user?.role === 'super_admin') return true;
        return user?.modules?.some(m => m.code === moduleCode);
    };

    return (
        <AdminLayout title="Aplicaciones Disponibles">
            <div className="p-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-12 text-center">
                    <h2 className="text-3xl font-serif text-earth font-bold mb-4">Marketplace de Funcionalidades</h2>
                    <p className="text-slate-500 max-w-2xl mx-auto">
                        Explora y potencia tu plataforma con módulos adicionales diseñados para optimizar tu gestión.
                        Activa herramientas de salud, comercio o gestión avanzada en un solo lugar.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {modules.map((mod) => {
                            const enabled = isModuleEnabled(mod.code);
                            return (
                                <div
                                    key={mod.id}
                                    className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden hover:shadow-xl hover:translate-y-[-4px] transition-all duration-300 flex flex-col"
                                >
                                    <div className="p-8 flex-1">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-16 h-16 bg-beige rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-beige-dark/5">
                                                {mod.icon || '📦'}
                                            </div>
                                            {enabled ? (
                                                <span className="bg-green-100 text-green-700 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-green-200">
                                                    Instalado
                                                </span>
                                            ) : (
                                                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold uppercase px-3 py-1 rounded-full border border-slate-200">
                                                    Disponible
                                                </span>
                                            )}
                                        </div>

                                        <h3 className="text-xl font-serif font-bold text-slate-800 mb-3">{mod.name}</h3>
                                        <p className="text-sm text-slate-500 leading-relaxed mb-6">
                                            {mod.description || 'Optimiza tu flujo de trabajo con esta herramienta integrada.'}
                                        </p>
                                    </div>

                                    <div className="px-8 py-6 bg-paper/50 border-t border-beige-dark/5 flex items-center justify-between">
                                        {enabled ? (
                                            <button
                                                className="text-earth font-bold text-sm flex items-center gap-2 opacity-60 cursor-default"
                                                disabled
                                            >
                                                <span>✅</span> Ya incorporado
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => handleRequestModule(mod.name)}
                                                className="bg-earth hover:bg-earth-dark text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg shadow-earth/20 transition-all flex items-center gap-2"
                                            >
                                                Solicitar
                                            </button>
                                        )}
                                        <button className="text-slate-400 hover:text-earth transition-colors">
                                            <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}

                        {/* Card para "Sugerir nuevo" */}
                        <div className="bg-earth/5 rounded-3xl border-2 border-dashed border-earth/20 p-8 flex flex-col items-center justify-center text-center group hover:border-earth/40 transition-all">
                            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl mb-6 shadow-sm group-hover:scale-110 transition-transform">
                                💡
                            </div>
                            <h3 className="text-xl font-serif font-bold text-earth mb-3">¿Necesitas algo más?</h3>
                            <p className="text-sm text-earth/60 mb-6">
                                Desarrollamos módulos a medida según tus necesidades específicas.
                            </p>
                            <button
                                onClick={() => handleRequestModule('Nuevo Módulo Personalizado')}
                                className="text-earth font-bold text-sm border-b-2 border-earth/20 hover:border-earth transition-all"
                            >
                                Sugerir funcionalidad
                            </button>
                        </div>
                    </div>
                )}

                {/* Footer Banner */}
                <div className="mt-20 bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-serif font-bold mb-6">Potencia tu negocio con nuestra tecnología modular</h2>
                            <p className="text-slate-400 text-lg">
                                Si buscas una integración específica o un flujo de trabajo personalizado, nuestro equipo está listo para construirlo por ti.
                            </p>
                        </div>
                        <button
                            onClick={() => handleRequestModule('Consulta General Marketplace')}
                            className="bg-white text-slate-900 px-10 py-5 rounded-3xl font-bold hover:bg-earth hover:text-white transition-all transform hover:scale-105"
                        >
                            Hablar con Soporte
                        </button>
                    </div>
                    {/* Decorative elements */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-earth opacity-10 rounded-full -mr-32 -mt-32"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-moss opacity-10 rounded-full -ml-24 -mb-24"></div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminModulesMarketplace;
