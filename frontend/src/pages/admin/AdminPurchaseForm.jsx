import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../../context/ToastContext';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminPurchaseForm = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [loading, setLoading] = useState(false);
    const [suppliers, setSuppliers] = useState([]);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredProducts, setFilteredProducts] = useState([]);

    // Modal Create Product
    const [showProductModal, setShowProductModal] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: '',
        description: '',
        price: '',
        category_id: '',
        cost_price: ''
    });

    const [purchaseData, setPurchaseData] = useState({
        supplier_id: '',
        invoice_number: '',
        notes: '',
        items: []
    });

    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
    const token = localStorage.getItem('token');

    useEffect(() => {
        fetchInitialData();
    }, []);

    const fetchInitialData = async () => {
        try {
            const [suppliersRes, productsRes, categoriesRes] = await Promise.all([
                fetch(`${baseUrl}/suppliers`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}/products`, { headers: { 'Authorization': `Bearer ${token}` } }),
                fetch(`${baseUrl}/categories`)
            ]);

            const suppliersData = await suppliersRes.json();
            const productsData = await productsRes.json();
            const categoriesData = await categoriesRes.json();

            setSuppliers(suppliersData.filter(s => s.is_active));
            setProducts(productsData);
            setCategories(categoriesData);
        } catch (error) {
            console.error('Error loading data:', error);
            showToast('Error al cargar datos iniciales', 'error');
        }
    };

    const handleSearch = (term) => {
        setSearchTerm(term);
        if (term.trim() === '') {
            setFilteredProducts([]);
        } else {
            const filtered = products.filter(p =>
                p.name.toLowerCase().includes(term.toLowerCase())
            );
            setFilteredProducts(filtered.slice(0, 5));
        }
    };

    const addItem = (product) => {
        if (purchaseData.items.find(item => item.product_id === product.id)) {
            showToast('El producto ya está en la lista', 'info');
            return;
        }

        const newItem = {
            product_id: product.id,
            name: product.name,
            quantity: 1,
            unit_cost: product.cost_price || 0
        };

        setPurchaseData(prev => ({
            ...prev,
            items: [...prev.items, newItem]
        }));
        setSearchTerm('');
        setFilteredProducts([]);
    };

    const removeItem = (productId) => {
        setPurchaseData(prev => ({
            ...prev,
            items: prev.items.filter(item => item.product_id !== productId)
        }));
    };

    const updateItem = (productId, field, value) => {
        setPurchaseData(prev => ({
            ...prev,
            items: prev.items.map(item =>
                item.product_id === productId ? { ...item, [field]: parseFloat(value) || 0 } : item
            )
        }));
    };

    const calculateTotal = () => {
        return purchaseData.items.reduce((acc, item) => acc + (item.quantity * item.unit_cost), 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (purchaseData.items.length === 0) {
            showToast('Debes agregar al menos un producto', 'error');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/purchases`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(purchaseData)
            });

            if (response.ok) {
                showToast('Borrador de compra creado exitosamente', 'success');
                navigate('/admin/purchases');
            } else {
                showToast('Error al crear la compra', 'error');
            }
        } catch (error) {
            showToast('Error de conexión', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`${baseUrl}/products`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...newProduct,
                    stock: 0,
                    stock_minimo: 5,
                    featured: false
                })
            });

            if (response.ok) {
                const createdProduct = await response.json();
                showToast('Producto creado exitosamente', 'success');

                // Actualizar lista local y seleccionar
                setProducts([...products, createdProduct]);
                addItem(createdProduct);

                // Reset y cerrar modal
                setShowProductModal(false);
                setNewProduct({ name: '', description: '', price: '', category_id: '', cost_price: '' });
            } else {
                const errorData = await response.json();
                showToast(errorData.message || 'Error al crear producto', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error de conexión', 'error');
        }
    };

    return (
        <AdminLayout
            title="Nueva Factura de Compra"
            actions={<Link to="/admin/purchases" className="text-slate-500 hover:text-earth text-sm font-bold">Cancelar</Link>}
        >
            <div className="p-10 max-w-5xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Cabecera de Compra */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 grid grid-cols-2 gap-6">
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Proveedor *</label>
                            <select
                                required
                                value={purchaseData.supplier_id}
                                onChange={(e) => setPurchaseData({ ...purchaseData, supplier_id: e.target.value })}
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                            >
                                <option value="">Seleccionar Proveedor</option>
                                {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Número de Factura</label>
                            <input
                                type="text"
                                value={purchaseData.invoice_number}
                                onChange={(e) => setPurchaseData({ ...purchaseData, invoice_number: e.target.value })}
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                placeholder="Ej: 0001-00004562"
                            />
                        </div>
                    </div>

                    {/* Buscador de Productos */}
                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Buscar Productos para Añadir</label>
                            <button
                                type="button"
                                onClick={() => setShowProductModal(true)}
                                className="bg-earth text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-earth-dark transition-all"
                            >
                                + Nuevo Producto
                            </button>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 pl-12 focus:outline-none focus:border-earth transition-all"
                                placeholder="Escribe el nombre del producto..."
                            />
                            <svg className="absolute left-4 top-4 text-slate-400" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor font-bold"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>

                            {filteredProducts.length > 0 && (
                                <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-2xl border border-beige-dark/10 z-10 overflow-hidden">
                                    {filteredProducts.map(p => (
                                        <button
                                            key={p.id}
                                            type="button"
                                            onClick={() => addItem(p)}
                                            className="w-full p-4 text-left hover:bg-beige-light/30 transition-colors flex justify-between items-center border-b border-beige-dark/5 last:border-0"
                                        >
                                            <span className="font-bold text-slate-700">{p.name}</span>
                                            <span className="text-xs text-slate-400">Stock: {p.stock}</span>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Detalle de Items */}
                    <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden">
                        <table className="w-full text-left">
                            <thead className="bg-beige-light/30 border-b border-beige-dark/10">
                                <tr>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Producto</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 w-32">Cantidad</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 w-44">Costo Unitario</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 w-44 text-right">Subtotal</th>
                                    <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 w-20"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-beige-dark/5">
                                {purchaseData.items.map(item => (
                                    <tr key={item.product_id}>
                                        <td className="px-8 py-4 font-bold text-slate-700">{item.name}</td>
                                        <td className="px-8 py-4">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                min="1"
                                                onChange={(e) => updateItem(item.product_id, 'quantity', e.target.value)}
                                                className="w-full bg-paper border border-beige-dark/10 rounded-lg p-2 text-center text-sm"
                                            />
                                        </td>
                                        <td className="px-8 py-4">
                                            <div className="relative">
                                                <span className="absolute left-2 top-2 text-slate-400">$</span>
                                                <input
                                                    type="number"
                                                    value={item.unit_cost}
                                                    step="0.01"
                                                    onChange={(e) => updateItem(item.product_id, 'unit_cost', e.target.value)}
                                                    className="w-full bg-paper border border-beige-dark/10 rounded-lg p-2 pl-6 text-sm"
                                                />
                                            </div>
                                        </td>
                                        <td className="px-8 py-4 text-right font-bold text-slate-600">
                                            ${(item.quantity * item.unit_cost).toLocaleString('es-AR')}
                                        </td>
                                        <td className="px-8 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => removeItem(item.product_id)}
                                                className="text-terracotta hover:scale-110 transition-transform"
                                            >
                                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {purchaseData.items.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-8 py-10 text-center text-slate-400 italic">No se han añadido productos.</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot className="bg-beige-light/10">
                                <tr>
                                    <td colSpan="3" className="px-8 py-6 text-right font-bold uppercase tracking-widest text-slate-500">Total Factura</td>
                                    <td className="px-8 py-6 text-right text-2xl font-serif font-bold text-earth">
                                        ${calculateTotal().toLocaleString('es-AR')}
                                    </td>
                                    <td></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10">
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Notas / Observaciones</label>
                        <textarea
                            value={purchaseData.notes}
                            onChange={(e) => setPurchaseData({ ...purchaseData, notes: e.target.value })}
                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-4 text-sm focus:outline-none focus:border-earth transition-all h-24 resize-none"
                            placeholder="Ej: Pedido demorado por paros, mercadería frágil..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-earth text-white px-12 py-4 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-earth-dark shadow-xl hover:scale-105 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Procesando...' : 'Crear Borrador de Compra'}
                        </button>
                    </div>
                </form>
            </div>
            {/* Modal de Creación Rápida */}
            {showProductModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-fadeIn">
                        <div className="bg-earth p-4 flex justify-between items-center text-white">
                            <h3 className="font-serif font-bold text-lg">Nuevo Producto Rápido</h3>
                            <button onClick={() => setShowProductModal(false)} className="hover:bg-white/20 p-1 rounded-full">
                                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <form onSubmit={handleCreateProduct} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Nombre *</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-2 focus:outline-none focus:border-earth"
                                    value={newProduct.name}
                                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                                    placeholder="Nombre del producto"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Descripción *</label>
                                <textarea
                                    required
                                    rows="2"
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-2 focus:outline-none focus:border-earth"
                                    value={newProduct.description}
                                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                                    placeholder="Breve descripción"
                                ></textarea>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Precio Venta *</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-400">$</span>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-2 pl-6 focus:outline-none focus:border-earth"
                                            value={newProduct.price}
                                            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Costo Inicial (Opcional)</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-2 text-slate-400">$</span>
                                        <input
                                            type="number"
                                            min="0"
                                            className="w-full bg-paper border border-beige-dark/20 rounded-xl p-2 pl-6 focus:outline-none focus:border-earth"
                                            value={newProduct.cost_price}
                                            onChange={(e) => setNewProduct({ ...newProduct, cost_price: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-1">Categoría *</label>
                                <select
                                    required
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-2 focus:outline-none focus:border-earth"
                                    value={newProduct.category_id}
                                    onChange={(e) => setNewProduct({ ...newProduct, category_id: e.target.value })}
                                >
                                    <option value="">Seleccionar Categoría...</option>
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="pt-4 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowProductModal(false)}
                                    className="text-slate-500 hover:text-earth font-bold text-sm"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark shadow-lg shadow-earth/20"
                                >
                                    Crear y Añadir
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPurchaseForm;
