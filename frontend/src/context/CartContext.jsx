import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState([]);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            setCart(JSON.parse(savedCart));
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cart));
    }, [cart]);

    const addToCart = (product, quantity = 1, customization = {}) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item =>
                item.id === product.id &&
                JSON.stringify(item.customization) === JSON.stringify(customization)
            );

            if (existingItem) {
                return prevCart.map(item =>
                    item.id === product.id &&
                        JSON.stringify(item.customization) === JSON.stringify(customization)
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }

            return [...prevCart, { ...product, quantity, customization }];
        });
    };

    const removeFromCart = (productId, customization = {}) => {
        setCart(prevCart =>
            prevCart.filter(item =>
                !(item.id === productId &&
                    JSON.stringify(item.customization) === JSON.stringify(customization))
            )
        );
    };

    const updateQuantity = (productId, quantity, customization = {}) => {
        if (quantity <= 0) {
            removeFromCart(productId, customization);
            return;
        }

        setCart(prevCart =>
            prevCart.map(item =>
                item.id === productId &&
                    JSON.stringify(item.customization) === JSON.stringify(customization)
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => {
            const price = parseFloat(item.price);
            return total + (price * item.quantity);
        }, 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    return (
        <CartContext.Provider value={{
            cart,
            addToCart,
            removeFromCart,
            updateQuantity,
            clearCart,
            getCartTotal,
            getCartCount,
        }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within CartProvider');
    }
    return context;
};
