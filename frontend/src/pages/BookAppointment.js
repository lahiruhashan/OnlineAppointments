import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/BookAppointment.css';

function BookAppointment() {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        date: '',
        selectedSlot: null,
    });
    const [timeSlots, setTimeSlots] = useState([]);
    const [loading, setLoading] = useState(false);
    const [slotsLoading, setSlotsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const navigate = useNavigate();
    
    // Fetch time slots when date changes
    useEffect(() => {
        if (formData.date) {
            fetchTimeSlots(formData.date);
        }
    }, [formData.date]);
    
    const fetchTimeSlots = async (date) => {
        setSlotsLoading(true);
        setError('');
        try {
            const response = await api.get(`/appointments/slots/${date}`);
            setTimeSlots(response.data.data || []);
        } catch (err) {
            console.error('Error fetching time slots:', err);
            setError('Failed to load time slots');
        } finally {
            setSlotsLoading(false);
        }
    };
    
    const handleDateChange = (e) => {
        setFormData({
            ...formData,
            date: e.target.value,
            selectedSlot: null,
        });
        setTimeSlots([]);
    };
    
    const handleSlotClick = (slot) => {
        if (slot.available) {
            setFormData({
                ...formData,
                selectedSlot: slot,
            });
        }
    };
    
    const handleTitleChange = (e) => {
        setFormData({
            ...formData,
            title: e.target.value,
        });
    };
    
    const handleDescriptionChange = (e) => {
        setFormData({
            ...formData,
            description: e.target.value,
        });
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);
        setLoading(true);
        
        if (!formData.selectedSlot) {
            setError('Please select a time slot');
            setLoading(false);
            return;
        }
        
        try {
            const startTime = formData.selectedSlot.startTime;
            const endTime = formData.selectedSlot.endTime;
            
            await api.post('/appointments', {
                title: formData.title,
                description: formData.description,
                startTime: startTime,
                endTime: endTime,
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
    
    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    };
    
    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];
    
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
                        onChange={handleTitleChange}
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
                        onChange={handleDescriptionChange}
                        rows={3}
                        placeholder="Describe the purpose of your appointment..."
                    />
                </div>
                
                <div className="form-group">
                    <label htmlFor="date">Date</label>
                    <input
                        type="date"
                        id="date"
                        name="date"
                        value={formData.date}
                        onChange={handleDateChange}
                        required
                        min={today}
                    />
                </div>
                
                {formData.date && (
                    <div className="form-group">
                        <label>Available Time Slots</label>
                        {slotsLoading ? (
                            <div className="loading-slots">Loading time slots...</div>
                        ) : timeSlots.length === 0 ? (
                            <div className="no-slots">No time slots available for this date</div>
                        ) : (
                            <div className="time-slots-grid">
                                {timeSlots.map((slot, index) => (
                                    <div
                                        key={index}
                                        className={`time-slot ${
                                            slot.available ? 'available' : 'booked'
                                        } ${formData.selectedSlot?.startTime === slot.startTime ? 'selected' : ''}`}
                                        onClick={() => handleSlotClick(slot)}
                                        title={slot.available ? 'Click to select' : `Booked: ${slot.title}`}
                                    >
                                        <span className="slot-time">
                                            {formatTime(slot.startTime)} - {formatTime(slot.endTime)}
                                        </span>
                                        {slot.available ? (
                                            <span className="slot-status available">Available</span>
                                        ) : (
                                            <span className="slot-status booked">
                                                {slot.title}
                                                <small>({slot.status})</small>
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
                
                {formData.selectedSlot && (
                    <div className="selected-slot-info">
                        <strong>Selected:</strong> {formatTime(formData.selectedSlot.startTime)} - {formatTime(formData.selectedSlot.endTime)}
                    </div>
                )}
                
                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={loading || !formData.selectedSlot}
                >
                    {loading ? 'Booking...' : 'Book Appointment'}
                </button>
            </form>
        </div>
    );
}

export default BookAppointment;
