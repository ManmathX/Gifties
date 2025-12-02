import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const response = await api.get('/auth/me');
                setUser(response.data);
            } catch (error) {
                console.error('Auth check failed:', error);
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    };

    const login = async (email, password) => {
        try {
            console.log('Attempting login...', { email });
            const response = await api.post('/auth/login', { email, password });
            console.log('Login successful:', response.data);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            console.error('Login error:', error);
            console.error('Error response:', error.response?.data);
            throw error;
        }
    };

    const register = async (email, password, name) => {
        try {
            console.log('Attempting registration...', { email, name });
            const response = await api.post('/auth/register', { email, password, name });
            console.log('Registration successful:', response.data);
            localStorage.setItem('token', response.data.token);
            setUser(response.data.user);
            return response.data;
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response?.data);
            console.error('Error message:', error.message);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
