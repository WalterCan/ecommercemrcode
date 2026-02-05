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
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedVariant, setSelectedVariant] = useState(null); // [NEW] Variante seleccionada
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({});
    const [activeModules, setActiveModules] = useState([]); // [NEW] Verificación de módulos

    // Ref para carrusel
    const galleryParams = React.useRef(null);

    // Calcular galería de imágenes
    const gallery = React.useMemo(() => {
        if (!product) return [];
        let imgs = [];
        if (product.images && product.images.length > 0) {
            imgs = product.images.map(img => img.image_url);
        }
        if (product.image_url && !imgs.includes(product.image_url)) {
            imgs.unshift(product.image_url);
        }
        return imgs;
    }, [product]);

    const navigateGallery = (direction) => {
        if (!gallery.length) return;

        const currentIndex = gallery.indexOf(selectedImage || gallery[0]);
        let newIndex;

        if (direction === 'left') {
            newIndex = currentIndex === 0 ? gallery.length - 1 : currentIndex - 1;
        } else {
            newIndex = currentIndex === gallery.length - 1 ? 0 : currentIndex + 1;
        }

        setSelectedImage(gallery[newIndex]);

        // Scroll automático para seguir la selección
        if (galleryParams.current) {
            const thumbnailWidth = 96; // 80px width + 16px gap approx
            galleryParams.current.scrollTo({
                left: newIndex * thumbnailWidth,
                behavior: 'smooth'
            });
        }
    };

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

                const [prodRes, allRes, revRes, setRes, modRes] = await Promise.all([
                    fetch(`${baseUrl}/products/${id}`),
                    fetch(`${baseUrl}/products`),
                    fetch(`${baseUrl}/reviews/product/${id}`),
                    fetch(`${baseUrl}/settings`),
                    fetch(`${baseUrl}/modules/active`) // [NEW]
                ]);

                if (!prodRes.ok) throw new Error('Producto no encontrado');

                const prodData = await prodRes.json();
                setProduct(prodData);
                // Inicializar imagen seleccionada con la principal
                if (prodData.image_url) {
                    setSelectedImage(prodData.image_url);
                } else if (prodData.images && prodData.images.length > 0) {
                    setSelectedImage(prodData.images[0].image_url);
                }


                // Relacionados
                const allData = await allRes.json();
                if (prodData.category_id) {
                    setRelatedProducts(allData.filter(p => p.category_id === prodData.category_id && p.id !== prodData.id).slice(0, 4));
                }

                // Reseñas
                setReviews(await revRes.json());

                // Ajustes
                if (setRes.ok) setSettings(await setRes.json());

                // Módulos activos
                if (modRes.ok) setActiveModules(await modRes.json());

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
        } finally {
            setBookingProcessing(false);
        }
    };

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const res = await fetch(`${baseUrl}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product_id: id,
                    ...newReview
                })
            });

            if (res.ok) {
                showToast('Reseña enviada con éxito (pendiente de aprobación)', 'success');
                setNewReview({ customer_name: '', rating: 5, comment: '' });
            } else {
                showToast('Error al enviar reseña', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    if (loading) return <div className="min-h-screen bg-paper flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div></div>;

    if (!activeModules.includes('ecommerce') && user?.role !== 'super_admin') {
        return (
            <div className="bg-paper min-h-screen">
                <Header onSearch={() => { }} />
                <main className="py-40 text-center px-4">
                    <h2 className="text-4xl font-serif text-earth font-bold mb-4">Sección no disponible</h2>
                    <p className="text-slate-500 mb-8 max-w-md mx-auto">Lo sentimos, la tienda de productos se encuentra temporalmente desactivada.</p>
                    <Link to="/" className="bg-earth text-white px-8 py-3 rounded-full font-bold uppercase tracking-widest hover:bg-earth-dark transition-all">
                        Volver al inicio
                    </Link>
                </main>
            </div>
        );
    }

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
                    {/* Galería de Imágenes */}
                    <div className="space-y-4">
                        {/* Imagen Principal */}
                        <div className="aspect-square bg-white rounded-[40px] overflow-hidden shadow-2xl border border-beige-dark/10 relative group">
                            <img
                                src={formatImageUrl(selectedImage || product.image_url)}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        </div>

                        {/* Carrusel de Miniaturas (Solo si hay más de 1 imagen) */}
                        {/* Carrusel de Miniaturas (Solo si hay más de 1 imagen) */}
                        {gallery.length > 1 && (
                            <div className="relative group/gallery">
                                <button
                                    onClick={() => navigateGallery('left')}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg border border-gray-200 transition-transform hover:scale-110"
                                >
                                    <svg className="w-5 h-5 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                                </button>

                                <div
                                    ref={galleryParams}
                                    className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide scroll-smooth px-1"
                                >
                                    {gallery.map((img, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => setSelectedImage(img)}
                                            className={`
                                                relative w-20 h-20 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all
                                                ${selectedImage === img ? 'border-earth ring-2 ring-earth/30' : 'border-beige-dark/10 hover:border-earth/50'}
                                            `}
                                        >
                                            <img src={formatImageUrl(img)} alt={`View ${idx}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => navigateGallery('right')}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 z-20 p-2 bg-white/80 hover:bg-white rounded-full shadow-lg border border-gray-200 transition-transform hover:scale-110"
                                >
                                    <svg className="w-5 h-5 text-earth" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col pt-4">
                        <h1 className="text-4xl lg:text-5xl font-serif mb-6">{product.name}</h1>
                        <p className="text-3xl font-serif font-bold text-earth mb-8">
                            ${(parseFloat(product.price) + parseFloat(selectedVariant?.additional_price || 0)).toLocaleString('es-AR')}
                        </p>

                        {/* Selector de Variantes */}
                        {product.variants && product.variants.length > 0 && (
                            <div className="mb-8">
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Opciones</p>
                                <div className="flex flex-wrap gap-2">
                                    {product.variants.map((v) => {
                                        const hasStock = v.stock > 0;
                                        return (
                                            <button
                                                key={v.id}
                                                onClick={() => setSelectedVariant(selectedVariant?.id === v.id ? null : v)}
                                                disabled={!hasStock}
                                                className={`
                                                    px-4 py-2 rounded-lg text-sm font-bold border-2 transition-all relative
                                                    ${selectedVariant?.id === v.id
                                                        ? 'bg-earth text-white border-earth'
                                                        : hasStock
                                                            ? 'bg-white text-slate-600 border-beige-dark/20 hover:border-earth/50'
                                                            : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                    }
                                                `}
                                            >
                                                {v.name}
                                                {!hasStock && <span className="text-[10px] ml-1">(Agotado)</span>}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        <p className="leading-relaxed text-lg font-serif italic text-slate-600 mb-10">{product.description}</p>

                        {/* Atributos Personalizables */}
                        <div className="flex flex-wrap gap-4 mt-2 mb-10">
                            {/* ... (existing attributes) ... */}
                        </div>

                        {/* LÓGICA DIFERENCIADA: PRODUCTO vs SERVICIO */}
                        {product.type === 'service' ? (
                            <div className="bg-white p-6 rounded-3xl border border-beige-dark/10 shadow-sm animate-fade-in">
                                {/* ... (existing service logic) ... */}
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Stock Display */}
                                <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
                                    <svg className="w-5 h-5 text-earth" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                    <span>
                                        Stock disponible: <span className="text-earth text-lg">
                                            {selectedVariant ? selectedVariant.stock : product.stock}
                                        </span>
                                    </span>
                                </div>

                                <button
                                    onClick={() => addToCart({ ...product, variant: selectedVariant })}
                                    disabled={(selectedVariant ? selectedVariant.stock : product.stock) <= 0}
                                    className="w-full py-6 bg-earth text-white rounded-full font-bold text-lg hover:bg-earth-dark transition-all shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed"
                                >
                                    {(selectedVariant ? selectedVariant.stock : product.stock) > 0 ? 'Añadir al Carrito' : 'Agotado'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Productos Relacionados */}
                {relatedProducts.length > 0 && (
                    <div className="mt-32 animate-fade-in border-t border-beige-dark/10 pt-20">
                        <h2 className="text-3xl font-serif mb-12 text-slate-800 text-center">También te puede interesar</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(relProduct => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </div>
                )}

                {/* SECCIÓN DE RESEÑAS (Visible siempre o condicional a ecommerce) */}
                {true && (
                    <div className="mt-20 border-t border-beige-dark/10 pt-20 animate-fade-in">
                        <div className="max-w-4xl mx-auto">
                            <h2 className="text-3xl font-serif mb-12 text-center underline decoration-earth/30">Reseñas de Clientes</h2>

                            <div className="grid md:grid-cols-2 gap-16">
                                {/* Lista de Reseñas */}
                                <div>
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Lo que dicen otros</h3>
                                    <div className="space-y-8">
                                        {reviews.length > 0 ? (
                                            reviews.map((rev, i) => (
                                                <div key={rev.id || i} className="bg-white p-6 rounded-3xl shadow-sm border border-beige-dark/5">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <span className="font-bold text-slate-700">{rev.customer_name}</span>
                                                        <div className="flex text-earth">
                                                            {[...Array(5)].map((_, i) => (
                                                                <svg key={i} className={`w-3 h-3 ${i < rev.rating ? 'fill-current' : 'text-beige-dark/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                                </svg>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <p className="text-slate-600 italic leading-relaxed">"{rev.comment}"</p>
                                                    <p className="text-[10px] text-slate-300 mt-4 uppercase tracking-tighter">
                                                        {new Date(rev.created_at || rev.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-slate-400 italic font-serif">Aún no hay reseñas aprobadas para este producto.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Formulario */}
                                <div className="bg-beige-light/20 p-8 rounded-[40px] border border-beige-dark/10 h-fit">
                                    <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-8">Cuéntanos tu experiencia</h3>
                                    <form onSubmit={handleReviewSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Tu Nombre</label>
                                            <input
                                                type="text"
                                                required
                                                value={newReview.customer_name}
                                                onChange={(e) => setNewReview({ ...newReview, customer_name: e.target.value })}
                                                className="w-full bg-white/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth/30"
                                                placeholder="Ej: Ana García"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Calificación</label>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5].map(num => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => setNewReview({ ...newReview, rating: num })}
                                                        className={`p-1 transition-transform hover:scale-125 ${newReview.rating >= num ? 'text-earth' : 'text-beige-dark/30'}`}
                                                    >
                                                        <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                                                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                                        </svg>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-2">Comentario</label>
                                            <textarea
                                                required
                                                rows="4"
                                                value={newReview.comment}
                                                onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                                className="w-full bg-white/50 border-none rounded-2xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth/30 resize-none"
                                                placeholder="Comparte tu opinión sobre este producto..."
                                            ></textarea>
                                        </div>
                                        <button
                                            type="submit"
                                            disabled={submittingReview}
                                            className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold uppercase tracking-[0.2em] text-[10px] hover:bg-slate-700 transition-all shadow-lg disabled:opacity-50"
                                        >
                                            {submittingReview ? 'Enviando...' : 'Publicar Reseña'}
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductDetail;
