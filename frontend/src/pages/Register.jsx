import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            return showToast('Las contraseñas no coinciden', 'error');
        }

        setLoading(true);
        const result = await register(formData.email, formData.password, formData.name);
        setLoading(false);

        if (result.success) {
            showToast('¡Cuenta creada con éxito!', 'success');

            // Verificar si hay una redirección pendiente (ej: desde checkout)
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath);
            } else {
                navigate('/');
            }
        } else {
            showToast(result.message, 'error');
        }
    };

    return (
        <div className="min-h-screen bg-paper">
            <Header />
            <CartDrawer />

            <div className="flex items-center justify-center px-4 py-20">
                <div className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden border border-beige-dark/10">
                    <div className="p-8 md:p-12">
                        <div className="text-center mb-10">
                            <h2 className="text-2xl font-serif text-slate-900">Crear Cuenta</h2>
                            <p className="text-slate-500 mt-2">Únete a nuestra comunidad del bienestar</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre Completo</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="Tu nombre"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="Al menos 6 caracteres"
                                    minLength="6"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Confirmar Contraseña</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="Repite tu contraseña"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-earth text-white py-4 rounded-xl font-bold hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-4"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                ) : (
                                    'Registrarme'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-beige-dark/10 pt-8">
                            <p className="text-slate-600">
                                ¿Ya tienes una cuenta?{' '}
                                <Link to="/login" className="text-earth font-bold hover:underline">
                                    Inicia sesión
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
