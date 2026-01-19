import React, { useState, useEffect } from 'react';
import SEO from '../components/common/SEO';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';
import ProductCard from '../components/products/ProductCard';
import CategoryFilter from '../components/products/CategoryFilter';
import { formatImageUrl } from '../utils/imageConfig';

/**
 * Página de Catálogo de Productos.
 * Permite una exploración profunda con filtros y búsqueda.
 */
const Products = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('relevance');
    const [loading, setLoading] = useState(true);

    const [settings, setSettings] = useState({
        products_empty_icon: '🕯️',
        products_empty_image_url: '',
        products_empty_text: 'No encontramos objetos para esta vibración actualmente.'
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const [productsRes, categoriesRes, settingsRes] = await Promise.all([
                    fetch(`${baseUrl}/products`),
                    fetch(`${baseUrl}/categories`),
                    fetch(`${baseUrl}/settings`)
                ]);

                const rawProducts = await productsRes.json();
                setProducts(rawProducts);

                if (categoriesRes.ok) {
                    const rawCategories = await categoriesRes.json();
                    setCategories(rawCategories);
                } else {
                    const uniqueCats = Array.from(new Set(rawProducts.map(p => p.category?.id)))
                        .filter(Boolean)
                        .map(id => rawProducts.find(p => p.category?.id === id).category);
                    setCategories(uniqueCats);
                }

                if (settingsRes.ok) {
                    const settingsData = await settingsRes.json();
                    setSettings(prev => ({ ...prev, ...settingsData }));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        window.scrollTo(0, 0);
    }, []);

    // Lógica de filtrado
    const filteredProducts = products
        .filter(product => {
            const matchesCategory = activeCategory === null || product.category_id === activeCategory;
            const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                product.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        })
        .sort((a, b) => {
            switch (sortBy) {
                case 'price-asc':
                    return parseFloat(a.price) - parseFloat(b.price);
                case 'price-desc':
                    return parseFloat(b.price) - parseFloat(a.price);
                case 'relevance':
                default:
                    // Ordenar por featured primero, luego por id
                    if (a.featured !== b.featured) {
                        return b.featured ? 1 : -1;
                    }
                    return a.id - b.id;
            }
        });

    return (
        <div className="bg-paper min-h-screen font-sans text-slate-800 selection:bg-rose-100 selection:text-rose-900">
            <SEO title="Catálogo" description="Explora nuestra colección de productos holísticos." />
            <Header onSearch={setSearchQuery} />
            <CartDrawer />

            <main className="py-12 lg:py-20">
                <div className="container mx-auto px-4">
                    {/* Header del Catálogo */}
                    <div className="text-center mb-16">
                        <h1
                            className="text-4xl md:text-5xl font-serif mb-4"
                            style={{ color: settings.products_title_color || '#1e293b' }}
                        >
                            {settings.products_title || 'Nuestra Colección'}
                        </h1>
                        <p
                            className="italic max-w-xl mx-auto"
                            style={{ color: settings.products_subtitle_color || '#64748b' }}
                        >
                            {settings.products_subtitle || 'Cada objeto sagrado ha sido cuidadosamente seleccionado y portador de una intención única para tu bienestar.'}
                        </p>
                    </div>

                    {loading ? (
                        <div className="py-20 text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth mx-auto"></div>
                            <p className="mt-4 text-slate-400 font-serif italic">Preparando el catálogo...</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-10">
                            {/* Filtros Superiores */}
                            <CategoryFilter
                                categories={categories}
                                activeCategory={activeCategory}
                                onCategoryChange={setActiveCategory}
                            />

                            {/* Información de resultados */}
                            <div className="flex justify-between items-center border-b border-beige-dark/20 pb-4 mb-4">
                                <span className="text-xs uppercase tracking-widest text-slate-400 font-bold">
                                    {filteredProducts.length} Objetos encontrados
                                </span>
                                <div className="flex items-center gap-2 text-xs text-slate-500">
                                    <span className="uppercase tracking-tighter">Ordenar por:</span>
                                    <select
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        className="bg-transparent border-none focus:ring-0 font-bold cursor-pointer text-earth"
                                    >
                                        <option value="relevance">Relevancia</option>
                                        <option value="price-asc">Precio: Menor a Mayor</option>
                                        <option value="price-desc">Precio: Mayor a Menor</option>
                                    </select>
                                </div>
                            </div>

                            {/* Grid de Productos */}
                            {filteredProducts.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                    {filteredProducts.map((product) => (
                                        <ProductCard key={product.id} product={product} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-40 bg-white/50 rounded-3xl border border-dashed border-beige-dark/30">
                                    <div className="h-20 mb-6 flex items-center justify-center">
                                        {settings.products_empty_image_url ? (
                                            <img
                                                src={formatImageUrl(settings.products_empty_image_url)}
                                                alt="Sin resultados"
                                                className="h-full object-contain"
                                            />
                                        ) : (
                                            <span className="text-6xl block">{settings.products_empty_icon}</span>
                                        )}
                                    </div>
                                    <p
                                        className="font-serif italic text-lg"
                                        style={{ color: settings.products_empty_text_color || '#94a3b8' }}
                                    >
                                        {settings.products_empty_text}
                                    </p>
                                    <button
                                        onClick={() => { setActiveCategory(null); setSearchQuery(''); }}
                                        className="mt-6 text-earth font-bold uppercase tracking-widest text-xs border-b border-earth pb-1"
                                    >
                                        Restablecer Filtros
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Footer Minimalista */}
            {/* Footer eliminado para evitar duplicidad global */}
        </div>
    );
};

export default Products;
