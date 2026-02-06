import React, { useState, useEffect } from 'react';
import { formatImageUrl } from '../../utils/imageConfig';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

/**
 * Panel de Administración de Pedidos
 * Vista mejorada con cards, filtros y gestión de estados
 */
const AdminOrders = () => {
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');

    // Date Filters
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            // Build query params
            const params = new URLSearchParams();
            if (dateRange.startDate) params.append('startDate', dateRange.startDate);
            if (dateRange.endDate) params.append('endDate', dateRange.endDate);

            const response = await fetch(`${baseUrl}/orders?${params.toString()}`);
            const data = await response.json();
            setOrders(data);
            setCurrentPage(1); // Reset to first page on new fetch
        } catch (error) {
            console.error('Error fetching orders:', error);
            showToast('Error al cargar pedidos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleFilterSubmit = (e) => {
        e.preventDefault();
        fetchOrders();
    };

    const updateOrderStatus = async (orderId, field, value) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${baseUrl}/orders/${orderId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ [field]: value })
            });

            if (response.ok) {
                fetchOrders(); // Refrescar lista
                showToast('Estado actualizado correctamente', 'success');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            showToast('Error al actualizar el estado', 'error');
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
            processing: 'bg-blue-100 text-blue-800 border-blue-300',
            shipped: 'bg-purple-100 text-purple-800 border-purple-300',
            delivered: 'bg-green-100 text-green-800 border-green-300',
            cancelled: 'bg-red-100 text-red-800 border-red-300'
        };

        const labels = {
            pending: 'Pendiente',
            processing: 'Procesando',
            shipped: 'Enviado',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getPaymentBadge = (status) => {
        const styles = {
            pending: 'bg-orange-100 text-orange-800 border-orange-300',
            approved: 'bg-green-100 text-green-800 border-green-300',
            rejected: 'bg-red-100 text-red-800 border-red-300',
            refunded: 'bg-gray-100 text-gray-800 border-gray-300'
        };

        const labels = {
            pending: 'Pago Pendiente',
            approved: 'Pagado',
            rejected: 'Rechazado',
            refunded: 'Reembolsado'
        };

        return (
            <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.pending}`}>
                {labels[status] || status}
            </span>
        );
    };

    const getPaymentMethodLabel = (method) => {
        const labels = {
            mercadopago: 'Mercado Pago',
            transfer: 'Transferencia',
            whatsapp: 'WhatsApp',
            cash: 'Efectivo'
        };
        return labels[method] || method;
    };

    // Filtrar pedidos (Status & Payment Local Filter)
    const filteredOrders = orders.filter(order => {
        const matchStatus = filterStatus === 'all' || order.order_status === filterStatus;
        const matchPayment = filterPayment === 'all' || order.payment_status === filterPayment;
        return matchStatus && matchPayment;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <AdminLayout title="Gestión de Pedidos">
            <div className="p-8">
                {/* Filtros */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-beige-dark/10 mb-8 w-full">
                    <div className="flex flex-col gap-6">
                        {/* Date Filters Form */}
                        <form onSubmit={handleFilterSubmit} className="flex flex-col md:flex-row items-end gap-4 border-b border-beige-dark/10 pb-6">
                            <div className="w-full md:w-auto flex-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Desde Fecha</label>
                                <input
                                    type="date"
                                    value={dateRange.startDate}
                                    onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                                    className="bg-paper border border-beige-dark/20 rounded-xl p-2 w-full focus:outline-none focus:border-earth text-sm"
                                />
                            </div>
                            <div className="w-full md:w-auto flex-1">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Hasta Fecha</label>
                                <input
                                    type="date"
                                    value={dateRange.endDate}
                                    onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                                    className="bg-paper border border-beige-dark/20 rounded-xl p-2 w-full focus:outline-none focus:border-earth text-sm"
                                />
                            </div>
                            <button
                                type="submit"
                                className="bg-earth text-white px-6 py-2 rounded-xl font-bold shadow-lg shadow-earth/20 hover:bg-earth-dark transition-all w-full md:w-auto text-sm h-[38px]"
                            >
                                Filtrar por Fecha
                            </button>
                            <button
                                type="button"
                                onClick={() => {
                                    setDateRange({ startDate: '', endDate: '' });
                                    // Trigger fetch without dates is tricky here because state update is async. 
                                    // A simple reload or effect dependency could work, 
                                    // but let's just clear inputs and let user click Filter or rely on next effect.
                                    // For now, simpler to just clear and let user refilter empty.
                                }}
                                className="text-slate-400 hover:text-earth text-xs font-bold uppercase tracking-widest px-2 py-2"
                            >
                                Limpiar
                            </button>
                        </form>

                        {/* Status Filters */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    Estado del Pedido
                                </label>
                                <select
                                    value={filterStatus}
                                    onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                >
                                    <option value="all">Todos</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="processing">Procesando</option>
                                    <option value="shipped">Enviado</option>
                                    <option value="delivered">Entregado</option>
                                    <option value="cancelled">Cancelado</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                    Estado del Pago
                                </label>
                                <select
                                    value={filterPayment}
                                    onChange={(e) => { setFilterPayment(e.target.value); setCurrentPage(1); }}
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth text-sm"
                                >
                                    <option value="all">Todos</option>
                                    <option value="pending">Pendiente</option>
                                    <option value="approved">Aprobado</option>
                                    <option value="rejected">Rechazado</option>
                                    <option value="refunded">Reembolsado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl shadow-sm border border-beige-dark/10 text-center">
                        <p className="text-slate-500 italic">No hay pedidos que coincidan con los filtros</p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {currentItems.map((order) => (
                            <div key={order.id} className="bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-beige-dark/10 hover:shadow-md transition-all">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    {/* Información Principal */}
                                    <div className="lg:col-span-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-800 font-serif">Pedido #{order.id}</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(order.createdAt || order.created_at).toLocaleDateString('es-AR', {
                                                        day: '2-digit',
                                                        month: 'long',
                                                        year: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 text-sm">
                                            <p className="flex justify-between border-b border-beige-dark/5 pb-2">
                                                <span className="text-slate-400">Cliente:</span>
                                                <span className="font-bold text-slate-700">{order.customer_name}</span>
                                            </p>
                                            <p className="flex justify-between border-b border-beige-dark/5 pb-2">
                                                <span className="text-slate-400">Teléfono:</span>
                                                <span className="font-bold text-slate-700">{order.customer_phone}</span>
                                            </p>
                                            <p className="flex flex-col gap-1">
                                                <span className="text-slate-400">Dirección:</span>
                                                <span className="text-slate-600 italic">
                                                    {order.customer_address ? `${order.customer_address}, ${order.customer_city}` : 'Retira en local'}
                                                </span>
                                            </p>
                                            <p className="flex justify-between bg-beige-light/30 p-2 rounded-lg">
                                                <span className="text-slate-500 font-bold text-xs uppercase self-center">Método:</span>
                                                <span className="font-bold text-earth text-xs">{getPaymentMethodLabel(order.payment_method)}</span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Productos */}
                                    <div className="lg:col-span-5 lg:border-x lg:border-beige-dark/10 lg:px-8 border-t border-b border-beige-dark/10 py-6 lg:py-0">
                                        <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Productos</h4>
                                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex gap-4 items-center">
                                                    <div className="w-12 h-12 bg-beige rounded-xl overflow-hidden flex-shrink-0 border border-beige-dark/10">
                                                        <img
                                                            src={formatImageUrl(item.image_url)}
                                                            alt={item.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-bold text-slate-700 truncate">{item.name}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold uppercase">x{item.quantity} • ${parseFloat(item.price).toLocaleString('es-AR')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-4 border-t border-beige-dark/10 flex justify-between items-center">
                                            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Total acumulado</span>
                                            <span className="text-2xl font-serif font-bold text-earth">
                                                ${parseFloat(order.total).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Estados y Acciones */}
                                    <div className="lg:col-span-3 lg:pl-4">
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Estado Pedido</label>
                                                <select
                                                    value={order.order_status}
                                                    onChange={(e) => updateOrderStatus(order.id, 'order_status', e.target.value)}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-2 text-sm focus:outline-none focus:border-earth transition-all"
                                                >
                                                    <option value="pending">Pendiente</option>
                                                    <option value="processing">Procesando</option>
                                                    <option value="shipped">Enviado</option>
                                                    <option value="delivered">Entregado</option>
                                                    <option value="cancelled">Cancelado</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Estado Pago</label>
                                                <select
                                                    value={order.payment_status}
                                                    onChange={(e) => updateOrderStatus(order.id, 'payment_status', e.target.value)}
                                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-2 text-sm focus:outline-none focus:border-earth transition-all"
                                                >
                                                    <option value="pending">Pendiente</option>
                                                    <option value="approved">Aprobado</option>
                                                    <option value="rejected">Rechazado</option>
                                                    <option value="refunded">Reembolsado</option>
                                                </select>
                                            </div>

                                            <div className="flex flex-col gap-2 pt-2">
                                                {getStatusBadge(order.order_status)}
                                                {getPaymentBadge(order.payment_status)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {/* Pagination Controls */}
                        {filteredOrders.length > itemsPerPage && (
                            <div className="flex justify-center items-center gap-2 p-6 border-t border-beige-dark/10 bg-gray-50 rounded-3xl">
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
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
