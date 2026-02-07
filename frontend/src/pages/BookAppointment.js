import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import api from '../services/api';
import '../styles/BookAppointment.css';

// Stripe will be loaded dynamically from backend config
let stripePromise = null;

function getStripe(publishableKey) {
    if (!stripePromise && publishableKey) {
        stripePromise = loadStripe(publishableKey);
    }
    return stripePromise;
}

function CardForm({ onSuccess, onError, amount, disabled }) {
    const stripe = useStripe();
    const elements = useElements();
    const [processing, setProcessing] = useState(false);
    
    const handleSubmit = async (event) => {
        event.preventDefault();
        
        if (!stripe || !elements) {
            return;
        }
        
        setProcessing(true);
        
        try {
            // Create payment intent on server
            const { data } = await api.post('/payments/create-payment-intent', {
                amount: amount,
            });
            
            const { clientSecret } = data.data;
            
            // Confirm payment with Stripe
            const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
                payment_method: {
                    card: elements.getElement(CardElement),
                },
            });
            
            if (error) {
                onError(error.message);
            } else if (paymentIntent.status === 'succeeded') {
                onSuccess(paymentIntent);
            }
        } catch (err) {
            onError(err.response?.data?.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };
    
    return (
        <form onSubmit={handleSubmit}>
            <div className="form-group">
                <label>Card Details</label>
                <div className="card-element-container">
                    <CardElement
                        options={{
                            style: {
                                base: {
                                    fontSize: '16px',
                                    color: '#424770',
                                    '::placeholder': {
                                        color: '#aab7c4',
                                    },
                                },
                                invalid: {
                                    color: '#9e2146',
                                },
                            },
                        }}
                    />
                </div>
            </div>
            
            <div className="payment-actions">
                <button 
                    type="button" 
                    className="btn-secondary" 
                    onClick={() => elements?.getElement(CardElement)?.clear()}
                >
                    Clear
                </button>
                <button 
                    type="submit" 
                    className="btn-primary" 
                    disabled={!stripe || processing || disabled}
                >
                    {processing ? 'Processing...' : `Pay $${amount.toFixed(2)}`}
                </button>
            </div>
        </form>
    );
}

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
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [stripeConfig, setStripeConfig] = useState(null);
    
    const navigate = useNavigate();
    const APPOINTMENT_FEE = 50.00;
    
    // Fetch Stripe config on mount
    useEffect(() => {
        const fetchStripeConfig = async () => {
            try {
                const response = await api.get('/payments/config');
                const config = response.data.data;
                setStripeConfig(config);
                
                // Initialize Stripe with publishable key from backend
                if (config.publishableKey) {
                    getStripe(config.publishableKey);
                }
            } catch (err) {
                console.error('Failed to load Stripe config');
            }
        };
        fetchStripeConfig();
    }, []);
    
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
    
    const handleProceedToPayment = (e) => {
        e.preventDefault();
        if (!formData.selectedSlot) {
            setError('Please select a time slot');
            return;
        }
        if (!formData.title.trim()) {
            setError('Please enter an appointment title');
            return;
        }
        setError('');
        setShowPaymentModal(true);
    };
    
    const handlePaymentSuccess = async (paymentIntent) => {
        try {
            // Confirm payment on server
            await api.post('/payments/confirm-payment', {
                paymentIntentId: paymentIntent.id,
            });
            
            // Create the appointment
            await createAppointment();
            
            setShowPaymentModal(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to complete booking');
        }
    };
    
    const handlePaymentError = (errorMessage) => {
        setError(errorMessage);
    };
    
    const createAppointment = async () => {
        setLoading(true);
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
    
    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setError('');
    };
    
    // Get minimum date (today)
    const today = new Date().toISOString().split('T')[0];
    
    return (
        <div className="book-appointment">
            <h1>Book an Appointment</h1>
            
            {error && <div className="error-message">{error}</div>}
            {success && <div className="success-message">Appointment booked successfully! Redirecting...</div>}
            
            <form onSubmit={handleProceedToPayment}>
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
                    disabled={loading || !formData.selectedSlot || !formData.title}
                >
                    {loading ? 'Processing...' : `Proceed to Payment - $${APPOINTMENT_FEE.toFixed(2)}`}
                </button>
            </form>
            
            {/* Stripe Payment Modal */}
            {showPaymentModal && (
                <div className="modal-overlay" onClick={closePaymentModal}>
                    <div className="modal-content payment-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Secure Payment</h2>
                            <button className="close-btn" onClick={closePaymentModal}>&times;</button>
                        </div>
                        
                        <div className="payment-summary">
                            <div className="summary-row">
                                <span>Appointment:</span>
                                <span>{formData.title}</span>
                            </div>
                            <div className="summary-row">
                                <span>Date:</span>
                                <span>{formData.date}</span>
                            </div>
                            <div className="summary-row">
                                <span>Time:</span>
                                <span>{formData.selectedSlot && formatTime(formData.selectedSlot.startTime)} - {formData.selectedSlot && formatTime(formData.selectedSlot.endTime)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Total:</span>
                                <span>${APPOINTMENT_FEE.toFixed(2)}</span>
                            </div>
                        </div>
                        
                        <div className="stripe-form-container">
                            {stripeConfig?.publishableKey ? (
                                <Elements stripe={getStripe(stripeConfig.publishableKey)}>
                                    <CardForm 
                                        onSuccess={handlePaymentSuccess} 
                                        onError={handlePaymentError}
                                        amount={APPOINTMENT_FEE}
                                        disabled={loading}
                                    />
                                </Elements>
                            ) : (
                                <div className="loading-payment">Loading payment form...</div>
                            )}
                        </div>
                        
                        <div className="secure-notice">
                            <span className="lock-icon">🔒</span> 
                            <span>Powered by <strong>Stripe</strong> - Your payment is secured with SSL encryption</span>
                        </div>
                        
                        <div className="test-cards-info">
                            <strong>Test Cards:</strong>
                            <p>Use 4242 4242 4242 4242 with any future date and any CVC</p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default BookAppointment;
