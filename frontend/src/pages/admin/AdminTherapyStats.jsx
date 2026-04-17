import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';

/**
 * AdminTherapyStats - Visualización de ingresos por terapias.
 * Permite ver el rendimiento financiero del consultorio con filtros y gráficos.
 */
const AdminTherapyStats = () => {
    const { user } = useAuth();
    const { showToast } = useToast();
    const [stats, setStats] = useState({ totalIncome: 0, pendingIncome: 0, totalSessions: 0, byType: [] });
    const [chartData, setChartData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filter State
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0], // Últimos 30 días
        endDate: new Date().toISOString().split('T')[0]
    });

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const COLORS = ['#8A9A5B', '#C19A6B', '#D27D2D', '#556B2F', '#BC8F8F'];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const headers = { 'Authorization': `Bearer ${token}` };

            // Query params for dates
            const queryParams = new URLSearchParams({
                startDate: dateRange.startDate,
                endDate: dateRange.endDate
            }).toString();

            const [statsRes, chartRes] = await Promise.all([
                fetch(`${baseUrl}/stats/therapy-stats?${queryParams}`, { headers }),
                fetch(`${baseUrl}/stats/therapy-sales-chart?${queryParams}`, { headers })
            ]);

            if (statsRes.ok && chartRes.ok) {
                const statsData = await statsRes.json();
                const chartDataRaw = await chartRes.json();

                setStats(statsData);

                // Formatear datos del gráfico
                const formattedChart = chartDataRaw.map(d => ({
                    date: d.date.split('-').slice(1).reverse().join('/'),
                    total: parseFloat(d.total)
                }));
                setChartData(formattedChart);
                setCurrentPage(1); // Reset pagination on new data
            } else {
                let msg = 'Error al cargar estadísticas';
                try {
                    if (!statsRes.ok) {
                        const err = await statsRes.json();
                        msg = err.message || 'Error en estadísticas';
                    } else if (!chartRes.ok) {
                        const err = await chartRes.json();
                        msg = err.message || 'Error en gráfico';
                    }
                } catch (e) {
                    console.error('Error parsing error response:', e);
                }
                showToast(msg, 'error');
            }
        } catch (error) {
            console.error('Error fetching therapy stats:', error);
            showToast('Error de conexión: ' + (error.message || 'Desconocido'), 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchData();
    };

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = stats.byType.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(stats.byType.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    if (loading && !stats.totalIncome) {
        return (
            <AdminLayout title="Ingresos Terapias">
                <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-earth"></div>
                </div>
            </AdminLayout>
        );
    }

    return (
        <AdminLayout title="Análisis de Ingresos - Consultorio">
            <div className="p-8 space-y-8">
                {/* Filtro de Fechas */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-beige-dark/10">
                    <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row items-end gap-4">
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Desde</label>
                            <input
                                type="date"
                                value={dateRange.startDate}
                                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                className="bg-paper border border-beige-dark/20 rounded-xl p-2 w-full focus:outline-none focus:border-earth"
                            />
                        </div>
                        <div className="w-full md:w-auto">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Hasta</label>
                            <input
                                type="date"
                                value={dateRange.endDate}
                                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                className="bg-paper border border-beige-dark/20 rounded-xl p-2 w-full focus:outline-none focus:border-earth"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-earth text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-earth/20 hover:bg-earth-dark transition-all w-full md:w-auto mt-4 md:mt-0"
                        >
                            Filtrar
                        </button>
                    </form>
                </div>

                {/* Métricas Principales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ingresos Consolidados</p>
                        <p className="text-4xl font-serif font-bold text-earth">${stats.totalIncome.toLocaleString('es-AR')}</p>
                        <p className="text-[10px] text-moss font-bold mt-2 uppercase tracking-tighter italic">Efectivo + Transferencia + MP</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Ingresos Pendientes</p>
                        <p className="text-4xl font-serif font-bold text-terracotta">${stats.pendingIncome.toLocaleString('es-AR')}</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tighter">Turnos agendados sin abonar</p>
                    </div>
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Sesiones Totales</p>
                        <p className="text-4xl font-serif font-bold text-slate-800">{stats.totalSessions}</p>
                        <p className="text-[10px] text-slate-400 mt-2 uppercase tracking-tighter">Histórico de reservas activas</p>
                    </div>
                </div>

                {/* Gráficos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Ingresos Diarios */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                        <h3 className="text-lg font-serif font-bold text-slate-800 mb-6">Tendencia de Ingresos</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94A3B8' }} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                        formatter={(val) => [`$${val.toLocaleString('es-AR')}`, 'Ingresos']}
                                    />
                                    <Line type="monotone" dataKey="total" stroke="#8A9A5B" strokeWidth={3} dot={{ r: 4, fill: '#8A9A5B' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Distribución por Terapia */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                        <h3 className="text-lg font-serif font-bold text-slate-800 mb-6">Distribución por Tipo de Terapia</h3>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={stats.byType}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={100}
                                        paddingAngle={5}
                                        dataKey="income"
                                    >
                                        {stats.byType.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(val) => [`$${val.toLocaleString('es-AR')}`, 'Ingresos']} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Tabla de Desglose */}
                <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                    <div className="p-8 border-b border-beige-dark/10 flex justify-between items-center">
                        <h3 className="text-lg font-serif font-bold text-slate-800">Rendimiento por Categoría</h3>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-paper border-b border-beige-dark/10">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Terapia</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Sesiones</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Total Generado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {currentItems.map((item, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-700 text-sm">{item.name}</td>
                                        <td className="px-8 py-5 text-center text-sm text-slate-500">{item.count} sesiones</td>
                                        <td className="px-8 py-5 text-right font-bold text-earth text-sm">${item.income.toLocaleString('es-AR')}</td>
                                    </tr>
                                ))}
                                {stats.byType.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="px-8 py-10 text-center text-slate-400 italic">No hay datos cargados aún para este período</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Controls */}
                    {stats.byType.length > itemsPerPage && (
                        <div className="flex justify-center items-center gap-2 p-6 border-t border-beige-dark/10 bg-gray-50">
                            <button
                                onClick={() => paginate(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="p-2 rounded-lg border border-beige-dark/20 text-slate-600 hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                &lt;
                            </button>
                            {Array.from({ length: totalPages }, (_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => paginate(i + 1)}
                                    className={`w-8 h-8 rounded-lg text-sm font-bold ${currentPage === i + 1 ? 'bg-earth text-white' : 'text-slate-600 hover:bg-paper'}`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <button
                                onClick={() => paginate(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="p-2 rounded-lg border border-beige-dark/20 text-slate-600 hover:bg-paper disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminTherapyStats;
