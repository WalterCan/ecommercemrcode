import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';
import { useCart } from '../context/CartContext';
import { formatImageUrl } from '../utils/imageConfig';
import ProductCard from '../components/products/ProductCard';
import { useToast } from '../context/ToastContext';

/**
 * Vista de Detalle de Producto.
 */
const ProductDetail = () => {
    const { id } = useParams();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState({ customer_name: '', rating: 5, comment: '' });
    const [submittingReview, setSubmittingReview] = useState(false);
    const [settings, setSettings] = useState({
        products_detail_title_color: '#0f172a',
        products_detail_price_color: '#8A9A5B',
        products_detail_stock_color: '#8A9A5B',
        products_detail_description_color: '#475569',
        products_detail_button_bg_color: '#8A9A5B',
        products_detail_button_text_color: '#ffffff',
        products_detail_badge_bg_color: '#F7E7CE',
        products_detail_badge_text_color: '#8A9A5B',
    });

    useEffect(() => {
        const fetchProductData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

                // Fetch producto, relacionados, reseñas y ajustes
                const [productRes, allProductsRes, reviewsRes, settingsRes] = await Promise.all([
                    fetch(`${baseUrl}/products/${id}`),
                    fetch(`${baseUrl}/products`),
                    fetch(`${baseUrl}/reviews/product/${id}`),
                    fetch(`${baseUrl}/settings`)
                ]);

                const productData = await productRes.json();
                setProduct(productData);

                const allProducts = await allProductsRes.json();
                if (productData.category_id) {
                    const related = allProducts
                        .filter(p => p.category_id === productData.category_id && p.id !== productData.id)
                        .slice(0, 4);
                    setRelatedProducts(related);
                }

                const reviewsData = await reviewsRes.json();
                setReviews(reviewsData);

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    setSettings(prev => ({ ...prev, ...settingsData }));
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProductData();
        window.scrollTo(0, 0);
    }, [id]);

    const handleReviewSubmit = async (e) => {
        e.preventDefault();
        setSubmittingReview(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const res = await fetch(`${baseUrl}/reviews`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newReview, product_id: product.id })
            });
            if (res.ok) {
                showToast('¡Gracias! Tu reseña será revisada por un administrador.', 'success');
                setNewReview({ customer_name: '', rating: 5, comment: '' });
            } else {
                showToast('Error al enviar la reseña', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setSubmittingReview(false);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : null;

    if (loading) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <div className="flex flex-col items-center justify-center py-40">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
                    <p className="mt-4 text-slate-400 font-serif italic text-lg">Sintonizando energías...</p>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-paper">
                <Header />
                <div className="container mx-auto px-4 py-20 text-center">
                    <h2 className="text-3xl font-serif text-slate-700 mb-4">Objeto no encontrado</h2>
                    <Link to="/" className="bg-earth text-white px-8 py-3 rounded-full font-bold">
                        Volver a la Tienda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            <Header />
            <CartDrawer />

            <main className="container mx-auto px-4 py-12">
                {/* Breadcrumbs Mejorados */}
                <nav className="mb-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400">
                    <Link to="/" className="hover:text-earth transition-colors">Inicio</Link>
                    <span className="opacity-30">/</span>
                    {product.category && (
                        <>
                            <span className="text-slate-500">{product.category.name}</span>
                            <span className="opacity-30">/</span>
                        </>
                    )}
                    <span className="text-earth truncate">{product.name}</span>
                </nav>

                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start mb-20">
                    {/* Imagen */}
                    <div className="relative group">
                        <div className="aspect-square bg-white rounded-[40px] overflow-hidden shadow-2xl border border-beige-dark/10">
                            <img
                                src={formatImageUrl(product.image_url)}
                                alt={product.name}
                                className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                            />
                        </div>
                        {product.featured && (
                            <span className="absolute top-8 left-8 bg-terracotta text-white text-[10px] px-4 py-2 rounded-full uppercase tracking-widest font-bold shadow-xl">
                                Destacado
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="flex flex-col pt-4">
                        <h1
                            className="text-4xl lg:text-6xl font-serif mb-6 leading-tight"
                            style={{ color: settings.products_detail_title_color || '#0f172a' }}
                        >
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-6 mb-10">
                            <span
                                className="text-4xl font-serif font-bold"
                                style={{ color: settings.products_detail_price_color || '#8A9A5B' }}
                            >
                                ${parseFloat(product.price).toLocaleString('es-AR')}
                            </span>
                            <div className="w-px h-8 bg-beige-dark/20"></div>
                            <div className="flex flex-col">
                                <span
                                    className="text-xs font-bold uppercase tracking-widest"
                                    style={{ color: product.stock > 0 ? (settings.products_detail_stock_color || '#3d4a3d') : '#ef4444' }}
                                >
                                    {product.stock > 0 ? `${product.stock} en stock` : 'Sin existencias'}
                                </span>
                                {averageRating && (
                                    <div className="flex items-center gap-1 mt-1">
                                        <div className="flex text-earth text-[10px]" style={{ color: settings.products_detail_price_color || '#8A9A5B' }}>
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className={`w-3 h-3 ${i < Math.floor(averageRating) ? 'fill-current' : 'text-beige-dark/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-400">{reviews.length} reseñas</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <p
                            className="leading-relaxed text-xl font-serif italic mb-10"
                            style={{ color: settings.products_detail_description_color || '#475569' }}
                        >
                            "{product.description}"
                        </p>

                        <div className="space-y-6 mb-12">
                            <button
                                onClick={() => addToCart(product)}
                                disabled={product.stock <= 0}
                                className={`w-full py-6 rounded-full font-bold text-lg transition-all transform hover:scale-[1.02] shadow-2xl disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed`}
                                style={{
                                    backgroundColor: product.stock > 0 ? (settings.products_detail_button_bg_color || '#8A9A5B') : undefined,
                                    color: product.stock > 0 ? (settings.products_detail_button_text_color || '#ffffff') : undefined
                                }}
                            >
                                {product.stock > 0 ? 'Añadir a mi Selección' : 'Agotado Temporalmente'}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div
                                className="p-5 rounded-3xl border text-center"
                                style={{
                                    backgroundColor: settings.products_detail_badge_bg_color || '#FDFCF8',
                                    borderColor: (settings.products_detail_badge_text_color || '#8A9A5B') + '20',
                                    color: settings.products_detail_badge_text_color || '#8A9A5B'
                                }}
                            >
                                <div className="mb-2">🌿</div>
                                <span className="text-[9px] uppercase tracking-widest font-bold">100% Natural</span>
                            </div>
                            <div
                                className="p-5 rounded-3xl border text-center"
                                style={{
                                    backgroundColor: settings.products_detail_badge_bg_color || '#FDFCF8',
                                    borderColor: (settings.products_detail_badge_text_color || '#8A9A5B') + '20',
                                    color: settings.products_detail_badge_text_color || '#8A9A5B'
                                }}
                            >
                                <div className="mb-2">✨</div>
                                <span className="text-[9px] uppercase tracking-widest font-bold">Artesanal</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sección de Reseñas */}
                <div className="grid lg:grid-cols-2 gap-20 py-20 border-t border-beige-dark/20">
                    <div>
                        <h2 className="text-3xl font-serif text-slate-800 mb-8">Reseñas de la Comunidad</h2>
                        {reviews.length > 0 ? (
                            <div className="space-y-8">
                                {reviews.map(review => (
                                    <div key={review.id} className="bg-white p-6 rounded-3xl border border-beige-dark/10 shadow-sm">
                                        <div className="flex justify-between items-center mb-3">
                                            <span className="text-xs font-bold text-slate-800 uppercase tracking-widest">{review.customer_name}</span>
                                            <div className="flex text-earth">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-beige-dark/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-600 font-serif italic leading-relaxed">"{review.comment}"</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-slate-400 font-serif italic text-lg text-center py-10">Aún no hay reseñas. ¡Sé el primero en compartir tu experiencia!</p>
                        )}
                    </div>

                    <div className="bg-beige-light/20 p-10 rounded-[40px] border border-beige-dark/10 h-fit sticky top-32">
                        <h3 className="text-xl font-serif text-slate-800 mb-6">Comparte tu experiencia</h3>
                        <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tu Nombre</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    value={newReview.customer_name}
                                    onChange={(e) => setNewReview({ ...newReview, customer_name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Puntuación</label>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <button
                                            key={star}
                                            type="button"
                                            onClick={() => setNewReview({ ...newReview, rating: star })}
                                            className={`p-1 transition-colors ${newReview.rating >= star ? 'text-earth' : 'text-beige-dark/30'}`}
                                        >
                                            <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Comentario</label>
                                <textarea
                                    required
                                    rows="4"
                                    className="w-full bg-white border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    value={newReview.comment}
                                    onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                                ></textarea>
                            </div>
                            <button
                                type="submit"
                                disabled={submittingReview}
                                className="w-full bg-slate-800 text-white font-bold py-4 rounded-xl uppercase tracking-widest text-[10px] hover:bg-black transition-all disabled:opacity-50"
                            >
                                {submittingReview ? 'Enviando...' : 'Enviar Reseña'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Productos Relacionados */}
                {relatedProducts.length > 0 && (
                    <section className="pt-20 border-t border-beige-dark/20">
                        <div className="flex justify-between items-end mb-12">
                            <div>
                                <span className="text-terracotta font-bold tracking-[0.3em] uppercase text-[10px] mb-2 block">
                                    Completa tu ritual
                                </span>
                                <h2 className="text-3xl font-serif text-slate-900">Objetos Similares</h2>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {relatedProducts.map(relProduct => (
                                <ProductCard key={relProduct.id} product={relProduct} />
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </div>
    );
};

export default ProductDetail;
