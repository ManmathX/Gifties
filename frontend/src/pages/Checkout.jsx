import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Checkout.css';

export default function Checkout() {
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('STRIPE');

    const handleCheckout = async () => {
        if (!user) {
            navigate('/login');
            return;
        }

        setLoading(true);
        try {
            // Create order
            const orderData = {
                items: cart.map(item => ({
                    productId: item.id,
                    quantity: item.quantity,
                    price: item.price,
                    customizedMessage: item.customization?.message,
                })),
                totalAmount: getCartTotal(),
            };

            const orderResponse = await api.post('/orders', orderData);
            const order = orderResponse.data;

            // Process payment
            if (paymentMethod === 'CASH_ON_DELIVERY') {
                await api.post('/payments/cod', { orderId: order.id });
                clearCart();
                alert('Order placed successfully! You will pay on delivery.');
                navigate('/dashboard');
            } else {
                // For Stripe, you would integrate Stripe Elements here
                alert('Stripe integration would go here. For demo, using COD.');
                await api.post('/payments/cod', { orderId: order.id });
                clearCart();
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Checkout failed:', error);
            alert('Checkout failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="checkout-page">
                <div className="container">
                    <div className="empty-cart">
                        <h2>Your cart is empty</h2>
                        <button className="btn btn-primary" onClick={() => navigate('/products')}>
                            Continue Shopping
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="checkout-page">
            <div className="container">
                <h1>Checkout</h1>

                <div className="checkout-grid">
                    <div className="checkout-items">
                        <h2>Order Summary</h2>
                        {cart.map((item) => (
                            <div key={`${item.id}-${JSON.stringify(item.customization)}`} className="checkout-item">
                                <img src={item.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={item.name} />
                                <div className="checkout-item-details">
                                    <h4>{item.name}</h4>
                                    <p>Quantity: {item.quantity}</p>
                                    {item.customization?.message && (
                                        <p className="custom-message">Message: {item.customization.message}</p>
                                    )}
                                </div>
                                <div className="checkout-item-price">
                                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="checkout-sidebar">
                        <div className="card">
                            <h3>Payment Method</h3>
                            <div className="payment-methods">
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="STRIPE"
                                        checked={paymentMethod === 'STRIPE'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Credit/Debit Card</span>
                                </label>
                                <label className="payment-option">
                                    <input
                                        type="radio"
                                        name="payment"
                                        value="CASH_ON_DELIVERY"
                                        checked={paymentMethod === 'CASH_ON_DELIVERY'}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    />
                                    <span>Cash on Delivery</span>
                                </label>
                            </div>

                            <div className="checkout-total">
                                <span>Total:</span>
                                <span className="total-amount">${getCartTotal().toFixed(2)}</span>
                            </div>

                            <button
                                className="btn btn-primary btn-lg"
                                onClick={handleCheckout}
                                disabled={loading}
                            >
                                {loading ? 'Processing...' : 'Place Order'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
