import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import './ProductDetail.css';

export default function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [customMessage, setCustomMessage] = useState('');
    const { addToCart } = useCart();

    useEffect(() => {
        fetchProduct();
    }, [id]);

    const fetchProduct = async () => {
        try {
            const response = await api.get(`/products/${id}`);
            setProduct(response.data);
        } catch (error) {
            console.error('Failed to fetch product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        const customization = customMessage ? { message: customMessage } : {};
        addToCart(product, quantity, customization);
        alert('Added to cart!');
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
            </div>
        );
    }

    if (!product) {
        return <div className="container"><h2>Product not found</h2></div>;
    }

    return (
        <div className="product-detail-page">
            <div className="container">
                <div className="product-detail-grid">
                    <div className="product-images">
                        <img
                            src={product.images?.[0]?.url || 'https://via.placeholder.com/600'}
                            alt={product.name}
                            className="main-image"
                        />
                    </div>

                    <div className="product-details">
                        <h1>{product.name}</h1>
                        <div className="product-price-large">
                            ${parseFloat(product.price).toFixed(2)}
                        </div>

                        {product.averageRating > 0 && (
                            <div className="product-rating-large">
                                <span className="stars">
                                    {'★'.repeat(Math.round(product.averageRating))}
                                    {'☆'.repeat(5 - Math.round(product.averageRating))}
                                </span>
                                <span>({product.reviewCount} reviews)</span>
                            </div>
                        )}

                        <p className="product-description-large">{product.description}</p>

                        <div className="product-stock">
                            {product.stock > 0 ? (
                                <span className="in-stock">In Stock ({product.stock} available)</span>
                            ) : (
                                <span className="out-of-stock">Out of Stock</span>
                            )}
                        </div>

                        <div className="customization-section">
                            <label htmlFor="message">Add a personal message (optional)</label>
                            <textarea
                                id="message"
                                className="input"
                                rows="3"
                                placeholder="Your message here..."
                                value={customMessage}
                                onChange={(e) => setCustomMessage(e.target.value)}
                            />
                        </div>

                        <div className="quantity-section">
                            <label>Quantity</label>
                            <div className="quantity-controls-large">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <span>{quantity}</span>
                                <button onClick={() => setQuantity(quantity + 1)}>+</button>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-lg"
                            onClick={handleAddToCart}
                            disabled={product.stock <= 0}
                        >
                            {product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}
                        </button>
                    </div>
                </div>

                {product.reviews && product.reviews.length > 0 && (
                    <div className="reviews-section">
                        <h2>Customer Reviews</h2>
                        <div className="reviews-list">
                            {product.reviews.map((review) => (
                                <div key={review.id} className="review-card">
                                    <div className="review-header">
                                        <span className="review-author">{review.user.name || 'Anonymous'}</span>
                                        <span className="review-rating">
                                            {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                        </span>
                                    </div>
                                    {review.comment && <p>{review.comment}</p>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
