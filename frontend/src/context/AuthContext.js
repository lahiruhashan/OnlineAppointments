import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        
        if (token && userData) {
            setUser(JSON.parse(userData));
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
        setLoading(false);
    }, []);
    
    const login = async (email, password) => {
        console.log('AuthContext.login called');
        const response = await api.post('/auth/login', { email, password });
        console.log('Login response:', response.data);
        const { token, ...userData } = response.data.data;
        console.log('Token received:', token.substring(0, 20) + '...');
        console.log('User data:', userData);
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        console.log('User state set, user:', userData);
        return userData;
    };
    
    const register = async (firstName, lastName, email, password) => {
        const response = await api.post('/auth/register', {
            firstName,
            lastName,
            email,
            password
        });
        const { token, ...userData } = response.data.data;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        setUser(userData);
        return userData;
    };
    
    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        delete api.defaults.headers.common['Authorization'];
        setUser(null);
    };
    
    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
