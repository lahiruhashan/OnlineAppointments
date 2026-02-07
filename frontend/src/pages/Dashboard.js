import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import '../styles/Dashboard.css';

function Dashboard() {
    const { user } = useAuth();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        fetchAppointments();
    }, []);
    
    const fetchAppointments = async () => {
        try {
            const response = await api.get('/appointments');
            setAppointments(response.data.data.slice(0, 5)); // Show last 5 appointments
        } catch (error) {
            console.error('Error fetching appointments:', error);
        } finally {
            setLoading(false);
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
        <div className="dashboard">
            <h1>Welcome, {user?.firstName}!</h1>
            
            <div className="dashboard-stats">
                <div className="stat-card">
                    <h3>Quick Actions</h3>
                    <Link to="/book" className="btn-primary">Book New Appointment</Link>
                    <Link to="/my-appointments" className="btn-secondary">View All Appointments</Link>
                </div>
                
                <div className="stat-card">
                    <h3>Your Profile</h3>
                    <p><strong>Email:</strong> {user?.email}</p>
                    <p><strong>Role:</strong> {user?.role}</p>
                </div>
            </div>
            
            <div className="dashboard-section">
                <h2>Recent Appointments</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : appointments.length === 0 ? (
                    <p>No appointments yet. <Link to="/book">Book your first appointment!</Link></p>
                ) : (
                    <table className="appointments-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Date & Time</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {appointments.map((appointment) => (
                                <tr key={appointment.id}>
                                    <td>{appointment.title}</td>
                                    <td>
                                        {new Date(appointment.startTime).toLocaleString()}
                                    </td>
                                    <td>
                                        <span className={`status-badge ${getStatusClass(appointment.status)}`}>
                                            {appointment.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}

export default Dashboard;
