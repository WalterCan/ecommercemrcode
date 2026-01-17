import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';

/**
 * Página "Nosotros".
 * Comparte la misión, visión y filosofía de la tienda holística.
 */
const About = () => {
    return (
        <div className="min-h-screen bg-paper font-sans">
            <Header />
            <CartDrawer />

            <main>
                {/* Hero Section - Nosotros */}
                <section className="relative py-24 bg-beige-light/50 overflow-hidden">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <span className="text-terracotta font-bold uppercase tracking-[0.3em] text-xs mb-4 block animate-fade-in">Nuestra Esencia</span>
                        <h1 className="text-4xl md:text-6xl font-serif text-slate-800 mb-8 leading-tight">
                            Honramos el equilibrio <br /> <span className="italic text-earth">entre cuerpo y espíritu.</span>
                        </h1>
                    </div>
                    {/* Elementos decorativos abstractos */}
                    <div className="absolute top-0 right-0 opacity-10 -translate-y-1/2 translate-x-1/2">
                        <svg width="600" height="600" viewBox="0 0 200 200">
                            <circle cx="100" cy="100" r="80" stroke="#8B5E3C" strokeWidth="0.5" fill="none" />
                        </svg>
                    </div>
                </section>

                {/* Misión y Visión */}
                <section className="py-20">
                    <div className="container mx-auto px-4">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <div>
                                <div className="aspect-[4/5] bg-beige rounded-3xl overflow-hidden shadow-2xl rotate-1">
                                    <img
                                        src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&q=80&w=800"
                                        alt="Espacio sagrado"
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                            <div className="space-y-8">
                                <div>
                                    <h2 className="text-3xl font-serif text-slate-800 mb-4">Nacimos del Silencio</h2>
                                    <p className="text-slate-600 leading-relaxed text-lg">
                                        Tienda Holística surgió como una respuesta a la necesidad de reconectar con lo esencial.
                                        En un mundo acelerado, creemos que cada rincón de nuestro hogar puede convertirse en un altar de bienestar.
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-8 pt-8">
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-earth mb-3 underline underline-offset-8 decoration-terracotta/30">Propósito</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Facilitar herramientas sagradas para la meditación y el autoconocimiento.
                                        </p>
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-earth mb-3 underline underline-offset-8 decoration-terracotta/30">Pureza</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">
                                            Seleccionamos cada objeto bajo criterios de comercio ético y origen natural.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Valores / Filosofía */}
                <section className="bg-white py-24">
                    <div className="container mx-auto px-4">
                        <div className="max-w-3xl mx-auto text-center mb-16">
                            <h2 className="text-3xl font-serif text-slate-800 mb-6">Nuestros Pilares</h2>
                            <p className="text-slate-500 italic">"Lo que es adentro, es afuera. Lo que es arriba, es abajo."</p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-12">
                            {[
                                { title: "Respeto a la Tierra", desc: "Honramos los ciclos de la naturaleza en cada producto.", icon: "🌱" },
                                { title: "Intención Sagrada", desc: "Cada envío es preparado como un ritual de agradecimiento.", icon: "✨" },
                                { title: "Comunidad", desc: "Creemos en el crecimiento colectivo y la sanación grupal.", icon: "🧘" }
                            ].map((item, i) => (
                                <div key={i} className="text-center p-8 rounded-3xl bg-paper border border-beige-dark/10 hover:shadow-lg transition-all duration-500">
                                    <span className="text-4xl mb-6 block">{item.icon}</span>
                                    <h3 className="text-lg font-bold text-slate-700 mb-3 tracking-wide uppercase text-sm">{item.title}</h3>
                                    <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Intermedio */}
                <section className="bg-earth py-20 relative overflow-hidden">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h2 className="text-3xl font-serif text-white mb-8">¿Listo para comenzar tu ritual?</h2>
                        <Link
                            to="/productos"
                            className="inline-block bg-white text-earth px-10 py-4 rounded-full font-bold hover:bg-paper transition-all shadow-xl"
                        >
                            Ver Colección
                        </Link>
                    </div>
                    {/* Mandala decorativo de fondo */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none scale-150">
                        <svg width="400" height="400" viewBox="0 0 200 200">
                            <path fill="white" d="M100 0 L110 90 L200 100 L110 110 L100 200 L90 110 L0 100 L90 90 Z" />
                        </svg>
                    </div>
                </section>
            </main>

            {/* Footer Minimalista */}
            <footer className="bg-white py-12 border-t border-beige-dark/20 text-center">
                <div className="container mx-auto px-4">
                    <p className="font-serif text-earth text-xl mb-4">TIENDA HOLÍSTICA</p>
                    <p className="text-slate-400 text-sm uppercase tracking-widest text-[10px]">Paz · Equilibrio · Naturaleza</p>
                </div>
            </footer>
        </div>
    );
};

export default About;
