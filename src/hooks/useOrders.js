import { useState, useEffect, useContext } from "react";
import { getUserOrders, getOrderById, getOrderDetails, cancelOrder } from "../api/userOrderApi";
import { AuthContext } from "../context/AuthContext";

export default function useOrders() {
    const [orders, setOrders] = useState([]);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderDetails, setOrderDetails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Use AuthContext to get user authentication status
    const auth = useContext(AuthContext);

    // Load orders when the component mounts or auth status changes
    useEffect(() => {
        if (auth.isAuthenticated()) {
            loadOrders();
        } else {
            setOrders([]);
            setSelectedOrder(null);
            setOrderDetails([]);
            setLoading(false);
        }
    }, [auth.isAuthenticated()]);

    // Load all orders for the authenticated user
    const loadOrders = async () => {
        if (!auth.isAuthenticated()) {
            setError("You must be logged in to view orders");
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getUserOrders();
            setOrders(data);
            setLoading(false);
        } catch (err) {
            setError("Error loading orders: " + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Load a specific order by ID
    const loadOrderById = async (orderId) => {
        if (!auth.isAuthenticated()) {
            setError("You must be logged in to view order details");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getOrderById(orderId);
            setSelectedOrder(data);
            
            // Also load the order details
            await loadOrderDetails(orderId);
            
            setLoading(false);
        } catch (err) {
            setError("Error loading order: " + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Load order details for a specific order
    const loadOrderDetails = async (orderId) => {
        if (!auth.isAuthenticated()) {
            setError("You must be logged in to view order details");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const data = await getOrderDetails(orderId);
            setOrderDetails(data);
            setLoading(false);
        } catch (err) {
            setError("Error loading order details: " + (err.response?.data?.message || err.message));
            setLoading(false);
        }
    };

    // Cancel an order
    const cancelUserOrder = async (orderId) => {
        if (!auth.isAuthenticated()) {
            setError("You must be logged in to cancel an order");
            return false;
        }

        setError(null);

        try {
            const data = await cancelOrder(orderId);
            
            // Update the orders list with the updated order
            setOrders(prevOrders => 
                prevOrders.map(order => 
                    order.id === orderId ? data : order
                )
            );
            
            // If this is the currently selected order, update it
            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder(data);
            }
            
            return true;
        } catch (err) {
            setError("Error cancelling order: " + (err.response?.data?.message || err.message));
            return false;
        }
    };

    // Check if an order can be cancelled
    // This depends on business rules, e.g., only orders with status PENDING or PROCESSING can be cancelled
    const canBeCancelled = (order) => {
        if (!order) return false;
        
        // Example condition: Only orders with AWAITING_PAYMENT status can be cancelled
        return order.status === "AWAITING_PAYMENT";
    };

    // Reset error state
    const clearError = () => {
        setError(null);
    };

    return {
        orders,
        selectedOrder,
        orderDetails,
        loading,
        error,
        loadOrders,
        loadOrderById,
        loadOrderDetails,
        cancelOrder: cancelUserOrder,
        canBeCancelled,
        clearError
    };
}