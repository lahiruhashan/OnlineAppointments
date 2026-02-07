import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    
    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/">Appointment System</Link>
            </div>
            <div className="navbar-menu">
                {user ? (
                    <>
                        <span className="navbar-user">Welcome, {user.firstName}</span>
                        <Link to="/dashboard" className="navbar-link">Dashboard</Link>
                        <Link to="/book" className="navbar-link">Book Appointment</Link>
                        <Link to="/my-appointments" className="navbar-link">My Appointments</Link>
                        {user.role === 'ADMIN' && (
                            <Link to="/admin" className="navbar-link admin-link">Admin Panel</Link>
                        )}
                        <button onClick={handleLogout} className="navbar-logout">Logout</button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className="navbar-link">Login</Link>
                        <Link to="/register" className="navbar-link">Register</Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;
