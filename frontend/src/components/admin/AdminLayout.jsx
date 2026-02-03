import React, { useState, useEffect } from 'react';
import { formatImageUrl } from '../../utils/imageConfig';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * Layout unificado para la administración.
 * Proporciona Sidebar y Header consistentes.
 */
const AdminLayout = ({ children, title, actions }) => {
    const { logout, user } = useAuth();
    const location = useLocation();
    const [settings, setSettings] = useState({ site_logo_url: '', site_name: '' });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const res = await fetch(`${baseUrl}/settings`);
                const data = await res.json();
                setSettings(prev => ({ ...prev, ...data }));
            } catch (error) {
                console.error("Error fetching settings in AdminLayout", error);
            }
        };
        fetchSettings();
    }, []);

    const menuItems = [
        {
            path: '/admin',
            label: 'Dashboard',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
        },
        {
            path: '/admin/apps',
            label: 'Aplicaciones',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM18 10V6a2 2 0 00-2-2H4a2 2 0 00-2 2v10a2 2 0 002 2h4m10-12a2 2 0 012 2v10a2 2 0 01-2 2h-8a2 2 0 01-2-2v-3a2 2 0 012-2h3V8a2 2 0 012-2h3z" /></svg>
        },
        {
            module: 'ecommerce',
            path: '/admin/products',
            label: 'Productos',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
        },
        {
            module: 'appointments',
            path: '/admin/agenda',
            label: 'Agenda',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
        },
        {
            module: 'appointments',
            path: '/admin/turnos/historial',
            label: 'Historial',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
        },
        {
            module: 'appointments',
            path: '/admin/therapies',
            label: 'Mis Terapias',
            icon: <span style={{ fontSize: '18px' }}>🧘</span>
        },
        {
            module: 'appointments',
            path: '/admin/availability',
            label: 'Disponibilidad',
            icon: <span style={{ fontSize: '18px' }}>🕐</span>
        },
        {
            module: 'patients',
            path: '/admin/pacientes',
            label: 'Pacientes',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
        },
        {
            module: 'patients',
            path: '/admin/pacientes/ingresos',
            label: 'Ingresos Terapias',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            module: 'ecommerce',
            path: '/admin/categories',
            label: 'Categorías',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
        },
        {
            module: 'ecommerce',
            path: '/admin/orders',
            label: 'Pedidos',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        },
        {
            module: 'ecommerce',
            path: '/admin/coupons',
            label: 'Cupones',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
        },
        {
            module: 'reviews',
            path: '/admin/reviews',
            label: 'Reseñas',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
        },
        {
            module: 'whatsapp',
            path: '/admin/whatsapp',
            label: 'WhatsApp',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
        },
        {
            module: 'reports',
            path: '/admin/reports',
            label: 'Reportes',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        },
        {
            module: 'settings',
            path: '/admin/settings',
            label: 'Ajustes',
            icon: <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        }
    ];

    // Filtrar items según módulos del usuario o si es Super Admin
    const filteredMenuItems = menuItems.filter(item => {
        // Super Admin siempre tiene acceso a todo
        if (user?.role === 'super_admin') return true;

        // Dashboard es visible para todos los que entren al panel admin
        if (!item.module) return true;

        // Para otros ítems, verificar si el módulo está habilitado para el usuario
        return user?.modules?.some(m => m.code === item.module);
    });

    // Determinar item activo por coincidencia más larga (para evitar solapamiento Pacientes vs Pacientes/Ingresos)
    const activePath = filteredMenuItems.reduce((best, item) => {
        if (location.pathname.startsWith(item.path)) {
            if (item.path.length > best.length) {
                return item.path;
            }
        }
        return best;
    }, '');

    return (
        <div className="flex h-screen bg-paper font-sans overflow-hidden">
            {/* Sidebar Admin */}
            <aside className="w-64 bg-white border-r border-beige-dark/20 flex flex-col shrink-0">
                <div className="p-8 border-b border-beige-dark/10">
                    <Link to="/" className="flex items-center gap-2">
                        {(settings.site_logo_url && settings.site_logo_url !== 'null') ? (
                            <img
                                src={formatImageUrl(settings.site_logo_url)}
                                alt="Logo"
                                className="h-8 w-auto object-contain"
                            />
                        ) : (
                            <span className="text-xl font-serif text-earth font-bold">
                                {settings.site_name || 'HOLÍSTICA'}
                            </span>
                        )}
                        <span className="text-slate-400 font-sans text-[10px] tracking-widest uppercase italic pt-1">Admin</span>
                    </Link>
                </div>

                <nav className="flex-1 p-6 space-y-2 overflow-y-auto">
                    {filteredMenuItems.map((item) => {
                        const isActive = item.path === activePath;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm ${isActive
                                    ? 'bg-beige-light text-earth font-bold shadow-sm'
                                    : 'text-slate-500 hover:bg-beige-light/50 hover:text-earth'
                                    }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}

                    {/* Menú exclusivo para Super Admin */}
                    {user?.role === 'super_admin' && (
                        <>
                            <Link
                                to="/super-admin/users"
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm ${location.pathname === '/super-admin/users'
                                    ? 'bg-purple-100 text-purple-700 font-bold shadow-sm'
                                    : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-200/50'
                                    }`}
                            >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                                👑 Gestión Usuarios
                            </Link>
                            <Link
                                to="/admin/audit"
                                className={`flex items-center gap-3 p-3 rounded-xl transition-all text-sm ${location.pathname === '/admin/audit'
                                    ? 'bg-purple-100 text-purple-700 font-bold shadow-sm'
                                    : 'text-purple-600 hover:bg-purple-50 hover:text-purple-700 border border-purple-200/50'
                                    }`}
                            >
                                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                🛡️ Auditoría
                            </Link>
                        </>
                    )}
                </nav>

                <div className="p-6 border-t border-beige-dark/10">
                    <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full p-3 rounded-xl text-terracotta hover:bg-terracotta/5 transition-all text-sm font-bold"
                    >
                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col overflow-hidden">
                <header className="h-20 bg-white border-b border-beige-dark/10 px-10 flex items-center justify-between sticky top-0 z-10 shrink-0">
                    <h2 className="text-xl font-serif text-slate-800">{title}</h2>

                    <div className="flex items-center gap-6">
                        {actions}

                        <div className="h-8 w-px bg-beige-dark/20"></div>

                        <Link to="/perfil" className="flex items-center gap-4 hover:bg-beige/50 p-2 rounded-lg transition-colors group">
                            <div className="flex flex-col items-end">
                                <span className="text-xs font-bold text-slate-700 group-hover:text-earth transition-colors">{user?.email || 'Admin'}</span>
                                <span className="text-[10px] uppercase text-moss font-bold tracking-widest">Conectado</span>
                            </div>
                            <div className="w-10 h-10 bg-beige rounded-full flex items-center justify-center text-earth font-serif font-bold border border-beige-dark/20 group-hover:bg-earth group-hover:text-white transition-all">
                                {user?.email ? user.email[0].toUpperCase() : 'A'}
                            </div>
                        </Link>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto bg-paper/30 custom-scrollbar">
                    {children}
                </div>
            </main>
        </div >
    );
};

export default AdminLayout;
