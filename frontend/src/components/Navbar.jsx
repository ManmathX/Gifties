import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartDrawer from './CartDrawer';
import './Navbar.css';

export default function Navbar() {
    const { user, logout } = useAuth();
    const { getCartCount } = useCart();
    const [showCart, setShowCart] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    const cartCount = getCartCount();

    return (
        <>
            <nav className="navbar">
                <div className="container navbar-content">
                    <Link to="/" className="navbar-brand">
                        <span className="brand-icon">🎁</span>
                        <span className="brand-text">Giftiy</span>
                    </Link>

                    <div className="navbar-links">
                        <Link to="/products" className="nav-link">Products</Link>
                        <Link to="/products?category=CHOCOLATE" className="nav-link">Chocolates</Link>
                        <Link to="/products?category=FLOWERS" className="nav-link">Flowers</Link>
                        <Link to="/products?category=MYSTERY_BOX" className="nav-link">Mystery Boxes</Link>
                    </div>

                    <div className="navbar-actions">
                        <button
                            className="cart-button"
                            onClick={() => setShowCart(true)}
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M9 2L7.17 4H3a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1h-4.17L15 2H9z" />
                                <circle cx="12" cy="13" r="3" />
                            </svg>
                            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
                        </button>

                        {user ? (
                            <div className="user-menu">
                                <button
                                    className="user-button"
                                    onClick={() => setShowUserMenu(!showUserMenu)}
                                >
                                    <div className="user-avatar">
                                        {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                                    </div>
                                    <span>{user.name || user.email}</span>
                                </button>

                                {showUserMenu && (
                                    <div className="user-dropdown">
                                        <Link to="/dashboard" className="dropdown-item">
                                            Dashboard
                                        </Link>
                                        <Link to="/dashboard#orders" className="dropdown-item">
                                            My Orders
                                        </Link>
                                        <Link to="/dashboard#tents" className="dropdown-item">
                                            My Stores
                                        </Link>
                                        <button onClick={logout} className="dropdown-item">
                                            Logout
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="auth-buttons">
                                <Link to="/login" className="btn btn-ghost btn-sm">Login</Link>
                                <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <CartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
        </>
    );
}
