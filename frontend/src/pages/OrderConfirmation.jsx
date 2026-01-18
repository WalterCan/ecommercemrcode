import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';

// Inicializar Mercado Pago con la clave pública del entorno
// Nota: La clave se obtiene de VITE_MP_PUBLIC_KEY
if (import.meta.env.VITE_MP_PUBLIC_KEY) {
    initMercadoPago(import.meta.env.VITE_MP_PUBLIC_KEY);
}

/**
 * Página de Confirmación de Pedido
 * Muestra el estado del pedido e instrucciones de pago
 */
const OrderConfirmation = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [paymentStatus, setPaymentStatus] = useState(null);

    useEffect(() => {
        // Obtener estado del pago desde la URL si existe
        const queryParams = new URLSearchParams(location.search);
        const status = queryParams.get('status');
        if (status) {
            setPaymentStatus(status);
        }

        const fetchData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

                // Fetch pedido y configuraciones en paralelo
                const [orderRes, settingsRes] = await Promise.all([
                    fetch(`${baseUrl}/orders/${orderId}`),
                    fetch(`${baseUrl}/settings`)
                ]);

                if (!orderRes.ok) throw new Error('Pedido no encontrado');

                const orderData = await orderRes.json();
                const settingsData = await settingsRes.json();

                setOrder(orderData);
                setSettings(settingsData);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [orderId, location.search]);

    if (loading) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h1 className="text-3xl font-serif text-slate-800 mb-4">Pedido No Encontrado</h1>
                    <Link to="/productos" className="text-earth hover:underline">Volver a la tienda</Link>
                </div>
            </div>
        );
    }

    const getPaymentInstructions = () => {
        // Si venimos de un pago de Mercado Pago
        if (paymentStatus === 'approved') {
            return (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-green-900 mb-2">¡Pago Aprobado!</h3>
                    <p className="text-green-700">
                        Hemos recibido tu pago correctamente. Estamos preparando tu pedido.
                    </p>
                </div>
            );
        }

        if (paymentStatus === 'rejected') {
            return (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8 text-center">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h3 className="font-bold text-red-900 mb-2">Pago Rechazado</h3>
                    <p className="text-red-700 mb-4">
                        Lo sentimos, no pudimos procesar tu pago. Por favor intenta nuevamente o elige otro método.
                    </p>
                    {order.preference_id ? (
                        <div className="flex justify-center">
                            <Wallet initialization={{ preferenceId: order.preference_id }} customization={{ texts: { valueProp: 'smart_option' } }} />
                        </div>
                    ) : order.init_point && (
                        <a
                            href={order.init_point}
                            className="inline-block bg-earth text-white px-6 py-2 rounded-full font-medium"
                        >
                            Reintentar Pago
                        </a>
                    )}
                </div>
            );
        }

        switch (order.payment_method) {
            case 'mercadopago':
                if (order.init_point) {
                    return (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                            <h3 className="font-bold text-blue-900 mb-3">¡Pedido listo para pagar!</h3>
                            <p className="text-blue-700 mb-6">
                                Tu pedido ha sido registrado. Haz clic en el siguiente botón para completar tu pago de forma segura con Mercado Pago.
                            </p>
                            {order.preference_id ? (
                                <div className="max-w-[400px] mx-auto">
                                    <Wallet
                                        initialization={{ preferenceId: order.preference_id }}
                                        customization={{ texts: { valueProp: 'smart_option' } }}
                                    />
                                </div>
                            ) : (
                                <a
                                    href={order.init_point}
                                    className="inline-block w-full sm:w-auto bg-[#009EE3] hover:bg-[#007EB5] text-white px-10 py-4 rounded-xl font-bold text-lg transition-transform hover:scale-[1.02] text-center shadow-lg shadow-blue-200"
                                >
                                    💳 Pagar con Mercado Pago
                                </a>
                            )}
                        </div>
                    );
                }
                return (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-3">Próximo Paso: Pagar con Mercado Pago</h3>
                        <p className="text-blue-700 mb-4">
                            Estamos generando tu link de pago. En breve recibirás un email para completar tu compra.
                        </p>
                        <p className="text-sm text-blue-600">
                            También puedes esperar a que el administrador procese tu pedido y te envíe el link.
                        </p>
                    </div>
                );
            case 'transfer':
                return (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-8">
                        <h3 className="font-bold text-green-900 mb-4 text-xl">Datos para Transferencia Bancaria</h3>
                        <div className="space-y-4 text-green-800 bg-white/50 p-6 rounded-2xl border border-green-100">
                            {settings?.bank_name && <p className="flex justify-between"><strong>Banco:</strong> <span>{settings.bank_name}</span></p>}
                            {settings?.bank_account_holder && <p className="flex justify-between"><strong>Titular:</strong> <span>{settings.bank_account_holder}</span></p>}
                            {settings?.bank_cbu && <p className="flex justify-between"><strong>CBU / CVU:</strong> <span>{settings.bank_cbu}</span></p>}
                            {settings?.bank_alias && <p className="flex justify-between"><strong>Alias:</strong> <span>{settings.bank_alias}</span></p>}

                            {!settings?.bank_name && (
                                <p className="text-sm italic text-green-600">El administrador aún no ha configurado los datos bancarios. Por favor contacta por WhatsApp para coordinar.</p>
                            )}

                            <div className="text-sm text-green-700 mt-6 pt-6 border-t border-green-200/50">
                                <p className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    Envía el comprobante mencionando el número de pedido: <strong>#{order.id}</strong>
                                </p>
                            </div>
                        </div>
                    </div>
                );
            case 'whatsapp':
                const whatsappNum = settings?.whatsapp_number || '5491123456789';
                const whatsappMsg = encodeURIComponent(settings?.whatsapp_message || `¡Hola! Quiero coordinar el pago de mi pedido #${order.id}`);

                return (
                    <div className="bg-moss/10 border border-moss/30 rounded-xl p-8 text-center">
                        <h3 className="font-bold text-moss mb-4 text-xl">Coordinar Pago por WhatsApp</h3>
                        <p className="text-slate-700 mb-8 max-w-md mx-auto">
                            Haz clic en el botón inferior para enviarnos un mensaje directo y coordinar el pago y la entrega de tu pedido.
                        </p>
                        <a
                            href={`https://wa.me/${whatsappNum}?text=${whatsappMsg}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-3 bg-[#25D366] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#20ba59] transition-all shadow-lg shadow-green-200 transform hover:scale-[1.02]"
                        >
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                            Enviar mensaje de WhatsApp
                        </a>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-paper">
            <Header />
            <CartDrawer />

            <main className="container mx-auto px-4 py-12">
                <div className="max-w-3xl mx-auto">
                    {/* Mensaje de éxito */}
                    <div className="text-center mb-12">
                        <div className="w-20 h-20 bg-earth/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-4xl font-serif text-slate-800 mb-4">¡Pedido Confirmado!</h1>
                        <p className="text-slate-600 text-lg">
                            Gracias por tu compra, <strong>{order.customer_name}</strong>
                        </p>
                        <p className="text-sm text-slate-500 mt-2">
                            Número de pedido: <strong className="text-earth">#{order.id}</strong>
                        </p>
                    </div>

                    {/* Instrucciones de pago */}
                    <div className="mb-8">
                        {getPaymentInstructions()}
                    </div>

                    {/* Detalles del pedido */}
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-beige-dark/10 mb-8">
                        <h2 className="text-xl font-bold text-slate-700 mb-6 uppercase tracking-wide text-sm">Detalles del Pedido</h2>

                        <div className="space-y-4 mb-6">
                            {order.items && order.items.map((item, index) => {
                                const getImageUrl = (url) => {
                                    if (!url) return 'https://via.placeholder.com/64?text=No+Img';
                                    if (url.startsWith('http')) return url;

                                    // Determinar base URL (sin /api)
                                    let baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                                    baseUrl = baseUrl.replace(/\/api\/?$/, ''); // Remove /api or /api/

                                    // Remover slash inicial del path para evitar dobles
                                    const cleanPath = url.startsWith('/') ? url.slice(1) : url;

                                    return `${baseUrl}/${cleanPath}`;
                                };

                                return (
                                    <div key={index} className="flex gap-4 pb-4 border-b border-beige-dark/10 last:border-0">
                                        <div className="w-16 h-16 bg-beige rounded-lg overflow-hidden flex-shrink-0">
                                            <img
                                                src={getImageUrl(item.image_url)}
                                                alt={item.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    if (e.target.src !== 'https://via.placeholder.com/64?text=IMG') {
                                                        e.target.src = 'https://via.placeholder.com/64?text=IMG';
                                                    }
                                                }}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-slate-700">{item.name}</h3>
                                            <p className="text-sm text-slate-500">Cantidad: {item.quantity}</p>
                                            <p className="text-sm font-bold text-earth">
                                                ${parseFloat(item.price * item.quantity).toLocaleString('es-AR')}
                                            </p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        {order.discount_amount > 0 && (
                            <div className="flex justify-between items-center mb-2 text-moss font-bold">
                                <span className="text-sm uppercase tracking-widest">Descuento {order.coupon_code && `(${order.coupon_code})`}</span>
                                <span>-${parseFloat(order.discount_amount).toLocaleString('es-AR')}</span>
                            </div>
                        )}

                        <div className="border-t border-beige-dark/20 pt-4 flex justify-between items-center">
                            <span className="text-lg font-bold text-slate-800">Total</span>
                            <span className="text-2xl font-bold text-earth">
                                ${parseFloat(order.total).toLocaleString('es-AR')}
                            </span>
                        </div>
                    </div>

                    {/* Datos de envío */}
                    {order.customer_address && (
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-beige-dark/10 mb-8">
                            <h2 className="text-xl font-bold text-slate-700 mb-4 uppercase tracking-wide text-sm">Datos de Envío</h2>
                            <div className="text-slate-600 space-y-1">
                                <p>{order.customer_address}</p>
                                <p>{order.customer_city} {order.customer_postal_code && `(CP: ${order.customer_postal_code})`}</p>
                                <p className="text-sm text-slate-500 mt-3">
                                    Email: {order.customer_email}<br />
                                    Teléfono: {order.customer_phone}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Acciones */}
                    <div className="flex gap-4 justify-center">
                        <Link
                            to="/productos"
                            className="bg-earth hover:bg-earth-dark text-white px-8 py-3 rounded-full font-medium transition-colors"
                        >
                            Seguir Comprando
                        </Link>
                        <Link
                            to="/"
                            className="bg-white hover:bg-beige-light text-earth border border-earth/20 px-8 py-3 rounded-full font-medium transition-colors"
                        >
                            Volver al Inicio
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default OrderConfirmation;
