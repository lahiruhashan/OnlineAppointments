import React, { useState, useEffect } from 'react';
import api from '../services/api';
import '../styles/MyAppointments.css';

function MyAppointments() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    useEffect(() => {
        fetchAppointments();
    }, []);
    
    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data.data);
        } catch (err) {
            setError('Failed to load appointments');
        } finally {
            setLoading(false);
        }
    };
    
    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) {
            return;
        }
        
        try {
            await api.delete(`/appointments/${id}`);
            fetchAppointments(); // Refresh the list
        } catch (err) {
            setError('Failed to cancel appointment');
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
        <div className="my-appointments">
            <h1>My Appointments</h1>
            
            {error && <div className="error-message">{error}</div>}
            
            {loading ? (
                <p>Loading appointments...</p>
            ) : appointments.length === 0 ? (
                <div className="no-appointments">
                    <p>You haven't booked any appointments yet.</p>
                </div>
            ) : (
                <table className="appointments-table">
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Description</th>
                            <th>Start Time</th>
                            <th>End Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {appointments.map((appointment) => (
                            <tr key={appointment.id}>
                                <td>{appointment.title}</td>
                                <td>{appointment.description || '-'}</td>
                                <td>{new Date(appointment.startTime).toLocaleString()}</td>
                                <td>{new Date(appointment.endTime).toLocaleString()}</td>
                                <td>
                                    <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                        {appointment.status}
                                    </span>
                                </td>
                                <td>
                                    {appointment.status === 'SCHEDULED' && (
                                        <button
                                            onClick={() => handleCancel(appointment.id)}
                                            className="btn-cancel"
                                        >
                                            Cancel
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default MyAppointments;
