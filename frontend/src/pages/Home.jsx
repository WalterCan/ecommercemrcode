import React, { useState, useEffect } from 'react';
import SEO from '../components/common/SEO';
import Header from '../components/layout/Header';
import Hero from '../components/home/Hero';
import HomeFeatures from '../components/home/HomeFeatures';
import HomeDevPromo from '../components/home/HomeDevPromo'; // [NEW]
import ProductGrid from '../components/products/ProductGrid';
import CartDrawer from '../components/cart/CartDrawer';
import CategoryFilter from '../components/products/CategoryFilter';
import { useAuth } from '../context/AuthContext'; // [NEW]

/**
 * Página principal de la Tienda Holística.
 * Orquesta los componentes para mostrar la vista inicial con carrito y filtros.
 */
const Home = () => {
    const { user } = useAuth(); // [NEW]
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [activeCategory, setActiveCategory] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [activeModules, setActiveModules] = useState([]); // [NEW]
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

                const [productsRes, categoriesRes, settingsRes, modulesRes] = await Promise.all([
                    fetch(`${baseUrl}/products`),
                    fetch(`${baseUrl}/products/categories`),
                    fetch(`${baseUrl}/settings`),
                    fetch(`${baseUrl}/modules/active`)
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

                if (modulesRes.ok) {
                    const modulesData = await modulesRes.json();
                    setActiveModules(modulesData);
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

    // Verificación de Visibilidad Web
    const showHome = settings.web_show_home === 'true' || settings.web_show_home === true;
    const maintenanceForce = settings.maintenance_mode_active === 'true' || settings.maintenance_mode_active === true;

    // DEBUG: Log para verificar settings
    console.log('🔍 DEBUG Maintenance Mode:', {
        maintenance_mode_active: settings.maintenance_mode_active,
        type: typeof settings.maintenance_mode_active,
        maintenanceForce,
        user: user?.role,
        allSettings: settings
    });

    // Check if ALL sections are disabled
    const allDisabled =
        (settings.web_show_home !== 'true' && settings.web_show_home !== true) &&
        (settings.web_show_about !== 'true' && settings.web_show_about !== true) &&
        (settings.web_show_contact !== 'true' && settings.web_show_contact !== true) &&
        (settings.web_show_products !== 'true' && settings.web_show_products !== true) &&
        (settings.web_show_therapies !== 'true' && settings.web_show_therapies !== true);

    if (loading) {
        return (
            <div className="bg-slate-950 min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
            </div>
        );
    }

    // Maintenance Mode Logic
    if ((maintenanceForce || allDisabled) && user?.role !== 'super_admin') {
        return (
            <div className="bg-slate-950 min-h-screen font-sans">
                <SEO title="Sitio en Construcción" description="Estamos preparando algo increíble." />
                <HomeDevPromo settings={settings} />
            </div>
        );
    }

    // Si el Admin entra y está desactivado, le mostramos el sitio pero con la Promo de aviso (que ya agregamos antes)
    // O mejor, si el Admin lo ve, ve el sitio normal, y la Promo "Admin Mode" le recuerda que es especial.

    return (
        <div className="bg-paper min-h-screen font-sans text-slate-800 selection:bg-rose-100 selection:text-rose-900">
            <SEO title="Inicio" description={settings.home_decorative_text} />
            <Header />
            <CartDrawer />

            <main>
                {/* Sección Hero */}
                <Hero />

                {/* Promo para Desarrolladores (Solo Admin - Eliminado para evitar conflicto con visualización web real) */}
                {/* {user?.role === 'super_admin' && <HomeDevPromo settings={settings} />} */}

                {/* Sección de Features Configurable */}
                <HomeFeatures settings={settings} />

                {/* Sección de Catálogo (Solo si ecommerce está activo) */}
                {(activeModules.includes('ecommerce') || user?.role === 'super_admin') && (
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
                )}

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
