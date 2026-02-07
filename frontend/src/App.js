import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import MyAppointments from './pages/MyAppointments';
import AdminDashboard from './pages/AdminDashboard';
import AdminAppointments from './pages/AdminAppointments';
import AdminUsers from './pages/AdminUsers';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return user ? children : <Navigate to="/login" />;
}

function AdminRoute({ children }) {
    const { user, loading } = useAuth();
    
    if (loading) {
        return <div>Loading...</div>;
    }
    
    return user && user.role === 'ADMIN' ? children : <Navigate to="/dashboard" />;
}

function App() {
    return (
        <div className="App">
            <Navbar />
            <div className="container">
                <Routes>
                    <Route path="/" element={<Navigate to="/dashboard" />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    
                    <Route path="/dashboard" element={
                        <PrivateRoute>
                            <Dashboard />
                        </PrivateRoute>
                    } />
                    
                    <Route path="/book" element={
                        <PrivateRoute>
                            <BookAppointment />
                        </PrivateRoute>
                    } />
                    
                    <Route path="/my-appointments" element={
                        <PrivateRoute>
                            <MyAppointments />
                        </PrivateRoute>
                    } />
                    
                    <Route path="/admin" element={
                        <AdminRoute>
                            <AdminDashboard />
                        </AdminRoute>
                    } />
                    
                    <Route path="/admin/appointments" element={
                        <AdminRoute>
                            <AdminAppointments />
                        </AdminRoute>
                    } />
                    
                    <Route path="/admin/users" element={
                        <AdminRoute>
                            <AdminUsers />
                        </AdminRoute>
                    } />
                </Routes>
            </div>
        </div>
    );
}

export default App;
