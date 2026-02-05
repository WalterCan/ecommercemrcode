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
        // Generar un ID único para el item en el carrito (Producto + Variante)
        const cartItemId = product.variant
            ? `${product.id}-${product.variant.id}`
            : `${product.id}`;

        const existingItem = cartItems.find((item) => item.uid === cartItemId);

        if (existingItem) {
            // Verificar si hay stock suficiente para añadir uno más
            const currentStock = product.variant ? product.variant.stock : product.stock;

            // Si el stock es 0 o indefinido, asumimos que no hay límite (o manejamos error), 
            // pero si hay stock definido, lo respetamos.
            if (currentStock !== undefined && existingItem.quantity >= currentStock) {
                showToast(`Lo sentimos, solo hay ${currentStock} unidades disponibles.`, 'warning');
                return;
            }

            setCartItems(prevItems =>
                prevItems.map((item) =>
                    item.uid === cartItemId ? { ...item, quantity: item.quantity + 1 } : item
                )
            );
        } else {
            // Si no existe, lo añadimos con cantidad 1 y su UID
            showToast(`${product.name} ${product.variant ? `(${product.variant.name})` : ''} agregado al carrito.`, 'success');
            setCartItems(prevItems => [...prevItems, { ...product, uid: cartItemId, quantity: 1 }]);
        }

        setIsCartOpen(true);
    };

    // Función para eliminar un producto o reducir cantidad
    const removeFromCart = (uid) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => item.uid !== uid)
        );
    };

    // Cambiar cantidad de un item
    const updateQuantity = (uid, amount) => {
        const item = cartItems.find(i => i.uid === uid);
        if (!item) return;

        const newQuantity = item.quantity + amount;
        const currentStock = item.variant ? item.variant.stock : item.stock;

        // Verificar stock máximo
        if (amount > 0 && currentStock !== undefined && newQuantity > currentStock) {
            showToast(`Lo sentimos, solo hay ${currentStock} unidades disponibles.`, 'warning');
            return;
        }

        if (newQuantity < 1) return;

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.uid === uid ? { ...item, quantity: newQuantity } : item
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
