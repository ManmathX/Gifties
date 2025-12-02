import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import './Products.css';

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchParams, setSearchParams] = useSearchParams();

    const category = searchParams.get('category');
    const search = searchParams.get('search') || '';

    useEffect(() => {
        fetchProducts();
    }, [category, search]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = {};
            if (category) params.category = category;
            if (search) params.search = search;

            const response = await api.get('/products', { params });
            setProducts(response.data);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { label: 'All', value: null },
        { label: 'Chocolates', value: 'CHOCOLATE' },
        { label: 'Flowers', value: 'FLOWERS' },
        { label: 'Mystery Boxes', value: 'MYSTERY_BOX' },
        { label: 'Custom Gifts', value: 'CUSTOM_GIFT' },
    ];

    return (
        <div className="products-page">
            <div className="container">
                <div className="products-header">
                    <h1>Discover Amazing Gifts</h1>
                    <div className="search-bar">
                        <input
                            type="text"
                            className="input"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearchParams({ search: e.target.value })}
                        />
                    </div>
                </div>

                <div className="category-filters">
                    {categories.map((cat) => (
                        <button
                            key={cat.label}
                            className={`filter-btn ${category === cat.value ? 'active' : ''}`}
                            onClick={() => {
                                if (cat.value) {
                                    setSearchParams({ category: cat.value });
                                } else {
                                    setSearchParams({});
                                }
                            }}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {loading ? (
                    <div className="loading-container">
                        <div className="spinner"></div>
                    </div>
                ) : products.length === 0 ? (
                    <div className="no-products">
                        <h3>No products found</h3>
                        <p>Try adjusting your filters or search query</p>
                    </div>
                ) : (
                    <div className="grid grid-4">
                        {products.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
