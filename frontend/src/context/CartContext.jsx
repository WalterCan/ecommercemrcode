import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';

// Creamos el contexto del carrito
const CartContext = createContext();

/**
 * Proveedor del Carrito (CartProvider)
 * Maneja el estado global de los productos añadidos, cantidades y totales.
 */
export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const { showToast } = useToast();

    // Cargar carrito desde localStorage al iniciar
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCartItems(JSON.parse(savedCart));
        }
    }, []);

    // Guardar carrito en localStorage cuando cambie
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
    }, [cartItems]);

    // Función para abrir/cerrar el carrito
    const toggleCart = () => setIsCartOpen(!isCartOpen);

    // Función para añadir un producto al carrito
    const addToCart = (product) => {
        const existingItem = cartItems.find((item) => item.id === product.id);

        if (existingItem) {
            // Verificar si hay stock suficiente para añadir uno más
            if (existingItem.quantity >= product.stock) {
                showToast(`Lo sentimos, solo hay ${product.stock} unidades disponibles de este objeto sagrado.`, 'warning');
                return;
            }

            setCartItems(prevItems =>
                prevItems.map((item) =>
                    item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            // Si no existe, lo añadimos con cantidad 1
            showToast(`${product.name} añadido a tu colección sagrada.`, 'success');
            setCartItems(prevItems => [...prevItems, { ...product, quantity: 1 }]);
        }

        setIsCartOpen(true);
    };

    // Función para eliminar un producto o reducir cantidad
    const removeFromCart = (productId) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.id !== productId)
        );
    };

    // Cambiar cantidad de un item
    const updateQuantity = (productId, amount) => {
        const item = cartItems.find(i => i.id === productId);
        if (!item) return;

        const newQuantity = item.quantity + amount;

        // Verificar stock máximo
        if (amount > 0 && newQuantity > item.stock) {
            showToast(`Lo sentimos, solo hay ${item.stock} unidades disponibles.`, 'warning');
            return;
        }

        if (newQuantity < 1) return;

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        );
    };

    // Calcular subtotal
    const cartSubtotal = cartItems.reduce(
        (total, item) => total + parseFloat(item.price) * item.quantity,
        0
    );

    // Cantidad total de items
    const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

    // Función para limpiar el carrito
    const clearCart = () => {
        setCartItems([]);
    };

    return (
        <CartContext.Provider value={{
            cartItems,
            cart: cartItems, // Alias para compatibilidad
            isCartOpen,
            toggleCart,
            addToCart,
            removeFromCart,
            updateQuantity,
            cartSubtotal,
            cartTotal: cartSubtotal, // Alias para compatibilidad
            cartCount,
            clearCart
        }}>
            {children}
        </CartContext.Provider>
    );
};

// Hook personalizado para usar el carrito fácilmente
export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart debe usarse dentro de un CartProvider');
    }
    return context;
};
