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

            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                {/* Lado izquierdo: Navegación */}
                <nav className="flex items-center gap-8">
                    <Link to="/" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Inicio</Link>
                    <Link to="/productos" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Productos</Link>
                    <Link to="/nosotros" className="text-xs font-bold uppercase tracking-widest text-slate-600 hover:text-earth transition-colors">Nosotros</Link>
                    {activeModules.includes('appointments') && (
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

                <div className="flex-1 flex justify-center">
                    <Link to="/" className="text-2xl font-serif tracking-tighter font-bold flex items-center justify-center">
                        {(settings.site_logo_url && settings.site_logo_url !== 'null' && settings.site_logo_url !== '') ? (
                            <img
                                src={formatImageUrl(settings.site_logo_url)}
                                alt="Logo"
                                className="h-10 md:h-12 w-auto object-contain"
                            />
                        ) : (
                            <div className="flex flex-col items-center leading-none">
                                <span style={{ color: settings.site_name_color || '#1e293b' }}>
                                    {settings.site_name || 'TIENDA HOLÍSTICA'}
                                </span>
                                {settings.site_tagline && (
                                    <span
                                        className="text-[10px] uppercase tracking-[0.2em] mt-1 font-sans"
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
                <div className="flex items-center gap-4">
                    <div className="relative hidden sm:block">
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

                    {/* Botón de Mis Turnos (Solo Logueados) */}
                    {user && activeModules.includes('appointments') && (
                        <Link
                            to="/mis-turnos"
                            className="p-2 text-slate-600 hover:text-earth transition-colors"
                            title="Mis Turnos"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        </Link>
                    )}

                    {/* Botón de Cuenta */}
                    <Link
                        to={user ? '/perfil' : '/login'}
                        className="p-2 text-slate-600 hover:text-earth transition-colors"
                        title={user ? `Hola, ${user.name || 'Usuario'}` : 'Iniciar Sesión'}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
