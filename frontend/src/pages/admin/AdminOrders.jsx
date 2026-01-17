import React, { useState, useEffect } from 'react';
import { formatImageUrl } from '../../utils/imageConfig';
import AdminLayout from '../../components/admin/AdminLayout';

/**
 * Panel de Administración de Pedidos
 * Vista mejorada con cards, filtros y gestión de estados
 */
const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterPayment, setFilterPayment] = useState('all');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${baseUrl}/orders`);
            const data = await response.json();
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
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
                alert('Estado actualizado correctamente');
            }
        } catch (error) {
            console.error('Error updating order:', error);
            alert('Error al actualizar el estado');
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

    // Filtrar pedidos
    const filteredOrders = orders.filter(order => {
        const matchStatus = filterStatus === 'all' || order.order_status === filterStatus;
        const matchPayment = filterPayment === 'all' || order.payment_status === filterPayment;
        return matchStatus && matchPayment;
    });

    return (
        <AdminLayout title="Gestión de Pedidos">
            <div className="p-10">
                {/* Filtros */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-beige-dark/10 mb-8 max-w-4xl">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
                                Estado del Pedido
                            </label>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
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
                                onChange={(e) => setFilterPayment(e.target.value)}
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
                        {filteredOrders.map((order) => (
                            <div key={order.id} className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 hover:shadow-md transition-all">
                                <div className="grid lg:grid-cols-12 gap-8">
                                    {/* Información Principal */}
                                    <div className="lg:col-span-4">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="font-bold text-xl text-slate-800 font-serif">Pedido #{order.id}</h3>
                                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                                                    {new Date(order.created_at).toLocaleDateString('es-AR', {
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
                                    <div className="lg:col-span-5 border-x border-beige-dark/10 px-8">
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
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminOrders;
