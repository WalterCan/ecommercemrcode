import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const AdminCoupons = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();
    const [newCoupon, setNewCoupon] = useState({
        code: '',
        discount_type: 'percentage',
        discount_value: '',
        start_date: '',
        expiry_date: '',
        usage_limit: ''
    });

    const fetchCoupons = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/coupons`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setCoupons(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';

            // Limpiar datos: convertir campos vacíos a null
            const cleanedCoupon = {
                ...newCoupon,
                start_date: newCoupon.start_date || null,
                expiry_date: newCoupon.expiry_date || null,
                usage_limit: newCoupon.usage_limit || null,
                discount_value: parseFloat(newCoupon.discount_value)
            };

            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/coupons`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(cleanedCoupon)
            });
            if (res.ok) {
                showToast('Cupón creado exitosamente', 'success');
                setNewCoupon({ code: '', discount_type: 'percentage', discount_value: '', start_date: '', expiry_date: '', usage_limit: '' });
                fetchCoupons();
            } else {
                showToast('Error al crear cupón', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar este cupón?')) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5176/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/coupons/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast('Cupón eliminado', 'success');
                fetchCoupons();
            }
        } catch (error) {
            showToast('Error al eliminar', 'error');
        }
    };

    return (
        <AdminLayout title="Gestión de Cupones">
            <div className="p-10">
                <div className="grid lg:grid-cols-3 gap-10">
                    {/* Formulario */}
                    <div className="lg:col-span-1">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                            <h3 className="text-lg font-serif text-slate-800 mb-6">Nuevo Cupón</h3>
                            <form onSubmit={handleCreate} className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Código</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth uppercase"
                                        value={newCoupon.code}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })}
                                        placeholder="EJ: HOLISTICA10"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Tipo de Descuento</label>
                                    <select
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none"
                                        value={newCoupon.discount_type}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_type: e.target.value })}
                                    >
                                        <option value="percentage">Porcentaje (%)</option>
                                        <option value="fixed">Monto Fijo ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Valor</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none"
                                        value={newCoupon.discount_value}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, discount_value: e.target.value })}
                                        placeholder="10"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Inicio</label>
                                        <input
                                            type="date"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none"
                                            value={newCoupon.start_date}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, start_date: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Expiración</label>
                                        <input
                                            type="date"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none"
                                            value={newCoupon.expiry_date}
                                            onChange={(e) => setNewCoupon({ ...newCoupon, expiry_date: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Límite de Uso (opcional)</label>
                                    <input
                                        type="number"
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none"
                                        value={newCoupon.usage_limit}
                                        onChange={(e) => setNewCoupon({ ...newCoupon, usage_limit: e.target.value })}
                                        placeholder="Sin límite"
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-earth text-white py-4 rounded-xl font-bold hover:bg-earth-dark transition-all mt-4"
                                >
                                    Crear Cupón
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Tabla */}
                    <div className="lg:col-span-2">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                            <h3 className="text-lg font-serif text-slate-800 mb-6">Cupones Activos</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400 border-b border-beige-dark/10">
                                            <th className="pb-4">Código</th>
                                            <th className="pb-4">Descuento</th>
                                            <th className="pb-4">Vigencia</th>
                                            <th className="pb-4">Usos</th>
                                            <th className="pb-4">Límite</th>
                                            <th className="pb-4">Acciones</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-beige-dark/5">
                                        {coupons.map((coupon) => (
                                            <tr key={coupon.id} className="text-sm">
                                                <td className="py-4 font-bold text-earth">{coupon.code}</td>
                                                <td className="py-4 text-slate-600">
                                                    {coupon.discount_type === 'percentage' ? `${coupon.discount_value}%` : `$${coupon.discount_value}`}
                                                </td>
                                                <td className="py-4 text-xs text-slate-500">
                                                    {coupon.start_date ? new Date(coupon.start_date).toLocaleDateString() : 'Ahora'} - {coupon.expiry_date ? new Date(coupon.expiry_date).toLocaleDateString() : '∞'}
                                                </td>
                                                <td className="py-4">{coupon.usage_count}</td>
                                                <td className="py-4">{coupon.usage_limit || '∞'}</td>
                                                <td className="py-4">
                                                    <button
                                                        onClick={() => handleDelete(coupon.id)}
                                                        className="text-terracotta hover:underline text-xs"
                                                    >
                                                        Eliminar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminCoupons;
