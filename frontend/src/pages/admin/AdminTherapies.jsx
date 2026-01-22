import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminTherapies = () => {
    const [therapies, setTherapies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        duration: 60,
        price: '',
        active: true
    });
    const { showToast } = useToast();
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

    useEffect(() => {
        fetchTherapies();
    }, []);

    const fetchTherapies = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/therapies/my-therapies`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            setTherapies(data);
        } catch (error) {
            console.error('Error fetching therapies:', error);
            showToast('Error al cargar terapias', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingId
                ? `${baseUrl}/therapies/${editingId}`
                : `${baseUrl}/therapies`;
            const method = editingId ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(editingId ? 'Terapia actualizada' : 'Terapia creada', 'success');
                setShowForm(false);
                setEditingId(null);
                setFormData({ name: '', description: '', duration: 60, price: '', active: true });
                fetchTherapies();
            } else {
                showToast('Error al guardar terapia', 'error');
            }
        } catch (error) {
            console.error('Error saving therapy:', error);
            showToast('Error de conexión', 'error');
        }
    };

    const handleEdit = (therapy) => {
        setFormData({
            name: therapy.name,
            description: therapy.description || '',
            duration: therapy.duration,
            price: therapy.price,
            active: therapy.active
        });
        setEditingId(therapy.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta terapia?')) return;

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/therapies/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                showToast('Terapia eliminada', 'success');
                fetchTherapies();
            } else {
                showToast('Error al eliminar', 'error');
            }
        } catch (error) {
            console.error('Error deleting therapy:', error);
            showToast('Error de conexión', 'error');
        }
    };

    const actions = (
        <button
            onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ name: '', description: '', duration: 60, price: '', active: true });
            }}
            className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center gap-2"
        >
            <span>+</span> Nueva Terapia
        </button>
    );

    return (
        <AdminLayout title="Mis Terapias" actions={actions}>
            <div className="p-10">
                {showForm && (
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 p-8 mb-6">
                        <h3 className="text-xl font-bold mb-6">{editingId ? 'Editar' : 'Nueva'} Terapia</h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    placeholder="Ej: Consulta Ayurveda"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows="3"
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Duración (min)</label>
                                    <input
                                        type="number"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                                        required
                                        min="15"
                                        step="15"
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Precio</label>
                                    <input
                                        type="number"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth"
                                    />
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <input
                                    type="checkbox"
                                    checked={formData.active}
                                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                                    id="active"
                                    className="w-5 h-5 text-earth rounded focus:ring-earth"
                                />
                                <label htmlFor="active" className="text-sm font-bold text-slate-700">Activa</label>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button type="submit" className="bg-earth text-white px-6 py-2 rounded-xl font-bold hover:bg-earth-dark">
                                    {editingId ? 'Actualizar' : 'Crear'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => { setShowForm(false); setEditingId(null); }}
                                    className="bg-slate-200 text-slate-700 px-6 py-2 rounded-xl font-bold hover:bg-slate-300"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-beige-light/30 border-b border-beige-dark/10">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Terapia</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Duración</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Precio</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {therapies.map(therapy => (
                                    <tr key={therapy.id} className="hover:bg-beige-light/10 transition-colors">
                                        <td className="px-8 py-5">
                                            <p className="font-bold text-slate-800 text-sm">{therapy.name}</p>
                                            <p className="text-xs text-slate-400">{therapy.description}</p>
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-600">{therapy.duration} min</td>
                                        <td className="px-8 py-5 font-bold text-slate-700">${parseFloat(therapy.price).toLocaleString('es-AR')}</td>
                                        <td className="px-8 py-5">
                                            <span className={`text-xs px-2 py-1 rounded-md ${therapy.active ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                                                {therapy.active ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(therapy)} className="p-2 hover:text-earth transition-colors text-slate-400">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => handleDelete(therapy.id)} className="p-2 hover:text-terracotta transition-colors text-slate-400">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
};

export default AdminTherapies;
