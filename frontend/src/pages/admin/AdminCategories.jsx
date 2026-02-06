import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

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

    // Filter & Pagination Logic
    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredCategories.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const actions = (
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            {/* Search Bar */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Buscar categoría..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="pl-10 pr-4 py-2 border border-beige-dark/20 rounded-full focus:outline-none focus:border-earth w-full md:w-64"
                />
                <svg className="w-5 h-5 text-slate-400 absolute left-3 top-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </div>

            <Link to="/admin/categories/new" className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center justify-center gap-2 whitespace-nowrap">
                <span>+</span> Nueva Categoría
            </Link>
        </div>
    );

    return (
        <AdminLayout title="Categorías y Colecciones" actions={actions}>
            <div className="p-8">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[600px]">
                                <thead className="bg-beige-light/30 border-b border-beige-dark/10">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Nombre</th>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Descripción</th>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-beige-dark/5">
                                    {currentItems.map(cat => (
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
                                    {currentItems.length === 0 && (
                                        <tr>
                                            <td colSpan="3" className="text-center py-8 text-slate-500">
                                                {searchTerm ? 'No se encontraron categorías que coincidan.' : 'No hay categorías registradas.'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredCategories.length > itemsPerPage && (
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
            </div>
        </AdminLayout>
    );
};

export default AdminCategories;
