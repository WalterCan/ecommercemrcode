import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCategoryForm = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const { showToast } = useToast();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        description: ''
    });

    useEffect(() => {
        if (isEditing) {
            const fetchCategory = async () => {
                try {
                    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
                    const res = await fetch(`${baseUrl}/categories/${id}`);
                    if (res.ok) {
                        const data = await res.json();
                        setFormData({
                            name: data.name,
                            description: data.description || ''
                        });
                    }
                } catch (error) {
                    console.error('Error fetching category:', error);
                    showToast('Error al cargar categoría', 'error');
                }
            };
            fetchCategory();
        }
    }, [id, isEditing]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
            const url = isEditing ? `${baseUrl}/categories/${id}` : `${baseUrl}/categories`;
            const method = isEditing ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(isEditing ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente', 'success');
                navigate('/admin/categories');
            } else {
                showToast('Error al guardar la categoría', 'error');
            }
        } catch (error) {
            console.error('Error saving category:', error);
            showToast('Error de conexión al guardar la categoría', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            title={isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
            actions={
                <Link to="/admin/categories" className="text-slate-500 hover:text-earth text-sm font-bold">
                    Cancelar
                </Link>
            }
        >
            <div className="p-10 max-w-2xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 space-y-6">

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre de la Categoría</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                            placeholder="Ej: Aceites Esenciales"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descripción</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows="4"
                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                            placeholder="Breve descripción de la colección..."
                        />
                    </div>

                    <div className="pt-4 border-t border-beige-dark/10 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-earth text-white px-8 py-3 rounded-xl font-bold hover:bg-earth-dark transition-all disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Categoría' : 'Crear Categoría')}
                        </button>
                    </div>

                </form>
            </div>
        </AdminLayout>
    );
};

export default AdminCategoryForm;
