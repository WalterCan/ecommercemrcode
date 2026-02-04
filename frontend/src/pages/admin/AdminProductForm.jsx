import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { formatImageUrl } from '../../utils/imageConfig';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminProductForm = () => {
    const { logout, user } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = !!id;
    const { showToast } = useToast();

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        cost_price: '',
        category_id: '',
        image_url: '',
        featured: false
    });
    const [margin, setMargin] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

    useEffect(() => {
        fetchCategories();
        if (isEditing) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const res = await fetch(`${baseUrl}/categories`);
            if (res.ok) {
                const data = await res.json();
                setCategories(data);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            showToast('Error al cargar categorías', 'error');
        }
    };

    const fetchProduct = async () => {
        try {
            const res = await fetch(`${baseUrl}/products/${id}`);
            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    stock_minimo: data.stock_minimo || 10,
                    stock_critico: data.stock_critico || 3,
                    cost_price: data.cost_price || 0,
                    category_id: data.category_id || '',
                    image_url: data.image_url || '',
                    featured: data.featured || false
                });

                // Calcular margen inicial si existen precios
                if (data.cost_price && data.price && parseFloat(data.cost_price) > 0) {
                    const marg = ((parseFloat(data.price) - parseFloat(data.cost_price)) / parseFloat(data.cost_price)) * 100;
                    setMargin(marg.toFixed(2));
                }
            } else {
                showToast('Error al cargar el producto', 'error');
                navigate('/admin/products');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            showToast('Error de conexión', 'error');
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : value;

        let newFormData = { ...formData, [name]: val };

        // Lógica de cálculo automática
        if (name === 'cost_price') {
            // Si cambia costo y hay margen, calcular precio
            if (margin && val) {
                const cost = parseFloat(val);
                const marg = parseFloat(margin);
                const price = cost * (1 + marg / 100);
                newFormData.price = price.toFixed(2);
            } else if (newFormData.price && val) {
                // Si cambia costo y hay precio, recalcular margen
                const cost = parseFloat(val);
                const price = parseFloat(newFormData.price);
                if (cost > 0) {
                    const marg = ((price - cost) / cost) * 100;
                    setMargin(marg.toFixed(2));
                }
            }
        } else if (name === 'price') {
            // Si cambia precio y hay costo, calcular margen
            if (newFormData.cost_price && val) {
                const cost = parseFloat(newFormData.cost_price);
                const price = parseFloat(val);
                if (cost > 0) {
                    const marg = ((price - cost) / cost) * 100;
                    setMargin(marg.toFixed(2));
                }
            }
        }

        setFormData(newFormData);
    };

    const handleMarginChange = (e) => {
        const val = e.target.value;
        setMargin(val);
        if (formData.cost_price && val) {
            const cost = parseFloat(formData.cost_price);
            const marg = parseFloat(val);
            const price = cost * (1 + marg / 100);
            setFormData(prev => ({ ...prev, price: price.toFixed(2) }));
        }
    };


    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const url = isEditing
                ? `${baseUrl}/products/${id}`
                : `${baseUrl}/products`;

            const method = isEditing ? 'PUT' : 'POST';

            const data = new FormData();
            data.append('name', formData.name);
            data.append('description', formData.description);
            data.append('price', parseFloat(formData.price) || 0);
            data.append('stock', parseInt(formData.stock) || 0);

            // Sanitizar campos opcionales
            data.append('stock_minimo', parseInt(formData.stock_minimo) || 0);
            data.append('stock_critico', parseInt(formData.stock_critico) || 0);
            data.append('cost_price', parseFloat(formData.cost_price) || 0);

            data.append('category_id', formData.category_id);
            data.append('featured', formData.featured ? '1' : '0');

            if (selectedFile) {
                data.append('image', selectedFile);
            } else if (!isEditing && !formData.image_url) {
                // Optional: Handle case where no image is provided for new product
                // data.append('image_url', 'some_default_url');
            }

            const token = localStorage.getItem('token');
            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: data
            });

            const result = await response.json();

            if (response.ok) {
                showToast(isEditing ? 'Producto actualizado exitosamente' : 'Producto creado exitosamente', 'success');
                navigate('/admin/products');
            } else {
                // Mostrar error específico si viene del backend (ej: validación)
                const errorMsg = result.error || result.message || 'Error al guardar el producto';
                // Si hay detalles de validación, mostrar el primero
                const details = result.details ? `: ${result.details[0].msg}` : '';
                showToast(`${errorMsg}${details}`, 'error');
            }
        } catch (error) {
            console.error('Error saving product:', error);
            showToast('Error de conexión al guardar el producto', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AdminLayout
            title={isEditing ? 'Editar Objeto Sagrado' : 'Nuevo Objeto Sagrado'}
            actions={
                <Link to="/admin/products" className="text-slate-500 hover:text-earth text-sm font-bold">
                    Cancelar
                </Link>
            }
        >
            <div className="p-10 max-w-4xl mx-auto w-full">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-beige-dark/10 space-y-6">

                    <div className="grid grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del Producto</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                placeholder="Ej: Amatista Protectora"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Descripción</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows="4"
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                placeholder="Describe las propiedades energéticas..."
                            />
                        </div>

                        {/* Bloque de Precios con Margen */}
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Precio de Costo</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        name="cost_price"
                                        value={formData.cost_price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 pl-8 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Margen (%)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={margin}
                                        onChange={handleMarginChange}
                                        min="0"
                                        step="0.1"
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all text-center font-bold text-earth"
                                        placeholder="%"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Precio de Venta</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-3 text-slate-400">$</span>
                                    <input
                                        type="number"
                                        name="price"
                                        value={formData.price}
                                        onChange={handleChange}
                                        required
                                        min="0"
                                        step="0.01"
                                        className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 pl-8 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all font-bold text-xl"
                                        placeholder="0.00"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Stock en nueva fila */}
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-beige-dark/5">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stock Actual</label>
                                <input
                                    type="number"
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stock Mínimo</label>
                                <input
                                    type="number"
                                    name="stock_minimo"
                                    value={formData.stock_minimo}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="10"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Nivel de alerta</p>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Stock Crítico</label>
                                <input
                                    type="number"
                                    name="stock_critico"
                                    value={formData.stock_critico}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                                    placeholder="3"
                                />
                                <p className="text-[10px] text-slate-400 mt-1">Nivel crítico</p>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Categoría</label>
                            <select
                                name="category_id"
                                value={formData.category_id}
                                onChange={handleChange}
                                required
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all"
                            >
                                <option value="">Seleccionar Categoría</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Imagen del Producto</label>

                            {/* Preview de la imagen actual cuando se está editando */}
                            {isEditing && formData.image_url && !selectedFile && (
                                <div className="mb-4 p-4 bg-beige-light/30 rounded-xl border border-beige-dark/10">
                                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-3">Imagen Actual</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-white border border-beige-dark/20 flex-shrink-0">
                                            <img
                                                src={formatImageUrl(formData.image_url)}
                                                alt="Preview actual"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-slate-700 mb-1">
                                                {formData.image_url.startsWith('http')
                                                    ? 'Imagen externa'
                                                    : formData.image_url.split('/').pop()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-center w-full">
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-beige-dark/20 border-dashed rounded-xl cursor-pointer bg-paper hover:bg-beige-light/50 transition-all">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <svg className="w-8 h-8 mb-4 text-slate-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2" />
                                        </svg>
                                        <p className="text-sm text-slate-500"><span className="font-bold">Haz clic para subir</span> o arrastra y suelta</p>
                                        <p className="text-xs text-slate-400">SVG, PNG, JPG (MAX. 5MB)</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                </label>
                            </div>
                            {selectedFile && (
                                <div className="mt-3 p-3 bg-earth/10 rounded-lg border border-earth/20">
                                    <p className="text-sm font-bold text-earth">
                                        ✓ Nuevo archivo seleccionado: {selectedFile.name}
                                    </p>
                                </div>
                            )}
                        </div>

                        <div className="col-span-2 flex items-center gap-3 p-4 bg-beige-light/30 rounded-xl">
                            <input
                                type="checkbox"
                                name="featured"
                                checked={formData.featured}
                                onChange={handleChange}
                                id="featured"
                                className="w-5 h-5 text-earth rounded focus:ring-earth border-gray-300"
                            />
                            <label htmlFor="featured" className="text-sm font-bold text-slate-700 cursor-pointer">
                                Destacar este producto en la página principal
                            </label>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-beige-dark/10 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-earth text-white px-8 py-3 rounded-xl font-bold hover:bg-earth-dark transition-all disabled:opacity-50"
                        >
                            {loading ? 'Guardando...' : (isEditing ? 'Actualizar Producto' : 'Crear Producto')}
                        </button>
                    </div>

                </form>
            </div >
        </AdminLayout >
    );
};

export default AdminProductForm;
