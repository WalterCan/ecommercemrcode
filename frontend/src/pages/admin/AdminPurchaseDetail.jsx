import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';
import { formatImageUrl } from '../../utils/imageConfig';

const AdminPurchaseDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [purchase, setPurchase] = useState(null);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchPurchase();
    }, [id]);

    const fetchPurchase = async () => {
        try {
            const response = await fetch(`${baseUrl}/purchases/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setPurchase(data);
            } else {
                showToast('No se encontró la compra', 'error');
                navigate('/admin/purchases');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleReceive = async () => {
        if (window.confirm('¿Deseas marcar esta compra como RECIBIDA? El stock se actualizará ahora.')) {
            try {
                const response = await fetch(`${baseUrl}/purchases/${id}/receive`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (response.ok) {
                    showToast('Compra recibida correctamente', 'success');
                    fetchPurchase();
                }
            } catch (error) {
                showToast('Error al procesar recepción', 'error');
            }
        }
    };

    if (loading) return <AdminLayout title="Cargando..."><div className="p-20 text-center"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div></div></AdminLayout>;
    if (!purchase) return null;

    return (
        <AdminLayout
            title={`Detalle de Compra #${purchase.id}`}
            actions={<Link to="/admin/purchases" className="text-slate-500 hover:text-earth text-sm font-bold">Volver al listado</Link>}
        >
            <div className="p-4 md:p-10 max-w-5xl mx-auto w-full space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Info General */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 md:col-span-2 space-y-4">
                        <div className="flex justify-between items-start border-b border-beige-dark/5 pb-4">
                            <div>
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Proveedor</h3>
                                <p className="text-xl font-serif font-bold text-slate-800">{purchase.supplier?.name}</p>
                                <p className="text-xs text-slate-500 italic">CUIT: {purchase.supplier?.tax_id || 'N/A'}</p>
                            </div>
                            <div className="text-right">
                                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">Estado</h3>
                                <span className={`px-4 py-1 rounded-full text-[10px] font-bold uppercase ${purchase.status === 'received' ? 'bg-green-100 text-green-700' :
                                    purchase.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                    }`}>
                                    {purchase.status}
                                </span>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-slate-400">Fecha de Registro</h4>
                                <p className="text-sm font-medium">{new Date(purchase.purchase_date).toLocaleDateString()} {new Date(purchase.purchase_date).toLocaleTimeString()}</p>
                            </div>
                            <div>
                                <h4 className="text-[10px] font-bold uppercase text-slate-400">Factura Número</h4>
                                <p className="text-sm font-mono font-bold text-earth">{purchase.invoice_number || 'Sin número'}</p>
                            </div>
                            <div className="col-span-2">
                                <h4 className="text-[10px] font-bold uppercase text-slate-400">Notas</h4>
                                <p className="text-sm text-slate-600 bg-paper p-3 rounded-xl mt-1">{purchase.notes || 'Sin observaciones'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Resumen de Total */}
                    <div className="bg-earth text-white p-8 rounded-3xl shadow-xl shadow-earth/20 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xs font-bold uppercase tracking-widest opacity-70 mb-2">Total de la Compra</h3>
                            <p className="text-4xl font-serif font-bold">${parseFloat(purchase.total_amount).toLocaleString('es-AR')}</p>
                        </div>
                        {purchase.status === 'draft' && (
                            <button
                                onClick={handleReceive}
                                className="w-full bg-white text-earth py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-beige-light transition-all shadow-lg mt-8"
                            >
                                Recibir Mercadería
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabla de Items */}
                <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left min-w-[600px]">
                            <thead className="bg-beige-light/30 border-b border-beige-dark/10">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Producto</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Cantidad</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Costo Unit.</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {purchase.items?.map(item => (
                                    <tr key={item.id}>
                                        <td className="px-8 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-beige-light flex-shrink-0 border border-beige-dark/10">
                                                    <img src={formatImageUrl(item.product?.image_url)} className="w-full h-full object-cover" alt="" />
                                                </div>
                                                <span className="font-bold text-slate-700 text-sm">{item.product?.name}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-center font-bold text-slate-600">
                                            {item.quantity}
                                        </td>
                                        <td className="px-8 py-4 text-right text-slate-500 text-sm">
                                            ${parseFloat(item.unit_cost).toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-8 py-4 text-right font-bold text-slate-800">
                                            ${(item.quantity * item.unit_cost).toLocaleString('es-AR')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminPurchaseDetail;
