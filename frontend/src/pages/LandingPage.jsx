import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const LandingPage = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-paper flex flex-col items-center justify-center relative overflow-hidden px-4">
            {/* Elementos decorativos de fondo */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-earth/5 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-terracotta/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }}></div>

            <main className="relative z-10 max-w-3xl text-center">
                {/* Logo o Icono Simbólico */}
                <div className="mb-12 inline-block">
                    <div className="w-24 h-24 rounded-[2rem] bg-white shadow-2xl shadow-earth/10 flex items-center justify-center border border-beige-dark/10 transform hover:rotate-12 transition-transform duration-500">
                        <span className="text-4xl">✨</span>
                    </div>
                </div>

                {/* Título Principal con tipografía elegante */}
                <h1 className="text-5xl md:text-7xl font-serif text-slate-900 font-bold mb-8 leading-tight">
                    Estamos preparando <br />
                    <span className="text-earth italic">algo especial para ti</span>
                </h1>

                {/* Mensaje de Estado */}
                <p className="text-xl text-slate-500 mb-12 max-w-xl mx-auto leading-relaxed">
                    Nuestra plataforma se encuentra en mantenimiento para ofrecerte una mejor experiencia.
                    Volveremos a estar en línea muy pronto.
                </p>

                {/* Acciones */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                    {(user?.role === 'admin' || user?.role === 'super_admin') ? (
                        <Link
                            to="/admin"
                            className="bg-slate-900 text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-slate-800 transition-all shadow-xl hover:scale-105"
                        >
                            Acceder al Panel de Control
                        </Link>
                    ) : (
                        <Link
                            to="/login"
                            className="bg-earth text-white px-10 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-earth-dark transition-all shadow-xl hover:scale-105"
                        >
                            Iniciar Sesión
                        </Link>
                    )}

                    <a
                        href="https://wa.me/5493412763219"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-slate-600 font-bold uppercase tracking-widest text-xs hover:text-earth transition-colors flex items-center gap-2"
                    >
                        Soporte Técnico WhatsApp
                        <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12.004 2c-5.523 0-10 4.477-10 10a9.957 9.957 0 001.531 5.318L2 22l4.809-1.503A9.956 9.956 0 0012.004 22c5.523 0 10-4.477 10-10s-4.477-10-10-10zm0 18.283c-1.802 0-3.56-.474-5.086-1.373l-.364-.215-2.825.882.897-2.753-.236-.375a8.219 8.219 0 01-1.264-4.449c0-4.544 3.7-8.244 8.244-8.244 4.544 0 8.244 3.7 8.244 8.244-.001 4.545-3.701 8.282-8.244 8.282z" />
                        </svg>
                    </a>
                </div>
            </main>
        </div>
    );
};

export default LandingPage;
