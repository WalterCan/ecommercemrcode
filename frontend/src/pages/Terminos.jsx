import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import SEO from '../components/common/SEO';

const Terminos = () => {
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/settings`);
                const data = await response.json();
                setText(data.terms_text || 'No hay términos y condiciones definidos.');
                setLoading(false);
            } catch (error) {
                console.error('Error fetching settings:', error);
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

    if (loading) return <div className="text-center py-20">Cargando...</div>;

    return (
        <>
            <SEO
                title="Términos y Condiciones"
                description="Lee nuestros términos y condiciones de servicio."
            />
            <div className="container mx-auto px-4 py-12 max-w-4xl">
                <h1 className="text-3xl font-serif font-bold text-slate-800 mb-8 text-center">Términos y Condiciones</h1>
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 prose prose-slate max-w-none whitespace-pre-wrap">
                    {text}
                </div>
            </div>
        </>
    );
};

export default Terminos;
