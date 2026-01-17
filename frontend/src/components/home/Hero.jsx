import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils/imageConfig';

/**
 * Hero section dinámica.
 * Carga su contenido desde los Ajustes de la tienda.
 */
const Hero = () => {
    const [heroSettings, setHeroSettings] = useState({
        hero_title: 'Conecta con tu esencia natural y bienestar',
        hero_subtitle: 'Descubre nuestra selección artesanal de productos para la meditación, limpieza energética y aromaterapia.',
        hero_image_url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=2000',
        hero_cta_text: 'Ver Catálogo',
        hero_cta1_link: '/productos',
        hero_cta2_text: 'Sobre Nosotros',
        hero_cta2_link: '/nosotros'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchHeroSettings = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const res = await fetch(`${baseUrl}/settings`);
                const data = await res.json();

                // Extraer solo lo necesario para el hero
                const settingsObj = {};
                Object.keys(data).forEach(key => {
                    if (key.startsWith('hero_')) {
                        settingsObj[key] = data[key];
                    }
                });

                if (Object.keys(settingsObj).length > 0) {
                    setHeroSettings(prev => ({ ...prev, ...settingsObj }));
                }
            } catch (error) {
                console.error('Error fetching hero settings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchHeroSettings();
    }, []);

    if (loading) return <div className="h-[80vh] bg-paper flex items-center justify-center animate-pulse">Cargando vibraciones...</div>;

    return (
        <section className="relative h-[80vh] overflow-hidden">
            {/* Background Image Overlay */}
            <div className="absolute inset-0 z-0">
                <img
                    src={formatImageUrl(heroSettings.hero_image_url)}
                    alt="Bienestar Holístico"
                    className="w-full h-full object-cover transition-opacity duration-1000"
                />
                <div className="absolute inset-0 bg-black/10"></div>
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-4 h-full flex flex-col justify-center items-start">
                <div className="max-w-2xl bg-white/20 backdrop-blur-sm p-8 md:p-12 rounded-2xl border border-white/30 animate-fade-in">
                    <span className="text-moss font-medium tracking-widest uppercase text-sm mb-4 block">
                        Bienvenido a tu Espacio Sagrado
                    </span>
                    <h2 className="text-4xl md:text-6xl text-slate-900 font-serif leading-tight mb-6">
                        {heroSettings.hero_title}
                    </h2>
                    <p className="text-lg text-slate-700 mb-8 max-w-md">
                        {heroSettings.hero_subtitle}
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <Link
                            to={heroSettings.hero_cta1_link || '/productos'}
                            className="bg-earth hover:bg-earth-dark text-white px-8 py-3 rounded-full shadow-lg shadow-earth/20 font-medium transition-all hover:scale-105 active:scale-95"
                        >
                            {heroSettings.hero_cta_text}
                        </Link>
                        {heroSettings.hero_cta2_text && (
                            <Link
                                to={heroSettings.hero_cta2_link || '/nosotros'}
                                className="bg-white/80 hover:bg-white text-earth border border-earth/20 px-8 py-3 rounded-full font-medium transition-all hover:scale-105"
                            >
                                {heroSettings.hero_cta2_text}
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Onda decorativa inferior */}
            <div className="absolute bottom-0 w-full overflow-hidden leading-[0] transform rotate-180">
                <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative block w-full h-16 fill-paper">
                    <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
                </svg>
            </div>
        </section>
    );
};

export default Hero;
