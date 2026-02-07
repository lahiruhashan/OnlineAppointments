import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/BookAppointment.css';

function BookAppointment() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        time: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();
    
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        
        try {
            const startTime = new Date(`${formData.date}T${formData.time}`);
            const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // 1 hour later
            
            await api.post('/appointments', {
                title: formData.title,
                description: formData.description,
                startTime: startTime.toISOString(),
                endTime: endTime.toISOString(),
            });
            
            setSuccess(true);
            setTimeout(() => {
                navigate('/my-appointments');
            }, 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to book appointment');
        } finally {
            setLoading(false);
        }
    };
    
    // Generate time slots for 24/7 availability
    const timeSlots = [];
    for (let hour = 0; hour < 24; hour++) {
        const time = `${hour.toString().padStart(2, '0')}:00`;
        timeSlots.push(time);
    }
    
    return (
        <div className="book-appointment">
            <h1>Book an Appointment</h1>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Appointment booked successfully! Redirecting...</div>}
            
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="title">Appointment Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        placeholder="e.g., Consultation, Meeting, etc."
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="description">Description (Optional)</label>
                    <textarea
                        id="description"
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Describe the purpose of your appointment..."
                    />
                </div>
                
                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="date">Date</label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            required
                            min={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                    
                    <div className="form-group">
                        <label htmlFor="time">Time</label>
                        <select
                            id="time"
                            name="time"
                            value={formData.time}
                            onChange={handleChange}
                            required
                        >
                            <option value="">Select a time</option>
                            {timeSlots.map((time) => (
                                <option key={time} value={time}>
                                    {time}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <button type="submit" className="btn-primary" disabled={loading}>
                    {loading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>
        </div>
    );
}

export default BookAppointment;
