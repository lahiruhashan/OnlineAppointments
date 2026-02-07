import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/AdminUsers.css';

function AdminUsers() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        fetchUsers();
    }, []);
    
    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data.data);
        } catch (err) {
            setError('Failed to load users');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="admin-users">
            <h1>Manage Users</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <p>Loading users...</p>
            ) : users.length === 0 ? (
                <p>No users found.</p>
            ) : (
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Role</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.id}</td>
                                <td>{user.firstName}</td>
                                <td>{user.lastName}</td>
                                <td>{user.email}</td>
                                <td>
                                    <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                                        {user.role}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminUsers;
