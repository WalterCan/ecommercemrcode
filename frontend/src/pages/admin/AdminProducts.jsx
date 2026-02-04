import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formatImageUrl } from '../../utils/imageConfig';
import { useToast } from '../../context/ToastContext';
import StockBadge from '../../components/StockBadge';
import AdminLayout from '../../components/admin/AdminLayout';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
      const response = await fetch(`${baseUrl}/products`);
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este objeto sagrado?')) {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3002/api';
        const response = await fetch(`${baseUrl}/products/${id}`, {
          method: 'DELETE'
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
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
      const response = await fetch(`${baseUrl}/products/${product.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
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

  const actions = (
    <Link to="/admin/products/new" className="bg-earth text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-earth-dark transition-all shadow-lg shadow-earth/20 flex items-center gap-2">
      <span>+</span> Añadir Nuevo
    </Link>
  );

  return (
    <AdminLayout title="Inventario" actions={actions}>
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
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Producto</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Categoría</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Precio</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-center">Destacado</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500">Stock</th>
                  <th className="px-8 py-5 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-beige-dark/5">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-beige-light/10 transition-colors">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-beige-light flex-shrink-0">
                          <img src={formatImageUrl(product.image_url)} alt={product.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{product.name}</p>
                          <p className="text-[10px] text-slate-400 truncate max-w-[200px] italic">{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs text-slate-600 bg-beige-light px-2 py-1 rounded-md">
                        {product.category?.name || 'N/A'}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-slate-700 text-sm">
                      ${parseFloat(product.price).toLocaleString('es-AR')}
                    </td>
                    <td className="px-8 py-5 text-center">
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
                    <td className="px-8 py-5">
                      <StockBadge
                        stock={product.stock}
                        stockMinimo={product.stock_minimo || 10}
                        stockCritico={product.stock_critico || 3}
                        size="sm"
                      />
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex justify-end gap-2 text-slate-400">
                        <Link to={`/admin/products/edit/${product.id}`} className="p-2 hover:text-earth transition-colors" title="Editar">
                          <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2 hover:text-terracotta transition-colors" title="Borrar">
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

export default AdminProducts;
