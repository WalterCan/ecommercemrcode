import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils/imageConfig';

/**
 * Header minimalista inspirado en Nutrigo.
 * Logo centrado y barra de búsqueda sutil.
 */
const Header = ({ onSearch }) => {
    const { toggleCart, cartCount } = useCart();
    const { user } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    const [allProducts, setAllProducts] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [activeModules, setActiveModules] = useState([]); // [NEW]
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [settings, setSettings] = useState({
        announcement_active: 'false',
        announcement_text: '',
        announcement_link: '',
        site_logo_url: ''
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const settingsRes = await fetch(`${baseUrl}/settings`);
                const settingsData = await settingsRes.json();
                setSettings(prev => ({ ...prev, ...settingsData }));

                // [NEW] Fetch módulos activos
                const modulesRes = await fetch(`${baseUrl}/modules/active`);
                if (modulesRes.ok) {
                    const modulesData = await modulesRes.json();
                    setActiveModules(modulesData);
                }
            } catch (error) {
                console.error('Error loading settings or modules:', error);
            }
        };
        fetchSettings();
    }, []);

    // Fetch productos para sugerencias (solo si no se han cargado)
    const handleInputFocus = async () => {
        if (allProducts.length === 0) {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const res = await fetch(`${baseUrl}/products`);
                const data = await res.json();
                setAllProducts(data);
            } catch (error) {
                console.error('Error loading search suggestions:', error);
            }
        }
        if (searchTerm.length >= 2) setShowSuggestions(true);
    };

    const handleSearchChange = (val) => {
        setSearchTerm(val);
        if (onSearch) onSearch(val);

        if (val.length >= 2) {
            const filtered = allProducts.filter(p =>
                p.name.toLowerCase().includes(val.toLowerCase())
            ).slice(0, 5); // Máximo 5 sugerencias
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };

    // Cerrar menú móvil al cambiar de ruta
    const closeMobileMenu = () => setMobileMenuOpen(false);

    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-beige-dark/20">
            {/* Barra superior de anuncios */}
            {(settings.announcement_active === 'true' || settings.announcement_active === true) && (
                <div
                    className="text-[10px] py-1 text-center tracking-widest uppercase"
                    style={{
                        backgroundColor: settings.announcement_bg_color || '#8A9A5B',
                        color: settings.announcement_text_color || '#ffffff'
                    }}
                >
                    {settings.announcement_link ? (
                        <Link to={settings.announcement_link} className="hover:underline">
                            {settings.announcement_text}
                        </Link>
                    ) : (
                        settings.announcement_text
                    )}
                </div>
            )}

            <div className="container mx-auto px-4 py-4 flex items-center justify-between relative">

                {/* Botón Hamburguesa (Móvil) */}
                <button
                    className="md:hidden p-2 text-slate-600 hover:text-earth transition-colors focus:outline-none"
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                    )}
                </button>

                {/* Lado izquierdo: Navegación (Escritorio) */}
                <nav className="hidden md:flex items-center gap-8">
                    {/* Links del Sitio Web (Inicio, Nosotros) */}
                    {((activeModules.includes('web') || activeModules.includes('ecommerce')) &&
                        (settings.web_show_home === 'true' || settings.web_show_home === true || user?.role === 'super_admin')) && (
                            <Link to="/" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Inicio</Link>
                        )}

                    {((activeModules.includes('web') || activeModules.includes('ecommerce')) &&
                        (settings.web_show_about === 'true' || settings.web_show_about === true || user?.role === 'super_admin')) && (
                            <Link to="/nosotros" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Nosotros</Link>
                        )}

                    {/* Link Contacto (Nuevo) */}
                    {((activeModules.includes('web') || activeModules.includes('ecommerce')) &&
                        (settings.web_show_contact === 'true' || settings.web_show_contact === true || user?.role === 'super_admin')) && (
                            <Link to="/contacto" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Contacto</Link>
                        )}

                    {/* Links de E-commerce (Productos) */}
                    {(
                        (activeModules.includes('ecommerce') || user?.role === 'super_admin') &&
                        (settings.web_show_products === 'true' || settings.web_show_products === true || user?.role === 'super_admin')
                    ) && (
                            <Link to="/productos" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Productos</Link>
                        )}
                    {(
                        (activeModules.includes('appointments') || user?.role === 'super_admin') &&
                        (settings.web_show_therapies === 'true' || settings.web_show_therapies === true || user?.role === 'super_admin')
                    ) && (
                            <Link to="/terapias" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Terapias</Link>
                        )}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <Link
                            to="/admin"
                            className="text-xs font-bold uppercase tracking-widest text-earth flex items-center gap-1"
                        >
                            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Panel
                        </Link>
                    )}
                </nav>

                {/* Logo Central */}
                <div className="flex-1 flex justify-center md:justify-center absolute left-1/2 transform -translate-x-1/2 md:static md:transform-none md:left-auto">
                    <Link to="/" className="text-2xl font-serif tracking-tighter font-bold flex items-center justify-center">
                        {(settings.site_logo_url && settings.site_logo_url !== 'null' && settings.site_logo_url !== '') ? (
                            <img
                                src={formatImageUrl(settings.site_logo_url)}
                                alt="Logo"
                                className="h-8 md:h-12 w-auto object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center leading-none">
                                <span style={{ color: settings.site_name_color || '#1e293b' }} className="text-lg md:text-2xl">
                                    {settings.site_name || 'TIENDA HOLÍSTICA'}
                                </span>
                                {settings.site_tagline && (
                                    <span
                                        className="text-[8px] md:text-[10px] uppercase tracking-[0.2em] mt-1 font-sans hidden sm:block"
                                        style={{ color: settings.site_tagline_color || '#64748b' }}
                                    >
                                        {settings.site_tagline}
                                    </span>
                                )}
                            </div>
                        )}
                    </Link>
                </div>

                {/* Lado derecho: Búsqueda y Carrito */}
                <div className="flex items-center gap-2 md:gap-4 ml-auto">
                    {(activeModules.includes('ecommerce') || user?.role === 'super_admin') && (
                        <>
                            <div className="relative hidden lg:block">
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={searchTerm}
                                    onFocus={handleInputFocus}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="bg-beige/30 border-none rounded-full px-4 py-1.5 text-sm focus:ring-1 focus:ring-earth/30 w-40 md:w-60"
                                />
                                {/* Dropdown de Sugerencias */}
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-beige-dark/10 overflow-hidden z-[100]">
                                        <div className="py-2">
                                            {suggestions.map(p => (
                                                <Link
                                                    key={p.id}
                                                    to={`/product/${p.id}`}
                                                    className="flex items-center gap-3 px-4 py-2 hover:bg-beige-light/30 transition-colors"
                                                    onClick={() => setShowSuggestions(false)}
                                                >
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden bg-paper flex-shrink-0">
                                                        <img src={formatImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-xs font-bold text-slate-700 truncate">{p.name}</p>
                                                        <p className="text-[10px] text-earth font-bold">${parseFloat(p.price).toLocaleString('es-AR')}</p>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                        <div className="bg-paper p-2 border-t border-beige-dark/5">
                                            <Link to="/productos" className="block text-center text-[10px] font-bold uppercase tracking-widest text-earth hover:underline">Ver todos los productos</Link>
                                        </div>
                                    </div>
                                )}
                            </div>
                            <button
                                onClick={toggleCart}
                                className="relative p-2 text-slate-600 hover:text-earth"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                </svg>
                                {cartCount > 0 && (
                                    <span className="absolute top-1 right-1 bg-terracotta text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </>
                    )}

                    {/* Botón de Cuenta (Icono) */}
                    <Link
                        to={user ? '/perfil' : '/login'}
                        className="p-2 text-slate-600 hover:text-earth transition-colors hidden md:block"
                        title={user ? `Hola, ${user.name || 'Usuario'}` : 'Iniciar Sesión'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </div>
            </div>

            {/* Menú Móvil Fullscreen */}
            <div
                className={`fixed inset-0 z-[50] w-screen h-screen transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-8 !bg-white bg-opacity-100 ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
            >
                {/* Botón Cerrar Menú */}
                <button
                    className="absolute top-6 right-6 p-2 text-slate-600 hover:text-earth transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Search en Móvil */}
                <div className="mb-8">
                    <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={searchTerm}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full bg-beige/30 border-none rounded-xl px-4 py-3 text-lg focus:ring-1 focus:ring-earth/30"
                    />
                    {/* Lista sugerencias móvil */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="mt-2 bg-white rounded-xl shadow-lg border border-beige-dark/10 overflow-hidden">
                            {suggestions.map(p => (
                                <Link
                                    key={p.id}
                                    to={`/product/${p.id}`}
                                    className="flex items-center gap-3 px-4 py-3 border-b border-gray-50 last:border-0"
                                    onClick={() => { setShowSuggestions(false); closeMobileMenu(); }}
                                >
                                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-paper flex-shrink-0">
                                        <img src={formatImageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-700">{p.name}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <nav className="flex flex-col gap-6 text-center">
                    {((activeModules.includes('web') || activeModules.includes('ecommerce')) &&
                        (settings.web_show_home === 'true' || settings.web_show_home === true || user?.role === 'super_admin')) && (
                            <Link to="/" onClick={closeMobileMenu} className="text-xl font-serif font-bold text-slate-700 hover:text-earth">Inicio</Link>
                        )}
                    {((activeModules.includes('web') || activeModules.includes('ecommerce')) &&
                        (settings.web_show_about === 'true' || settings.web_show_about === true || user?.role === 'super_admin')) && (
                            <Link to="/nosotros" onClick={closeMobileMenu} className="text-xl font-serif font-bold text-slate-700 hover:text-earth">Nosotros</Link>
                        )}
                    {((activeModules.includes('web') || activeModules.includes('ecommerce')) &&
                        (settings.web_show_contact === 'true' || settings.web_show_contact === true || user?.role === 'super_admin')) && (
                            <Link to="/contacto" onClick={closeMobileMenu} className="text-xl font-serif font-bold text-slate-700 hover:text-earth">Contacto</Link>
                        )}
                    {(
                        (activeModules.includes('ecommerce') || user?.role === 'super_admin') &&
                        (settings.web_show_products === 'true' || settings.web_show_products === true || user?.role === 'super_admin')
                    ) && (
                            <Link to="/productos" onClick={closeMobileMenu} className="text-xl font-serif font-bold text-slate-700 hover:text-earth">Productos</Link>
                        )}
                    {(
                        (activeModules.includes('appointments') || user?.role === 'super_admin') &&
                        (settings.web_show_therapies === 'true' || settings.web_show_therapies === true || user?.role === 'super_admin')
                    ) && (
                            <Link to="/terapias" onClick={closeMobileMenu} className="text-xl font-serif font-bold text-slate-700 hover:text-earth">Terapias</Link>
                        )}
                    {(user?.role === 'admin' || user?.role === 'super_admin') && (
                        <Link to="/admin" onClick={closeMobileMenu} className="text-xl font-serif font-bold text-earth mt-4">Panel de Administración</Link>
                    )}

                    <div className="w-12 h-0.5 bg-earth/20 mx-auto my-2"></div>

                    <Link to={user ? '/perfil' : '/login'} onClick={closeMobileMenu} className="text-lg font-bold text-slate-500 hover:text-earth">
                        {user ? 'Mi Cuenta' : 'Iniciar Sesión / Registrarse'}
                    </Link>
                </nav>
            </div>

        </header>
    );
};

export default Header;
