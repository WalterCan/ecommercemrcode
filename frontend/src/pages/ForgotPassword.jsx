import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useToast } from '../context/ToastContext';

/**
 * Página de Recuperación de Contraseña
 */
const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${baseUrl}/password/forgot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (response.ok) {
                setEmailSent(true);
                showToast('Revisa tu correo electrónico para continuar', 'success');
            } else {
                showToast(data.error || 'Error al enviar el correo', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error de conexión. Intenta nuevamente', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-beige-light to-paper px-4 py-20">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    {!emailSent ? (
                        <>
                            {/* Icono */}
                            <div className="text-center mb-6">
                                <div className="inline-block p-4 bg-earth/10 rounded-full">
                                    <svg className="w-12 h-12 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </div>
                            </div>

                            <h1 className="text-3xl font-serif text-earth-dark text-center mb-2">
                                ¿Olvidaste tu contraseña?
                            </h1>
                            <p className="text-slate-600 text-center mb-8">
                                No te preocupes, te enviaremos instrucciones para recuperarla
                            </p>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                                        Correo Electrónico
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth focus:border-transparent transition-all"
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-earth hover:bg-earth-dark text-white py-3 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Instrucciones'}
                                </button>
                            </form>

                            <div className="mt-6 text-center">
                                <Link to="/login" className="text-earth hover:text-earth-dark text-sm underline">
                                    ← Volver al inicio de sesión
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            {/* Icono de éxito */}
                            <div className="inline-block p-4 bg-green-100 rounded-full mb-6">
                                <svg className="w-12 h-12 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-serif text-earth-dark mb-4">
                                ¡Revisa tu correo!
                            </h2>
                            <p className="text-slate-600 mb-6">
                                Si el correo <strong>{email}</strong> está registrado en nuestro sistema,
                                recibirás un enlace para restablecer tu contraseña.
                            </p>
                            <p className="text-sm text-slate-500 mb-8">
                                El enlace expirará en 1 hora por seguridad.
                            </p>

                            <Link
                                to="/login"
                                className="inline-block bg-earth hover:bg-earth-dark text-white px-8 py-3 rounded-lg transition-colors duration-300 font-medium"
                            >
                                Volver al inicio de sesión
                            </Link>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ForgotPassword;
