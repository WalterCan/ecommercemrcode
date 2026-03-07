import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth(); // Destructure user from useAuth

    // Redirect if already logged in
    React.useEffect(() => {
        if (user) {
            if (user.role === 'admin' || user.role === 'super_admin') {
                navigate('/admin');
            } else {
                navigate('/');
            }
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        if (result.success) {
            showToast(`¡Bienvenido de nuevo, ${result.user.name || 'Cliente'}!`, 'success');

            // Verificar si hay una redirección pendiente (ej: desde checkout)
            const redirectPath = localStorage.getItem('redirectAfterLogin');
            if (redirectPath) {
                localStorage.removeItem('redirectAfterLogin');
                navigate(redirectPath);
            } else {
                // Redirigir a donde venía o al inicio
                const from = location.state?.from?.pathname || (result.user.role === 'admin' ? '/admin' : '/');
                navigate(from);
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
                            <h2 className="text-2xl font-serif text-slate-900">Iniciar Sesión</h2>
                            <p className="text-slate-500 mt-2">Bienvenido de nuevo</p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Correo Electrónico</label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="tu@email.com"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Contraseña</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="••••••••"
                                />
                            </div>

                            <div className="flex justify-end">
                                <Link to="/forgot-password" className="text-sm text-earth hover:text-earth-dark hover:underline">
                                    ¿Olvidaste tu contraseña?
                                </Link>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-earth text-white py-4 rounded-xl font-bold hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {loading ? (
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white/30 border-t-white"></div>
                                ) : (
                                    'Entrar'
                                )}
                            </button>
                        </form>

                        <div className="mt-8 text-center border-t border-beige-dark/10 pt-8">
                            <p className="text-slate-600">
                                ¿Aún no tienes cuenta?{' '}
                                <Link to="/registro" className="text-earth font-bold hover:underline">
                                    Regístrate aquí
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
