import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './CartDrawer.css';

export default function CartDrawer({ isOpen, onClose }) {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

    if (!isOpen) return null;

    return (
        <>
            <div className="cart-overlay" onClick={onClose} />
            <div className={`cart-drawer ${isOpen ? 'open' : ''}`}>
                <div className="cart-header">
                    <h2>Shopping Cart</h2>
                    <button className="close-button" onClick={onClose}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>

                {cart.length === 0 ? (
                    <div className="cart-empty">
                        <div className="empty-icon">🛍️</div>
                        <h3>Your cart is empty</h3>
                        <p>Add some amazing gifts to get started!</p>
                        <button className="btn btn-primary" onClick={onClose}>
                            Continue Shopping
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="cart-items">
                            {cart.map((item) => (
                                <div key={`${item.id}-${JSON.stringify(item.customization)}`} className="cart-item">
                                    <img
                                        src={item.images?.[0]?.url || 'https://via.placeholder.com/80'}
                                        alt={item.name}
                                        className="cart-item-image"
                                    />

                                    <div className="cart-item-details">
                                        <h4>{item.name}</h4>
                                        <p className="cart-item-price">${parseFloat(item.price).toFixed(2)}</p>

                                        {item.customization?.message && (
                                            <p className="cart-item-custom">
                                                Message: {item.customization.message}
                                            </p>
                                        )}
                                    </div>

                                    <div className="cart-item-actions">
                                        <div className="quantity-controls">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1, item.customization)}
                                                className="quantity-btn"
                                            >
                                                -
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1, item.customization)}
                                                className="quantity-btn"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id, item.customization)}
                                            className="remove-btn"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="cart-footer">
                            <div className="cart-total">
                                <span>Total:</span>
                                <span className="total-amount">${getCartTotal().toFixed(2)}</span>
                            </div>

                            <Link to="/checkout" className="btn btn-primary btn-lg" onClick={onClose}>
                                Proceed to Checkout
                            </Link>

                            <button className="btn btn-ghost" onClick={clearCart}>
                                Clear Cart
                            </button>
                        </div>
                    </>
                )}
            </div>
        </>
    );
}
