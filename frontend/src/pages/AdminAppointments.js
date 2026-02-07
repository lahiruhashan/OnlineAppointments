import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/AdminAppointments.css';

function AdminAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        fetchAppointments();
    }, []);
    
    const fetchAppointments = async () => {
        try {
            const response = await api.get('/admin/appointments');
            setAppointments(response.data.data);
        } catch (err) {
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };
    
    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this appointment?')) {
            return;
        }
        
        try {
            await api.delete(`/admin/appointments/${id}`);
            fetchAppointments(); // Refresh the list
        } catch (err) {
            setError('Failed to delete appointment');
        }
    };
    
    const getStatusClass = (status) => {
        switch (status) {
            case 'SCHEDULED': return 'status-scheduled';
            case 'COMPLETED': return 'status-completed';
            case 'CANCELLED': return 'status-cancelled';
            default: return '';
        }
    };
    
    return (
        <div className="admin-appointments">
            <h1>Manage All Appointments</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
                <p>No appointments found.</p>
            ) : (
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>User</th>
                            <th>Title</th>
                            <th>Start Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>{appointment.id}</td>
                                <td>{appointment.userName}<br/><small>{appointment.userEmail}</small></td>
                                <td>{appointment.title}</td>
                                <td>{new Date(appointment.startTime).toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td>
                                    <button
                                        onClick={() => handleDelete(appointment.id)}
                                        className="btn-delete"
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default AdminAppointments;
