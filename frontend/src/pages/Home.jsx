import React, { useState, useEffect } from 'react';
import SEO from '../components/common/SEO';
import Header from '../components/layout/Header';
import Hero from '../components/home/Hero';
import ProductGrid from '../components/products/ProductGrid';
import CartDrawer from '../components/cart/CartDrawer';
import CategoryFilter from '../components/products/CategoryFilter';

/**
 * Página principal de la Tienda Holística.
 * Orquesta los componentes para mostrar la vista inicial con carrito y filtros.
 */
const Home = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        home_decorative_title: '"El bienestar comienza con la intención"',
        home_decorative_text: 'En nuestra tienda cada objeto ha sido seleccionado por su vibración y pureza. Te acompañamos en tu camino de regreso a la naturaleza.'
    });

    // Efecto para cargar datos iniciales (Productos, Categorías y Ajustes)
    useEffect(() => {
        const fetchData = async () => {
            try {
                // Usar variable de entorno para la API o fallback a localhost
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

                const [productsRes, categoriesRes, settingsRes] = await Promise.all([
                    fetch(`${baseUrl}/products`),
                    fetch(`${baseUrl}/products/categories`), // Necesitaremos crear este endpoint o simularlo
                    fetch(`${baseUrl}/settings`)
                ]);

                const rawProducts = await productsRes.json();
                setProducts(rawProducts);

                // Si el endpoint de categorías falla, extraemos categorías de los productos
                if (categoriesRes.ok) {
                    const rawCategories = await categoriesRes.json();
                    setCategories(rawCategories);
                } else {
                    // Fallback: extraer categorías únicas de la lista de productos
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
    }, []);

    // Lógica de filtrado - En Home solo mostramos productos destacados
    const filteredProducts = products.filter(product => {
        const isFeatured = product.featured === true; // Solo productos destacados en Home
        const matchesCategory = activeCategory === null || product.category_id === activeCategory;
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return isFeatured && matchesCategory && matchesSearch;
    });

    return (
        <div className="bg-paper min-h-screen font-sans text-slate-800 selection:bg-rose-100 selection:text-rose-900">
            <SEO title="Inicio" description={settings.home_decorative_text} />
            <Header />
            <CartDrawer />

            <main>
                {/* Sección Hero */}
                <Hero />

                {/* Sección de Catálogo */}
                <section className="py-20 bg-paper">
                    <div className="container mx-auto px-4">

                        {loading ? (
                            <div className="py-20 text-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth mx-auto"></div>
                                <p className="mt-4 text-slate-400 font-serif italic">Sintonizando energías...</p>
                            </div>
                        ) : (
                            <>
                                {/* Filtros */}
                                <CategoryFilter
                                    categories={categories}
                                    activeCategory={activeCategory}
                                    onCategoryChange={setActiveCategory}
                                />

                                {/* Resultados */}
                                {filteredProducts.length > 0 ? (
                                    <ProductGrid
                                        products={filteredProducts}
                                        title={activeCategory ? categories.find(c => c.id === activeCategory)?.name : (settings.products_title || 'Productos Destacados')}
                                        subtitle={settings.products_subtitle || 'Seleccionados especialmente para ti'}
                                        titleColor={settings.products_title_color}
                                        subtitleColor={settings.products_subtitle_color}
                                    />
                                ) : (
                                    <div className="text-center py-20">
                                        <p className="text-slate-400 font-serif italic text-lg">
                                            No encontramos ningún objeto con esa vibración. Intenta otra búsqueda.
                                        </p>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </section>

                {/* Sección decorativa intermedia */}
                <section className="bg-beige-light py-24 overflow-hidden relative">
                    <div className="container mx-auto px-4 text-center relative z-10">
                        <h3
                            className="text-3xl font-serif mb-6"
                            style={{ color: settings.home_decorative_title_color || '#3d4a3d' }}
                        >
                            {settings.home_decorative_title || '"El bienestar comienza con la intención"'}
                        </h3>
                        <p
                            className="max-w-xl mx-auto leading-relaxed italic"
                            style={{ color: settings.home_decorative_text_color || '#475569' }}
                        >
                            {settings.home_decorative_text || 'En nuestra tienda cada objeto ha sido seleccionado por su vibración y pureza. Te acompañamos en tu camino de regreso a la naturaleza.'}
                        </p>
                    </div>
                    <div className="absolute -bottom-10 -right-10 opacity-10 pointer-events-none">
                        <svg width="300" height="300" viewBox="0 0 200 200">
                            <path fill="#8A9A5B" d="M100 10C100 10 70 70 10 100C70 130 100 190 100 190C100 190 130 130 190 100C130 70 100 10 100 10Z" />
                        </svg>
                    </div>
                </section>
            </main>

            {/* Footer Minimalista */}
            {/* Footer eliminado para evitar duplicidad global */}
        </div>
    );
};

export default Home;
