import React, { useState, useEffect } from 'react';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminSuppliers = () => {
    const [suppliers, setSuppliers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingSupplier, setEditingSupplier] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        tax_id: '',
        email: '',
        phone: '',
        address: '',
        contact_name: ''
    });

    // Search & Pagination State
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { showToast } = useToast();

    useEffect(() => {
        fetchSuppliers();
    }, []);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const response = await fetch(`${baseUrl}/suppliers`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            setSuppliers(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            showToast('Error al cargar proveedores', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
            const token = localStorage.getItem('token');
            const url = editingSupplier ? `${baseUrl}/suppliers/${editingSupplier.id}` : `${baseUrl}/suppliers`;
            const method = editingSupplier ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                showToast(editingSupplier ? 'Proveedor actualizado' : 'Proveedor creado', 'success');
                setShowModal(false);
                setEditingSupplier(null);
                setFormData({ name: '', tax_id: '', email: '', phone: '', address: '', contact_name: '' });
                fetchSuppliers();
            } else {
                const data = await response.json();
                showToast(data.error || 'Error en la operación', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        }
    };

    const openEditModal = (supplier) => {
        setEditingSupplier(supplier);
        setFormData({
            name: supplier.name,
            tax_id: supplier.tax_id || '',
            email: supplier.email || '',
            phone: supplier.phone || '',
            address: supplier.address || '',
            contact_name: supplier.contact_name || ''
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('¿Estás seguro de desactivar este proveedor?')) {
            try {
                const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
                const token = localStorage.getItem('token');
                const response = await fetch(`${baseUrl}/suppliers/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    showToast('Proveedor desactivado', 'success');
                    fetchSuppliers();
                }
            } catch (error) {
                showToast('Error al eliminar', 'error');
            }
        }
    };

    // Filter & Pagination Logic
    const filteredSuppliers = suppliers.filter(supplier =>
        supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (supplier.tax_id && supplier.tax_id.includes(searchTerm))
    );

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredSuppliers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    const actions = (
        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
            <div className="relative w-full md:w-64">
                <input
                    type="text"
                    placeholder="Buscar proveedor..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-beige-dark/20 focus:outline-none focus:border-earth text-sm bg-white/80 backdrop-blur-sm"
                />
                <svg className="w-4 h-4 text-slate-400 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            </div>
            <button
                onClick={() => {
                    setEditingSupplier(null);
                    setFormData({ name: '', tax_id: '', email: '', phone: '', address: '', contact_name: '' });
                    setShowModal(true);
                }}
                className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark transition-all flex items-center justify-center gap-2 shadow-lg shadow-earth/20 whitespace-nowrap"
            >
                <span>+</span> Nuevo Proveedor
            </button>
        </div>
    );

    return (
        <AdminLayout title="Gestión de Proveedores" actions={actions}>
            <div className="p-4 md:p-10">
                {loading ? (
                    <div className="py-20 text-center">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden flex flex-col">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[800px]">
                                <thead className="bg-beige-light/30 border-b border-beige-dark/10">
                                    <tr>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Nombre</th>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Contacto</th>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Email / Tel</th>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Estado</th>
                                        <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-beige-dark/5">
                                    {currentItems.length > 0 ? currentItems.map(supplier => (
                                        <tr key={supplier.id} className="hover:bg-beige-light/10 transition-colors">
                                            <td className="px-8 py-5">
                                                <p className="font-bold text-slate-800 text-sm">{supplier.name}</p>
                                                <p className="text-[10px] text-slate-400 italic">CUIT: {supplier.tax_id || 'N/A'}</p>
                                            </td>
                                            <td className="px-8 py-5 text-xs text-slate-600">
                                                {supplier.contact_name || 'N/A'}
                                            </td>
                                            <td className="px-8 py-5 text-xs text-slate-600">
                                                <div>{supplier.email || '-'}</div>
                                                <div>{supplier.phone || '-'}</div>
                                            </td>
                                            <td className="px-8 py-5">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${supplier.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {supplier.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <div className="flex justify-end gap-2 text-slate-400">
                                                    <button onClick={() => openEditModal(supplier)} className="p-2 hover:text-earth transition-colors">
                                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                    </button>
                                                    <button onClick={() => handleDelete(supplier.id)} className="p-2 hover:text-terracotta transition-colors">
                                                        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan="5" className="px-8 py-10 text-center text-slate-400 italic">No hay proveedores que coincidan con la búsqueda.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination Controls */}
                        {filteredSuppliers.length > itemsPerPage && (
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

            {/* Modal de Proveedor */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in">
                        <div className="bg-earth p-6 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold font-serif">{editingSupplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-2xl hover:scale-110 transition-transform">&times;</button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Nombre Comercial *</label>
                                    <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full bg-paper border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth" placeholder="Ej: Distribuidora Global" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">CUIT / Tax ID</label>
                                    <input type="text" value={formData.tax_id} onChange={(e) => setFormData({ ...formData, tax_id: e.target.value })} className="w-full bg-paper border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth" placeholder="20-12345678-9" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Persona de Contacto</label>
                                    <input type="text" value={formData.contact_name} onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })} className="w-full bg-paper border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth" placeholder="Ej: Juan Pérez" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Teléfono</label>
                                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-paper border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth" placeholder="+54 9..." />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1">Email</label>
                                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full bg-paper border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth" placeholder="proveedor@mail.com" />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Dirección</label>
                                    <textarea rows="2" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full bg-paper border-none rounded-xl px-4 py-3 text-sm focus:ring-1 focus:ring-earth resize-none" placeholder="Calle falsa 123..."></textarea>
                                </div>
                            </div>
                            <div className="pt-4">
                                <button type="submit" className="w-full py-4 bg-earth text-white rounded-xl font-bold uppercase tracking-widest text-xs hover:bg-earth-dark shadow-lg shadow-earth/20 transition-all">
                                    {editingSupplier ? 'Guardar Cambios' : 'Registrar Proveedor'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminSuppliers;
