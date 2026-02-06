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

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredPurchases.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

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

    const [showReceiveModal, setShowReceiveModal] = useState(false);
    const [selectedPurchaseId, setSelectedPurchaseId] = useState(null);

    const openReceiveModal = (id) => {
        setSelectedPurchaseId(id);
        setShowReceiveModal(true);
    };

    const confirmReceive = async () => {
        if (!selectedPurchaseId) return;

        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/purchases/${selectedPurchaseId}/receive`, {
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
        } finally {
            setShowReceiveModal(false);
            setSelectedPurchaseId(null);
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
            <div className="p-4 md:p-10">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden flex flex-col">
                        {/* Filtros */}
                        <div className="p-5 border-b border-beige-dark/10 bg-beige-light/10 flex flex-col md:flex-row gap-4 items-end md:flex-wrap">
                            <div className="w-full md:w-auto">
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Desde</label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => { setStartDate(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50"
                                />
                            </div>
                            <div className="w-full md:w-auto">
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Hasta</label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => { setEndDate(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50"
                                />
                            </div>
                            <div className="flex-1 w-full md:w-auto">
                                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Proveedor</label>
                                <input
                                    type="text"
                                    placeholder="Buscar por proveedor..."
                                    value={supplierFilter}
                                    onChange={(e) => { setSupplierFilter(e.target.value); setCurrentPage(1); }}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50"
                                />
                            </div>
                            {(startDate || endDate || supplierFilter) && (
                                <button
                                    onClick={() => { setStartDate(''); setEndDate(''); setSupplierFilter(''); setCurrentPage(1); }}
                                    className="text-xs text-red-500 hover:text-red-700 font-bold underline mb-1"
                                >
                                    Limpiar Filtros
                                </button>
                            )}
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
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
                                    {currentItems.length > 0 ? currentItems.map(purchase => (
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
                                                                onClick={() => openReceiveModal(purchase.id)}
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
                                            <td colSpan="6" className="px-8 py-10 text-center text-slate-400 italic">No hay historial de compras que coincida con los filtros.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredPurchases.length > itemsPerPage && (
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
                )}

                {/* Modal de Confirmación */}
                {showReceiveModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
                        <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fade-in-up">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-full bg-earth/10 flex items-center justify-center text-earth text-2xl">
                                    📦
                                </div>
                                <h3 className="text-lg font-bold text-slate-800">Confirmar Recepción</h3>
                            </div>

                            <p className="text-slate-600 mb-6">
                                ¿Deseas marcar esta compra como <span className="font-bold text-earth">RECIBIDA</span>?
                                <br /><br />
                                Esto <strong className="text-green-600">sumará el stock</strong> de todos los productos incluidos en la factura al inventario actual.
                            </p>

                            <div className="flex gap-3 justify-end">
                                <button
                                    onClick={() => setShowReceiveModal(false)}
                                    className="px-4 py-2 rounded-xl text-slate-500 hover:bg-slate-50 font-medium transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={confirmReceive}
                                    className="px-6 py-2 rounded-xl bg-earth text-white font-bold hover:bg-earth-dark shadow-lg shadow-earth/20 transition-all hover:-translate-y-0.5"
                                >
                                    Confirmar y Actualizar Stock
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminPurchases;
