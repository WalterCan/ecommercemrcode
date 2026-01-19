import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils/imageConfig';

const Footer = () => {
    const [settings, setSettings] = useState({
        social_instagram: '',
        social_facebook: '',
        site_logo_url: '',
        footer_bg_color: '',
        footer_border_color: '',
        footer_text_color: '',
        footer_description: '',
        footer_title_color: '',
        footer_tagline: '',
        footer_tagline_color: '',
        footer_copyright_color: '',
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const res = await fetch(`${baseUrl}/settings`);
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error('Error loading settings:', error);
            }
        };
        fetchSettings();
    }, []);

    return (
        <footer
            className="border-t pt-16 pb-8 mt-auto relative z-10 w-full transition-colors duration-300"
            style={{
                backgroundColor: settings.footer_bg_color || 'var(--color-bg-secondary)',
                borderColor: settings.footer_border_color || 'var(--color-primary)22'
            }}
        >
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
                    {/* Columna 1: Marca y Redes */}
                    <div className="space-y-6">
                        <Link to="/" className="text-2xl font-serif text-earth-dark tracking-tighter font-bold block">
                            {(settings.site_logo_url && settings.site_logo_url !== 'null') ? (
                                <img
                                    src={formatImageUrl(settings.site_logo_url)}
                                    alt="Logo"
                                    className="h-12 w-auto object-contain"
                                />
                            ) : (
                                <span style={{ color: settings.site_name_color || 'inherit' }}>
                                    {settings.site_name || <>TIENDA<span className="text-earth">HOLÍSTICA</span></>}
                                </span>
                            )}
                        </Link>
                        <p
                            className="text-sm leading-relaxed max-w-xs"
                            style={{ color: settings.footer_text_color || '#475569' }}
                        >
                            {settings.footer_description || 'Productos seleccionados para tu bienestar y equilibrio energético.'}
                        </p>
                        <div className="flex items-center gap-4">
                            {settings.social_instagram && (
                                <a
                                    href={settings.social_instagram}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full transition-all"
                                    style={{
                                        backgroundColor: (settings.theme_primary_color || '#8A9A5B') + '1A',
                                        color: settings.theme_primary_color || '#8A9A5B'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = settings.theme_primary_color || '#8A9A5B';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = (settings.theme_primary_color || '#8A9A5B') + '1A';
                                        e.currentTarget.style.color = settings.theme_primary_color || '#8A9A5B';
                                    }}
                                >
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                                </a>
                            )}
                            {settings.social_facebook && (
                                <a
                                    href={settings.social_facebook}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-2 rounded-full transition-all"
                                    style={{
                                        backgroundColor: (settings.theme_primary_color || '#8A9A5B') + '1A',
                                        color: settings.theme_primary_color || '#8A9A5B'
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = settings.theme_primary_color || '#8A9A5B';
                                        e.currentTarget.style.color = 'white';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = (settings.theme_primary_color || '#8A9A5B') + '1A';
                                        e.currentTarget.style.color = settings.theme_primary_color || '#8A9A5B';
                                    }}
                                >
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" /></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Columna 2: Enlaces */}
                    <div>
                        <h4
                            className="font-bold text-sm uppercase tracking-widest mb-6"
                            style={{ color: settings.footer_title_color || '#8A9A5B' }}
                        >
                            Navegación
                        </h4>
                        <ul className="space-y-4">
                            <li>
                                <Link
                                    to="/productos"
                                    className="text-sm hover:underline transition-colors"
                                    style={{ color: settings.footer_text_color || '#475569' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = settings.theme_primary_color || '#8A9A5B'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = settings.footer_text_color || '#475569'}
                                >
                                    Productos
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/nosotros"
                                    className="text-sm hover:underline transition-colors"
                                    style={{ color: settings.footer_text_color || '#475569' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = settings.theme_primary_color || '#8A9A5B'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = settings.footer_text_color || '#475569'}
                                >
                                    Nosotros
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/contacto"
                                    className="text-sm hover:underline transition-colors"
                                    style={{ color: settings.footer_text_color || '#475569' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = settings.theme_primary_color || '#8A9A5B'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = settings.footer_text_color || '#475569'}
                                >
                                    Contacto
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/terminos"
                                    className="text-sm hover:underline transition-colors"
                                    style={{ color: settings.footer_text_color || '#475569' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = settings.theme_primary_color || '#8A9A5B'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = settings.footer_text_color || '#475569'}
                                >
                                    Términos y Condiciones
                                </Link>
                            </li>
                            <li>
                                <Link
                                    to="/privacidad"
                                    className="text-sm hover:underline transition-colors"
                                    style={{ color: settings.footer_text_color || '#475569' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = settings.theme_primary_color || '#8A9A5B'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = settings.footer_text_color || '#475569'}
                                >
                                    Política de Privacidad
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Columna 3: Desarrollador */}
                    <div>
                        <h4
                            className="font-bold text-sm uppercase tracking-widest mb-6"
                            style={{ color: settings.footer_title_color || '#8A9A5B' }}
                        >
                            Desarrollo
                        </h4>
                        <div className="flex items-center gap-4">
                            <p
                                className="text-sm"
                                style={{ color: settings.footer_text_color || '#475569' }}
                            >
                                Desarrollado por
                            </p>
                            <a
                                href="https://www.mrcode.com.ar/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:opacity-80 transition-opacity"
                            >
                                <img
                                    src="/images/logo-no-background.svg"
                                    alt="Mr Code Web Design"
                                    className="h-8 w-auto object-contain"
                                />
                            </a>
                        </div>
                    </div>
                </div>

                <div
                    className="border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-widest"
                    style={{ borderColor: settings.footer_border_color || '#E5E7EB' }}
                >
                    <p style={{ color: settings.footer_copyright_color || '#94a3b8' }}>
                        &copy; {new Date().getFullYear()} {settings.site_name || 'Tienda Holística'}. Todos los derechos reservados.
                    </p>
                    <p style={{ color: settings.footer_tagline_color || '#94a3b8' }}>
                        {settings.footer_tagline || 'Inspirando tu equilibrio natural'}
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
