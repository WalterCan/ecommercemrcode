import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import { useToast } from '../context/ToastContext';

/**
 * Página de Restablecimiento de Contraseña
 */
const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [verifying, setVerifying] = useState(true);
    const [tokenValid, setTokenValid] = useState(false);

    // Verificar token al cargar
    useEffect(() => {
        const verifyToken = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const response = await fetch(`${baseUrl}/password/verify/${token}`);

                if (response.ok) {
                    setTokenValid(true);
                } else {
                    setTokenValid(false);
                    showToast('El enlace es inválido o ha expirado', 'error');
                }
            } catch (error) {
                console.error('Error:', error);
                setTokenValid(false);
                showToast('Error al verificar el enlace', 'error');
            } finally {
                setVerifying(false);
            }
        };

        verifyToken();
    }, [token, showToast]);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            showToast('Las contraseñas no coinciden', 'error');
            return;
        }

        if (password.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        setLoading(true);

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${baseUrl}/password/reset/${token}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ password, confirmPassword })
            });

            const data = await response.json();

            if (response.ok) {
                showToast('Contraseña actualizada exitosamente', 'success');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                showToast(data.error || 'Error al actualizar la contraseña', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showToast('Error de conexión. Intenta nuevamente', 'error');
        } finally {
            setLoading(false);
        }
    };

    if (verifying) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-beige-light to-paper">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth mx-auto mb-4"></div>
                        <p className="text-slate-600">Verificando enlace...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!tokenValid) {
        return (
            <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-beige-light to-paper px-4 py-20">
                    <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
                        <div className="inline-block p-4 bg-red-100 rounded-full mb-6">
                            <svg className="w-12 h-12 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-serif text-earth-dark mb-4">
                            Enlace Inválido
                        </h2>
                        <p className="text-slate-600 mb-6">
                            Este enlace de recuperación es inválido o ha expirado.
                        </p>
                        <Link
                            to="/forgot-password"
                            className="inline-block bg-earth hover:bg-earth-dark text-white px-8 py-3 rounded-lg transition-colors duration-300 font-medium"
                        >
                            Solicitar nuevo enlace
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-grow flex items-center justify-center bg-gradient-to-b from-beige-light to-paper px-4 py-20">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
                    {/* Icono */}
                    <div className="text-center mb-6">
                        <div className="inline-block p-4 bg-earth/10 rounded-full">
                            <svg className="w-12 h-12 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                    </div>

                    <h1 className="text-3xl font-serif text-earth-dark text-center mb-2">
                        Nueva Contraseña
                    </h1>
                    <p className="text-slate-600 text-center mb-8">
                        Ingresa tu nueva contraseña
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                                Nueva Contraseña
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth focus:border-transparent transition-all"
                                placeholder="Mínimo 6 caracteres"
                            />
                            <p className="mt-1 text-xs text-slate-500">
                                Debe contener al menos una mayúscula, una minúscula y un número
                            </p>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                                Confirmar Contraseña
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-earth focus:border-transparent transition-all"
                                placeholder="Repite la contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-earth hover:bg-earth-dark text-white py-3 rounded-lg font-medium transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar Contraseña'}
                        </button>
                    </form>

                    <div className="mt-6 text-center">
                        <Link to="/login" className="text-earth hover:text-earth-dark text-sm underline">
                            ← Volver al inicio de sesión
                        </Link>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default ResetPassword;
