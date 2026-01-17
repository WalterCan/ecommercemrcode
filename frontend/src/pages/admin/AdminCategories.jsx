import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const response = await fetch(`${baseUrl}/categories`);
            const data = await response.json();
            if (Array.isArray(data)) {
                setCategories(data);
            } else {
                console.error('Invalid categories response:', data);
                setCategories([]);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta categoría?')) {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                const response = await fetch(`${baseUrl}/categories/${id}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    setCategories(categories.filter(c => c.id !== id));
                    showToast('Categoría eliminada con éxito', 'success');
                } else {
                    showToast('No se pudo eliminar la categoría', 'error');
                }
            } catch (error) {
                console.error('Error eliminando categoría:', error);
                showToast('Error de conexión al eliminar', 'error');
            }
        }
    };

    const actions = (
        <Link to="/admin/categories/new" className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center gap-2">
            <span>+</span> Nueva Categoría
        </Link>
    );

    return (
        <AdminLayout title="Categorías y Colecciones" actions={actions}>
            <div className="p-10">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-beige-light/30 border-b border-beige-dark/10">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Nombre</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Descripción</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {Array.isArray(categories) && categories.map(cat => (
                                    <tr key={cat.id} className="hover:bg-beige-light/10 transition-colors">
                                        <td className="px-8 py-5 font-bold text-slate-800">
                                            {cat.name}
                                        </td>
                                        <td className="px-8 py-5 text-sm text-slate-600">
                                            {cat.description || '-'}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex justify-end gap-2 text-slate-400">
                                                <Link to={`/admin/categories/edit/${cat.id}`} className="p-2 hover:text-earth transition-colors" title="Editar">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </Link>
                                                <button onClick={() => handleDelete(cat.id)} className="p-2 hover:text-terracotta transition-colors" title="Borrar">
                                                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!Array.isArray(categories) || categories.length === 0 && (
                                    <tr>
                                        <td colSpan="3" className="text-center py-8 text-slate-500">
                                            No hay categorías registradas.
                                        </td>
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

export default AdminCategories;
