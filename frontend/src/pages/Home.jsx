import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './Home.css';

export default function Home() {
    const [featuredProducts, setFeaturedProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            const response = await api.get('/products');
            setFeaturedProducts(response.data.slice(0, 8));
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { name: 'Chocolates', icon: '🍫', category: 'CHOCOLATE', color: 'hsl(30, 70%, 50%)' },
        { name: 'Flowers', icon: '🌸', category: 'FLOWERS', color: 'hsl(340, 75%, 60%)' },
        { name: 'Mystery Boxes', icon: '🎁', category: 'MYSTERY_BOX', color: 'hsl(280, 70%, 60%)' },
        { name: 'Custom Gifts', icon: '✨', category: 'CUSTOM_GIFT', color: 'hsl(200, 70%, 55%)' },
    ];

    return (
        <div className="home">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content animate-slide-up">
                        <h1 className="hero-title">
                            Give the Perfect Gift,<br />
                            <span className="text-gradient">Every Time</span>
                        </h1>
                        <p className="hero-subtitle">
                            Discover unique, personalized gifts from independent creators.
                            Create your own store and share the joy of giving.
                        </p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Shop Now
                            </Link>
                            <Link to="/register" className="btn btn-secondary btn-lg">
                                Create Your Store
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Categories */}
            <section className="categories">
                <div className="container">
                    <h2 className="section-title text-center">Shop by Category</h2>
                    <div className="category-grid">
                        {categories.map((cat) => (
                            <Link
                                key={cat.category}
                                to={`/products?category=${cat.category}`}
                                className="category-card"
                                style={{ '--category-color': cat.color }}
                            >
                                <div className="category-icon">{cat.icon}</div>
                                <h3>{cat.name}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="featured-products">
                <div className="container">
                    <h2 className="section-title text-center">Featured Products</h2>
                    {loading ? (
                        <div className="loading-container">
                            <div className="spinner"></div>
                        </div>
                    ) : (
                        <div className="grid grid-4">
                            {featuredProducts.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-xl">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            View All Products
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="features">
                <div className="container">
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon">🚚</div>
                            <h3>Fast Delivery</h3>
                            <p>Get your gifts delivered quickly and safely</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🎨</div>
                            <h3>Customizable</h3>
                            <p>Personalize your gifts with photos and messages</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">🏪</div>
                            <h3>Create Your Store</h3>
                            <p>Start selling your unique gifts today</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon">💳</div>
                            <h3>Secure Payments</h3>
                            <p>Multiple payment options for your convenience</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
