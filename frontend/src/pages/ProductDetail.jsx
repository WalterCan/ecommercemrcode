import React, { useState, useEffect } from 'react';
import SEO from '../components/common/SEO';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatImageUrl } from '../utils/imageConfig';
import ProductCard from '../components/products/ProductCard';
import { format, addDays, startOfWeek, addMinutes, isSameDay, parseISO, setHours, setMinutes, isBefore, startOfToday } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Vista de Detalle de Producto con Reserva de Turnos.
 */
const ProductDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const { user } = useAuth();
    const { showToast } = useToast();

    // Estados principales
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({});

    // Estados de Reserva (Solo para Servicios)
    const [selectedDate, setSelectedDate] = useState(null);
    const [selectedTime, setSelectedTime] = useState(null);
    const [weekStart, setWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }));
    const [availability, setAvailability] = useState([]);
    const [loadingAvailability, setLoadingAvailability] = useState(false);
    const [bookingProcessing, setBookingProcessing] = useState(false);

    // Estados de Reseñas
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ customer_name: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);

    useEffect(() => {
        const fetchAllData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

                const [prodRes, allRes, revRes, setRes] = await Promise.all([
                    fetch(`${baseUrl}/products/${id}`),
                    fetch(`${baseUrl}/products`),
                    fetch(`${baseUrl}/reviews/product/${id}`),
                    fetch(`${baseUrl}/settings`)
                ]);

                if (!prodRes.ok) throw new Error('Producto no encontrado');

                const prodData = await prodRes.json();
                setProduct(prodData);

                // Relacionados
                const allData = await allRes.json();
                if (prodData.category_id) {
                    setRelatedProducts(allData.filter(p => p.category_id === prodData.category_id && p.id !== prodData.id).slice(0, 4));
                }

                // Reseñas
                setReviews(await revRes.json());

                // Ajustes
                if (setRes.ok) setSettings(await setRes.json());

            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchAllData();
        window.scrollTo(0, 0);
    }, [id]);

    // Cargar disponibilidad si es servicio y cambia la semana
    useEffect(() => {
        if (product?.type === 'service') {
            fetchAvailability();
        }
    }, [product, weekStart]);

    const fetchAvailability = async () => {
        setLoadingAvailability(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const start = format(weekStart, 'yyyy-MM-dd');
            const end = format(addDays(weekStart, 6), 'yyyy-MM-dd');

            const res = await fetch(`${baseUrl}/appointments/availability?start=${start}&end=${end}`);
            if (res.ok) {
                setAvailability(await res.json());
            }
        } catch (error) {
            console.error('Error loading availability', error);
        } finally {
            setLoadingAvailability(false);
        }
    };

    // Generar slots (simplificado: 9 a 18 cada 1 hora)
    // MEJORA: Leer configuración real de horarios del backend
    const generateTimeSlots = (date) => {
        const slots = [];
        let start = setHours(setMinutes(date, 0), 9); // 9:00 AM
        const end = setHours(setMinutes(date, 0), 18); // 6:00 PM

        while (isBefore(start, end)) {
            const timeStr = format(start, 'HH:mm:ss');
            // Verificar si está ocupado
            const isBusy = availability.some(app =>
                isSameDay(parseISO(app.date), date) && app.time === timeStr
            );

            if (!isBusy) {
                slots.push(timeStr);
            }
            start = addMinutes(start, 60); // Intervalos de 1h fijo por ahora
        }
        return slots;
    };

    const handleBooking = async () => {
        if (!user) {
            showToast('Inicia sesión para reservar.', 'error');
            navigate('/login');
            return;
        }
        if (!selectedDate || !selectedTime) {
            return showToast('Por favor selecciona fecha y hora', 'warning');
        }

        setBookingProcessing(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = user.token || localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    product_id: product.id,
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    time: selectedTime,
                    notes: 'Reserva desde web'
                })
            });

            const data = await res.json();
            if (res.ok) {
                showToast('¡Turno reservado con éxito!', 'success');
                navigate('/mis-turnos');
            } else {
                showToast(data.error || 'Error al reservar', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setBookingProcessing(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div></div>;
    if (!product) return <div className="min-h-screen bg-paper text-center py-20">Producto no encontrado</div>;

    return (
        <div className="min-h-screen bg-paper">
            <Header />
            <CartDrawer />

            <main className="container mx-auto px-4 py-12">
                {/* Breadcrumbs */}
                <nav className="mb-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                    <Link to="/" className="hover:text-earth">Inicio</Link> / <span className="text-earth">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-20">
                    {/* Imagen */}
                    <div className="aspect-square bg-white rounded-[40px] overflow-hidden shadow-2xl border border-beige-dark/10">
                        <img src={formatImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="flex flex-col pt-4">
                        <h1 className="text-4xl lg:text-5xl font-serif mb-6">{product.name}</h1>
                        <p className="text-3xl font-serif font-bold text-earth mb-8">${parseFloat(product.price).toLocaleString('es-AR')}</p>
                        <p className="leading-relaxed text-lg font-serif italic text-slate-600 mb-10">{product.description}</p>

                        {/* LÓGICA DIFERENCIADA: PRODUCTO vs SERVICIO */}
                        {product.type === 'service' ? (
                            <div className="bg-white p-6 rounded-3xl border border-beige-dark/10 shadow-sm animate-fade-in">
                                <h3 className="text-lg font-bold font-serif text-slate-800 mb-4">Agenda tu Cita</h3>

                                {/* Selector de Día */}
                                <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                                    {[0, 1, 2, 3, 4].map(dayOffset => {
                                        const date = addDays(startOfToday(), dayOffset);
                                        const isSelected = selectedDate && isSameDay(date, selectedDate);
                                        return (
                                            <button
                                                key={dayOffset}
                                                onClick={() => { setSelectedDate(date); setSelectedTime(null); }}
                                                className={`flex-shrink-0 w-16 h-20 rounded-2xl flex flex-col items-center justify-center border transition-all ${isSelected ? 'bg-earth text-white border-earth' : 'bg-gray-50 border-gray-200 hover:border-earth'}`}
                                            >
                                                <span className="text-[10px] uppercase font-bold">{format(date, 'EEE', { locale: es })}</span>
                                                <span className="text-xl font-bold">{format(date, 'd')}</span>
                                            </button>
                                        );
                                    })}
                                </div>

                                {/* Selector de Hora */}
                                {selectedDate && (
                                    <div className="mb-6">
                                        <h4 className="text-xs font-bold uppercase text-slate-400 mb-2">Horarios Disponibles</h4>
                                        <div className="grid grid-cols-3 gap-2">
                                            {generateTimeSlots(selectedDate).length > 0 ? (
                                                generateTimeSlots(selectedDate).map(time => (
                                                    <button
                                                        key={time}
                                                        onClick={() => setSelectedTime(time)}
                                                        className={`py-2 rounded-lg text-sm font-bold border ${selectedTime === time ? 'bg-earth text-white border-earth' : 'text-slate-600 border-gray-200 hover:border-earth'}`}
                                                    >
                                                        {time.slice(0, 5)}
                                                    </button>
                                                ))
                                            ) : (
                                                <p className="col-span-3 text-xs text-red-400 italic">No hay horarios disponibles.</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <button
                                    onClick={handleBooking}
                                    disabled={!selectedDate || !selectedTime || bookingProcessing}
                                    className="w-full py-4 bg-earth text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-earth-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {bookingProcessing ? 'Procesando...' : (user ? 'Confirmar Reserva' : 'Inicia Sesión para Reservar')}
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                <button
                                    onClick={() => addToCart(product)}
                                    disabled={product.stock <= 0}
                                    className="w-full py-6 bg-earth text-white rounded-full font-bold text-lg hover:bg-earth-dark transition-all shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {product.stock > 0 ? 'Añadir al Carrito' : 'Agotado'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductDetail;
