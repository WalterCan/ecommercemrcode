import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import StockBadge from '../../components/StockBadge';
import { formatImageUrl } from '../../utils/imageConfig';

/**
 * AdminStockAlerts - Página de alertas de stock crítico y bajo
 * Permite al administrador ver productos que necesitan reposición
 */
const AdminStockAlerts = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [products, setProducts] = useState([]);
    const [stats, setStats] = useState({ critical: 0, low: 0, ok: 0, total: 0 });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all'); // 'all', 'critical', 'low'

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            navigate('/');
            return;
        }
        fetchData();
    }, [user, navigate]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const token = localStorage.getItem('token');

            // Obtener alertas
            const alertsResponse = await fetch(`${baseUrl}/products/stock-alerts`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const alertsData = await alertsResponse.json();

            // Obtener estadísticas
            const statsResponse = await fetch(`${baseUrl}/products/stock-stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const statsData = await statsResponse.json();

            setProducts(alertsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error fetching stock data:', error);
            showToast('Error al cargar datos de stock', 'error');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = products.filter(product => {
        if (filter === 'all') return true;
        return product.stockStatus === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-paper flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth mx-auto mb-4"></div>
                    <p className="text-slate-600">Cargando alertas de stock...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-paper">
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-serif text-slate-800 mb-2">Alertas de Stock</h1>
                    <p className="text-slate-600">Monitorea productos con stock bajo o crítico</p>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-dark/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                    Stock Crítico
                                </p>
                                <p className="text-3xl font-bold text-red-600">{stats.critical}</p>
                            </div>
                            <div className="text-4xl">⚠️</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-dark/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                    Stock Bajo
                                </p>
                                <p className="text-3xl font-bold text-yellow-600">{stats.low}</p>
                            </div>
                            <div className="text-4xl">⚡</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-dark/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                    Stock OK
                                </p>
                                <p className="text-3xl font-bold text-green-600">{stats.ok}</p>
                            </div>
                            <div className="text-4xl">✓</div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-beige-dark/10">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">
                                    Total Productos
                                </p>
                                <p className="text-3xl font-bold text-slate-800">{stats.total}</p>
                            </div>
                            <div className="text-4xl">📦</div>
                        </div>
                    </div>
                </div>

                {/* Filtros */}
                <div className="bg-white p-4 rounded-2xl shadow-sm border border-beige-dark/10 mb-6">
                    <div className="flex gap-2">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-4 py-2 rounded-full font-medium transition-colors ${filter === 'all'
                                    ? 'bg-earth text-white'
                                    : 'bg-beige text-slate-700 hover:bg-beige-dark'
                                }`}
                        >
                            Todos ({products.length})
                        </button>
                        <button
                            onClick={() => setFilter('critical')}
                            className={`px-4 py-2 rounded-full font-medium transition-colors ${filter === 'critical'
                                    ? 'bg-red-600 text-white'
                                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                                }`}
                        >
                            Críticos ({stats.critical})
                        </button>
                        <button
                            onClick={() => setFilter('low')}
                            className={`px-4 py-2 rounded-full font-medium transition-colors ${filter === 'low'
                                    ? 'bg-yellow-600 text-white'
                                    : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                }`}
                        >
                            Bajos ({stats.low})
                        </button>
                    </div>
                </div>

                {/* Tabla de productos */}
                <div className="bg-white rounded-2xl shadow-sm border border-beige-dark/10 overflow-hidden">
                    {filteredProducts.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="text-6xl mb-4">🎉</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {filter === 'all' ? '¡No hay alertas!' : `No hay productos ${filter === 'critical' ? 'críticos' : 'con stock bajo'}`}
                            </h3>
                            <p className="text-slate-600">
                                {filter === 'all'
                                    ? 'Todos los productos tienen stock suficiente'
                                    : 'Cambia el filtro para ver otras alertas'}
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-beige border-b border-beige-dark/20">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">
                                            Producto
                                        </th>
                                        <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-widest text-slate-700">
                                            Categoría
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700">
                                            Stock Actual
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700">
                                            Stock Mínimo
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700">
                                            Stock Crítico
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700">
                                            Estado
                                        </th>
                                        <th className="px-6 py-4 text-center text-xs font-bold uppercase tracking-widest text-slate-700">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-beige-dark/10">
                                    {filteredProducts.map((product) => (
                                        <tr key={product.id} className="hover:bg-beige/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-beige rounded-lg overflow-hidden flex-shrink-0">
                                                        <img
                                                            src={formatImageUrl(product.image_url)}
                                                            alt={product.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-slate-800">{product.name}</p>
                                                        <p className="text-sm text-slate-500">${parseFloat(product.price).toLocaleString('es-AR')}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sm text-slate-600">
                                                    {product.category?.name || 'Sin categoría'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-lg font-bold text-slate-800">{product.stock}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-slate-600">{product.stock_minimo}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className="text-sm text-slate-600">{product.stock_critico}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <StockBadge
                                                    stock={product.stock}
                                                    stockMinimo={product.stock_minimo}
                                                    stockCritico={product.stock_critico}
                                                    size="md"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => navigate(`/admin/products/edit/${product.id}`)}
                                                    className="bg-earth hover:bg-earth-dark text-white px-4 py-2 rounded-full text-sm font-medium transition-colors"
                                                >
                                                    Editar Stock
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminStockAlerts;
