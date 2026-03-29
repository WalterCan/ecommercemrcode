import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatImageUrl } from '../utils/imageConfig';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';

/**
 * Página de Checkout
 * Formulario para completar datos del cliente y confirmar pedido
 */
const Checkout = () => {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();
    const { cart, cartTotal, clearCart } = useCart();
    const { showToast } = useToast();

    const [isModuleActive, setIsModuleActive] = useState(true);
    const [loadingModules, setLoadingModules] = useState(true);
    const [storeSettings, setStoreSettings] = useState(null);

    const [formData, setFormData] = useState({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        customer_address: user?.address || '',
        customer_city: user?.city || '',
        customer_postal_code: user?.postal_code || '',
        shipping_method: 'pickup',
        shipping_cost: 0,
        payment_method: 'mercadopago',
        notes: ''
    });

    useEffect(() => {
        const checkModulesAndSettings = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const [modulesRes, settingsRes] = await Promise.all([
                    fetch(`${baseUrl}/modules/active`),
                    fetch(`${baseUrl}/settings`)
                ]);

                if (modulesRes.ok) {
                    const activeModules = await modulesRes.json();
                    if (!activeModules.includes('ecommerce')) {
                        setIsModuleActive(false);
                    }
                }

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    setStoreSettings(settingsData);
                }
            } catch (error) {
                console.error('Error checking modules or settings:', error);
            } finally {
                setLoadingModules(false);
            }
        };
        checkModulesAndSettings();
    }, []);

    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                customer_name: prev.customer_name || user.name || '',
                customer_email: prev.customer_email || user.email || '',
                customer_phone: prev.customer_phone || user.phone || '',
                customer_address: prev.customer_address || user.address || '',
                customer_city: prev.customer_city || user.city || '',
                customer_postal_code: prev.customer_postal_code || user.postal_code || ''
            }));
        }
    }, [user]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleShippingChange = (method) => {
        const cost = method === 'delivery' && storeSettings?.shipping_enabled === 'true'
            ? parseFloat(storeSettings?.shipping_fixed_cost || 0)
            : 0;

        setFormData(prev => ({
            ...prev,
            shipping_method: method,
            shipping_cost: cost
        }));
    };

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setError('');

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${baseUrl}/coupons/validate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: couponCode.toUpperCase() })
            });

            const result = await response.json();
            if (response.ok) {
                setAppliedCoupon(result);
                showToast('Cupón aplicado correctamente', 'success');
            } else {
                showToast(result.error || 'Cupón inválido', 'error');
                setAppliedCoupon(null);
            }
        } catch (err) {
            showToast('Error al validar el cupón', 'error');
        } finally {
            setCouponLoading(false);
        }
    };

    const calculateDiscount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.discount_type === 'percentage') {
            return (cartTotal * appliedCoupon.discount_value) / 100;
        }
        return parseFloat(appliedCoupon.discount_value);
    };

    const discountAmount = calculateDiscount();
    const finalTotal = cartTotal - discountAmount + formData.shipping_cost;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const items = cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image_url,
                variant: item.variant || null
            }));

            const orderData = {
                ...formData,
                items,
                total: finalTotal,
                coupon_code: appliedCoupon?.code || null,
                discount_amount: discountAmount,
                user_id: user?.id || null
            };

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const response = await fetch(`${baseUrl}/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(orderData)
            });

            const result = await response.json();

            if (!response.ok) {
                showToast(result.error || 'Error al crear el pedido', 'error');
                throw new Error(result.error || 'Error al crear el pedido');
            }

            showToast('Pedido procesado exitosamente', 'success');
            clearCart();
            navigate(`/order-confirmation/${result.order.id}`);
        } catch (err) {
            console.error('Error creating order:', err);
            setError('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    if (loadingModules || authLoading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
            </div>
        );
    }

    if (!isModuleActive && user?.role !== 'super_admin') {
        return (
            <div className="bg-paper min-h-screen">
                <Header />
                <main className="py-40 text-center px-4">
                    <h2 className="text-4xl font-serif text-earth font-bold mb-4">Checkout No Disponible</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Lo sentimos, esta sección se encuentra temporalmente desactivada.</p>
                    <Link to="/" className="bg-earth text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-earth-dark transition-all">
                        Volver al inicio
                    </Link>
                </main>
            </div>
        );
    }

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <CartDrawer />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-serif text-slate-800 mb-4">Tu carrito está vacío</h1>
                    <button
                        onClick={() => navigate('/productos')}
                        className="bg-earth hover:bg-earth-dark text-white px-8 py-3 rounded-full font-medium transition-colors"
                    >
                        Ver Productos
                    </button>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <CartDrawer />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-serif text-slate-800 mb-4">Inicia sesión para continuar</h1>
                    <div className="flex gap-4 justify-center mt-8">
                        <button
                            onClick={() => { localStorage.setItem('redirectAfterLogin', '/checkout'); navigate('/login'); }}
                            className="bg-earth text-white px-8 py-3 rounded-full font-bold"
                        >
                            Iniciar Sesión
                        </button>
                        <button
                            onClick={() => { localStorage.setItem('redirectAfterLogin', '/checkout'); navigate('/registro'); }}
                            className="bg-white border-2 border-earth text-earth px-8 py-3 rounded-full font-bold"
                        >
                            Crear Cuenta
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            <Header />
            <CartDrawer />

            <main className="container mx-auto px-4 py-12">
                <h1 className="text-3xl font-serif text-slate-800 mb-8">Finalizar Compra</h1>

                <div className="grid lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-beige-dark/10">
                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm">Datos de Contacto</h2>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre Completo *</label>
                                    <input type="text" name="customer_name" value={formData.customer_name} onChange={handleChange} required className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Email *</label>
                                    <input type="email" name="customer_email" value={formData.customer_email} onChange={handleChange} required className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Teléfono *</label>
                                    <input type="tel" name="customer_phone" value={formData.customer_phone} onChange={handleChange} required className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm mt-8">Datos de Envío / Retiro</h2>

                            {storeSettings?.shipping_enabled === 'true' && (
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <button
                                        type="button"
                                        onClick={() => handleShippingChange('pickup')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.shipping_method === 'pickup' ? 'border-earth bg-earth/5' : 'border-beige-dark/20 hover:border-earth/50'}`}
                                    >
                                        <div className="font-bold text-slate-700">Retiro en local</div>
                                        <div className="text-earth font-bold text-sm mt-1">Gratis</div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleShippingChange('delivery')}
                                        className={`p-4 rounded-xl border-2 text-left transition-all ${formData.shipping_method === 'delivery' ? 'border-earth bg-earth/5' : 'border-beige-dark/20 hover:border-earth/50'}`}
                                    >
                                        <div className="font-bold text-slate-700">Envío a domicilio</div>
                                        <div className="text-earth font-bold text-sm mt-1">${parseFloat(storeSettings?.shipping_fixed_cost || 0).toLocaleString('es-AR')}</div>
                                    </button>
                                </div>
                            )}

                            <div className={`grid gap-4 transition-opacity duration-300 ${formData.shipping_method === 'pickup' && storeSettings?.shipping_enabled === 'true' ? 'opacity-50' : 'opacity-100'}`}>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Dirección de Envío {formData.shipping_method === 'pickup' && storeSettings?.shipping_enabled === 'true' ? '(Opcional)' : '*'}</label>
                                    <input type="text" name="customer_address" value={formData.customer_address} onChange={handleChange} required={formData.shipping_method === 'delivery'} className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth" />
                                </div>
                                <div className="grid md:grid-cols-2 gap-4">
                                    <input type="text" name="customer_city" value={formData.customer_city} onChange={handleChange} required={formData.shipping_method === 'delivery'} className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth" placeholder="Ciudad" />
                                    <input type="text" name="customer_postal_code" value={formData.customer_postal_code} onChange={handleChange} required={formData.shipping_method === 'delivery'} className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth" placeholder="Código Postal" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm mt-8">Método de Pago</h2>
                            <select name="payment_method" value={formData.payment_method} onChange={handleChange} required className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth mb-4">
                                <option value="mercadopago">Mercado Pago (Tarjeta, Efectivo, etc.)</option>
                                <option value="transfer">Transferencia Bancaria</option>
                                <option value="whatsapp">Coordinar por WhatsApp</option>
                            </select>

                            {error && <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">{error}</div>}

                            <button type="submit" disabled={loading} className="w-full mt-8 bg-earth hover:bg-earth-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-colors">
                                {loading ? 'Procesando...' : 'Confirmar Pedido'}
                            </button>
                        </form>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="bg-white p-6 lg:p-8 rounded-2xl shadow-sm border border-beige-dark/10 lg:sticky lg:top-4">
                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm">Resumen</h2>
                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-12 h-12 bg-beige rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={formatImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-xs text-slate-700">{item.name}</h3>
                                            <p className="text-xs text-earth font-bold">${parseFloat(item.price).toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="border-t border-beige-dark/20 pt-4 mb-4">
                                <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                                    <span>Subtotal</span>
                                    <span>${cartTotal.toLocaleString('es-AR')}</span>
                                </div>
                                {discountAmount > 0 && (
                                    <div className="flex justify-between items-center text-sm font-medium text-green-600 mb-2">
                                        <span>Descuento</span>
                                        <span>-${discountAmount.toLocaleString('es-AR')}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center text-sm font-medium text-slate-600 mb-2">
                                    <span>Envío {formData.shipping_method === 'pickup' ? '(Retiro)' : ''}</span>
                                    <span>{formData.shipping_cost > 0 ? `$${formData.shipping_cost.toLocaleString('es-AR')}` : 'Gratis'}</span>
                                </div>
                            </div>
                            <div className="border-t border-beige-dark/20 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-800">Total</span>
                                <span className="text-2xl font-bold text-earth">${finalTotal.toLocaleString('es-AR')}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
