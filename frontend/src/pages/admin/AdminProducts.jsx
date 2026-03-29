import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils/imageConfig';
import { useToast } from '../../context/ToastContext';
import StockBadge from '../../components/StockBadge';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  // Filtros y Paginación
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, active, inactive
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        const token = localStorage.getItem('token');

        // Cargar productos y categorías en paralelo
        // Usamos el endpoint de ADMIN para traer todos (activos e inactivos)
        const [productsRes, categoriesRes] = await Promise.all([
          fetch(`${baseUrl}/products/admin/all`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }),
          fetch(`${baseUrl}/categories`)
        ]);

        if (productsRes.status === 401 || productsRes.status === 403) {
          showToast('No autorizado para ver productos', 'error');
          return;
        }

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();

        // Asegurar que active tenga un valor por defecto si viene undefined (aunque DB tiene default)
        const normalizedProducts = productsData.map(p => ({
          ...p,
          active: p.active !== undefined ? p.active : true
        }));

        setProducts(normalizedProducts);
        setCategories(categoriesData);
      } catch (error) {
        console.error('Error fetching data:', error);
        showToast('Error al cargar datos', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este objeto sagrado?')) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        const token = localStorage.getItem('token');
        const response = await fetch(`${baseUrl}/products/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setProducts(products.filter(p => p.id !== id));
          showToast('Objeto sagrado eliminado con éxito', 'success');
        } else {
          showToast('No se pudo eliminar el objeto', 'error');
        }
      } catch (error) {
        console.error('Error eliminando producto:', error);
        showToast('Error de conexión al eliminar', 'error');
      }
    }
  };

  const toggleFeatured = async (product) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
      const token = localStorage.getItem('token');
      const response = await fetch(`${baseUrl}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ featured: !product.featured })
      });

      if (response.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, featured: !p.featured } : p));
        showToast(!product.featured ? 'Destacado en portada' : 'Removido de portada', 'success');
      } else {
        showToast('Error al actualizar', 'error');
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
      showToast('Error de conexión', 'error');
    }
  };

  const toggleActive = async (product) => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
      const token = localStorage.getItem('token');
      // Usar endpoint específico PATCH para cambiar estado (evita validaciones estrictas de PUT)
      const response = await fetch(`${baseUrl}/products/${product.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ active: !product.active })
      });

      if (response.ok) {
        setProducts(products.map(p => p.id === product.id ? { ...p, active: !p.active } : p));
        showToast(!product.active ? 'Producto visible (Activo)' : 'Producto oculto (Inactivo)', 'success');
      } else {
        showToast('Error al actualizar estado', 'error');
      }
    } catch (error) {
      console.error('Error toggling active:', error);
      showToast('Error de conexión', 'error');
    }
  };

  // --- LÓGICA DE FILTRADO Y PAGINACIÓN ---

  // 1. Filtrar productos
  const filteredProducts = products.filter(product => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = product.name.toLowerCase().includes(term) ||
      (product.custom_code && product.custom_code.toLowerCase().includes(term));

    const productCatId = product.category?.id || product.category_id;
    const matchesCategory = categoryFilter === '' || productCatId?.toString() === categoryFilter.toString();

    const matchesStatus = statusFilter === 'all'
      ? true
      : statusFilter === 'active'
        ? product.active
        : !product.active;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 2. Calcular Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const actions = (
    <Link to="/admin/products/new" className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center gap-2">
      <span>+</span> Añadir Nuevo
    </Link>
  );

  return (
    <AdminLayout title="Inventario" actions={actions}>
      <div className="p-4 md:p-10 h-full flex flex-col">
        {loading ? (
          <div className="py-20 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-earth mx-auto"></div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-beige-dark/10 overflow-hidden flex flex-col flex-1">

            {/* --- BARRA DE HERRAMIENTAS (Filtros) --- */}
            <div className="p-5 border-b border-beige-dark/10 bg-beige-light/10 flex flex-wrap gap-4 items-end">
              {/* Búsqueda */}
              <div className="flex-1 min-w-[200px]">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Buscar Producto</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Nombre o Código (EAN)..."
                    value={searchTerm}
                    onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                    className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50"
                  />
                  <span className="absolute left-3 top-2 text-slate-400">🔍</span>
                </div>
              </div>

              {/* Filtro Categoría */}
              <div className="min-w-[150px]">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Categoría</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50 bg-white"
                >
                  <option value="">Todas</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              {/* Filtro Estado */}
              <div className="min-w-[120px]">
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">Estado</label>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-earth/50 bg-white"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activos</option>
                  <option value="inactive">Inactivos</option>
                </select>
              </div>

              {/* Limpiar Filtros */}
              {(searchTerm || categoryFilter || statusFilter !== 'all') && (
                <button
                  onClick={() => { setSearchTerm(''); setCategoryFilter(''); setStatusFilter('all'); setCurrentPage(1); }}
                  className="text-xs text-red-500 hover:text-red-700 font-bold underline mb-2"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* --- LISTADO DE PRODUCTOS --- */}
            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left min-w-[600px] lg:min-w-[900px]">
                <thead className="bg-beige-light/30 border-b border-beige-dark/10 sticky top-0 z-10 backdrop-blur-sm">
                  <tr>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Producto</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Categoría</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Precio</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Destacado</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">Stock</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-beige-dark/5">
                  {currentItems.length > 0 ? currentItems.map(product => (
                    <tr key={product.id} className={`hover:bg-beige-light/10 transition-colors ${!product.active ? 'bg-slate-50' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 ${!product.active ? 'grayscale opacity-70' : ''}`}>
                            <img src={formatImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className={`font-bold text-sm ${!product.active ? 'text-slate-500' : 'text-slate-800'}`}>{product.name}</p>
                            {product.custom_code && (
                              <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded font-mono mr-2">
                                #{product.custom_code}
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 italic truncate inline-block max-w-[150px] align-bottom">
                              {product.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-slate-600 bg-beige-light px-2 py-1 rounded-md">
                          {product.category?.name || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-slate-700 text-sm">
                        ${parseFloat(product.price).toLocaleString('es-AR')}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-full border ${product.active
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                          {product.active ? 'Activo' : 'Inactivo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => toggleFeatured(product)}
                          className={`p-2 rounded-full transition-colors ${product.featured ? 'text-yellow-500 bg-yellow-50 hover:bg-yellow-100' : 'text-slate-300 hover:text-yellow-300'}`}
                          title={product.featured ? "Quitar de destacados" : "Destacar en portada"}
                        >
                          <svg width="20" height="20" fill={product.featured ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                        </button>
                      </td>
                      <td className="px-6 py-4">
                        <StockBadge
                          stock={product.stock}
                          stockMinimo={product.stock_minimo || 10}
                          stockCritico={product.stock_critico || 3}
                          size="sm"
                        />
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 text-slate-400">
                          {/* Botón Toggle Active */}
                          <button
                            onClick={() => toggleActive(product)}
                            className={`p-2 transition-colors ${product.active ? 'hover:text-amber-600' : 'text-slate-300 hover:text-green-600'}`}
                            title={product.active ? "Ocultar en web" : "Mostrar en web"}
                          >
                            {product.active ? (
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                              </svg>
                            ) : (
                              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            )}
                          </button>

                          <Link to={`/admin/products/edit/${product.id}`} className="p-2 hover:text-earth transition-colors" title="Editar">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                          </Link>
                          <button onClick={() => handleDelete(product.id)} className="p-2 hover:text-terracotta transition-colors" title="Borrar">
                            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-slate-400 italic">No se encontraron productos con estos criterios.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* --- CONTROLES DE PAGINACIÓN --- */}
            {totalPages > 1 && (
              <div className="p-5 border-t border-beige-dark/10 flex justify-between items-center bg-beige-light/5 sticky bottom-0 z-10">
                <span className="text-xs text-slate-400">
                  Mostrando {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredProducts.length)} de {filteredProducts.length} productos
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => goToPage(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold"
                  >
                    Anterior
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => goToPage(page)}
                      className={`w-8 h-8 rounded-md flex items-center justify-center text-xs font-bold transition-colors ${currentPage === page
                        ? 'bg-earth text-white shadow-md'
                        : 'text-slate-500 hover:bg-slate-100'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                  <button
                    onClick={() => goToPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold"
                  >
                    Siguiente
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminProducts;
