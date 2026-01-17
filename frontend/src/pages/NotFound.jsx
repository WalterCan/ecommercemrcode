import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

/**
 * Página 404 - No Encontrado
 * Diseño holístico con navegación útil
 */
const NotFound = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-beige-light to-paper px-4 py-20">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Icono decorativo */}
                    <div className="mb-8">
                        <svg
                            className="w-32 h-32 mx-auto text-earth opacity-30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                    </div>

                    {/* Título */}
                    <h1 className="text-6xl font-serif text-earth-dark mb-4">404</h1>
                    <h2 className="text-3xl font-serif text-earth mb-6">
                        Esta energía no se encuentra
                    </h2>

                    {/* Mensaje */}
                    <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                        Parece que la página que buscas se ha desvanecido en el éter.
                        No te preocupes, podemos ayudarte a encontrar tu camino de regreso.
                    </p>

                    {/* Botones de navegación */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link
                            to="/"
                            className="inline-block bg-earth hover:bg-earth-dark text-white px-8 py-3 rounded-lg transition-colors duration-300 font-medium"
                        >
                            🏠 Volver al Inicio
                        </Link>
                        <Link
                            to="/productos"
                            className="inline-block bg-white hover:bg-beige-light text-earth border-2 border-earth px-8 py-3 rounded-lg transition-colors duration-300 font-medium"
                        >
                            🛍️ Ver Productos
                        </Link>
                    </div>

                    {/* Enlaces adicionales */}
                    <div className="mt-12 pt-8 border-t border-slate-200">
                        <p className="text-slate-500 mb-4">También puedes explorar:</p>
                        <div className="flex flex-wrap justify-center gap-4 text-sm">
                            <Link to="/nosotros" className="text-earth hover:text-earth-dark underline">
                                Sobre Nosotros
                            </Link>
                            <span className="text-slate-300">•</span>
                            <Link to="/productos" className="text-earth hover:text-earth-dark underline">
                                Catálogo
                            </Link>
                            <span className="text-slate-300">•</span>
                            <Link to="/perfil" className="text-earth hover:text-earth-dark underline">
                                Mi Cuenta
                            </Link>
                        </div>
                    </div>

                    {/* Mensaje inspirador */}
                    <p className="mt-8 text-slate-400 italic font-serif">
                        "No todo lo que se pierde está perdido" 🌿
                    </p>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default NotFound;
