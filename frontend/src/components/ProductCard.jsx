import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './ProductCard.css';

export default function ProductCard({ product }) {
    const { addToCart } = useCart();
    const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/300x300?text=No+Image';

    const categoryColors = {
        CHOCOLATE: 'hsl(30, 70%, 50%)',
        MYSTERY_BOX: 'hsl(280, 70%, 60%)',
        FLOWERS: 'hsl(340, 75%, 60%)',
        CUSTOM_GIFT: 'hsl(200, 70%, 55%)',
    };

    const categoryLabels = {
        CHOCOLATE: 'Chocolate',
        MYSTERY_BOX: 'Mystery Box',
        FLOWERS: 'Flowers',
        CUSTOM_GIFT: 'Custom Gift',
    };

    const handleAddToCart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    return (
        <Link to={`/products/${product.id}`} className="product-card">
            <div className="product-image-wrapper">
                <img src={imageUrl} alt={product.name} className="product-image" />
                <span
                    className="product-category-badge"
                    style={{ background: categoryColors[product.category] }}
                >
                    {categoryLabels[product.category]}
                </span>
                {product.stock <= 0 && (
                    <div className="out-of-stock-overlay">
                        <span>Out of Stock</span>
                    </div>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>

                {product.averageRating > 0 && (
                    <div className="product-rating">
                        <span className="stars">
                            {'★'.repeat(Math.round(product.averageRating))}
                            {'☆'.repeat(5 - Math.round(product.averageRating))}
                        </span>
                        <span className="rating-count">({product.reviewCount})</span>
                    </div>
                )}

                <div className="product-footer">
                    <div className="product-price">
                        <span className="price-currency">$</span>
                        <span className="price-amount">{parseFloat(product.price).toFixed(2)}</span>
                    </div>

                    <button
                        className="btn-add-to-cart"
                        onClick={handleAddToCart}
                        disabled={product.stock <= 0}
                    >
                        {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        </Link>
    );
}
