import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { formatImageUrl } from '../../utils/imageConfig';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

/**
 * Dashboard Administrativo.
 * Vista resumida con estadísticas y acceso a gestión.
 */
const AdminDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, totalSales: 0 });
  const [salesData, setSalesData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [criticalStock, setCriticalStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#8A9A5B', '#C19A6B', '#D27D2D', '#556B2F', '#BC8F8F'];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
        const token = localStorage.getItem('token');
        const headers = { 'Authorization': `Bearer ${token}` };

        // Fetch estadísticas nuevas del backend
        const [generalRes, salesRes, topProdsRes, stockAlertsRes, recentOrdersRes, categoryRes] = await Promise.all([
          fetch(`${baseUrl}/stats/general`, { headers }),
          fetch(`${baseUrl}/stats/sales-chart`, { headers }),
          fetch(`${baseUrl}/stats/top-products`, { headers }),
          fetch(`${baseUrl}/products/stock-alerts`, { headers }),
          fetch(`${baseUrl}/stats/recent-orders`, { headers }),
          fetch(`${baseUrl}/stats/category-stats`, { headers })
        ]);

        const generalData = await generalRes.json();
        const salesData = await salesRes.json();
        const topProducts = await topProdsRes.json();
        const stockAlerts = await stockAlertsRes.json();
        const recentOrdersData = await recentOrdersRes.json();
        const catChart = await categoryRes.json();

        // Obtener reseñas pendientes
        const reviewRes = await fetch(`${baseUrl}/reviews/admin`);
        let pendingReviews = 0;
        if (reviewRes.ok) {
          const allReviews = await reviewRes.json();
          pendingReviews = allReviews.filter(r => !r.is_approved).length;
        }

        setStats({
          products: generalData.lowStockProducts, // Reusamos este campo o lo cambiamos
          categories: catChart.length, // Ya no es crítico
          orders: generalData.totalOrders,
          totalSales: generalData.totalSales,
          pendingReviews: pendingReviews,
          criticalStock: generalData.lowStockProducts,
          avgTicket: generalData.avgTicket
        });

        // Formatear datos del gráfico
        const chartData = salesData.map(d => ({
          date: d.date.split('-').slice(1).join('/'),
          total: parseFloat(d.total)
        }));

        setSalesData(chartData);
        setCategoryData(catChart); // Desactivado por ahora si no hay endpoint
        setCriticalStock(stockAlerts.slice(0, 5));
        setRecentOrders(recentOrdersData);

      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout title="Cargando Energías...">
        <div className="flex h-full items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-earth"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Panel de Control">
      <div className="p-10 custom-scrollbar">
        {/* Tarjetas de Estadísticas Principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            { label: "Ventas Totales", value: `$${stats.totalSales.toLocaleString('es-AR')}`, color: "bg-earth/10 text-earth", icon: "💰" },
            { label: "Alertas Stock", value: stats.criticalStock || 0, color: (stats.criticalStock || 0) > 0 ? "bg-red-50 text-red-600" : "bg-green-50 text-green-600", icon: "⚠️", link: "/admin/stock-alerts" },
            { label: "Reseñas Pendientes", value: stats.pendingReviews, color: stats.pendingReviews > 0 ? "bg-terracotta/10 text-terracotta" : "bg-moss/10 text-moss", icon: "💬", link: "/admin/reviews" },
            { label: "Recordatorios", value: "Gestionar", color: "bg-blue-50 text-blue-600", icon: "🔔", link: "/admin/recordatorios" }
          ].map((card, i) => (
            <Link key={i} to={card.link || "#"} className="bg-white p-6 rounded-3xl shadow-sm border border-beige-dark/10 flex items-center justify-between hover:shadow-md transition-all">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">{card.label}</p>
                <p className="text-2xl font-serif text-slate-800 font-bold">{card.value}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl ${card.color} flex items-center justify-center text-xl`}>
                {card.icon}
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-10">
          {/* Gráfico de Ventas */}
          <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-lg font-serif text-slate-800">Tendencia de Ventas (7 días)</h3>
              <span className="text-xs font-bold text-moss bg-moss/10 px-3 py-1 rounded-full uppercase tracking-tighter">En Tiempo Real</span>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12 }} dx={-10} tickFormatter={(value) => `$${value}`} />
                  <Tooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(value) => [`$${value.toLocaleString()}`, 'Ventas']}
                  />
                  <Line type="monotone" dataKey="total" stroke="#8A9A5B" strokeWidth={4} dot={{ r: 6, fill: '#8A9A5B', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 8 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico de Distribución */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
            <h3 className="text-lg font-serif text-slate-800 mb-8">Vibración por Categoría</h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Stock Crítico */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-serif text-slate-800">Alertas de Stock</h3>
              <Link to="/admin/products" className="text-xs text-earth hover:underline font-bold uppercase tracking-widest">Ver todo</Link>
            </div>
            <div className="space-y-4">
              {criticalStock.length > 0 ? criticalStock.map((prod) => (
                <div key={prod.id} className="flex items-center justify-between p-4 bg-paper/50 rounded-2xl border border-beige-dark/5">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg border border-beige-dark/10 overflow-hidden">
                      <img src={formatImageUrl(prod.image_url)} alt={prod.name} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">{prod.name}</p>
                      <p className="text-xs text-slate-400">ID: #{prod.id}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${prod.stockStatus === 'critical' ? 'bg-red-50 text-red-600' :
                      prod.stockStatus === 'low' ? 'bg-yellow-50 text-yellow-600' :
                        'bg-green-50 text-green-600'
                      }`}>
                      {prod.stock === 0 ? 'Agotado' : `${prod.stock} Restantes`}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Mín: {prod.stock_minimo || 10}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="py-10 text-center">
                  <p className="text-slate-400 italic text-sm">Todos los niveles de energía son estables.</p>
                </div>
              )}
            </div>
          </div>

          {/* Pedidos Recientes */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-serif text-slate-800">Actividad Reciente</h3>
              <Link to="/admin/orders" className="text-xs text-earth hover:underline font-bold uppercase tracking-widest">Gestionar</Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400 border-b border-beige-dark/10">
                    <th className="pb-4">Pedido</th>
                    <th className="pb-4">Cliente</th>
                    <th className="pb-4">Total</th>
                    <th className="pb-4">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-dark/5">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="text-sm">
                      <td className="py-4 font-bold text-earth">#{order.id}</td>
                      <td className="py-4 text-slate-600 truncate max-w-[120px]">{order.customer_name}</td>
                      <td className="py-4 font-bold text-slate-800">${parseFloat(order.total).toLocaleString()}</td>
                      <td className="py-4">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded-md font-bold ${order.payment_status === 'approved' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                          }`}>
                          {order.payment_status === 'approved' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
