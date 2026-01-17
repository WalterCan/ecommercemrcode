import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { formatImageUrl } from '../../utils/imageConfig';

/**
 * Tarjeta de producto individual.
 * Diseño limpio con bordes redondeados y sombras suaves.
 */
const ProductCard = ({ product }) => {
    const { addToCart } = useCart();

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-500 border border-beige-dark/10">
            {/* Imagen del producto */}
            <div className="relative aspect-square overflow-hidden bg-beige-light">
                <img
                    src={formatImageUrl(product.image_url)}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {/* Badge de Categoría (opcional) */}
                {product.category && (
                    <span className="absolute top-3 left-3 bg-moss/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-medium">
                        {product.category.name}
                    </span>
                )}

                {/* Stock Badges */}
                {product.stock === 0 ? (
                    <span className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-bold">
                        Agotado
                    </span>
                ) : product.stock < 5 ? (
                    <span className="absolute top-3 right-3 bg-orange-500/90 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md uppercase tracking-wider font-bold">
                        Últimas {product.stock}
                    </span>
                ) : null}

                {/* Acciones Rápidas (Overlay al hover) */}
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity duration-300">
                    <button
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className={`p-2 rounded-full transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 shadow-lg ${product.stock === 0
                                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                : 'bg-white text-earth hover:bg-earth hover:text-white'
                            }`}
                        title={product.stock === 0 ? "Sin stock" : "Añadir al carrito"}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Información del producto */}
            <div className="p-5 text-center flex flex-col items-center">
                <Link to={`/product/${product.id}`} className="group-hover:text-earth transition-colors">
                    <h3 className="text-slate-700 font-medium text-lg mb-1">
                        {product.name}
                    </h3>
                </Link>
                <p className="text-slate-400 text-sm mb-3 line-clamp-2 italic text-center mx-auto">
                    {product.description}
                </p>
                <div className="flex flex-col items-center">
                    <span className="text-xl font-serif font-bold text-slate-800">
                        ${parseFloat(product.price).toLocaleString('es-AR')}
                    </span>
                    <Link
                        to={`/product/${product.id}`}
                        className="mt-4 text-xs font-bold uppercase tracking-widest text-earth hover:text-terracotta transition-colors border-b border-transparent hover:border-terracotta pb-1"
                    >
                        Ver Detalles
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
