import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPurchases = () => {
    const [purchases, setPurchases] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [supplierFilter, setSupplierFilter] = useState('');

    useEffect(() => {
        fetchPurchases();
    }, []);

    const filteredPurchases = purchases.filter(purchase => {
        const purchaseDate = new Date(purchase.purchase_date);
        const start = startDate ? new Date(startDate) : null;
        const end = endDate ? new Date(endDate) : null;

        // Ajustar fin del día para la fecha final
        if (end) end.setHours(23, 59, 59, 999);

        const dateMatch = (!start || purchaseDate >= start) && (!end || purchaseDate <= end);
        const supplierMatch = supplierFilter === '' ||
            (purchase.supplier?.name && purchase.supplier.name.toLowerCase().includes(supplierFilter.toLowerCase()));

        return dateMatch && supplierMatch;
    });

    const fetchPurchases = async () => {
        try {
            setLoading(true);
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/purchases`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setPurchases(data);
        } catch (error) {
            console.error('Error fetching purchases:', error);
            showToast('Error al cargar historial de compras', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async (id) => {
        if (window.confirm('¿Deseas marcar esta compra como RECIBIDA? Esto actualizará el stock de todos los productos incluidos.')) {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const token = localStorage.getItem('token');
                const response = await fetch(`${baseUrl}/purchases/${id}/receive`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    showToast('Compra recibida y stock actualizado', 'success');
                    fetchPurchases();
                } else {
                    showToast('Error al recibir compra', 'error');
                }
            } catch (error) {
                showToast('Error de conexión', 'error');
            }
        }
    };

    const handleCancel = async (id) => {
        if (window.confirm('¿Estás seguro de cancelar esta compra?')) {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const token = localStorage.getItem('token');
                const response = await fetch(`${baseUrl}/purchases/${id}/cancel`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    showToast('Compra cancelada', 'info');
                    fetchPurchases();
                }
            } catch (error) {
                showToast('Error al cancelar', 'error');
            }
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'received': return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-[10px] font-bold uppercase">Recibida</span>;
            case 'cancelled': return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-[10px] font-bold uppercase">Cancelada</span>;
            case 'draft': return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold uppercase">Borrador</span>;
            default: return null;
        }
    };

    const actions = (
        <Link to="/admin/purchases/new" className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark transition-all flex items-center gap-2 shadow-lg shadow-earth/20">
            <span>+</span> Registrar Compra
        </Link>
    );

    return (
        <AdminLayout title="Historial de Compras" actions={actions}>
            <div className="p-10">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                        {/* Filtros */}
                        <div className="p-5 border-b border-beige-dark/10 bg-beige-light/10 flex flex-wrap gap-4 items-end">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50"
                                />
                            </div>
                            <div className="flex-1">
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Proveedor</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por proveedor..."
                                    value={supplierFilter}
                                    onChange={(e) => setSupplierFilter(e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50"
                                />
                            </div>
                            {(startDate || endDate || supplierFilter) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); setSupplierFilter(''); }}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold underline mb-1"
                                >
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>

                        <table className="w-full text-left">
                            <thead className="bg-beige-light/30 border-b border-beige-dark/10">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Fecha</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Proveedor</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Factura #</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Total</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {filteredPurchases.length > 0 ? filteredPurchases.map(purchase => (
                                    <tr key={purchase.id} className="hover:bg-beige-light/10 transition-colors">
                                        <td className="px-8 py-5 text-sm text-slate-600">
                                            {new Date(purchase.purchase_date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-800 text-sm">{purchase.supplier?.name || 'N/A'}</p>
                                        </td>
                                        <td className="px-8 py-5 text-xs text-slate-500 font-mono">
                                            {purchase.invoice_number || '-'}
                                        </td>
                                        <td className="px-8 py-5 font-bold text-earth text-sm">
                                            ${parseFloat(purchase.total_amount).toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-8 py-5">
                                            {getStatusBadge(purchase.status)}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-3 text-slate-400">
                                                {purchase.status === 'draft' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleReceive(purchase.id)}
                                                            className="px-3 py-1 bg-earth text-white rounded-lg text-[10px] font-bold hover:bg-earth-dark transition-all"
                                                            title="Marcar como recibida"
                                                        >
                                                            RECIBIR
                                                        </button>
                                                        <button
                                                            onClick={() => handleCancel(purchase.id)}
                                                            className="p-2 hover:text-red-500 transition-colors"
                                                            title="Cancelar compra"
                                                        >
                                                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </>
                                                )}
                                                <Link to={`/admin/purchases/${purchase.id}`} className="p-2 hover:text-earth transition-colors" title="Ver detalle">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-8 py-10 text-center text-slate-400 italic">No hay historial de compras.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminPurchases;
