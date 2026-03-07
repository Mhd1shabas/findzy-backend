// Booking related functions
const API_BASE = 'http://localhost:5000/api';

// Load service ID from URL if present
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceId = urlParams.get('serviceId');

    if (serviceId && document.getElementById('service-id')) {
        document.getElementById('service-id').value = serviceId;
    }

    // Booking form handler
    const bookingForm = document.getElementById('booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', handleBooking);
    }
});

// Handle booking form submission
async function handleBooking(e) {
    e.preventDefault();

    const token = localStorage.getItem('token');
    if (!token) {
        showMessage('Please login to book a service', 'error');
        return;
    }

    const formData = new FormData(e.target);
    const bookingData = Object.fromEntries(formData);

    try {
        const response = await fetch(`${API_BASE}/requests`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(bookingData),
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Booking request sent successfully!', 'success');
            setTimeout(() => {
                window.location.href = 'services.html';
            }, 2000);
        } else {
            showMessage(data.message || 'Booking failed', 'error');
        }
    } catch (error) {
        console.error('Booking error:', error);
        showMessage('Network error. Please try again.', 'error');
    }
}

// Utility function to show messages
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = type;
    }
}