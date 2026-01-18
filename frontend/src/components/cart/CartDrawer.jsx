import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatImageUrl } from '../../utils/imageConfig';

/**
 * Carrito Lateral (Side Drawer)
 * Se despliega desde la derecha para mostrar el resumen de compra.
 */
const CartDrawer = () => {
    const { cartItems, isCartOpen, toggleCart, removeFromCart, updateQuantity, cartSubtotal } = useCart();
    const { user } = useAuth();

    return (
        <>
            {/* Overlay (Fondo oscuro al abrir) */}
            <div
                className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] transition-opacity duration-300 ${isCartOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
                    }`}
                onClick={toggleCart}
            />

            {/* Drawer Panel */}
            <aside
                className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-paper shadow-2xl z-[101] transform transition-transform duration-500 ease-out ${isCartOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                <div className="flex flex-col h-full">
                    {/* Header del Carrito */}
                    <div className="p-6 border-b border-beige-dark/20 flex items-center justify-between">
                        <h2 className="text-xl font-serif text-earth font-bold">Tu Selección</h2>
                        <button onClick={toggleCart} className="text-slate-400 hover:text-earth transition-colors">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    {/* Lista de Productos */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {cartItems.length === 0 ? (
                            <div className="text-center py-10">
                                <p className="text-slate-400 italic font-serif">Aún no has seleccionado ningún objeto sagrado.</p>
                                <button
                                    onClick={toggleCart}
                                    className="mt-6 text-earth font-bold uppercase tracking-widest text-xs border-b border-earth pb-1"
                                >
                                    Continuar Explorando
                                </button>
                            </div>
                        ) : (
                            cartItems.map((item) => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="w-20 h-20 bg-beige-light rounded-xl overflow-hidden flex-shrink-0">
                                        <img src={formatImageUrl(item.image_url)} alt={item.name} className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <h3 className="text-sm font-medium text-slate-800">{item.name}</h3>
                                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-terracotta transition-colors">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </div>
                                        <p className="text-xs text-slate-400 mb-2 truncate max-w-[180px]">{item.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center border border-beige-dark/30 rounded-full px-2">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 text-slate-400 hover:text-earth">-</button>
                                                <span className="px-2 text-xs font-medium">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 text-slate-400 hover:text-earth">+</button>
                                            </div>
                                            <span className="text-sm font-bold text-slate-700">
                                                ${(parseFloat(item.price) * item.quantity).toLocaleString('es-AR')}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer del Carrito */}
                    {cartItems.length > 0 && (
                        <div className="p-6 border-t border-beige-dark/20 bg-beige-light/30">
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-slate-500 uppercase tracking-widest text-xs font-medium">Subtotal</span>
                                <span className="text-xl font-serif font-bold text-slate-900">
                                    ${cartSubtotal.toLocaleString('es-AR')}
                                </span>
                            </div>

                            {user ? (
                                <Link
                                    to="/checkout"
                                    onClick={toggleCart}
                                    className="block w-full text-white py-4 rounded-full shadow-lg font-bold transition-all transform hover:scale-[1.02] text-center"
                                    style={{
                                        backgroundColor: 'var(--color-primary)',
                                        boxShadow: '0 10px 25px -5px var(--color-primary)33'
                                    }}
                                >
                                    Finalizar Compra
                                </Link>
                            ) : (
                                <div className="space-y-3">
                                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-xs text-yellow-800 text-center">
                                        Debes iniciar sesión para completar tu compra
                                    </div>
                                    <Link
                                        to="/login"
                                        onClick={() => {
                                            toggleCart();
                                            localStorage.setItem('redirectAfterLogin', '/checkout');
                                        }}
                                        className="block w-full bg-slate-800 hover:bg-slate-900 text-white py-4 rounded-full shadow-lg font-bold transition-all transform hover:scale-[1.02] text-center"
                                    >
                                        Iniciar sesión para comprar
                                    </Link>
                                </div>
                            )}

                            <p className="text-[10px] text-center text-slate-400 mt-4 uppercase tracking-tighter">
                                Impuestos y envío calculados al finalizar
                            </p>
                        </div>
                    )}
                </div>
            </aside>
        </>
    );
};

export default CartDrawer;
