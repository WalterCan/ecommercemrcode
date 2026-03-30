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
        custom_code: '',
        description: '',
        price: '',
        cost_price: '',
        category_id: '',
        image_url: '',
        featured: false,
        active: true // Default visible
    });
    const [margin, setMargin] = useState('');
    const [categories, setCategories] = useState([]);
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [gallery, setGallery] = useState([]); // Array of { id, image_url }
    const [deletedImageIds, setDeletedImageIds] = useState([]);
    // Estado para Variantes
    const [variants, setVariants] = useState([]); // Array of { id?, name, additional_price, stock }
    const [loading, setLoading] = useState(false);
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5176/api';

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
            const token = localStorage.getItem('token');
            // Usar endpoint de ADMIN para obtener detalle completo (incluso si está inactivo)
            const res = await fetch(`${baseUrl}/products/admin/detail/${id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (res.ok) {
                const data = await res.json();
                setFormData({
                    name: data.name,
                    custom_code: data.custom_code || '',
                    description: data.description,
                    price: data.price,
                    stock: data.stock,
                    stock_minimo: data.stock_minimo || 10,
                    stock_critico: data.stock_critico || 3,
                    cost_price: data.cost_price || 0,
                    category_id: data.category_id || '',
                    image_url: data.image_url || '',
                    featured: data.featured || false,
                    active: data.active !== undefined ? data.active : true
                });

                // Cargar galería si existe
                if (data.images && data.images.length > 0) {
                    setGallery(data.images);
                } else if (data.image_url) {
                    // Si no hay array de imágenes pero hay image_url (legacy), mostrarla como parte de la galería inicial
                    setGallery([{ id: 'legacy', image_url: data.image_url }]);
                }

                // Calcular margen inicial si existen precios
                if (data.cost_price && data.price && parseFloat(data.cost_price) > 0) {
                    const marg = ((parseFloat(data.price) - parseFloat(data.cost_price)) / parseFloat(data.cost_price)) * 100;
                    setMargin(marg.toFixed(2));
                }

                // Cargar variantes si existen
                if (data.variants && Array.isArray(data.variants)) {
                    setVariants(data.variants);
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
        if (e.target.files && e.target.files.length > 0) {
            // Convertir FileList a Array y añadir a los existentes
            const newFiles = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...newFiles]);
        }
    };

    const removeSelectedFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (imageId) => {
        if (imageId === 'legacy') {
            // Caso especial para imagen legacy no migrada a tabla
            setGallery(prev => prev.filter(img => img.id !== 'legacy'));
            // También la marcamos para posible limpieza si hiciera falta, aunque el controlador manejará la nueva principal
        } else {
            setDeletedImageIds(prev => [...prev, imageId]);
            setGallery(prev => prev.filter(img => img.id !== imageId));
        }
    };

    // --- Manejo de Variantes ---
    const addVariant = () => {
        setVariants([...variants, { name: '', additional_price: '', stock: '' }]);
    };

    const removeVariant = (index) => {
        setVariants(variants.filter((_, i) => i !== index));
    };

    const handleVariantChange = (index, field, value) => {
        const newVariants = [...variants];
        newVariants[index][field] = value;
        setVariants(newVariants);
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
            data.append('custom_code', formData.custom_code || '');
            data.append('description', formData.description);
            data.append('price', parseFloat(formData.price) || 0);
            data.append('stock', parseInt(formData.stock) || 0);

            // Sanitizar campos opcionales
            data.append('stock_minimo', parseInt(formData.stock_minimo) || 0);
            data.append('stock_critico', parseInt(formData.stock_critico) || 0);
            data.append('cost_price', parseFloat(formData.cost_price) || 0);

            data.append('category_id', formData.category_id);
            data.append('featured', formData.featured ? '1' : '0');
            data.append('active', formData.active ? '1' : '0');

            if (selectedFiles.length > 0) {
                selectedFiles.forEach(file => {
                    data.append('images', file);
                });
            }

            if (deletedImageIds.length > 0) {
                data.append('deleted_images', JSON.stringify(deletedImageIds));
            }

            // Variantes
            if (variants.length > 0) {
                data.append('variants', JSON.stringify(variants));
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
                        <div className="col-span-2 md:col-span-1">
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

                        <div className="col-span-2 md:col-span-1">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">Código / EAN <span className="text-[10px] lowercase font-normal text-slate-400">(opcional)</span></label>
                            <input
                                type="text"
                                name="custom_code"
                                value={formData.custom_code || ''}
                                onChange={handleChange}
                                className="w-full bg-paper border border-beige-dark/20 rounded-xl p-3 focus:outline-none focus:border-earth focus:ring-1 focus:ring-earth transition-all font-mono text-sm"
                                placeholder="Ej: A-1234, 779123456"
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

                        {/* Variants Section */}
                        <div className="col-span-2 pt-6 border-t border-beige-dark/5">
                            <div className="flex justify-between items-center mb-4">
                                <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Variantes de Producto</label>
                                <button
                                    type="button"
                                    onClick={addVariant}
                                    className="text-xs font-bold text-earth hover:text-earth-dark uppercase tracking-wide flex items-center gap-1"
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                    Agregar Variante
                                </button>
                            </div>

                            {variants.length > 0 ? (
                                <div className="space-y-3">
                                    {variants.map((variant, index) => (
                                        <div key={index} className="grid grid-cols-12 gap-3 items-end bg-paper p-4 rounded-xl border border-beige-dark/10">
                                            <div className="col-span-5">
                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Nombre (Ej: 50ml, XL)</label>
                                                <input
                                                    type="text"
                                                    value={variant.name}
                                                    onChange={(e) => handleVariantChange(index, 'name', e.target.value)}
                                                    className="w-full bg-white border border-beige-dark/10 rounded-lg p-2 text-sm focus:border-earth focus:ring-1 focus:ring-earth outline-none"
                                                    placeholder="Nombre de variante"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Precio Extra ($)</label>
                                                <input
                                                    type="number"
                                                    value={variant.additional_price}
                                                    onChange={(e) => handleVariantChange(index, 'additional_price', e.target.value)}
                                                    className="w-full bg-white border border-beige-dark/10 rounded-lg p-2 text-sm focus:border-earth focus:ring-1 focus:ring-earth outline-none"
                                                    placeholder="0.00"
                                                />
                                            </div>
                                            <div className="col-span-3">
                                                <label className="block text-[10px] font-bold text-slate-400 mb-1">Stock Variante</label>
                                                <input
                                                    type="number"
                                                    value={variant.stock}
                                                    onChange={(e) => handleVariantChange(index, 'stock', e.target.value)}
                                                    className="w-full bg-white border border-beige-dark/10 rounded-lg p-2 text-sm focus:border-earth focus:ring-1 focus:ring-earth outline-none"
                                                    placeholder="0"
                                                />
                                            </div>
                                            <div className="col-span-1 flex justify-center pb-2">
                                                <button
                                                    type="button"
                                                    onClick={() => removeVariant(index)}
                                                    className="text-red-400 hover:text-red-600 transition-colors"
                                                    title="Eliminar variante"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic bg-paper p-4 rounded-xl border border-dashed border-beige-dark/20 text-center">
                                    No hay variantes creadas. Haz clic en "Agregar Variante" para crear opciones como talles o pesos.
                                </p>
                            )}
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
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-4">Galería de Imágenes</label>

                            {/* Galería Existente y Previews Nuevos */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {/* Imágenes Existentes de la BD */}
                                {gallery.map((img) => (
                                    <div key={img.id} className="relative aspect-square group rounded-xl overflow-hidden border border-beige-dark/20">
                                        <img src={formatImageUrl(img.image_url)} alt="Product" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(img.id)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-[10px] p-1 text-center">
                                            Guardada
                                        </div>
                                    </div>
                                ))}

                                {/* Previews de Nuevos Archivos Seleccionados */}
                                {selectedFiles.map((file, index) => (
                                    <div key={index} className="relative aspect-square group rounded-xl overflow-hidden border-2 border-earth/30">
                                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeSelectedFile(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-100 transition-opacity"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                        <div className="absolute bottom-0 left-0 right-0 bg-earth text-white text-[10px] p-1 text-center">
                                            Nueva
                                        </div>
                                    </div>
                                ))}

                                {/* Botón de Subida */}
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-beige-dark/20 border-dashed rounded-xl cursor-pointer bg-paper hover:bg-beige-light/50 transition-all group">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                        <svg className="w-8 h-8 mb-2 text-slate-400 group-hover:text-earth transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                        </svg>
                                        <p className="text-xs text-slate-500 font-bold group-hover:text-earth">Añadir Fotos</p>
                                    </div>
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" multiple />
                                </label>
                            </div>
                            <p className="text-[10px] text-slate-400 italic">* Puedes subir múltiples imágenes. La primera imagen de la lista será la principal.</p>
                        </div>

                        {/* Toggles Visibility / Featured */}
                        <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 p-4 bg-beige-light/30 rounded-xl">
                                <input
                                    type="checkbox"
                                    name="active"
                                    checked={formData.active}
                                    onChange={handleChange}
                                    id="active"
                                    className="w-5 h-5 text-green-600 rounded focus:ring-green-600 border-gray-300"
                                />
                                <label htmlFor="active" className="text-sm font-bold text-slate-700 cursor-pointer">
                                    Producto Activo
                                    <span className="block text-[10px] font-normal text-slate-500">Visible en el catálogo público</span>
                                </label>
                            </div>

                            <div className="flex items-center gap-3 p-4 bg-beige-light/30 rounded-xl">
                                <input
                                    type="checkbox"
                                    name="featured"
                                    checked={formData.featured}
                                    onChange={handleChange}
                                    id="featured"
                                    className="w-5 h-5 text-earth rounded focus:ring-earth border-gray-300"
                                />
                                <label htmlFor="featured" className="text-sm font-bold text-slate-700 cursor-pointer">
                                    Destacar
                                    <span className="block text-[10px] font-normal text-slate-500">Mostrar en la página de inicio</span>
                                </label>
                            </div>
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
