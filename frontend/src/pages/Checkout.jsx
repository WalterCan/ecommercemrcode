import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

    // Actualizar datos si el usuario carga después del montaje inicial
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

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        setError('');

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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
            // Preparar items del pedido
            const items = cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image_url: item.image_url
            }));

            const orderData = {
                ...formData,
                items,
                total: finalTotal,
                coupon_code: appliedCoupon?.code || null,
                discount_amount: discountAmount,
                user_id: user?.id || null
            };

            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
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

            const order = result;
            showToast('Pedido procesado exitosamente', 'success');

            // Limpiar carrito
            clearCart();

            // Redirigir a página de confirmación
            navigate(`/order-confirmation/${order.order.id}`);
        } catch (err) {
            console.error('Error creating order:', err);
            setError('Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    // Si el carrito está vacío
    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <CartDrawer />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-serif text-slate-800 mb-4">Tu carrito está vacío</h1>
                    <p className="text-slate-600 mb-8">Agrega productos antes de continuar con el checkout</p>
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

    // Si no está autenticado, mostrar mensaje para registrarse/iniciar sesión
    if (!authLoading && !user) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <CartDrawer />
                <div className="container mx-auto px-4 py-20">
                    <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-sm border border-beige-dark/10 text-center">
                        <div className="text-6xl mb-6">🔒</div>
                        <h1 className="text-3xl font-serif text-slate-800 mb-4">
                            Inicia sesión para continuar
                        </h1>
                        <p className="text-slate-600 mb-8 leading-relaxed">
                            Para realizar tu compra necesitas tener una cuenta. Esto te permitirá hacer seguimiento de tus pedidos y ver el historial de compras.
                        </p>

                        <div className="bg-beige/30 p-6 rounded-2xl mb-8">
                            <h3 className="font-bold text-slate-800 mb-3">Beneficios de registrarte:</h3>
                            <ul className="text-left text-sm text-slate-600 space-y-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-earth mt-0.5">✓</span>
                                    <span>Seguimiento en tiempo real de tus pedidos</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-earth mt-0.5">✓</span>
                                    <span>Historial completo de compras</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-earth mt-0.5">✓</span>
                                    <span>Proceso de compra más rápido</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-earth mt-0.5">✓</span>
                                    <span>Ofertas y promociones exclusivas</span>
                                </li>
                            </ul>
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center">
                            <button
                                onClick={() => {
                                    localStorage.setItem('redirectAfterLogin', '/checkout');
                                    navigate('/login');
                                }}
                                className="bg-earth hover:bg-earth-dark text-white px-8 py-3 rounded-full font-bold transition-colors"
                            >
                                Iniciar Sesión
                            </button>
                            <button
                                onClick={() => {
                                    localStorage.setItem('redirectAfterLogin', '/checkout');
                                    navigate('/registro');
                                }}
                                className="bg-white hover:bg-beige border-2 border-earth text-earth px-8 py-3 rounded-full font-bold transition-colors"
                            >
                                Crear Cuenta
                            </button>
                        </div>

                        <p className="text-sm text-slate-500 mt-6">
                            Tu carrito se mantendrá guardado mientras te registras
                        </p>
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
                    {/* Formulario */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-beige-dark/10">
                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm">Datos de Contacto</h2>

                            <div className="grid md:grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Nombre Completo *
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_name"
                                        value={formData.customer_name}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                        placeholder="Juan Pérez"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="customer_email"
                                        value={formData.customer_email}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                        placeholder="tu@email.com"
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Teléfono *
                                    </label>
                                    <input
                                        type="tel"
                                        name="customer_phone"
                                        value={formData.customer_phone}
                                        onChange={handleChange}
                                        required
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                        placeholder="+54 9 11 1234-5678"
                                    />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm mt-8">Datos de Envío</h2>

                            <div className="grid gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                        Dirección
                                    </label>
                                    <input
                                        type="text"
                                        name="customer_address"
                                        value={formData.customer_address}
                                        onChange={handleChange}
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                        placeholder="Calle 123, Piso 4, Depto. B"
                                    />
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            Ciudad
                                        </label>
                                        <input
                                            type="text"
                                            name="customer_city"
                                            value={formData.customer_city}
                                            onChange={handleChange}
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                            placeholder="Buenos Aires"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                            Código Postal
                                        </label>
                                        <input
                                            type="text"
                                            name="customer_postal_code"
                                            value={formData.customer_postal_code}
                                            onChange={handleChange}
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                            placeholder="1234"
                                        />
                                    </div>
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm mt-8">Método de Envío</h2>
                            <div className="grid gap-4 mb-8">
                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.shipping_method === 'pickup' ? 'border-earth bg-earth/5' : 'border-beige-dark/20'}`}>
                                    <input
                                        type="radio"
                                        name="shipping_method"
                                        value="pickup"
                                        checked={formData.shipping_method === 'pickup'}
                                        onChange={() => setFormData({ ...formData, shipping_method: 'pickup', shipping_cost: 0 })}
                                        className="hidden"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-700">Retiro en Sucursal</p>
                                        <p className="text-sm text-slate-500">Retira gratis por nuestro local</p>
                                    </div>
                                    <span className="font-bold text-earth">Gratis</span>
                                </label>

                                <label className={`flex items-center p-4 border rounded-xl cursor-pointer transition-colors ${formData.shipping_method === 'delivery' ? 'border-earth bg-earth/5' : 'border-beige-dark/20'}`}>
                                    <input
                                        type="radio"
                                        name="shipping_method"
                                        value="delivery"
                                        checked={formData.shipping_method === 'delivery'}
                                        onChange={() => setFormData({ ...formData, shipping_method: 'delivery', shipping_cost: 1500 })}
                                        className="hidden"
                                    />
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-700">Envío a Domicilio</p>
                                        <p className="text-sm text-slate-500">Llegamos a todo el país</p>
                                    </div>
                                    <span className="font-bold text-earth">$1.500</span>
                                </label>
                            </div>

                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm mt-8">Método de Pago</h2>

                            <select
                                name="payment_method"
                                value={formData.payment_method}
                                onChange={handleChange}
                                required
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth mb-4"
                            >
                                <option value="mercadopago">Mercado Pago (Tarjeta, Efectivo, etc.)</option>
                                <option value="transfer">Transferencia Bancaria</option>
                                <option value="whatsapp">Coordinar por WhatsApp</option>
                            </select>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    Notas adicionales (opcional)
                                </label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleChange}
                                    rows="3"
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    placeholder="Instrucciones especiales, preferencias de horario de entrega, etc."
                                />
                            </div>

                            {error && (
                                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full mt-8 bg-earth hover:bg-earth-dark text-white px-8 py-4 rounded-full font-bold text-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Procesando...' : 'Confirmar Pedido'}
                            </button>
                        </form>
                    </div>

                    {/* Resumen del pedido */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-beige-dark/10 sticky top-4">
                            <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm">Resumen del Pedido</h2>

                            <div className="space-y-4 mb-6">
                                {cart.map((item) => (
                                    <div key={item.id} className="flex gap-4">
                                        <div className="w-16 h-16 bg-beige rounded-lg overflow-hidden flex-shrink-0">
                                            <img src={formatImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-sm text-slate-700">{item.name}</h3>
                                            <p className="text-xs text-slate-500">Cantidad: {item.quantity}</p>
                                            <p className="text-sm font-bold text-earth">${parseFloat(item.price * item.quantity).toLocaleString('es-AR')}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-600">Subtotal</span>
                                <span className="font-medium">${cartTotal.toLocaleString('es-AR')}</span>
                            </div>

                            {appliedCoupon && (
                                <div className="flex justify-between items-center mb-2 text-moss">
                                    <span className="text-sm font-bold uppercase tracking-widest">Descuento ({appliedCoupon.code})</span>
                                    <span className="font-bold">-${discountAmount.toLocaleString('es-AR')}</span>
                                </div>
                            )}

                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-600">Envío ({formData.shipping_method === 'pickup' ? 'Retiro' : 'A domicilio'})</span>
                                <span className="font-medium">{formData.shipping_cost === 0 ? 'Gratis' : `$${formData.shipping_cost.toLocaleString('es-AR')}`}</span>
                            </div>
                            <div className="border-t border-beige-dark/20 pt-4 flex justify-between items-center">
                                <span className="text-lg font-bold text-slate-800">Total</span>
                                <span className="text-2xl font-bold text-earth">${finalTotal.toLocaleString('es-AR')}</span>
                            </div>

                            {/* Sección de Cupón */}
                            <div className="mt-8 pt-6 border-t border-beige-dark/10">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">
                                    ¿Tienes un cupón de descuento?
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={couponCode}
                                        onChange={(e) => setCouponCode(e.target.value)}
                                        placeholder="CÓDIGO"
                                        className="flex-1 bg-paper border border-beige-dark/20 rounded-xl px-4 py-2 text-xs focus:outline-none focus:border-earth uppercase"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleApplyCoupon}
                                        disabled={couponLoading || !couponCode}
                                        className="bg-slate-800 text-white px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black transition-colors disabled:opacity-50"
                                    >
                                        {couponLoading ? '...' : 'Aplicar'}
                                    </button>
                                </div>
                                {appliedCoupon && (
                                    <button
                                        type="button"
                                        onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}
                                        className="mt-2 text-[10px] text-terracotta font-bold uppercase tracking-widest hover:underline"
                                    >
                                        Eliminar cupón
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Checkout;
