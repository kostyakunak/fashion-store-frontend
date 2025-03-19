import { useState, useEffect } from "react";

export default function useCart() {
    const [cartItems, setCartItems] = useState([]);
    const [total, setTotal] = useState(0);

    // Обновление суммы при изменении корзины
    useEffect(() => {
        setTotal(cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    }, [cartItems]);

    // Добавить в корзину
    const addToCart = (item) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((cartItem) => cartItem.title === item.title);
            if (existingItem) {
                return prevItems.map((cartItem) =>
                    cartItem.title === item.title ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
                );
            }
            return [...prevItems, { ...item, quantity: 1 }];
        });
    };

    // Удалить из корзины
    const removeFromCart = (title) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.title !== title));
    };

    // Изменить количество
    const updateQuantity = (title, quantity) => {
        setCartItems((prevItems) =>
            prevItems.map((item) => (item.title === title ? { ...item, quantity: Math.max(1, quantity) } : item))
        );
    };

    return { cartItems, addToCart, removeFromCart, updateQuantity, total };
}