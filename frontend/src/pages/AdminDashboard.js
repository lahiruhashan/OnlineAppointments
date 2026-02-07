import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/AdminDashboard.css';

function AdminDashboard() {
    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>
            
            <div className="admin-stats">
                <div className="admin-card">
                    <h3>Manage Appointments</h3>
                    <p>View and manage all appointments</p>
                    <Link to="/admin/appointments" className="btn-primary">Go to Appointments</Link>
                </div>
                
                <div className="admin-card">
                    <h3>Manage Users</h3>
                    <p>View all registered users</p>
                    <Link to="/admin/users" className="btn-primary">Go to Users</Link>
                </div>
            </div>
        </div>
    );
}

export default AdminDashboard;
