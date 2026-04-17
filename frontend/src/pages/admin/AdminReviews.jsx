import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import { useToast } from '../../context/ToastContext';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const { showToast } = useToast();

    // Filters & Pagination State
    const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'approved', 'pending'
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const fetchReviews = async () => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/reviews/admin`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const data = await res.json();
            setReviews(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleApprove = async (id) => {
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/reviews/${id}/approve`, {
                method: 'PUT',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast('Reseña aprobada', 'success');
                fetchReviews();
            }
        } catch (error) {
            showToast('Error al aprobar', 'error');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Estás seguro de eliminar esta reseña?')) return;
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5176/api';
            const token = localStorage.getItem('token');
            const res = await fetch(`${baseUrl}/reviews/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                showToast('Reseña eliminada', 'success');
                fetchReviews();
            }
        } catch (error) {
            showToast('Error al eliminar', 'error');
        }
    };

    // Filter Logic
    const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(review => {
        if (filterStatus === 'all') return true;
        if (filterStatus === 'approved') return review.is_approved;
        if (filterStatus === 'pending') return !review.is_approved;
        return true;
    });

    // Pagination Logic
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredReviews.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredReviews.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <AdminLayout title="Moderación de Reseñas">
            <div className="p-4 md:p-10">
                {/* Filter Tabs */}
                <div className="flex gap-4 mb-6 overflow-x-auto pb-2">
                    <button
                        onClick={() => { setFilterStatus('all'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === 'all'
                            ? 'bg-earth text-white shadow-lg shadow-earth/20'
                            : 'bg-white text-slate-500 hover:bg-beige-light'
                            }`}
                    >
                        Todas
                    </button>
                    <button
                        onClick={() => { setFilterStatus('pending'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === 'pending'
                            ? 'bg-terracotta text-white shadow-lg shadow-terracotta/20'
                            : 'bg-white text-slate-500 hover:bg-beige-light'
                            }`}
                    >
                        Pendientes
                    </button>
                    <button
                        onClick={() => { setFilterStatus('approved'); setCurrentPage(1); }}
                        className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap ${filterStatus === 'approved'
                            ? 'bg-moss text-white shadow-lg shadow-moss/20'
                            : 'bg-white text-slate-500 hover:bg-beige-light'
                            }`}
                    >
                        Aprobadas
                    </button>
                </div>

                <div className="bg-white rounded-[32px] shadow-sm border border-beige-dark/10 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead>
                                <tr className="text-left text-[10px] uppercase tracking-widest text-slate-400 border-b border-beige-dark/10 bg-paper/50">
                                    <th className="px-8 py-5">Producto</th>
                                    <th className="px-8 py-5">Cliente</th>
                                    <th className="px-8 py-5">Calificación</th>
                                    <th className="px-8 py-5">Comentario</th>
                                    <th className="px-8 py-5">Estado</th>
                                    <th className="px-8 py-5">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {currentItems.map((review) => (
                                    <tr key={review.id} className="text-sm hover:bg-beige-light/10 transition-colors">
                                        <td className="px-8 py-6 font-bold text-slate-700">{review.product?.name}</td>
                                        <td className="px-8 py-6 text-slate-500">{review.customer_name}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex text-earth">
                                                {[...Array(5)].map((_, i) => (
                                                    <svg key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-beige-dark/30'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.382-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 max-w-xs overflow-hidden text-ellipsis italic text-slate-500">"{review.comment}"</td>
                                        <td className="px-8 py-6">
                                            {review.is_approved ? (
                                                <span className="bg-moss/10 text-moss text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">Aprobada</span>
                                            ) : (
                                                <span className="bg-terracotta/10 text-terracotta text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-widest">Pendiente</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex gap-3">
                                                {!review.is_approved && (
                                                    <button
                                                        onClick={() => handleApprove(review.id)}
                                                        className="text-moss hover:bg-moss/10 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                                                    >
                                                        Aprobar
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(review.id)}
                                                    className="text-terracotta hover:bg-terracotta/10 px-3 py-1 rounded-lg text-xs font-bold transition-colors"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {filteredReviews.length === 0 && !loading && (
                            <div className="py-20 text-center text-slate-400 font-serif italic">
                                No se encontraron reseñas {filterStatus !== 'all' ? (filterStatus === 'pending' ? ' pendientes' : ' aprobadas') : ''}.
                            </div>
                        )}
                    </div>

                    {/* Pagination Controls */}
                    {filteredReviews.length > itemsPerPage && (
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
            </div>
        </AdminLayout>
    );
};

export default AdminReviews;
