import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';
import { formatImageUrl } from '../utils/imageConfig';
import { useAuth } from '../context/AuthContext';

/**
 * Página "Nosotros" Dinámica con protección de módulos.
 */
const About = () => {
    const { user } = useAuth();
    const [isModuleActive, setIsModuleActive] = useState(true);
    const [settings, setSettings] = useState({
        about_hero_tagline: 'Nuestra Esencia',
        about_hero_title: 'Honramos el equilibrio entre cuerpo y espíritu.',
        about_mission_image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800',
        about_mission_title: 'Nacimos del Silencio',
        about_mission_text: 'Tienda Holística surgió como una respuesta a la necesidad de reconectar con lo esencial.',
        about_prop_1_title: 'Propósito',
        about_prop_1_text: 'Facilitar herramientas sagradas para la meditación y el autoconocimiento.',
        about_prop_2_title: 'Pureza',
        about_prop_2_text: 'Seleccionamos cada objeto bajo criterios de comercio ético y origen natural.',
        about_values_title: 'Nuestros Pilares',
        about_values_subtitle: '"Lo que es adentro, es afuera. Lo que es arriba, es abajo."',
        about_value_1_title: 'Respeto a la Tierra',
        about_value_1_text: 'Honramos los ciclos de la naturaleza en cada producto.',
        about_value_1_icon: '🌱',
        about_value_2_title: 'Intención Sagrada',
        about_value_2_text: 'Cada envío es preparado como un ritual de agradecimiento.',
        about_value_2_icon: '✨',
        about_value_3_title: 'Comunidad',
        about_value_3_text: 'Creemos en el crecimiento colectivo y la sanación grupal.',
        about_value_3_icon: '🧘',
        about_cta_title: '¿Listo para comenzar tu ritual?',
        about_cta_button_text: 'Ver Colección',
        about_cta_button_link: '/productos'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

                // Verificar módulos activos primero
                const modulesRes = await fetch(`${baseUrl}/modules/active`);
                if (modulesRes.ok) {
                    const activeModules = await modulesRes.json();
                    if (!activeModules.includes('ecommerce')) {
                        setIsModuleActive(false);
                    }
                }

                const res = await fetch(`${baseUrl}/settings`);
                if (res.ok) {
                    const data = await res.json();
                    setSettings(prev => ({ ...prev, ...data }));
                }
            } catch (error) {
                console.error('Error loading about data:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
            </div>
        );
    }

    if (!isModuleActive && user?.role !== 'super_admin') {
        return (
            <div className="bg-paper min-h-screen">
                <Header />
                <main className="py-40 text-center px-4">
                    <h2 className="text-4xl font-serif text-earth font-bold mb-4">Sección no disponible</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Lo sentimos, esta sección se encuentra temporalmente desactivada.</p>
                    <Link to="/" className="bg-earth text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-earth-dark transition-all">
                        Volver al inicio
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper font-sans">
            <Header />
            <CartDrawer />

            <main>
                <section className="relative py-24 bg-beige-light/50 overflow-hidden">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <span className="text-terracotta font-bold uppercase tracking-[0.3em] text-xs mb-4 block" style={{ color: settings.about_hero_tagline_color || 'var(--color-terracotta)' }}>
                            {settings.about_hero_tagline}
                        </span>
                        <h1 className="text-4xl md:text-6xl font-serif text-slate-800 mb-8 leading-tight max-w-4xl mx-auto" style={{ color: settings.about_hero_title_color || 'var(--color-text-primary)' }}>
                            {settings.about_hero_title}
                        </h1>
                    </div>
                </section>

                <section className="py-20 text-text-primary">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="aspect-[4/5] bg-beige rounded-3xl overflow-hidden shadow-2xl rotate-1">
                                    <img src={formatImageUrl(settings.about_mission_image_url)} alt={settings.about_mission_title} className="w-full h-full object-cover" />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-serif text-slate-800 mb-4" style={{ color: settings.about_mission_title_color || 'var(--color-text-primary)' }}>{settings.about_mission_title}</h2>
                                    <p className="text-slate-600 leading-relaxed text-lg italic whitespace-pre-wrap" style={{ color: settings.about_mission_text_color || 'var(--color-text-secondary)' }}>{settings.about_mission_text}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-8">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-earth mb-3 underline underline-offset-8 decoration-terracotta/30">{settings.about_prop_1_title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{settings.about_prop_1_text}</p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-earth mb-3 underline underline-offset-8 decoration-terracotta/30">{settings.about_prop_2_title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{settings.about_prop_2_text}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <h2 className="text-3xl font-serif text-slate-800 mb-6" style={{ color: settings.about_values_title_color || 'var(--color-text-primary)' }}>{settings.about_values_title}</h2>
                            <p className="text-slate-500 italic" style={{ color: settings.about_values_subtitle_color || 'var(--color-text-secondary)' }}>{settings.about_values_subtitle}</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { title: settings.about_value_1_title, desc: settings.about_value_1_text, icon: settings.about_value_1_icon, imageUrl: settings.about_value_1_image_url },
                                { title: settings.about_value_2_title, desc: settings.about_value_2_text, icon: settings.about_value_2_icon, imageUrl: settings.about_value_2_image_url },
                                { title: settings.about_value_3_title, desc: settings.about_value_3_text, icon: settings.about_value_3_icon, imageUrl: settings.about_value_3_image_url }
                            ].map((item, i) => (
                                <div key={i} className="text-center p-8 rounded-3xl bg-paper border border-beige-dark/10 hover:shadow-lg transition-all duration-500">
                                    <div className="h-16 mb-6 flex items-center justify-center">
                                        {item.imageUrl ? <img src={formatImageUrl(item.imageUrl)} alt={item.title} className="h-full object-contain" /> : <span className="text-4xl block">{item.icon}</span>}
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-700 mb-3 tracking-wide uppercase text-sm">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="bg-earth py-20 relative overflow-hidden">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl font-serif text-white mb-8" style={{ color: settings.about_cta_title_color || '#ffffff' }}>{settings.about_cta_title}</h2>
                        <Link to={settings.about_cta_button_link} className="inline-block bg-white text-earth px-10 py-4 rounded-full font-bold hover:bg-paper transition-all shadow-xl">{settings.about_cta_button_text}</Link>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default About;
