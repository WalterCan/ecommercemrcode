import React, { useState } from 'react';
import Layout from '../components/layout/Layout';
import SEO from '../components/common/SEO';
import { useToast } from '../context/ToastContext';
import { useSettings } from '../context/SettingsContext';

const Contact = () => {
    const { showToast } = useToast();
    const { settings } = useSettings();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const res = await fetch(`${baseUrl}/contact`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (res.ok) {
                showToast('Mensaje enviado con éxito. Te responderemos pronto.', 'success');
                setFormData({ name: '', email: '', subject: '', message: '' });
            } else {
                showToast(data.error || 'Error al enviar el mensaje', 'error');
            }
        } catch (error) {
            console.error('Error sending contact message:', error);
            showToast('Error de conexión. Inténtalo más tarde.', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Layout>
            <SEO title="Contacto" description={settings.site_tagline || "Estamos aquí para escucharte."} />

            <main className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto">

                        {/* Header Section */}
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-serif text-slate-900 mb-6">
                                {settings.contact_title || 'Estamos aquí para ti'}
                            </h1>
                            <div className="h-px w-24 bg-earth mx-auto mb-6 opacity-60"></div>
                            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
                                {settings.contact_subtitle || 'Si tienes alguna duda sobre nuestros productos, terapias o simplemente quieres saludar, escríbenos. Nuestra energía está enfocada en responderte.'}
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20">
                            {/* Contact Form */}
                            <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100">
                                <h3 className="text-2xl font-serif text-earth mb-8">Envíanos un mensaje</h3>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Nombre</label>
                                            <input
                                                type="text"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/50 transition-all font-medium"
                                                placeholder="Tu nombre"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Email</label>
                                            <input
                                                type="email"
                                                name="email"
                                                value={formData.email}
                                                onChange={handleChange}
                                                required
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/50 transition-all font-medium"
                                                placeholder="tucorreo@ejemplo.com"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Asunto</label>
                                        <input
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleChange}
                                            required
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/50 transition-all font-medium"
                                            placeholder="¿En qué podemos ayudarte?"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Mensaje</label>
                                        <textarea
                                            name="message"
                                            value={formData.message}
                                            onChange={handleChange}
                                            required
                                            rows="5"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-earth/50 transition-all font-medium resize-none"
                                            placeholder="Escribe tu mensaje aquí..."
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full bg-earth hover:bg-earth-dark text-white font-bold py-4 rounded-xl shadow-lg shadow-earth/20 transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                                <span>Enviando...</span>
                                            </div>
                                        ) : (
                                            'Enviar Mensaje'
                                        )}
                                    </button>
                                </form>
                            </div>

                            {/* Info & Map */}
                            <div className="space-y-10 flex flex-col justify-center">
                                <div className="space-y-8">
                                    <div className="flex items-start gap-4">
                                        <div className="bg-beige-dark/10 p-3 rounded-2xl text-earth">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">Visítanos</h4>
                                            <p className="text-slate-600 leading-relaxed">
                                                {settings.contact_address || 'Av. Pellegrini 1234'}<br />
                                                {settings.contact_city || 'Rosario, Santa Fe'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-beige-dark/10 p-3 rounded-2xl text-earth">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">Escríbenos</h4>
                                            <p className="text-slate-600">
                                                {settings.contact_email || 'contacto@perfumeria.com'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-start gap-4">
                                        <div className="bg-beige-dark/10 p-3 rounded-2xl text-earth">
                                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 mb-1">Llámanos</h4>
                                            <p className="text-slate-600">
                                                {settings.contact_phone ? (
                                                    <a href={`tel:${settings.contact_phone}`} className="hover:text-earth transition-colors">
                                                        {settings.contact_phone}
                                                    </a>
                                                ) : '+54 9 341 123-4567'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Map Placeholder/Widget */}
                                <div className="rounded-2xl overflow-hidden shadow-lg border border-slate-100 h-64 relative bg-beige-light">
                                    <iframe
                                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d107133.1673898628!2d-60.639420950000005!3d-32.95213605!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x95b7ab11d0eb49c3%3A0x11f1d3d54f950dd0!2sRosario%2C%20Santa%20Fe!5e0!3m2!1ses!2sar!4v1714578123456!5m2!1ses!2sar"
                                        width="100%"
                                        height="100%"
                                        style={{ border: 0 }}
                                        allowFullScreen=""
                                        loading="lazy"
                                        referrerPolicy="no-referrer-when-downgrade"
                                        className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
                                    ></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </Layout>
    );
};

export default Contact;
