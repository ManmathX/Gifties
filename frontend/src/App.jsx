import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Checkout from './pages/Checkout';
import Dashboard from './pages/Dashboard';
import TentManagement from './pages/TentManagement';

function App() {
    return (
        <div className="app">
            <Navbar />
            <main>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/products" element={<Products />} />
                    <Route path="/products/:id" element={<ProductDetail />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/tent/:tentId" element={<TentManagement />} />
                </Routes>
            </main>
        </div>
    );
}

export default App;
