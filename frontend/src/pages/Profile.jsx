import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';
import Header from '../components/layout/Header';
import CartDrawer from '../components/cart/CartDrawer';

const Profile = () => {
    const { user, logout } = useAuth();
    const { showToast } = useToast();
    const [orders, setOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userModules, setUserModules] = useState([]);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        dni: user?.patient?.dni || '',
        birth_date: user?.patient?.birth_date || '',
        address: user?.address || '',
        city: user?.city || '',
        postal_code: user?.postal_code || ''
    });

    useEffect(() => {
        fetchProfile();
        fetchOrders();
        fetchUserModules();
    }, []);

    const fetchProfile = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/users/profile`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                const profileUser = data.user || data;
                setFormData({
                    name: profileUser.name || '',
                    email: profileUser.email || '',
                    phone: profileUser.phone || '',
                    dni: profileUser.patient?.dni || '',
                    birth_date: profileUser.patient?.birth_date || '',
                    address: profileUser.address || '',
                    city: profileUser.city || '',
                    postal_code: profileUser.postal_code || ''
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    };


    const fetchOrders = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/users/orders`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setOrders(data);
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoadingOrders(false);
        }
    };

    const fetchUserModules = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/api/module-management/my-modules`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok) {
                const data = await response.json();
                setUserModules(data);
            }
        } catch (error) {
            console.error('Error fetching modules:', error);
        }
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/users/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast('Perfil actualizado correctamente', 'success');
            } else {
                showToast('Error al actualizar perfil', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setSaving(false);
        }
    };

    const getStatusBadge = (status) => {
        const styles = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-indigo-100 text-indigo-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };
        const labels = {
            pending: 'Pendiente',
            processing: 'Enviando',
            shipped: 'En Camino',
            delivered: 'Entregado',
            cancelled: 'Cancelado'
        };
        return <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${styles[status]}`}>{labels[status]}</span>;
    };

    return (
        <div className="min-h-screen bg-paper">
            <Header />
            <CartDrawer />

            <div className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div>
                            <h1 className="text-4xl font-serif text-slate-900 mb-2">Mi Cuenta</h1>
                            <p className="text-slate-500">Hola, {user?.name || 'Bienvenido'}. Gestiona tus pedidos y datos de envío.</p>
                        </div>
                        <div className="flex gap-4">
                            <Link
                                to="/"
                                className="bg-white border border-beige-dark/20 text-slate-600 px-6 py-2 rounded-full font-bold hover:bg-beige-light transition-all text-sm flex items-center gap-2"
                            >
                                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Volver a la Tienda
                            </Link>
                            <button
                                onClick={logout}
                                className="bg-white border border-red-200 text-red-600 px-6 py-2 rounded-full font-bold hover:bg-red-50 transition-all text-sm"
                            >
                                Cerrar Sesión
                            </button>
                        </div>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        {/* Panel de Datos */}
                        <div className="lg:col-span-1">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                                <h2 className="text-xl font-serif text-earth font-bold mb-6">Mis Datos de Envío</h2>
                                <form onSubmit={handleUpdateProfile} className="space-y-4">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nombre Completo</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                            Email <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.email || ''}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            placeholder="tu@email.com"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                            required
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Necesario para recordatorios de turnos</p>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                                            Teléfono <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            placeholder="3412345678"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                            required
                                        />
                                        <p className="text-xs text-slate-400 mt-1">Necesario para recordatorios de turnos</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">DNI</label>
                                            <input
                                                type="text"
                                                value={formData.dni}
                                                onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                                                placeholder="12345678"
                                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Fecha de Nacimiento</label>
                                            <input
                                                type="date"
                                                value={formData.birth_date}
                                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Dirección</label>
                                        <textarea
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            rows="2"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Ciudad</label>
                                            <input
                                                type="text"
                                                value={formData.city}
                                                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">CP</label>
                                            <input
                                                type="text"
                                                value={formData.postal_code}
                                                onChange={(e) => setFormData({ ...formData, postal_code: e.target.value })}
                                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-earth text-white py-3 rounded-xl font-bold hover:bg-earth-dark transition-all disabled:opacity-50 mt-4 shadow-md"
                                    >
                                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                                    </button>
                                </form>
                            </div>

                            {/* Cambio de Contraseña */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 mt-6">
                                <h2 className="text-xl font-serif text-earth font-bold mb-6">Seguridad</h2>
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const current = e.target.currentPassword.value;
                                        const newPass = e.target.newPassword.value;
                                        const confirm = e.target.confirmPassword.value;

                                        if (newPass !== confirm) {
                                            return showToast('Las nuevas contraseñas no coinciden', 'error');
                                        }

                                        setSaving(true);
                                        try {
                                            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                                            const token = localStorage.getItem('token');
                                            const response = await fetch(`${baseUrl}/users/change-password`, {
                                                method: 'PUT',
                                                headers: {
                                                    'Content-Type': 'application/json',
                                                    'Authorization': `Bearer ${token}`
                                                },
                                                body: JSON.stringify({ currentPassword: current, newPassword: newPass })
                                            });

                                            if (response.ok) {
                                                showToast('Contraseña actualizada correctamente', 'success');
                                                e.target.reset();
                                            } else {
                                                const data = await response.json();
                                                showToast(data.message || 'Error al cambiar contraseña', 'error');
                                            }
                                        } catch (error) {
                                            showToast('Error de conexión', 'error');
                                        } finally {
                                            setSaving(false);
                                        }
                                    }}
                                    className="space-y-4"
                                >
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Contraseña Actual</label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            required
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            required
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Confirmar Nueva Contraseña</label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 text-sm focus:outline-none focus:border-earth"
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full bg-white text-earth border border-earth py-3 rounded-xl font-bold hover:bg-beige-light transition-all disabled:opacity-50 mt-4 shadow-sm"
                                    >
                                        Actualizar Contraseña
                                    </button>
                                </form>
                            </div>

                            {/* Módulos Activos */}
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 mt-6">
                                <h2 className="text-xl font-serif text-earth font-bold mb-4">📦 Mis Módulos Activos</h2>
                                {userModules.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {userModules.map(module => (
                                            <span
                                                key={module.id}
                                                className="px-3 py-2 bg-green-100 text-green-800 rounded-full text-sm font-medium flex items-center gap-2"
                                                title={module.description}
                                            >
                                                <span>{module.icon}</span>
                                                <span>{module.name}</span>
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-slate-500 text-sm">No tienes módulos habilitados actualmente.</p>
                                )}
                                <p className="text-xs text-slate-400 mt-4">
                                    Los módulos determinan qué funcionalidades puedes acceder en la plataforma.
                                </p>
                            </div>
                        </div>

                        {/* Historial de Pedidos */}
                        <div className="lg:col-span-2">
                            <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 min-h-[500px]">
                                <h2 className="text-xl font-serif text-earth font-bold mb-6">Mis Pedidos</h2>

                                {loadingOrders ? (
                                    <div className="flex justify-center py-20">
                                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-earth"></div>
                                    </div>
                                ) : orders.length === 0 ? (
                                    <div className="text-center py-20">
                                        <svg className="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                        <p className="text-slate-500 italic">Aún no has realizado pedidos.</p>
                                        <Link to="/productos" className="text-earth font-bold mt-4 inline-block hover:underline">Ir a la tienda</Link>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="border-b border-beige-dark/10">
                                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase">Orden #</th>
                                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase">Fecha</th>
                                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase">Total</th>
                                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase">Estado</th>
                                                    <th className="py-4 text-[10px] font-bold text-slate-400 uppercase text-right">Acción</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {orders.map(order => (
                                                    <tr key={order.id} className="border-b border-paper last:border-0 hover:bg-paper/30 transition-colors">
                                                        <td className="py-4 text-sm font-medium text-slate-700">ORD-{order.id}</td>
                                                        <td className="py-4 text-sm text-slate-500">
                                                            {new Date(order.created_at || order.createdAt).toLocaleDateString()}
                                                        </td>
                                                        <td className="py-4 text-sm font-bold text-earth">
                                                            ${parseFloat(order.total).toLocaleString()}
                                                        </td>
                                                        <td className="py-4">
                                                            {getStatusBadge(order.order_status)}
                                                        </td>
                                                        <td className="py-4 text-right">
                                                            <Link
                                                                to={`/order-confirmation/${order.id}`}
                                                                className="text-earth hover:text-earth-dark text-xs font-bold"
                                                            >
                                                                Ver Detalles
                                                            </Link>
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
                </div>
            </div>
        </div>
    );
};

export default Profile;
