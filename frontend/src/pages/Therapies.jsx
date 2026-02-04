import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/layout/Layout';
import { useAuth } from '../context/AuthContext';
import { formatImageUrl } from '../utils/imageConfig';

const Therapies = () => {
    const { user: currentUser } = useAuth();
    const [therapies, setTherapies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModuleActive, setIsModuleActive] = useState(true);

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

                // Verificar módulos activos primero
                const modulesRes = await fetch(`${baseUrl}/modules/active`);
                if (modulesRes.ok) {
                    const activeModules = await modulesRes.json();
                    if (!activeModules.includes('appointments')) {
                        setIsModuleActive(false);
                        // Si NO es super admin, cortamos el flujo aquí
                        if (currentUser?.role !== 'super_admin') {
                            setLoading(false);
                            return;
                        }
                    }
                }

                // Cargar terapias (llega aquí si el módulo está activo O si es super_admin)
                const res = await fetch(`${baseUrl}/therapies`);
                if (res.ok) {
                    const data = await res.json();
                    setTherapies(data);
                }
            } catch (error) {
                console.error('Error fetching therapies or modules:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchContent();
    }, []);

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen flex items-center justify-center bg-paper">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
                </div>
            </Layout>
        );
    }

    if (!isModuleActive && currentUser?.role !== 'super_admin') {
        return (
            <Layout>
                <div className="min-h-screen flex flex-col items-center justify-center bg-paper px-4 text-center">
                    <h2 className="text-4xl font-serif text-earth font-bold mb-4">Sección no disponible</h2>
                    <p className="text-slate-500 mb-8 max-w-md">Lo sentimos, esta sección se encuentra temporalmente desactivada o no forma parte de los servicios actuales.</p>
                    <Link to="/" className="bg-earth text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-earth-dark transition-all">
                        Volver al inicio
                    </Link>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="bg-paper min-h-screen py-20 px-4">
                <div className="container mx-auto max-w-6xl">
                    <div className="text-center mb-16">
                        <h1 className="text-4xl md:text-5xl font-serif text-earth font-bold mb-6">Nuestras Terapias</h1>
                        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
                            Descubre un espacio de bienestar diseñado para tu equilibrio físico, mental y espiritual.
                            Elige la experiencia que mejor se adapte a tu momento.
                        </p>
                    </div>

                    {therapies.length === 0 ? (
                        <div className="text-center py-20 bg-white rounded-[2rem] border border-beige-dark/10 shadow-sm">
                            <p className="text-slate-400">No hay terapias disponibles en este momento.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {therapies.map((therapy) => (
                                <div
                                    key={therapy.id}
                                    className="bg-white rounded-[2rem] border border-beige-dark/10 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col h-full"
                                >
                                    <div className="relative h-48 bg-beige/30 overflow-hidden">
                                        <div className="absolute inset-0 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                                            {therapy.image_url ? (
                                                <img
                                                    src={formatImageUrl(therapy.image_url)}
                                                    alt={therapy.name}
                                                    className="w-full h-full object-contain p-8"
                                                />
                                            ) : (
                                                <span className="text-8xl opacity-20">{therapy.icon || '🧘'}</span>
                                            )}
                                        </div>
                                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm">
                                            <span className="text-xs font-bold text-earth uppercase tracking-widest">{therapy.duration} min</span>
                                        </div>
                                    </div>

                                    <div className="p-8 flex flex-col flex-1">
                                        <div className="mb-4">
                                            <h3 className="text-xl font-serif text-slate-800 font-bold mb-2 group-hover:text-earth transition-colors">
                                                {therapy.name}
                                            </h3>
                                            <div className="h-1 w-10 bg-earth/20 group-hover:w-20 transition-all duration-500 rounded-full"></div>
                                        </div>

                                        <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-1">
                                            {therapy.description || 'Sin descripción disponible.'}
                                        </p>

                                        <div className="pt-6 border-t border-beige-dark/10 flex items-center justify-between">
                                            <span className="text-2xl font-serif text-earth font-bold">
                                                ${parseFloat(therapy.price).toLocaleString('es-AR')}
                                            </span>
                                            <Link
                                                to="/reservar-turno"
                                                className="bg-earth text-white px-6 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-earth-dark hover:scale-105 transition-all shadow-lg shadow-earth/20"
                                            >
                                                Agendar
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Banner de soporte/contacto */}
                    <div className="mt-24 bg-slate-900 rounded-[2.5rem] p-10 md:p-16 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
                            <div className="max-w-xl">
                                <h2 className="text-3xl font-serif font-bold mb-6">¿Dudas sobre qué terapia elegir?</h2>
                                <p className="text-slate-400 text-lg">
                                    Nuestros profesionales están disponibles para orientarte y ayudarte a encontrar el tratamiento ideal para tus necesidades.
                                </p>
                            </div>
                            <div className="shrink-0">
                                <a
                                    href="https://wa.me/5491122334455"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-full font-bold uppercase tracking-widest hover:bg-beige transition-all group shadow-xl"
                                >
                                    <span>Contactar por WhatsApp</span>
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="group-hover:translate-x-1 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </a>
                            </div>
                        </div>
                        {/* Círculos decorativos */}
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-earth/10 rounded-full blur-3xl"></div>
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-earth/10 rounded-full blur-3xl"></div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default Therapies;
