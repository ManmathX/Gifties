import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import './Dashboard.css';

export default function Dashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [tents, setTents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }
        fetchData();
    }, [user]);

    const fetchData = async () => {
        try {
            const [ordersRes, tentsRes] = await Promise.all([
                api.get('/orders/my-orders'),
                api.get('/tents/user/my-tents'),
            ]);
            setOrders(ordersRes.data);
            setTents(tentsRes.data);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    return (
        <div className="dashboard-page">
            <div className="container">
                <h1>My Dashboard</h1>

                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>My Orders</h2>
                    </div>
                    {orders.length === 0 ? (
                        <p className="empty-message">No orders yet</p>
                    ) : (
                        <div className="orders-list">
                            {orders.map((order) => (
                                <div key={order.id} className="order-card">
                                    <div className="order-header">
                                        <span className="order-id">Order #{order.id.slice(0, 8)}</span>
                                        <span className={`badge badge-${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="order-items">
                                        {order.items.map((item) => (
                                            <div key={item.id} className="order-item">
                                                <img src={item.product.images?.[0]?.url || 'https://via.placeholder.com/60'} alt={item.product.name} />
                                                <span>{item.product.name} x {item.quantity}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-total">
                                        Total: ${parseFloat(order.totalAmount).toFixed(2)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="dashboard-section">
                    <div className="section-header">
                        <h2>My Stores</h2>
                        <Link to="/tent/new" className="btn btn-primary btn-sm">
                            Create Store
                        </Link>
                    </div>
                    {tents.length === 0 ? (
                        <p className="empty-message">No stores yet. Create one to start selling!</p>
                    ) : (
                        <div className="tents-grid">
                            {tents.map((tent) => (
                                <Link key={tent.id} to={`/tent/${tent.id}`} className="tent-card">
                                    <h3>{tent.name}</h3>
                                    <p>{tent.description}</p>
                                    <div className="tent-stats">
                                        <span>{tent.products?.length || 0} Products</span>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
